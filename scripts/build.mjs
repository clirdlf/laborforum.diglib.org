import { spawnSync } from "node:child_process";
import { cleanOutput } from "./lib/build.mjs";
await cleanOutput();
const result = spawnSync(
  process.execPath,
  ["node_modules/@11ty/eleventy/cmd.cjs"],
  { stdio: "inherit" },
);
process.exitCode = result.status ?? 1;
