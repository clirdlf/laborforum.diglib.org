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
