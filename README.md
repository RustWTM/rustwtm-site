# RustWTM website

The English product website for [RustWTM](https://rustwtm.com), built with Next.js and TypeScript and exported to static files for GitHub Pages.

## Local development

Use Node **26.13.0** and npm **12.2.2**, matching `.nvmrc`, `package.json` and CI.

```sh
npm ci
npm run dev
```

For a production preview:

```sh
npm run typecheck
npm run build
npm run check
npm run preview
```

Open `http://localhost:4173`. The preview serves `out/`, including a real 404 response for unknown routes. There is no server runtime in production.

## Where things live

- `config/product.json`: the domain, active product repository, future repository and website repository. Product URLs are derived from this file.
- `src/data/release.json`: the verified product snapshot: stable release assets, published release notes, source changelog and a content hash. The updater uses the immutable product repository ID, bounded GitHub API reads, atomic replacement and a last-good cache. `--strict` is used by automation; ordinary local builds retain a verified cache during API outages.
- `src/data/gallery.ts` and `src/data/screenshots.json`: gallery content and screenshot provenance, including the exact product release tag, commit and input hashes.
- `public/brand/`: original vector icon plus outlined light/dark wordmarks. Original icon geometry is preserved.
- `public/screenshots/`: optimized, full-aspect WebP product captures. Illustrative fixture data is identified on the page.
- `public/fonts/`: self-hosted variable Latin fonts and their licenses. Only Space Grotesk and JetBrains Mono are loaded. `--font-quicksand` is defined as a reserved design token, without adding another font download.
- `src/app/globals.css`: central theme, resource-color, layout and motion tokens.
- `docs/RESEARCH.md`: product sources, design references, version verification and content limits.
- `docs/VALIDATION.md`: observed checks and live publication evidence.

## Update product links after a repository move

The product repository is now [`RustWTM/RustWTM`](https://github.com/RustWTM/RustWTM). The committed release snapshot was refreshed to v0.28.0 after verifying its MSI, portable ZIP and checksum assets on 10 November 2026. Gallery captions continue to identify the actual UI version in each existing capture.

The immutable `repositoryId` in `config/product.json` follows owner/name transfers of the same product automatically. To select an entirely different product, explicitly update both its ID and fallback repository name. Product links derive from the verified snapshot. `targetRepository` is historical information only.

## Refresh media

Import only screenshots verified against the release. `node scripts/prepare-assets.mjs <product-checkout> <release-tag>` reads selected PNGs from the tagged Git tree. When tracked captures have not changed, use `node scripts/import-ci-captures.mjs <product-checkout> <release-tag> <run-id>` to import reviewed renders from a successful exact-source CI run. The importer verifies the artifact archive digest and preserves earlier version labels on unchanged captures. Each capture records its own version, source and SHA-256. Check the renders and captions before publication. No product source files are modified.

## Publication

The `Build and deploy GitHub Pages` workflow runs on pushes to `main`, manual dispatch, authenticated `product-content-updated` dispatches and a five-minute scheduled check. It commits changed product data, builds that exact snapshot offline and deploys only after checks pass. Unchanged scheduled checks skip installation, build and deployment. Pull requests build and check without publication. See [automatic updates](docs/AUTOMATIC_UPDATES.md) for the active flow, optional immediate notifier and failure behavior.

The workflow uses a clean lockfile installation, type checking, static export, integration checks, a Pages artifact and a separate deployment job. Actions are pinned to verified release SHAs. Enable **GitHub Actions** as the Pages source, set the custom domain to **rustwtm.com**, and enable HTTPS once the certificate is available.

`public/CNAME` and `public/.nojekyll` are copied to the export root. All routes have trailing slashes and their own `index.html`; canonical and asset URLs use the custom-domain root. No repository-name base path is needed.

DNS for the apex must resolve to GitHub Pages. Preserve unrelated DNS records. The website workflow does not edit DNS.

## Interaction and accessibility

Theme selection offers Light, Dark and System, uses native radio-button keyboard behavior and persists locally. A pre-paint initialization script prevents an incorrect-theme flash. The mouse button independently stops the background rendering loop and removes pointer listeners. Reduced motion starts with effects disabled. Diagram animation pauses outside its viewport; background animation stops in hidden tabs.

The resource field uses bounded, resource-colored paths, magnetic pointer response and short-lived click waves. `src/lib/motion.ts` owns the frame loop and geometry; deterministic tests cover cancellation, stale callbacks, visibility, throttling and bounded field sizes. The footer includes the animated Oxog studio signature, controlled by the same motion preference and viewport observer. Mobile navigation and Appearance are mutually exclusive and support Escape.

Gallery tabs use arrow keys, Home and End. Screenshot enlargement uses a native modal dialog with Escape, focus containment and focus restoration. Code copying reports success or offers selected text if clipboard access is unavailable. The site contains no analytics, accounts or computer monitoring.

## Licensing

Website presentation copyright: oxog.net. The source license and attribution of the original MIT-licensed RustWTM product icon and screenshots are retained. Fonts: SIL Open Font License, included beside each font.

`public/og.png` is the current 1200×630 social image, rendered from the outlined vector source `public/brand/og.svg`. All page sharing metadata references it; the earlier `opengraph.png` file remains available for existing links.
