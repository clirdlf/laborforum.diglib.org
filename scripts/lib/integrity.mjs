import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve, dirname } from "node:path";
export function cssReferences(css) {
  return [
    ...css
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g),
  ]
    .map((m) => m[1].trim())
    .filter((v) => !v.startsWith("data:") && !v.startsWith("#"));
}
export async function verifyAssets(assets, root) {
  const errors = [];
  for (const asset of assets) {
    try {
      const target = resolve(root, "." + asset.localPath);
      if (!target.startsWith(resolve(root) + "/"))
        throw new Error("Unsafe asset path");
      const bytes = await readFile(target);
      if (
        !asset.sha256 ||
        createHash("sha256").update(bytes).digest("hex") !== asset.sha256
      )
        errors.push(`Asset checksum differs: ${asset.localPath}`);
    } catch {
      errors.push(`Missing asset: ${asset.localPath}`);
    }
  }
  return errors;
}
export async function verifyCss(root) {
  const errors = [];
  async function walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = resolve(dir, entry.name);
      if (entry.isDirectory()) await walk(path);
      else if (path.endsWith(".css"))
        for (const ref of cssReferences(await readFile(path, "utf8"))) {
          if (/^(https?:)?\/\//.test(ref)) {
            errors.push(`Remote CSS dependency ${ref}`);
            continue;
          }
          const target = ref.startsWith("/")
            ? resolve(root, "." + ref.split(/[?#]/)[0])
            : resolve(dirname(path), ref.split(/[?#]/)[0]);
          try {
            if (!target.startsWith(resolve(root) + "/"))
              throw new Error("outside root");
            await readFile(target);
          } catch {
            errors.push(`Missing CSS dependency ${ref} in ${path}`);
          }
        }
    }
  }
  await walk(root);
  return errors;
}
