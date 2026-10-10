import { readFile, cp, mkdir, stat } from "node:fs/promises";
import { dirname } from "node:path";
import { createHash } from "node:crypto";
import { verifyAssets } from "./lib/integrity.mjs";
if (
  process.argv
    .slice(2)
    .filter((a) => a !== "--")
    .join(" ") !== "--overwrite"
)
  throw new Error(
    "Review output/import-staging, then explicitly pass --overwrite to promote.",
  );
const stage = "output/import-staging";
const archive = JSON.parse(await readFile(stage + "/src/_data/archive.json"));
const assets = JSON.parse(
  await readFile(stage + "/migration/asset-manifest.json"),
);
if (!archive.presentation || !archive.pages.length || !archive.posts.length)
  throw new Error("Staged import is incomplete");
const errors = await verifyAssets(assets, stage + "/src");
if (errors.length) throw new Error(errors.join("\n"));
const backup =
  "output/import-backups/" + new Date().toISOString().replaceAll(":", "-");
await mkdir(backup, { recursive: true });
const names = [
  "src/_data/archive.json",
  "src/wp-content",
  "src/assets/vendor",
  "src/assets/css/fonts.css",
  "migration/asset-manifest.json",
  "migration/source-inventory.json",
  "migration/live-content-inventory.json",
  "migration/published-source.xml",
];
const inventory = JSON.parse(
  await readFile(stage + "/migration/source-inventory.json"),
);
const fixture = await readFile(stage + "/migration/published-source.xml");
if (
  createHash("sha256").update(fixture).digest("hex") !==
  inventory.publicFixtureSha256
)
  throw new Error("Staged fixture checksum differs");
for (const name of names) await stat(stage + "/" + name);
for (const name of names) {
  await mkdir(dirname(backup + "/" + name), { recursive: true });
  await cp(name, backup + "/" + name, { recursive: true });
}
for (const name of names)
  await cp(stage + "/" + name, name, { recursive: true });
console.log(
  `Promoted staged import. Previous files backed up in ${backup}. Reapply documented archival corrections and run pnpm check.`,
);
