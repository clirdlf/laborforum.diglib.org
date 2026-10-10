# Labor Forum Archive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Build a faithful, self-contained permanent Eleventy archive deployed with pnpm and GitHub Pages at laborforum.diglib.org.

**Architecture:** Import WordPress once into normalized JSON content and local assets. Eleventy renders preserved routes through shared templates; lightweight browser scripts provide search, navigation, and retained accessibility controls. Normal builds never contact WordPress.

**Tech Stack:** Eleventy, pnpm, Node.js, Nunjucks, plain CSS and JavaScript, GitHub Actions. Select supported stable versions using current documentation and pin the installed versions and lockfile.

**Spec:** `docs/superpowers/specs/2026-10-10-laborforum-archive-design.md`

## Global Constraints

- Use Eleventy and pnpm; generated output is `_site/` and is excluded from source control.
- GitHub Pages will serve the existing custom domain, laborforum.diglib.org.
- Keep the original XML unchanged; builds after migration must use local files.
- Preserve 10 published pages and 8 published posts, existing page and post URLs, and approved comments.
- Do not publish commenter email addresses or IP addresses.
- Replace the contact form with an inactive-form notice; remove comment submission.
- Match the current presentation rather than redesign it.
- Prepare deployment configuration; do not publish, change DNS, or retire WordPress without a separate request.

## Review Focus

1. Invalid XML characters in plugin metadata must not prevent recovery of published content (Task 1).
2. Encoded media URLs, CSS/font dependencies, and repeated assets must resolve locally without filename collisions (Task 2).
3. Nested routes, fragment links, and archive pagination must retain their intended destinations (Task 3).
4. Unapproved comments, private fields, and WordPress shortcodes must not leak into output (Tasks 1 and 3).
5. Search queries containing punctuation or HTML must produce safe, understandable results (Task 4).

## File map

- `scripts/import-wordpress.mjs`: one-time import entry point.
- `scripts/lib/wordpress.mjs`: XML sanitization and published-content normalization.
- `scripts/archive-assets.mjs`: download assets and rewrite local references.
- `scripts/verify-archive.mjs`: generated content, routes, links, privacy, and asset checks.
- `migration/source-inventory.json`, `migration/asset-manifest.json`, `migration/report.md`: source routes, asset provenance, and discrepancies.
- `src/_data/archive.json`: normalized pages, posts, comments, navigation, and taxonomy.
- `src/_includes/`: shared Nunjucks layouts, navigation, comments, and post summaries.
- `src/content.njk`, `src/archives.njk`: paginated rendering of imported records and archive listings.
- `src/search.njk`, `src/search-index.11ty.js`, `src/404.njk`: search, generated index, and error page.
- `src/assets/css/site.css`, `src/assets/js/`: local styling and browser interactions.
- `src/wp-content/`: recovered assets at original paths where practical.
- `eleventy.config.js`, `package.json`, `pnpm-lock.yaml`, `.gitignore`: build/toolchain setup.
- `.github/workflows/deploy.yml`, `src/CNAME`, `README.md`: Pages configuration and operating instructions.
- `tests/wordpress.test.mjs`, `tests/archive.test.mjs`, `tests/search.test.mjs`: focused behavior checks.

## Task 1: Recover normalized published content

**Interfaces:** `parseWordPress(xml: string)` returns `{pages, posts, navigation, attachments, taxonomies}`. Content records use `{id, type, title, url, date, html, excerpt, categories, tags, comments}`; comments use `{id, parentId, author, date, html}`. URLs are pathname strings. The import CLI writes `src/_data/archive.json` and `migration/source-inventory.json`.

- [x] Inspect the export's content, menus, comment approval statuses, custom CSS, and attachment references. Inspect the live homepage, posts listing, contact page, one post, handbook, and white-paper pages. Capture source screenshots and record theme/layout findings in `migration/report.md`.
- [x] Add `tests/wordpress.test.mjs` with assertions that invalid metadata characters are tolerated, drafts/plugin records are excluded, approved comment threads survive, private fields are absent, and the actual export yields 10 pages and 8 posts with `/` as the home URL. Run `node --test tests/wordpress.test.mjs`; expect failure before implementation.
- [x] Implement `parseWordPress` and the CLI using an XML parser selected from current documentation. Decode CDATA and retain body HTML; sanitize only the in-memory parser input. Record shortcode occurrences for explicit conversion in Task 3. Keep the source file untouched.
- [x] Add the package/toolchain configuration needed for import and tests. Run the import and `pnpm test`; expect the stated counts and passing import checks. Verify the source checksum is unchanged.
- [x] Commit normalized content, import tooling, inventories, and checks.

## Task 2: Make source assets self-contained

**Interfaces:** `archiveAssets(archive, sourceInventory)` writes local files and `migration/asset-manifest.json`. Manifest records use `{sourceUrl, localPath, status, referencedBy}`. Status is `downloaded`, `existing`, or `unavailable`. Rewritten archive records retain Task 1's schema.

