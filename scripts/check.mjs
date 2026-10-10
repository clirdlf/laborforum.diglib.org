import { spawnSync } from "node:child_process";
import { readdir } from "node:fs/promises";
const tests = (await readdir("tests"))
  .filter((n) => n.endsWith(".test.mjs"))
  .map((n) => "tests/" + n);
for (const args of [
  ["scripts/build.mjs"],
  ["--test", ...tests],
  ["scripts/verify-archive.mjs"],
  ["scripts/audit-browser.mjs"],
]) {
  const r = spawnSync(process.execPath, args, { stdio: "inherit" });
  if (r.status !== 0) {
    process.exitCode = r.status ?? 1;
    break;
  }
}
