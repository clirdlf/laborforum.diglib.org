import { correctArchivalHtml } from "./lib/archive-corrections.mjs";
import { prepareImport } from "./lib/import-workspace.mjs";
await prepareImport(process.argv.slice(2));
import { readFile, writeFile, mkdir, cp } from "node:fs/promises";
import { load } from "cheerio";
import { parseWordPress } from "./lib/wordpress.mjs";
import { downloadAssets } from "./lib/assets.mjs";
const origin = "https://laborforum.diglib.org";
const archive = parseWordPress(
  await readFile(process.env.ARCHIVE_IMPORT_SOURCE, "utf8"),
);
const records = [...archive.pages, ...archive.posts];
const refs = archive.attachments.map((a) => ({
  url: a.url,
  referencedBy: "WordPress attachment",
}));
const live = [];
let home;
for (const record of records) {
  const response = await fetch(origin + record.url, {
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok)
    throw new Error(`Missing source page ${record.url}: ${response.status}`);
  const html = await response.text();
  const $ = load(html);
  if (record.url === "/") home = $;
  const content = $(`#post-${record.id} > .entry-content`).first();
  if (record.url !== "/posts/" && !content.length)
    throw new Error(`Missing body ${record.url}`);
  if (content.length) {
    content.find("script,style,form,iframe").remove();
    content.find("a").each((_, el) => {
      const label = $(el).text();
      if (
        label.startsWith("https://") &&
        record.html.includes(label.replace("https://", "http://"))
      )
        $(el).text(label.replace("https://", "http://"));
    });
    record.html = content.html().trim();
  }
  if (record.type === "post") {
    record.authorName =
      $(".entry-footer .author .fn").first().text() || record.author;
    record.authorUrl = new URL(
      $(".entry-footer .author .fn").first().attr("href") || "/",
      origin,
    ).pathname;
    const avatar = $(".entry-footer .avatar").first().attr("src");
    if (avatar) {
      record.avatarSource = avatar;
      refs.push({ url: avatar, referencedBy: record.url });
    }
  }
  live.push({
    url: record.url,
    title: $(".entry-title").first().text(),
    bodySource: content.length ? "live rendered HTML" : "listing",
    contentCharacters: content.text().length,
  });
}
archive.presentation = {
  banner: home(".header-image img").attr("src"),
  fundingLogo: home("#content-bottom-widgets img").attr("src"),
  bottomWidgets: home("#content-bottom-widgets").html(),
  themeCredit: "Nucleus by GalussoThemes.com",
  siteTitle: home(".site-title").text(),
  description: home(".top-bar-site-description").text(),
};
for (const url of [
  archive.presentation.banner,
  archive.presentation.fundingLogo,
])
  refs.push({ url, referencedBy: "Shared presentation" });
for (const r of records) {
  const $ = load(r.html, {}, false);
  $("[href],[src],[srcset]").each((_, el) => {
    for (const attr of ["href", "src"]) {
      const v = $(el).attr(attr);
      if (!v || v.startsWith("#") || /^(mailto:|tel:|data:)/.test(v)) continue;
      const u = new URL(v, origin + r.url);
      if (
        attr === "src" ||
        /\.(pdf|docx?|xlsx?|zip|png|jpe?g|gif|svg|webp)$/i.test(u.pathname)
      )
        refs.push({ url: u.href, referencedBy: r.url });
    }
    const set = $(el).attr("srcset");
    if (set)
      for (const part of set.split(","))
        refs.push({
          url: new URL(part.trim().split(/\s+/)[0], origin + r.url).href,
          referencedBy: r.url,
        });
  });
}
const themeUrls = [
  "/wp-content/themes/nucleus/style.css",
  "/wp-content/themes/nucleus/css/blocks.css",
  "/wp-content/themes/nucleus/genericons/genericons.css",
  "/wp-content/themes/nucleus/genericons/Genericons.woff",
  "/wp-content/themes/nucleus/genericons/Genericons.ttf",
];
for (const path of themeUrls)
  refs.push({ url: origin + path, referencedBy: "Nucleus theme" });
const fontsUrl =
  "https://fonts.googleapis.com/css?family=Open+Sans:400,700,900,400italic,700italic,900italic%7CMerriweather:400,700,900,400italic,700italic,900italic%7CMontserrat:400,700%7CInconsolata:400&subset=latin,latin-ext";
const fontsResponse = await fetch(fontsUrl, {
  headers: { "User-Agent": "Mozilla/5.0" },
});
if (!fontsResponse.ok) throw new Error("Font stylesheet unavailable");
let fontsCss = await fontsResponse.text();
for (const m of fontsCss.matchAll(/url\(([^)]+)\)/g))
  refs.push({
    url: m[1].replace(/["']/g, ""),
    referencedBy: "Google Fonts stylesheet",
  });
// Preserve archived font repairs and PDF metadata when reusing cached assets.
for (const name of ["src/wp-content", "src/assets/vendor"])
  await cp(process.env.ARCHIVE_IMPORT_ROOT + "/" + name, name, {
    recursive: true,
  });
const previous = JSON.parse(
  await readFile(
    process.env.ARCHIVE_IMPORT_ROOT + "/migration/asset-manifest.json",
  ),
);
const manifest = await downloadAssets(refs, "src");
for (const asset of manifest) {
  const old = previous.find(
    (a) => a.localPath === asset.localPath && a.sha256 === asset.sha256,
  );
  if (old)
    for (const key of ["metadataTitle", "archivalModification"])
      if (old[key]) asset[key] = old[key];
}

const map = new Map(
  manifest
    .filter((m) => m.status !== "unavailable")
    .map((m) => [m.sourceUrl, encodeURI(m.localPath)]),
);
function rewrite(value, base = origin) {
  if (!value || /^(mailto:|tel:|data:|#)/i.test(value)) return value;
  const u = new URL(value, base);
  const hash = u.hash;
  u.hash = "";
  return map.get(u.href)
    ? map.get(u.href) + hash
    : u.hostname === "laborforum.diglib.org"
      ? u.pathname + u.search + hash
      : value;
}
function rewriteHtml(html, base = origin) {
  const $ = load(html, {}, false);
  $("[href],[src],[srcset]").each((_, el) => {
    for (const attr of ["href", "src"]) {
      const v = $(el).attr(attr);
      if (v) $(el).attr(attr, rewrite(v, base));
    }
    const v = $(el).attr("srcset");
    if (v)
      $(el).attr(
        "srcset",
        v
          .split(",")
          .map((part) => {
            const [url, ...descriptor] = part.trim().split(/\s+/);
            return [rewrite(url, base), ...descriptor].join(" ");
          })
          .join(", "),
      );
  });
  return $.html();
}
for (const r of records) {
  r.html = correctArchivalHtml({
    ...r,
    html: rewriteHtml(r.html, origin + r.url),
  });
  r.avatar = r.avatarSource ? rewrite(r.avatarSource) : null;
  delete r.avatarSource;
  r.comments = r.comments.map((c) => ({
    ...c,
    html: rewriteHtml(c.html, origin + r.url),
  }));
}
archive.presentation.banner = rewrite(archive.presentation.banner);
archive.presentation.fundingLogo = rewrite(archive.presentation.fundingLogo);
archive.presentation.bottomWidgets = rewriteHtml(
  archive.presentation.bottomWidgets,
);
fontsCss = fontsCss.replace(
  /url\(([^)]+)\)/g,
  (_, url) => `url("${rewrite(url.replace(/["']/g, ""))}")`,
);
await mkdir("src/assets/css", { recursive: true });
await writeFile("src/assets/css/fonts.css", fontsCss);
await writeFile(
  "src/_data/archive.json",
  JSON.stringify(archive, null, 2) + "\n",
);
await writeFile(
  "migration/asset-manifest.json",
  JSON.stringify(manifest, null, 2) + "\n",
);
await writeFile(
  "migration/live-content-inventory.json",
  JSON.stringify(live, null, 2) + "\n",
);
console.log(
  `Archived ${manifest.filter((m) => m.status !== "unavailable").length}/${manifest.length} assets.`,
);
for (const m of manifest.filter((m) => m.status === "unavailable"))
  console.log(`Unavailable: ${m.sourceUrl} (${m.error})`);
