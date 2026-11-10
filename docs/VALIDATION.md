# Website validation

Validation date: 2026-11-10. This report distinguishes local checks, browser observations and hosted publication.

## Local production checks

- Clean `npm ci` from the committed lockfile: passed, 30 packages audited, no reported vulnerabilities.
- TypeScript check: passed.
- Next.js 16.4.6 production build and static export: passed. Five public content routes, designed 404, robots and sitemap exported without a server runtime.
- Node integration suite: **5 passed, 0 failed, 0 skipped**. Covers color contrast in both central palettes, per-page SEO/landmarks, local page/anchor/media/font/script resolution, Pages export files, and the release API outage fallback.
- External link check: **25 unique external destinations passed** (HEAD requests including the MSI, portable ZIP and checksum companions). Output retained locally in `.temp_files/external-links.json`.
- The original icon is retained as vector source; 14 screenshots were converted to full-aspect WebP, approximately 995 KB combined. The export is approximately 2.75 MB, including HTML, JavaScript, media and fonts; this is an artifact size, not a measured browser transfer or runtime-performance claim.

## Responsive and theme review

The five pages were captured in **Light and Dark** at **375, 768, 1024, 1440, 1920, 2560 and 3840 CSS px**. The final matrix contains 70 unique page/theme/width combinations. The browser viewport height was 1000 px for the matrix, with 900 px used for additional mobile interaction checks.

- No page-level horizontal overflow in the final matrix.
- No failed images in the final matrix.
- Main, header and footer containers share central gutters; maximum width is 1728 px on wide screens.
- Full-page captures retained in `.temp_files/qa/`; visual inspection included hero compositions, mobile content, process/gallery presentation, protection diagram, downloads, documentation, brand assets and footer layouts.
- An observed mobile documentation overflow from the grid’s minimum-content width was fixed with an explicit zero minimum on grid children. The affected Light and Dark views were recaptured.
- The original horizontal governor figure was too small on mobile. It was replaced there by a stacked SVG with readable labels.

## Observed interactions

- Native theme radio keyboard navigation: Light → ArrowRight selected Dark and changed the displayed theme.
- Escape closed the appearance panel and returned focus to the theme button.
- Dark theme and disabled background motion persisted after reload.
- Mobile navigation opened, followed Documentation and closed after navigation.
- Gallery ArrowRight, Home and End changed the selected tab correctly.
- Screenshot modal opened with focus on Close; Escape closed it and restored focus to the trigger.
- Enforcing illustration changed its explanation without running system actions.
- Copy-code control reported `Copied`; no clipboard API error occurred. The browser-control clipboard read returned an empty value, so system clipboard contents were not independently confirmed.
- No warning or error console entries were observed in these browser checks.

Reduced-motion initialization, hidden-tab loop cancellation, bounded click effects and observer/listener cleanup were reviewed in source. An OS-level reduced-motion preference change and a background-tab CPU profile were not independently instrumented. No Lighthouse or cross-browser score is claimed. The browser’s normal System appearance is supported; live OS theme switching still requires device-level testing.

## Hosted publication

Publication evidence is appended after GitHub Actions deployment and HTTPS verification. Local success alone is not recorded as a completed live deployment.
