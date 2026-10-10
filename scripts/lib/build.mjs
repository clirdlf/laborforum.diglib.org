import { rm } from "node:fs/promises";
import { resolve } from "node:path";
export async function cleanOutput(root = process.cwd()) {
  await rm(resolve(root, "_site"), { recursive: true, force: true });
}
