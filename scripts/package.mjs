import { spawnSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const check = spawnSync(process.execPath, ["scripts/check.mjs"], {
  stdio: "inherit",
});
if (check.status !== 0) process.exit(check.status ?? 1);
await mkdir("output/releases", { recursive: true });
const name = "laborforum-archive.tar.gz";
const tar = spawnSync(
  "tar",
  ["-czf", "output/releases/" + name, "-C", "_site", "."],
  { stdio: "inherit" },
);
if (tar.status !== 0) process.exit(tar.status ?? 1);
await writeFile(
  "output/releases/" + name + ".sha256",
  createHash("sha256")
    .update(await readFile("output/releases/" + name))
    .digest("hex") +
    "  " +
    name +
    "\n",
);
console.log("Deployable archive and checksum saved in output/releases.");
