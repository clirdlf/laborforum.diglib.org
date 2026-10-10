# Labor Forum permanent archive

## Purpose and agreed scope

Create a permanent static archive of https://laborforum.diglib.org/ using Eleventy and pnpm. GitHub Pages will serve the existing custom domain, laborforum.diglib.org. Preserve the published content, existing page and post URLs, and the live site's look and feel. This is an archival migration, not a redesign or an ongoing publishing system.

The user approved the in-chat design on October 10, 2026. This document records that design for review before implementation planning.

## Source and import

The source export is `data/collectiveresponsibility.WordPress.2026-10-10.xml`. Initial inspection identified 10 published pages, 8 published posts, 8 attachment records, 6 comment records, navigation records, custom CSS, and internal plugin records. Approved comments must be identified by their WordPress approval status; the total comment count is not an approved-comment count.

Perform a one-time conversion into local content files and assets. Keep the original XML unchanged. The export contains a NUL character in serialized plugin metadata that prevents strict XML parsing; sanitize invalid XML characters in the import input without altering the original source. Exclude draft content, statistics, form definitions, and other internal plugin records from published output.

Use the live site to recover presentation details and asset references absent from the export, including navigation order, theme styling, fonts, images, and downloadable documents. Record unavailable assets and unresolved source discrepancies explicitly rather than silently omitting them. Builds after migration must use local files and must not require WordPress or the live site.

## Content and URLs

Preserve published page and post titles, dates, body content, and meaningful metadata. Keep the homepage at `/`, existing page slugs, and dated post paths. Recreate the posts listing and relevant category, tag, or pagination paths exposed by the source site. Preserve meaningful internal anchors and update internal links to the archived equivalents.

Store available images and downloads locally, preserving their original URL paths where practical. Retain links to external resources as external links. Do not crawl unrelated external sites into the archive. Inventory source URLs so route omissions are detectable.

Preserve approved comments as read-only content with their author display names, dates, and thread relationships where present. Do not publish commenter email addresses or IP addresses. Remove comment forms and submission endpoints.

Preserve the contact page and replace its form with a clear notice that the form is no longer active. Do not add a replacement email contact or submission service.

## Presentation and interactions

Recreate the current layout, typography, colors, navigation, content widths, and responsive behavior using shared Eleventy templates and local CSS/assets. Inspect representative live pages before implementation, including the homepage, a text page, a post, and pages containing downloadable resources.

Provide keyboard-accessible navigation, visible focus states, semantic headings, and responsive content. Preserve source image alternative text where available. Recreate useful accessibility controls if they are part of the current presentation and can function locally; controls must not depend on WordPress services.

Provide local static search over published titles and body text. Search results must link to preserved routes and handle empty queries and no results. Provide a useful 404 page with navigation back to the homepage. Limit client-side JavaScript to navigation, search, and any retained accessibility controls.

## Build and deployment

Use Eleventy with pnpm scripts for local development and production builds. Commit a pnpm lockfile and document the supported Node and pnpm versions. Generated output is `_site/` and is excluded from source control.

Add a GitHub Actions workflow that installs the pinned toolchain, installs dependencies from the lockfile, builds the archive, uploads the Pages artifact, and deploys through GitHub Pages. Configure the custom domain with `CNAME` and use root-relative routes without a repository path prefix. Document the required GitHub Pages setting and domain/DNS prerequisites.

Preparing the workflow and domain configuration is in scope. Publishing, changing DNS, or retiring the current WordPress instance is not part of implementation unless separately requested.

## Structure and responsibilities

Keep import tooling separate from the normal Eleventy build. Store normalized content in editable local files, presentation in shared templates and CSS, assets in local passthrough directories, and source URL/content inventories in migration metadata. Keep search indexing derived from the normalized published content.

Include a README covering installation, local preview, build, deployment setup, content provenance, and any missing source resources. The original export remains the archival source of record.

## Validation and acceptance

- A clean pnpm installation and production build succeed using local archive inputs.
- All 10 published pages and 8 published posts are represented, subject only to explicitly documented source discrepancies.
- Existing page and post URLs resolve to the corresponding content, including the root homepage.
- Approved comments appear read-only; unapproved comments and private commenter fields do not appear in generated output.
- The contact form is replaced by the inactive-form notice, and no comment or contact submission interface remains.
- Available images and downloads are local; broken internal links and unavailable assets are reported and resolved where possible.
- Static search finds representative pages/posts and handles empty and unmatched queries.
- Desktop and mobile visual comparisons of representative pages confirm fidelity to the source layout, typography, colors, and navigation.
- Navigation and search work with keyboard input, and mobile layouts avoid unintended horizontal overflow.
- The Pages workflow, custom-domain file, 404 page, and deployment documentation are present.

## Known limitations

External destinations may change after archiving. Files absent from both the export and the live site cannot be recovered from these sources. WordPress server behavior, analytics, administration, and submission endpoints are intentionally not retained. The archive will preserve the observed source presentation rather than promise pixel identity across every browser and viewport.
