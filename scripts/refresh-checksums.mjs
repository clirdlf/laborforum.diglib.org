import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const path = "migration/asset-manifest.json";
const assets = JSON.parse(await readFile(path));
for (const asset of assets) {
  const bytes = await readFile("src" + asset.localPath);
  asset.bytes = bytes.length;
  asset.sha256 = createHash("sha256").update(bytes).digest("hex");
}
await writeFile(path, JSON.stringify(assets, null, 2) + "\n");
