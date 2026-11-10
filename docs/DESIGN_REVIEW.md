# Live design review — 10 November 2026

Starting revision: `93cd439b859af688f19208d8a872e5802e89c37a`. The working tree was clean. Scope: website design, responsive behavior, motion, interactions, the requested Oxog studio promotion and website copyright, plus a clean `og.png`.

## Reproduced interaction defects

| Finding                                  | Before                                                                                                                                                     | Change                                                                                                                        | Verification                                                                                                                 |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Mobile navigation and Appearance overlap | On the live 375 px site, opening navigation then Appearance left both controls with `aria-expanded="true"`. The menu remained behind the appearance panel. | Opening either panel closes the other.                                                                                        | The same sequence on the updated build leaves navigation `false`, Appearance `true`.                                         |
| Escape leaves mobile navigation open     | With the mobile menu open, pressing Escape left its expanded state `true`.                                                                                 | Escape closes the menu and restores focus to its trigger. Clicking outside or crossing the desktop breakpoint also closes it. | Escape returned expanded state `false` and focus to Open navigation. Resizing an open mobile menu to 1440 px also closed it. |

Before screenshot: `.temp_files/review-02/before-menu-overlap.png`. Browser observations and final captures are retained in the same local evidence directory.

## Design changes

- Header icon targets increased from 35 px to 44 px on mobile. Primary and secondary hero actions use deliberate full-width rows at narrow sizes.
- Increased mobile paragraph, FAQ, code and helper-text sizes; improved the gallery tab targets and added a swipe cue.
- Replaced the old background with five resource-color paths, traveling chip/activity nodes, eased magnetic pointer response, a subtle pointer glow and bounded click rings/sparks. The layer remains behind content, with passive listeners and no pointer interception.
- Pointer effects skip interactive controls. Coarse-pointer devices use a smaller node budget, fewer click effects and a lower render target. No browser or physical-device performance benchmark is claimed.
- Added modest hero/section arrival movement, gallery changes, image-frame hover feedback, and a shared easing curve. Core content is never hidden while waiting for animation.
- Extracted frame scheduling and field geometry into `src/lib/motion.ts`. Exactly one pending frame is owned. Generation checks reject callbacks cancelled before stop/restart or visibility changes. Cleanup cancels frames and removes listeners/observers.
- Added the Oxog promotion from the supplied reference direction: the original pink/purple reference mark, studio message and `https://oxog.net` destination. Its breathing/orbit animations run only near the viewport and follow the global motion preference.
- The footer now reads `© 2026 oxog.net. All rights reserved.` Original product/license attributions are retained in source documentation.
- Created a clean, outlined-vector-based 1200×630 `public/og.png`, with source `public/brand/og.svg`. Every page’s Open Graph and Twitter image points to `/og.png`. The old image URL remains available for existing links.

## Validation

- TypeScript and production static export passed.
- **11 Node tests passed, 0 failed, 0 skipped**, including five deterministic motion lifecycle/geometry cases, both palette contrasts, all exported routes/assets/anchors, all footer credits and promotion links, `/og.png` metadata/dimensions, Pages files and release API outage behavior.
- **80 page/theme/width combinations captured**: five pages × two themes × 320, 375, 768, 1024, 1440, 1920, 2560 and 3840 px. No page-level horizontal overflow or failed images was observed. Containers remained within the 1728 px maximum. Capture pixel dimensions were checked against the requested viewport sizes.
- Visual review covered hero compositions, mobile body text, downloads, documentation, gallery/inspector presentation and the new footer in both themes.
- Native gallery End navigation, modal focus/scroll region, Escape and copy-button feedback were exercised. Copy reported `Copied`; exact OS clipboard contents were not independently read.
- In-view Oxog styles reported `oxog-breathe` and `oxog-orbit`; turning motion off changed both to `none`. Offscreen figures had no running animation style. Theme preference and motion preference persistence were also exercised.
- No warning or error console entries were observed in the reviewed browser flows.

The browser surface keeps its rendering tab visible when another in-app tab opens, so that is not an actual hidden-tab simulation. Visibility cancellation is covered by deterministic scheduler tests and source review. OS-level reduced-motion changes, a physical touch device, cross-browser rendering and CPU profiling were not instrumented. No Lighthouse score is claimed.

Publication runs through the existing [GitHub Pages workflow](https://github.com/RustWTM/rustwtm-site/actions). The latest workflow revision and live HTTPS assets are checked again after publishing; local success is not treated as evidence of live deployment.
