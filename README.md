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
- `src/data/release.json`: a verified, committed release snapshot. `scripts/refresh-release.mjs` refreshes it at build time with a 15-second API deadline. On API failure, the same-repository snapshot remains usable. Missing expected x64 packages or an unexpected asset origin also retain the last known release. A repository change requires a successful refresh, preventing old-owner downloads from being silently used.
- `src/data/gallery.ts` and `src/data/screenshots.json`: gallery content and screenshot provenance. The captures in this site are from the released product tree; newer untracked installed-app and quick-navigation captures were excluded.
- `public/brand/`: original vector icon plus outlined light/dark wordmarks. Original icon geometry is preserved.
- `public/screenshots/`: optimized, full-aspect WebP product captures. Illustrative fixture data is identified on the page.
- `public/fonts/`: self-hosted variable Latin fonts and their licenses. Only Space Grotesk and JetBrains Mono are loaded. `--font-quicksand` is defined as a reserved design token, without adding another font download.
- `src/app/globals.css`: central theme, resource-color, layout and motion tokens.
- `docs/RESEARCH.md`: product sources, design references, version verification and content limits.
- `docs/VALIDATION.md`: observed checks and live publication evidence.

## Update product links after a repository move

Change `repository` in `config/product.json` only after the new repository serves the product and releases. Run `npm run refresh:release`, inspect the resulting metadata, then build and check. `targetRepository` is informational and is not used for public product links. This website does not move the product repository.

## Refresh media

Import only screenshots verified against the release. `node scripts/prepare-assets.mjs <product-checkout>` converts the selected PNGs to WebP and records source hashes. Check captions and release provenance when updating media. No product source files are modified.

## Publication

The `Build and deploy GitHub Pages` workflow runs on pushes to `main`, manual dispatch and a daily schedule. Pull requests build and check without deployment. The schedule refreshes release metadata in the build output without automatically committing it. Periodically commit a fresh verified snapshot so offline builds stay current.

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