- [x] Inventory image/srcset references, attachments, documents, theme CSS, fonts, CSS URLs, and presentation assets observed on the live site. Include dependencies absent from attachment records; keep unrelated external links external.
- [x] Add asset cases to `tests/archive.test.mjs`: encoded filenames map deterministically, duplicate references share a file, distinct source paths do not collide, and missing files are reported. Run the targeted checks; expect failure before implementation.
- [x] Implement the download and rewrite script. Preserve original upload paths when practical, use deterministic local paths for other assets, and record failures without silently dropping references. Fetch fonts and CSS dependencies needed for appearance; do not ship tracking or WordPress runtime scripts.
- [x] Run the asset import; inspect downloaded file types and update `migration/report.md` with any unavailable resources. Re-run asset checks; expect passing mappings and explicit unresolved entries.
- [x] Commit assets, provenance, script, and rewritten references.

## Task 3: Render the archive with preserved routes and appearance

**Interfaces:** Eleventy consumes `archive.json`; `src/content.njk` emits each record at `record.url`. `src/archives.njk` consumes explicit listing records `{url, title, posts, previousUrl, nextUrl}` derived from the observed source taxonomy and pagination. Shared templates receive `record` and site navigation.

- [x] Add generated-output assertions to `tests/archive.test.mjs` for every inventory page/post route, source-visible listing routes, approved comments, absence of private fields/forms/shortcodes, contact notice, and local image/document URLs. Run checks against an empty build; expect failure.
- [x] Configure Eleventy input/output, passthrough assets, local development, production build, and lockfile. Use current Context7 documentation for Eleventy APIs. Add shared base/page/post layouts, original navigation ordering, threaded read-only comments, and source-faithful CSS based on Task 1's observations.
- [x] Convert source shortcodes into their archival HTML equivalents. Replace the contact form with “This contact form is no longer active. This site is preserved as a permanent archive.” Remove comment submission and server-dependent UI. Preserve dates, content anchors, and meaningful post metadata.
- [x] Generate the posts listing and source-visible category/tag/pagination routes. Rewrite local WordPress links to archived routes and preserve fragments. Add the semantic 404 page.
- [x] Implement `scripts/verify-archive.mjs`: check route inventory coverage, all local href/src/srcset targets and fragments, local asset existence, content counts, comment privacy, and inactive forms. External links are reported separately without making the archive build depend on remote availability.
- [x] Run `pnpm build`, `pnpm test`, and `pnpm verify`; expect 18 published content records, all expected routes, and no unexplained broken internal references. Compare homepage/page/post/resource layouts at desktop and mobile widths and adjust CSS to match.
- [x] Commit rendering, style, verification, and updated migration report.

## Task 4: Add local search and accessible interactions

**Interfaces:** Search index records use `{title, url, text}`. `findResults(records, query)` returns matching records using case-insensitive token matching of title/body. Browser rendering uses DOM text nodes for titles/excerpts, never query-derived HTML.

- [x] Add `tests/search.test.mjs` checking a known project page and post query, empty input, unmatched input, punctuation, and HTML-shaped query input. Run it; expect failure before implementation.
- [x] Generate a local JSON search index from published body text with markup removed. Add a search route, accessible query form, results count, and empty/no-results messages. Provide a visible search entry point matching the source layout.
- [x] Implement keyboard-accessible mobile navigation with correct expanded state and focus behavior. Recreate locally functional source accessibility controls if source inspection establishes they should be retained. Ensure controls do not call WordPress endpoints.
- [x] Run tests and browser checks for search, keyboard navigation, mobile menu, retained accessibility controls, and no unintended horizontal overflow. Confirm search query text cannot inject markup.
- [x] Commit search and interactions.

## Task 5: Prepare Pages deployment and complete acceptance checks

**Interfaces:** `pnpm build` produces `_site/`; `pnpm verify` validates that output. The workflow installs the package-manager version declared in `package.json`, uses frozen-lockfile installation, builds and verifies, uploads the Pages artifact, and deploys on pushes to the configured default branch or manual dispatch.

- [x] Add `src/CNAME` containing `laborforum.diglib.org` and a GitHub Actions Pages workflow with appropriate Pages/id-token permissions and deployment concurrency. Use current official documentation to confirm action versions and setup; do not trigger a deployment.
- [x] Write the README with pinned Node/pnpm versions, install/dev/build/verify commands, import provenance, offline-build behavior, GitHub Pages source setting, custom-domain/DNS prerequisites, and known missing resources.
- [x] Run a frozen-lockfile installation, all tests, build, and verification. Confirm `_site/CNAME`, `_site/404.html`, search index, and expected routes exist. Confirm the normal build performs no content or asset downloads.
- [x] Finish desktop/mobile visual comparisons and representative browser flows. Summarize verification and unresolved source limitations in `migration/report.md`; resolve failures before claiming completion.
- [x] Review the final changes against the approved spec and commit deployment/documentation changes. Report what is ready locally and which GitHub/DNS steps remain for publishing.

## Execution and review

Tasks are sequential because each depends on recovered source information and the previous task's interfaces. Native execution in this session is recommended. Use an isolated branch/worktree if appropriate without losing access to the original untracked export. At completion, perform the required independent review under the selected execution skill, address material findings, and repeat only checks affected by changes.
