# Collective Responsibility archive

Permanent Eleventy archive of **laborforum.diglib.org**, retaining the WordPress site's Nucleus theme, published URLs, pages, posts, local downloads, and approved discussion. Contact and comment submissions are inactive. Search runs locally in the browser.

## Run locally

Use Node.js **24.14.0** (`.nvmrc`) and pnpm **12.10.1** (`package.json`). Install pnpm with your preferred installation method; the [official pnpm installation guide](https://pnpm.io/installation) covers the available options.

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm check
pnpm dev
```

Eleventy prints the preview URL (normally `http://localhost:8080`). `_site/` is generated output and is not committed. Run the build before tests because some checks inspect rendered output. Dependencies need network access for their first installation; subsequent builds use only local content and assets.

## Deploy to GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds and checks pull requests, and deploys pushes to `main` or manual runs on `main`. It uses the pnpm version declared in `package.json`, frozen-lockfile installation, and the `_site/` Pages artifact.

1. Push the reviewed archive changes to the repository's `main` branch when ready to publish. If the default branch has another name, update the workflow branch filters and deployment conditions first.
2. In **Settings → Pages → Build and deployment**, select **GitHub Actions**.
3. In Pages settings, set the custom domain to **laborforum.diglib.org**. `src/CNAME` is included in the build, but the repository's Pages custom-domain setting is still required for an Actions deployment.
4. Point the DNS CNAME for `laborforum.diglib.org` to the GitHub Pages account host (`OWNER.github.io`, without a repository path). Coordinate the cutover from the current WordPress host. Keep WordPress available until the archive has been checked on its final domain.
5. Enable **Enforce HTTPS** once GitHub provisions the certificate, then verify representative pages, search, and PDF downloads on the final domain.

The site uses root-relative URLs for the custom domain; it is not configured for an `OWNER.github.io/REPOSITORY/` subpath. No DNS changes, remote pushes, or deployment have been performed as part of this local migration.

References: [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [custom subdomains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-a-subdomain), and [pnpm/action-setup](https://github.com/pnpm/action-setup).

## Archive content and provenance

- `src/_data/archive.json`: normalized published content, navigation, approved discussion, and recovered presentation HTML.
- `src/_includes/`: shared templates; `src/assets/css/site.css`: archive adaptations and original custom colors.
- `src/wp-content/`: original upload/theme paths; `src/assets/vendor/`: external resources recovered locally, including fonts and PDFs.
- `migration/source-inventory.json`: published routes and source checksums.
- `migration/published-source.xml`: filtered CI fixture containing published records and approved discussion, without private author/comment fields, rejected comments, or plugin records.
- `migration/asset-manifest.json`: asset source URLs, local paths, status, and provenance.
- `migration/report.md`: recovery details, visual comparisons, checks, and limitations.

The original export at `data/collectiveresponsibility.WordPress.2026-10-10.xml` is unchanged and deliberately excluded from Git. Retain that file privately as the source of record. Normal builds and CI do not require it. Verification checks its checksum when present and always checks the published fixture. Tests compare rendered body text with the original locally, or the published fixture in a clean checkout.

### Repeat the one-time migration

Imports write only to ignored `output/import-staging/`. Review staged content and asset provenance before explicitly promoting with `pnpm import:promote -- --overwrite`. Promotion backs up current files under `output/import-backups/`; it replaces archival corrections, so reapply those corrections before accepting the new build. Never use imports for routine maintenance. The original XML and live WordPress site are required, and asset recovery needs network access.

```sh
pnpm import:wordpress
pnpm import:fixture
pnpm import:assets
pnpm import:promote -- --overwrite
pnpm check
```

The importer sanitizes invalid XML characters in memory. Asset recovery uses rendered WordPress body HTML to retain paragraph formatting, decodes public email addresses without Cloudflare scripts, preserves the export's text, and records local asset mappings. WordPress runtime scripts, analytics, contact forms, and comment submission are excluded.

## Checks and limitations

The checks cover 10 published pages, 8 posts, one approved pingback, original body text, category/author routes, local PDFs/images/fonts, internal links and fragments, search behavior, comment privacy, and inactive submissions. All 30 inventoried source assets were available. CSS dependencies and SHA-256 checksums for all inventoried assets are checked; icon fonts use local WOFF/TTF files.

External websites and historical survey links remain external and can change or become unavailable. Search requires JavaScript; published content and navigation remain available without it. The site's footer identifies it as a permanent archive. Future changes should be limited to archival corrections rather than new publishing.

Nucleus 1.5.0 CSS is preserved with its original GPL v2-or-later license header and theme attribution. Font and content ownership remains with the original owners; this repository does not relicense those materials.

## Long-term maintenance and recovery

`pnpm check` deletes stale `_site` output, rebuilds, runs tests and integrity checks, then audits every HTML route at mobile and desktop sizes with local Chromium and axe. It also checks text enlargement, spacing, menu/Escape behavior, and search. Results are saved in ignored `output/audit/results.json`. Incomplete axe checks are reported for manual review and retained in the JSON results. Current scans include desktop navigation contrast checks that axe cannot resolve against the transparent background. Automated scans do not replace screen-reader or PDF reading-order review.

Use `pnpm format` for first-party code. After an intentional asset correction, inspect the changed files and run `pnpm assets:refresh` to update the manifest. Do not refresh checksums merely to silence an unexpected mismatch.

PDF title corrections are recorded in each asset's `metadataTitle` and `archivalModification`. Install ExifTool, qpdf, and Poppler, then run `pnpm pdf:metadata` to apply the recorded titles with text preservation and structural checks. The command saves changed originals in `output/pdf-originals/`. To correct a different title, update `metadataTitle` deliberately. Alternatively, use ExifTool (`exiftool -overwrite_original -Title="RECORDED TITLE" FILE`), compare `pdftotext` output before and after, and check the result with `qpdf --check FILE`. Then refresh the checksum. Keep original PDFs privately. The grant proposal still requires manual PDF accessibility remediation.

`pnpm package` runs the complete checks and creates `output/releases/laborforum-archive.tar.gz` plus a SHA-256 sidecar. Preserve these alongside a repository snapshot and the private original XML in institutional storage. To recover without Node or pnpm, validate the checksum and extract the tarball into any static web host's document root. The archive contains local fonts, images, documents, search, and a CNAME file. Preserve DNS ownership and HTTPS configuration separately.

CI runs quarterly as well as on changes; scheduled checks do not deploy. Review Node's support status, the pinned Node/pnpm versions, dependencies, and GitHub Actions quarterly. Apply upgrades in a branch, update the lockfile, and run `pnpm check` before merging. Dependabot opens monthly dependency proposals. GitHub Actions artifacts expire and should not be the sole preservation copy. Review `pnpm audit` findings as part of dependency maintenance; the current Eleventy dependency tree reports braces and sprintf-js advisories with no patched versions offered by the registry audit. These are build dependencies; archived pages do not load them.
