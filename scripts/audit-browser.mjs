import { createServer } from "node:http";
import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { createRequire } from "node:module";
import assert from "node:assert/strict";
import { chromium } from "playwright";
const root = resolve("_site"),
  routes = [],
  results = [];
async function walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = resolve(dir, e.name);
    if (e.isDirectory()) await walk(p);
    else if (p.endsWith(".html"))
      routes.push("/" + p.slice(root.length + 1).replace(/index\.html$/, ""));
  }
}
await walk(root);
const mime = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
};
const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    if (p.endsWith("/")) p += "index.html";
    const file = resolve(root, "." + p);
    if (!file.startsWith(root + "/")) throw new Error("Invalid path");
    const data = await readFile(file);
    res.writeHead(200, {
      "Content-Type": mime[extname(file)] || "application/octet-stream",
    });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser = await chromium.launch();
  const page = await browser.newPage();
  const runtimeErrors = [];
  page.on("pageerror", (e) => runtimeErrors.push(e.message));
  await page.route("**/*", (route) =>
    new URL(route.request().url()).origin === origin
      ? route.continue()
      : route.abort(),
  );
  const axe = createRequire(import.meta.url).resolve("axe-core/axe.min.js");
  for (const width of [320, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(origin + route, { waitUntil: "networkidle" });
      await page.addScriptTag({ path: axe });
      const scan = await page.evaluate(async () => {
        const r = await axe.run(document, {
          runOnly: {
            type: "tag",
            values: [
              "wcag2a",
              "wcag2aa",
              "wcag21aa",
              "wcag22aa",
              "best-practice",
            ],
          },
        });
        return { violations: r.violations, incomplete: r.incomplete };
      });
      results.push({ route, width, ...scan });
      assert.equal(
        scan.violations.length,
        0,
        `${route} at ${width}px: ${scan.violations.map((v) => v.id).join(", ")}`,
      );
      if (width === 320) {
        await page.addStyleTag({
          content:
            "html{font-size:200%} *{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important} p{margin-bottom:2em!important}",
        });
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
          `Overflow: ${route}`,
        );
      }
    }
  }
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto(origin + "/");
  const toggle = page.locator(".menu-toggle");
  await toggle.click();
  assert.equal(await toggle.getAttribute("aria-expanded"), "true");
  await page.keyboard.press("Escape");
  assert.equal(await toggle.getAttribute("aria-expanded"), "false");
  await page.goto(origin + "/search/?q=collective");
  await page.locator("#search-results li").first().waitFor();
  await page.locator("#archive-query").fill("xyz-no-match-archive");
  await page.locator("#archive-search").evaluate((f) => f.requestSubmit());
  await page.waitForFunction(() =>
    document
      .querySelector("#search-status")
      .textContent.startsWith("No results"),
  );
  assert.equal(runtimeErrors.length, 0, runtimeErrors.join("\n"));
  const incomplete = results.reduce(
    (count, result) => count + result.incomplete.length,
    0,
  );
  if (incomplete)
    console.warn(
      `${incomplete} incomplete axe checks require review; details are in output/audit/results.json.`,
    );
  console.log(
    `Browser audit passed: ${results.length} route/viewport scans, reflow, menu, Escape, and search.`,
  );
} finally {
  await mkdir("output/audit", { recursive: true });
  await writeFile(
    "output/audit/results.json",
    JSON.stringify(results, null, 2) + "\n",
  );
  await browser?.close();
  await new Promise((r) => server.close(r));
}
