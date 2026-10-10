import { load } from "cheerio";
export function prepareContent(html) {
  const $ = load(html || "", {}, false);
  $("[data-cfemail]").each((_, el) => {
    const encoded = $(el).attr("data-cfemail");
    if (!/^(?:[\da-f]{2})+$/i.test(encoded))
      throw new Error("Invalid encoded email");
    const bytes = Buffer.from(encoded, "hex");
    const email = Buffer.from(
      bytes.subarray(1).map((b) => b ^ bytes[0]),
    ).toString();
    if ($(el).is("a")) $(el).attr("href", "mailto:" + email);
    $(el).text(email).removeAttr("data-cfemail").removeClass("__cf_email__");
  });
  $("script,style,form,iframe").remove();
  $("*").each((_, el) => {
    for (const name of Object.keys(el.attribs || {}))
      if (/^on/i.test(name)) $(el).removeAttr(name);
  });
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (/^javascript:/i.test(href)) $(el).removeAttr("href");
    if (/^https?:\/\/(?:www\.)?imlslaborforum\.org\/?$/i.test(href))
      $(el).attr("href", "/");
  });
  return $.html();
}
export function plainText(html) {
  return load(prepareContent(html), {}, false)
    .text()
    .replace(/\s+/g, " ")
    .trim();
}
export function makeListings(archive) {
  const all = [
    { url: "/posts/", title: "Posts", posts: archive.posts, hideTitle: true },
  ];
  for (const c of archive.taxonomies.categories)
    all.push({
      url: `/category/${c.slug}/`,
      title: `Category: ${c.name}`,
      posts: archive.posts.filter((r) =>
        r.categories.some((x) => x.slug === c.slug),
      ),
    });
  for (const t of archive.taxonomies.tags)
    all.push({
      url: `/tag/${t.slug}/`,
      title: `Tag: ${t.name}`,
      posts: archive.posts.filter((r) => r.tags.some((x) => x.slug === t.slug)),
    });
  for (const url of new Set(archive.posts.map((r) => r.authorUrl)))
    all.push({
      url,
      title: `Author: ${archive.posts.find((r) => r.authorUrl === url).authorName}`,
      posts: archive.posts.filter((r) => r.authorUrl === url),
    });
  return all.flatMap((l) => {
    const total = Math.max(1, Math.ceil(l.posts.length / 10));
    return Array.from({ length: total }, (_, i) => ({
      ...l,
      url: i ? `${l.url}page/${i + 1}/` : l.url,
      posts: l.posts.slice(i * 10, (i + 1) * 10),
      previousUrl: i === 1 ? l.url : i > 1 ? `${l.url}page/${i}/` : null,
      nextUrl: i + 1 < total ? `${l.url}page/${i + 2}/` : null,
    }));
  });
}
export function commentTree(comments, parentId = "0", seen = new Set()) {
  return comments
    .filter(
      (c) =>
        (!c.parentId ||
        c.parentId === "0" ||
        !comments.some((p) => p.id === c.parentId)
          ? "0"
          : c.parentId) === parentId && !seen.has(c.id),
    )
    .map((c) => {
      const next = new Set(seen).add(c.id);
      return {
        ...c,
        html: prepareContent(c.html),
        children: commentTree(comments, c.id, next),
      };
    });
}
