import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
const load = async () =>
  (await import("../scripts/lib/wordpress.mjs")).parseWordPress;
const raw = "data/collectiveresponsibility.WordPress.2026-10-10.xml";
const xml = readFileSync(
  existsSync(raw) ? raw : "migration/published-source.xml",
  "utf8",
);
test("recovers published pages and posts despite invalid plugin metadata", async () => {
  const parse = await load();
  const a = parse(xml);
  assert.equal(a.pages.length, 10);
  assert.equal(a.posts.length, 8);
  assert.equal(a.pages.find((p) => p.title === "Home").url, "/");
  assert.ok(a.pages.find((p) => p.url === "/handbook/"));
  assert.equal(a.attachments.length, 8);
  assert.ok(
    a.pages.find((p) => p.url === "/about/").html.includes("<h2>Project</h2>"),
  );
});
test("publishes only approved comments without private fields", async () => {
  const a = (await load())(xml);
  const records = [...a.pages, ...a.posts];
  assert.equal(records.flatMap((p) => p.comments).length, 1);
  for (const c of records.flatMap((p) => p.comments)) {
    assert.equal(Object.hasOwn(c, "email"), false);
    assert.equal(Object.hasOwn(c, "ip"), false);
    assert.ok(c.author);
    assert.ok(c.html);
    assert.ok(c.id);
  }
});
test("retains approved thread parent identifiers and omits draft/plugin records", async () => {
  const fixture = `<rss><channel><title>Archive</title><item><title>Page</title><link>https://laborforum.diglib.org/test/</link><wp:post_id>2</wp:post_id><wp:post_type>page</wp:post_type><wp:status>publish</wp:status><content:encoded><![CDATA[<p>Body</p>]]></content:encoded><wp:comment><wp:comment_id>9</wp:comment_id><wp:comment_parent>7</wp:comment_parent><wp:comment_approved>1</wp:comment_approved><wp:comment_author>Reader</wp:comment_author><wp:comment_author_email>private@example.org</wp:comment_author_email><wp:comment_content>Thanks</wp:comment_content></wp:comment></item><item><wp:post_type>page</wp:post_type><wp:status>draft</wp:status></item><item><wp:post_type>wpa-stats</wp:post_type><wp:status>publish</wp:status><wp:meta_value><![CDATA[invalid\u0000metadata]]></wp:meta_value></item></channel></rss>`;
  const a = (await load())(fixture);
  assert.equal(a.pages.length, 1);
  assert.equal(a.pages[0].comments[0].parentId, "7");
  assert.equal(JSON.stringify(a).includes("private@example.org"), false);
});
test("CI fixture recovers published content without private or unapproved comment data", async () => {
  const fixture = readFileSync("migration/published-source.xml", "utf8");
  const a = (await load())(fixture);
  assert.equal(a.pages.length, 10);
  assert.equal(a.posts.length, 8);
  assert.equal(a.attachments.length, 8);
  assert.equal([...a.pages, ...a.posts].flatMap((r) => r.comments).length, 1);
  assert.equal(fixture.includes("wp:comment_author_email"), false);
  assert.equal(fixture.includes("wp:comment_author_IP"), false);
  assert.equal(fixture.includes("wpa-stats"), false);
});
