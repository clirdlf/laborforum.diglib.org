import { verifyAssets, verifyCss } from "./lib/integrity.mjs";
import { readFile, readdir, stat } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { load } from "cheerio";
import { createHash } from "node:crypto";
const root = resolve("_site");
const inventory = JSON.parse(await readFile("migration/source-inventory.json"));
const archive = JSON.parse(await readFile("src/_data/archive.json"));
const assets = JSON.parse(await readFile("migration/asset-manifest.json"));
const errors = [],
  external = new Set(),
  documents = new Map();
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (path.endsWith(".html")) {
      const html = await readFile(path, "utf8");
      documents.set(path, { html, $: load(html) });
    }
  }
}
await walk(root);
const fileFor = (u) =>
  resolve(
    root,
    "." +
      decodeURIComponent(u.pathname) +
      (u.pathname.endsWith("/") ? "index.html" : ""),
  );
for (const r of inventory.routes)
  if (!documents.has(fileFor(new URL(r.url, "https://laborforum.diglib.org"))))
    errors.push(`Missing source route ${r.url}`);
if (
  archive.pages.length !== inventory.publishedPages ||
  archive.posts.length !== inventory.publishedPosts
)
  errors.push("Published content counts differ");
let comments = 0;
for (const [path, { html, $ }] of documents) {
  comments += $(".comment-body").length;
  if ($('form:not([role="search"])').length)
    errors.push(`Active form: ${path}`);
  if ($('[data-cfemail],script[src*="cdn-cgi"]').length)
    errors.push(`Unconverted protected email: ${path}`);
  if (/\[(?:contact-form-7|gallery|caption|embed)[\s\]]/.test(html))
    errors.push(`Unconverted shortcode: ${path}`);
  const pageUrl =
    "https://laborforum.diglib.org/" +
    path.slice(root.length + 1).replace(/index\.html$/, "");
  for (const el of $("[href],[src],[srcset]").toArray()) {
    const refs = ["href", "src"]
      .map((attr) => $(el).attr(attr))
      .filter(Boolean);
    const set = $(el).attr("srcset");
    if (set) refs.push(...set.split(",").map((s) => s.trim().split(/\s+/)[0]));
    for (const ref of refs) {
      if (/^(mailto:|tel:|data:)/i.test(ref)) continue;
      let u;
      try {
        u = new URL(ref, pageUrl);
      } catch {
        errors.push(`Invalid URL ${ref}`);
        continue;
      }
      if (u.hostname !== "laborforum.diglib.org") {
        external.add(u.href);
        if ($(el).attr("src") === ref)
          errors.push(`Remote runtime asset ${ref}`);
        continue;
      }
      const target = fileFor(u);
      if (!target.startsWith(root + "/")) {
        errors.push(`Unsafe path ${ref}`);
        continue;
      }
      if (!(await stat(target).catch(() => null))?.isFile())
        errors.push(`${path.slice(root.length)} → missing ${ref}`);
      else if (u.hash && extname(target) === ".html") {
        const doc = documents.get(target);
        const id = decodeURIComponent(u.hash.slice(1));
        if (
          doc &&
          !doc
            .$("[id],[name]")
            .toArray()
            .some(
              (e) => doc.$(e).attr("id") === id || doc.$(e).attr("name") === id,
            )
        )
          errors.push(`${path.slice(root.length)} → missing fragment ${ref}`);
      }
    }
  }
}
if (comments !== inventory.approvedComments)
  errors.push(
    `Approved comment count ${comments} differs from ${inventory.approvedComments}`,
  );
for (const a of assets) {
  if (a.status === "unavailable")
    errors.push(`Unavailable source asset ${a.sourceUrl}`);
  else if (
    !(await stat(resolve(root, "." + a.localPath)).catch(() => null))?.isFile()
  )
    errors.push(`Missing archived asset ${a.localPath}`);
}
errors.push(...(await verifyAssets(assets, root)), ...(await verifyCss(root)));
const fixture = await readFile(inventory.publicFixture);
if (
  createHash("sha256").update(fixture).digest("hex") !==
  inventory.publicFixtureSha256
)
  errors.push("Published source fixture changed");
const original = await readFile(inventory.source).catch((error) => {
  if (error.code !== "ENOENT") throw error;
  return null;
});
if (
  original &&
  createHash("sha256").update(original).digest("hex") !== inventory.sha256
)
  errors.push("Original XML changed");
const xml = (original || fixture).toString();
const privateValues = [
  ...xml.matchAll(
    /<wp:comment_(?:author_email|author_IP)><!\[CDATA\[(.*?)\]\]><\/wp:comment_/g,
  ),
]
  .map((m) => m[1])
  .filter(Boolean);
for (const [path, { html }] of documents)
  for (const v of privateValues)
    if (html.includes(v))
      errors.push(`Private commenter data in ${path.slice(root.length)}`);
console.log(
  `${archive.pages.length} pages, ${archive.posts.length} posts, ${comments} approved discussion record; ${documents.size} HTML routes; ${assets.length} local assets.`,
);
console.log(
  `${external.size} external destinations retained (not fetched during verification).`,
);
if (errors.length) {
  for (const error of errors) console.error(error);
  process.exitCode = 1;
} else
  console.log(
    "Archive verification passed: available source checksums, internal links, fragments, assets, privacy, and forms checked.",
  );
