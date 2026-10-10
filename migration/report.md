# Migration report

Source: WordPress export dated October 10, 2026; live site inspected October 10, 2026.

## Source findings

- Theme: Nucleus 1.5.0 by GalussoThemes, with site-specific purple top border and blue links.
- Typography: Open Sans body; Montserrat headings/navigation; Merriweather and Inconsolata available in original theme.
- Layout: description/search top bar, project title, seven navigation items, scanned-book banner, main content plus right sidebar, two content-bottom attribution/funding widgets, small theme-credit footer.
- Sidebar: Code of Conduct link, search, Contact link, two categories (Attendee Post and Logistics).
- Ten pages, eight posts, eight attachments; only one of six exported comments is approved.
- Export body text requires WordPress paragraph formatting. The live site will supply rendered body HTML for exact typography and paragraph fidelity, compared with the exported content before inclusion.
- The live Contact page currently contains institutional-directory links and no form; the archive will retain those links and add the agreed inactive-form notice.
- The handbook PDF is hosted on toolkit.dobetterlabor.com; recover this directly referenced document locally while retaining the external toolkit/repository links.
- `[un]` in “Developing Imagination” is prose, not a WordPress shortcode; preserve it.
- Invalid NUL characters occur in internal serialized plugin metadata; importer sanitizes its in-memory input only.

## Validation

Implementation complete; recovery and acceptance evidence follows.

## Recovery and rendering checks

- Recovered all 30 assets: original banner/funding imagery, attachment PDFs, the directly linked handbook and full grant proposal, fonts, author avatars, and Nucleus styles/icon files. No unavailable resources.
- Compared all 17 non-listing page/post bodies against the original export after normalizing whitespace and WordPress smart punctuation. All match; Cloudflare-obscured public email addresses are decoded locally and the export's visible HTTP link label is retained while its download destination is local.
- Homepage comparison at a 1094px desktop viewport: header, title, content, sidebar, and body text bounding boxes match the live site exactly; original theme CSS and local font files are used. Minor widget icon shapes are recreated with local SVG data.
- At a 390px viewport, body text width and wrapping match the source and there is no horizontal overflow. Mobile menu collapse and keyboard navigation are verified below.
- Build and 11 tests pass; verification checks 10 pages, 8 posts, 1 approved pingback, local assets, internal links/fragments, forms, original XML checksum, and private commenter values.

## Interaction checks

- Static search indexes all 18 published pages/posts and finds title/body matches; verified empty, punctuation-only, no-result, HTML-shaped queries, and multiple submissions before an index response.
- A browser regression exposed mixed results after rapid submissions; the latest request now owns rendering. Repeated the same browser case: one “Developing Imagination” result and matching result count.
- Mobile menu opens seven navigation links; Tab reaches About; Escape closes the menu and returns focus to its button.
- Accessibility toolbar opens/closes with correct expanded state. Increase Text changes root font from 16px to 18px, High Contrast toggles, Reset restores 16px and the original palette; Escape closes the panel and returns focus.
- Mobile page requests only local assets; no console errors on tested search flows.

## Final acceptance checks

- Toolchain: Node.js 24.14.0, pnpm 12.10.1, Eleventy 3.1.6; direct dependency versions and lockfile are pinned.
- Desktop white-paper page at 1280px: header and content bounds/height match source exactly. Desktop post body at 1280px and mobile post/About bodies at 390px also match exactly, with no horizontal overflow. Archived approved-discussion links and footer text are intentional additions.
- The original XML remains unchanged locally and is ignored by Git. A filtered published-source fixture provides the same published bodies to CI without publishing rejected discussion or private metadata.
- Frozen-lockfile installation, build, all 15 tests, and archive verification pass in a clean copied checkout without the original export. The clean installation reused all 157 cached packages with zero downloads; content/asset builds made no remote requests.
- Prepared the GitHub Actions Pages workflow, custom-domain CNAME, 404 page, search index, and README. The workflow only deploys main; pull requests run build/checks without deployment.
- All 30 inventoried assets were recovered. The retained Genericons CSS also references obsolete EOT/SVG fallback files that were not recovered; modern WOFF/TTF fonts work, and these legacy fallback references are a deferred minor. Remote pushes, GitHub configuration, DNS changes, certificate provisioning, and final-domain deployment validation have not been performed.


## Independent review and implementation decisions

An independent reviewer found no Critical or Important defects and judged the branch ready to merge. The reviewer independently ran 13 read-only checks and the archive verifier, and inspected the HTTP-fixture tests and clean-checkout evidence. The full implementation suite passes all 15 checks.

Deferred minor: `src/wp-content/themes/nucleus/genericons/genericons.css` references missing legacy `Genericons.eot` and `Genericons.svg` files. Modern WOFF/TTF alternatives work. The verifier currently checks HTML dependencies and inventoried assets rather than every CSS URL. This may affect old browsers using those legacy font formats.

Decisions made during execution:

