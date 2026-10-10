import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
export async function prepareImport(args) {
  if (args.length)
    throw new Error(
      "Imports write to staging only. Review output/import-staging before promotion; --overwrite is not supported.",
    );
  const root = resolve(".");
  process.env.ARCHIVE_IMPORT_ROOT = root;
  process.env.ARCHIVE_IMPORT_SOURCE = resolve(
    root,
    "data/collectiveresponsibility.WordPress.2026-10-10.xml",
  );
  const stage = resolve(root, "output/import-staging");
  await mkdir(stage + "/src/_data", { recursive: true });
  await mkdir(stage + "/migration", { recursive: true });
  process.chdir(stage);
}
