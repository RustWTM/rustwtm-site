# Content and implementation research

Reviewed on 2026-11-10. Product source commit: `d15371c1d9a6a5134f18ba274d6d4ed29b7d031f` (v0.27.2).

## Repository and release identity

- `https://github.com/rustwtm/rustwtm` returned 404 at review time. It is the intended future product address, not a working public source.
- `https://github.com/ersinkoc/RustWTM` serves the current source and releases.
- Official latest stable release: [v0.27.2](https://github.com/ersinkoc/RustWTM/releases/tag/v0.27.2), published 2026-11-10 at 12:52:06 UTC. API returned neither draft nor prerelease.
- Packages: `RustWTM-0.27.2-x64.msi`, 36,515,840 bytes; `rustwtm-x86_64-pc-windows-msvc.zip`, 49,449,294 bytes. Each has a published SHA-256 companion. Package digests and URLs are recorded in `src/data/release.json`.
- Windows 10 1809+ and Windows 11, x64. No native ARM64 package is published. The README does not give a minimum CPU/RAM capacity.
- Website repository was absent and was created at `rustwtm/rustwtm-site` with the available organization-admin access. The product repository was not moved.

## Primary content sources

Use the product tag for reproducible research; site links go to maintained documentation on the configured branch.

- [README](https://github.com/ersinkoc/RustWTM/blob/v0.27.2/README.md): purpose, process modes, resources, governor, app budgets, commands, installation, updates, requirements and five UI languages.
- [Configuration](https://github.com/ersinkoc/RustWTM/blob/v0.27.2/docs/configuration.md): dry-run is automatic enforcement only; manual actions execute. Rule matching, conditions, governor ladder, foreground protection and rollback scope.
- [Docker](https://github.com/ersinkoc/RustWTM/blob/v0.27.2/docs/docker.md): local named-pipe contexts; all requests read-only; no container actions; bounded logs and statistics; in-window memory, no history persistence.
- [Security](https://github.com/ersinkoc/RustWTM/blob/v0.27.2/SECURITY.md): LocalSystem service; local pipe; elevated control, interactive-user reads; protected data directory; protected processes; private vulnerability reporting.
- [Process workspace](https://github.com/ersinkoc/RustWTM/blob/v0.27.2/docs/process-workspace.md), [columns](https://github.com/ersinkoc/RustWTM/blob/v0.27.2/docs/process-columns.md), [timeline](https://github.com/ersinkoc/RustWTM/blob/v0.27.2/docs/performance-timeline.md), [resources](https://github.com/ersinkoc/RustWTM/blob/v0.27.2/docs/performance-resources.md): current inspection behavior, measurements and sampling gaps.
- [Hardware](https://github.com/ersinkoc/RustWTM/blob/v0.27.2/docs/hardware.md), [CPU controls](https://github.com/ersinkoc/RustWTM/blob/v0.27.2/docs/cpu-controls.md): optional provider; device-dependent fan support; additional elevation and enforcement requirements; shared power settings require their own restore action.
- [Changelog](https://github.com/ersinkoc/RustWTM/blob/v0.27.2/CHANGELOG.md), [contributing](https://github.com/ersinkoc/RustWTM/blob/v0.27.2/CONTRIBUTING.md), [MIT license](https://github.com/ersinkoc/RustWTM/blob/v0.27.2/LICENSE).

The local product checkout matches the released HEAD but has concurrent uncommitted work. Its unreleased installed-app inventory and quick-navigation features were not used as released marketing claims. The site modifies no files in that checkout.

## Brand and screenshots

Original `assets/logo.svg` is retained verbatim: 256-unit gauge, rounded slate background, green `#4fc778` to copper `#de783d` arc, white needle. No tracing or geometric redesign was needed. Website wordmarks use outlined Space Grotesk letterforms beside this icon. Light-mode web accents are darkened for contrast.

The selected application captures exist in the v0.27.2 Git tree; the visible UI version in these captures is v0.27.1. Gallery captions explicitly identify that version and example data. They are not presented as visitor telemetry. Per-source SHA-256 values and original dimensions are in `src/data/screenshots.json`. All converted images preserve full aspect ratio.

## Design references

All eight supplied websites were opened in the browser; accessible page content was also read where supported. Browser inspection used the available approximately tablet-sized surface. Reference observations are visual-direction research, not a claim of an exhaustive responsive audit of those unrelated sites.

| Reference                                        | Observed direction                                                                                           | RustWTM application                                                                                            |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| [DockRouter](https://dockrouter.com)             | Split hero, restrained technical labels, route diagram, compact proof strip                                  | Split first screen and a short capabilities strip; real product capture replaces a hypothetical engine graphic |
| [UWAS](https://uwaserver.com)                    | Strong typographic hierarchy, layered engine, install path near the primary action                           | Clear download path and terminal examples, with varied sections                                                |
| [NothingDNS](https://nothingdns.com)             | Sparse neutral surfaces, green signal details, orbital backdrop                                              | Quiet continuous resource-flow background, without copying its lettering or composition                        |
| [CobaltDB](https://cobaltdb.dev)                 | Illustrated Light/Dark/System tiles, icons, selected check, explanatory note; adjacent mouse-effects control | Accessible native-radio appearance popover, local persistence, system preference, separate mouse toggle        |
| [GuardianWAF](https://guardianwaf.com)           | Large direct headline, shield-led diagram, explanation of request flow                                       | Foreground protection and a truthful governor ladder; no unsupported speed claims                              |
| [AnubisWatch](https://anubis.watch)              | Warm accent identity, emblem-led composition, precise labels                                                 | Copper accents drawn from RustWTM’s existing gauge, with its own product-first imagery                         |
| [CacheStorm](https://cachestorm.com)             | Geometric engine and infrastructure labels, strong source CTA                                                | Original process and resource SVGs, open-source contribution close                                             |
| [OpenLoadBalancer](https://openloadbalancer.dev) | Connected-node explanation and clear interactive illustration label                                          | Explicitly illustrative dry-run/enforcement explanation; no actual system scan                                 |

The final site does not include the references’ Oxog promotional area.

## Verified stable implementation versions

Official npm registry dist-tags and engine/peer metadata were queried on the implementation date. Next.js official documentation identified 16.4.6 as latest. Node’s official release API identified v26.13.0.

| Package                                | Stable version |
| -------------------------------------- | -------------- |
| Node.js                                | 26.13.0        |
| npm                                    | 12.2.2         |
| Next.js                                | 16.4.6         |
| React / React DOM                      | 19.3.1         |
| TypeScript                             | 7.0.2          |
| @types/node                            | 26.6.6         |
| @types/react / @types/react-dom        | 19.3.0         |
| sharp                                  | 0.35.5         |
| Prettier                               | 3.9.10         |
| Fontsource variable font distributions | 5.3.0          |

Next’s documented Node engine is >=20.9; React 19 is supported by the queried peer range. The clean install and production export validate the selected combination. No motion library is required: bounded canvas work and native CSS provide the requested effects.

GitHub Actions versions were checked using their official release APIs and pinned to the exact released Git object: checkout v7.0.1, setup-node v7.1.0, configure-pages v6.0.0, upload-pages-artifact v5.0.0, deploy-pages v5.0.1. See the workflow for full SHAs.

References: [Next static exports](https://nextjs.org/docs/app/guides/static-exports), [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [Next registry metadata](https://registry.npmjs.org/next/latest).

## Content boundaries

No benchmarks, user counts, testimonials, measured speed advantages or universal hardware-control claims are used. Docker is monitoring-only. Automatic enforcement, explicit manual actions, privilege requirements and separate power-policy restoration are distinguished. No verified-signature claim is made. The website’s lack of tracking is a statement about its own implementation, not an unproven blanket claim about every product connection.