- Used the existing checkout on `archive/eleventy` to keep the untracked original export and IDE paths accessible. Changes share this checkout; only targeted files were staged.
- Preserved the approved pingback as read-only discussion. If it is unwanted, removing that single archived record is sufficient.
- Used live rendered HTML for paragraph/typographic fidelity. Tests compare all original bodies with archived text, including decoded public email addresses; the original XML remains unchanged.
- Kept the raw WXR out of Git and supplied a filtered published fixture to CI. Full-original checksum/privacy checks require the local export; clean CI validates the public fixture.
- Actual deployment, DNS cutover, and certificate checks remain outside this local implementation. These must be verified when publishing.
- External destinations are retained as requested; their future availability is outside archive control.
- Visual comparisons cover recorded desktop/mobile viewports, not every browser. Additional browser-specific differences remain possible.
- HTML recovery assumes the fixed trusted source export/site, not arbitrary untrusted user submissions. Turning the importer into a public service would require a separate review.


## Subsequent archive change

The accessibility tools toolbar was removed at the user’s request. Its template inclusion, browser controls, and dedicated styles are removed. Keyboard navigation, skip links, focus indicators, and mobile-menu Escape handling remain.

## Usability and WCAG remediation

Implemented the user-requested audit fixes:

- Underlined body, comment, funding-widget, and footer links so their purpose does not rely on color alone.
- Darkened search borders to #767676, set readable placeholder colors, removed the theme's unnecessary input gradient, and provided white footer focus outlines.
- Added Search to mobile navigation, with current-page identification.
- Added a prominent permanent-archive notice explaining that participation requests and surveys are historical.
- Converted Project Team names to H2 sections while retaining their previous visual size; corrected the skipped heading in the participant-nomination post.
- Reduced each post excerpt to one continuation link with the post title in its accessible name.
- Corrected invalid list markup in the Recession Forward post, placing its trailing period inside the final list item. Export-text comparison still passes.
- Placed the description and skip link in named/semantic landmarks and gave the sidebar search button a clean accessible name.
- Added PDF title metadata to all five local documents. qpdf structural checks pass and extracted text is unchanged. The white paper, handbook, and two survey/nomination documents retain their existing tags. The grant proposal remains untagged and needs separate document remediation.

Verification: all 24 HTML routes passed axe-core 4.10.3 scans for WCAG A/AA through 2.2 and best-practice rules with zero violations and zero incomplete checks at 320px. All routes also remained within the viewport at 200% text size and the WCAG text-spacing settings. Desktop homepage scan at 1280px also passed; footer outlines are white, field borders are #767676, and inline links are underlined. The build, archive verifier, and all 18 regression tests pass. Detailed machine-readable scan results are in `migration/accessibility-checks.json`.

These results do not constitute full WCAG conformance. Screen-reader testing and PDF reading-order/tag-tree/link-annotation assessment remain outstanding.

## Long-term maintenance improvements

The legacy icon-font fallback issue above is resolved: Genericons now references archived local WOFF/TTF files. Verification checks CSS URLs and SHA-256 hashes for all 30 inventoried assets. The manifest records that CSS correction.

Imports write to `output/import-staging/` and require explicit `--overwrite` promotion after review. Promotion validates required files and checksums, backs up published files before copying, and leaves migration reports and templates intact. Known heading/list corrections are reproducible in `scripts/lib/archive-corrections.mjs`; cached PDF metadata and provenance survive asset recovery. The original WordPress site remains necessary for recovering rendered content, so imports are a one-time migration tool rather than the maintenance workflow.

`pnpm check` provides clean builds, regression tests, static verification, and repeatable Chromium/axe route audits. Browser reports go to `output/audit/`; prior scan evidence above remains historical. CI performs the same checks on changes and quarterly, without deploying scheduled runs. Search landmarks now have distinct names to satisfy current axe best-practice checks.

First-party scripts, tests, configuration, CSS, and browser JavaScript are formatted with Prettier; build cleanup, asset/CSS integrity, import safeguards, and archival corrections have separate helper modules. Monthly Dependabot proposals and documented quarterly Node/pnpm review support ongoing maintenance. `pnpm pdf:metadata` reproduces recorded titles while checking structure and extracted text. `pnpm package` produces a verified static tarball plus SHA-256 sidecar for institutional preservation and recovery without the JavaScript toolchain.

Final maintenance verification: 24 regression tests passed, all 30 asset hashes and CSS dependencies verified, and 48 Chromium/axe-core 4.14.0 route/viewport scans reported zero violations. Current axe reports 24 incomplete desktop navigation contrast checks because it cannot establish the transparent background; these remain visible in audit output rather than being suppressed. A desktop screenshot and pointer-hit inspection confirm that links are visible and unobstructed on the white header. Automated results remain subject to the manual-review limitations stated above. The recovery tarball's checksum, home/search/index/CNAME files, and exclusion of source XML were verified. Frozen-lockfile installation succeeded with all 161 packages reused.
