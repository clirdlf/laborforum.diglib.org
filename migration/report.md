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

Implementation in progress. Final checks and any unavailable resources will be recorded here.

## Recovery and rendering checks

- Recovered all 30 assets: original banner/funding imagery, attachment PDFs, the directly linked handbook and full grant proposal, fonts, author avatars, and Nucleus styles/icon files. No unavailable resources.
- Compared all 17 non-listing page/post bodies against the original export after normalizing whitespace and WordPress smart punctuation. All match; Cloudflare-obscured public email addresses are decoded locally and the export's visible HTTP link label is retained while its download destination is local.
- Homepage comparison at a 1094px desktop viewport: header, title, content, sidebar, and body text bounding boxes match the live site exactly; original theme CSS and local font files are used. Minor widget icon shapes are recreated with local SVG data.
- At a 390px viewport, body text width and wrapping match the source and there is no horizontal overflow. Mobile menu collapse is completed in the interaction task.
- Build and 11 tests pass; verification checks 10 pages, 8 posts, 1 approved pingback, local assets, internal links/fragments, forms, original XML checksum, and private commenter values.
