import { execFileSync } from "node:child_process";
import { readFile, writeFile, cp, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
const path = "migration/asset-manifest.json";
const assets = JSON.parse(await readFile(path));
// Check all tools before touching any PDF.
for (const [tool, args] of [
  ["exiftool", ["-ver"]],
  ["qpdf", ["--version"]],
  ["pdftotext", ["-v"]],
])
  execFileSync(tool, args, { stdio: "pipe" });
for (const asset of assets.filter((a) => a.metadataTitle)) {
  const file = "src" + asset.localPath;
  const current = execFileSync("exiftool", ["-s3", "-Title", file], {
    encoding: "utf8",
  }).trim();
  if (current === asset.metadataTitle) continue;
  await mkdir("output/pdf-originals", { recursive: true });
  await cp(file, "output/pdf-originals/" + asset.localPath.split("/").pop());
  const before = execFileSync("pdftotext", [file, "-"]);
  execFileSync(
    "exiftool",
    ["-overwrite_original", "-Title=" + asset.metadataTitle, file],
    { stdio: "inherit" },
  );
  execFileSync("qpdf", ["--check", file], { stdio: "inherit" });
  if (!before.equals(execFileSync("pdftotext", [file, "-"])))
    throw new Error(
      `PDF text changed: ${file}. Restore from output/pdf-originals.`,
    );
  const bytes = await readFile(file);
  asset.sha256 = createHash("sha256").update(bytes).digest("hex");
  asset.bytes = bytes.length;
}
await writeFile(path, JSON.stringify(assets, null, 2) + "\n");
console.log(
  "Recorded PDF titles verified/applied without changing extracted text.",
);
