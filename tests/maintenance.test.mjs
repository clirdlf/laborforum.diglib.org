import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
test("import refuses unsupported flags before changing published content", async () => {
  const before = await readFile("src/_data/archive.json");
  const result = spawnSync(
    process.execPath,
    ["scripts/import-wordpress.mjs", "--overwrite"],
    { encoding: "utf8" },
  );
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /staging|promote/i);
  assert.deepEqual(await readFile("src/_data/archive.json"), before);
});
test("clean output removes stale build files without touching source", async () => {
  const { cleanOutput } = await import("../scripts/lib/build.mjs");
  const root = await mkdtemp(join(tmpdir(), "archive-clean-"));
  await mkdir(join(root, "_site"));
  await mkdir(join(root, "src"));
  await writeFile(join(root, "_site/stale.html"), "old");
  await writeFile(join(root, "src/keep.txt"), "source");
  await cleanOutput(root);
  assert.equal(await stat(join(root, "_site")).catch(() => null), null);
  assert.equal(await readFile(join(root, "src/keep.txt"), "utf8"), "source");
});
test("CSS dependencies resolve relative paths and skip embedded data", async () => {
  const { cssReferences } = await import("../scripts/lib/integrity.mjs");
  assert.deepEqual(
    cssReferences(
      '/* url(missing.png) */ @font-face{src:url("../font.woff#face")} a{background:url(data:image/png;base64,abc)}',
    ),
    ["../font.woff#face"],
  );
});
test("asset integrity catches changed content and missing files", async () => {
  const { verifyAssets } = await import("../scripts/lib/integrity.mjs");
  const root = await mkdtemp(join(tmpdir(), "archive-integrity-"));
  await writeFile(join(root, "asset.txt"), "changed");
  const errors = await verifyAssets(
    [
      { localPath: "/asset.txt", sha256: "0000" },
      { localPath: "/missing.txt", sha256: "0000" },
    ],
    root,
  );
  assert.equal(errors.length, 2);
  assert.ok(errors.some((e) => e.includes("checksum")));
  assert.ok(errors.some((e) => e.includes("missing.txt")));
});

test("promotion requires explicit overwrite authorization", () => {
  const result = spawnSync(process.execPath, ["scripts/promote-import.mjs"], {
    encoding: "utf8",
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /--overwrite/);
});
test("archival corrections preserve text while repairing headings and lists", async () => {
  const { correctArchivalHtml } =
    await import("../scripts/lib/archive-corrections.mjs");
  const team = correctArchivalHtml({
    url: "/project-team/",
    html: "<h5>Name</h5>",
  });
  assert.match(team, /<h2 class="team-member-heading">Name<\/h2>/);
  const list = correctArchivalHtml({
    url: "/post/",
    html: "<ol><li>Stakeholders</li><p>.</p></ol>",
  });
  assert.equal(list, "<ol><li>Stakeholders.</li></ol>");
});
