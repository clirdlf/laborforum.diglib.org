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
