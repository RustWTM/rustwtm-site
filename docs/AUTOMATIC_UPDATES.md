# Automatic product updates

The product repository now requests a website update directly after release publication, release-note edits and `CHANGELOG.md` changes. The website rebuilds only when its validated content changes or a previous publication is unfinished. GitHub Pages remains static; the delayed schedule is a recovery fallback rather than the primary trigger. See [event-driven updates](EVENT_UPDATES.md) for access scope and operational verification.

## Active flow

1. The product's **Update product website** workflow requests a content check on this repository's main branch. Its primary release trigger is successful completion of the **Release** publisher, which also works when `GITHUB_TOKEN` publishes the release. Stable release publication/editing and changelog pushes provide additional triggers. The five-minute GitHub schedule remains a fallback and can be delayed.
2. The sync job resolves the product through its immutable GitHub repository ID, then fetches the latest stable release, recent published releases and the default branch’s `CHANGELOG.md`.
3. The updater validates the repository identity, official download origins, expected x64 MSI/ZIP and their checksum companions. For v0.30.0 and later it also requires the release's website media package and checksum, resolves the real tag commit, and verifies the bounded image manifest and individual image hashes. It stages content-addressed images before replacing the one atomic snapshot at `src/data/release.json`.
   The snapshot and public receipt carry schema version 1; legacy snapshots can be refreshed, while unknown future cache schemas are rejected.
4. A content hash ignores polling time and download counters. If the source is unchanged, the job compares the committed hash with the live `/updates.json` receipt. A match skips the build; a mismatch retries publication even when the snapshot is already committed. An unavailable or invalid receipt fails the check and is retried at the next poll.
5. Changed content is committed by the website’s own scoped `GITHUB_TOKEN`. The same workflow builds that exact commit, runs the checks and publishes it with GitHub Pages. The token’s push does not recursively start another build.
6. An API/validation failure stops the automatic publication. The existing live website and its last verified download snapshot remain available. Local ordinary builds can also use the verified cache if GitHub is unavailable.

The publisher retries non-fast-forward pushes against fresh main, regenerating the data rather than discarding another writer’s edit. All reset/switch operations are confined to the ephemeral GitHub Actions checkout; the helper refuses ordinary local execution.

## What updates automatically

- Version badges, release date, MSI/portable URLs, file sizes, checksum links and structured product version metadata.
- The official release-note history on `/changelog/`.
- The homepage's latest-version highlight cards, derived from the published stable release notes without inventing marketing claims.
- The hero image, entire screenshot gallery, original image dimensions and capture-version captions from the exact-release website media package.
- A separate **In development** section from `[Unreleased]`. These entries are never advertised as features already available in the stable release.
- A changed released-version entry in `CHANGELOG.md`, shown alongside its GitHub release notes when the two sources differ.
- Canonical product links after an owner/name transfer of the same repository ID.
- `/updates.json`, a small public provenance receipt with the version, source hash and changelog SHA.

The system never promotes an unreleased commit as a stable screenshot. Product release CI renders every navigation page from the exact tag with fixture data, converts the captures into WebP and publishes a non-expiring release asset together with its checksum. New navigation entries are discovered from the product's own navigation enum; their renders are required. Existing screenshot labels are replaced only after the whole matching package validates.

The product's reusable **Website media** workflow is a prerequisite of future `Release` publication and participates in provenance generation. Its manual mode backfills an already published stable version without replacing installer binaries; completion triggers the existing App notifier. Failed or missing image production stops publication rather than silently retaining mislabeled images. The site consumer uses public release assets and requires no additional cross-repository permissions.

The earlier schedule-triggered runs [42949721838](https://github.com/RustWTM/rustwtm-site/actions/runs/42949721838) and [43003738441](https://github.com/RustWTM/rustwtm-site/actions/runs/43003738441) arrived hours apart. Direct product notifications remove that timer from the normal release path. GitHub runner queues and build/deployment time still apply; this is not a fixed publication-time guarantee.

## Manual and event-driven entry points

Run **Build and deploy GitHub Pages** from Actions for a forced publication. Select **Deploy only if product content changed or the live site is behind** to run the same check as the schedule.

The installed notifier uses `workflow_dispatch` with `check_only=true`. Its private GitHub App is limited to Actions write on `rustwtm-site`; the temporary token is revoked at job completion. The website also retains the authenticated `repository_dispatch` receiver of type `product-content-updated` for compatibility. Event payload URLs and branches never replace the configured official source.

The deploy-key policy remains unchanged. The user-approved RustWTM Website Sync App is installed on the website repository only. Its key is held in the product repository's encrypted `WEBSITE_SYNC_APP_PRIVATE_KEY` secret, with `WEBSITE_SYNC_APP_CLIENT_ID` as a variable. No personal access token is copied into automation.

## Guarantees and limits

- Snapshot fields and release/checksum pairs come from a single validated content refresh. They are not stitched together in the visitor’s browser.
- Publication uses an immutable source commit and an offline build, so the build cannot silently fetch a newer version than the committed snapshot.
- Raw HTML and images in product Markdown are not rendered. Notes use a server-rendered Markdown component with safe URL handling.
- GitHub’s schedule can be delayed and public-repository schedules can be disabled after extended inactivity. The repository’s Actions history is the operational source of truth.
- Only official stable releases populate download badges. Drafts, prereleases and versions found only in the changelog are excluded from the stable history.

## Validation

The normal test command covers metadata validation, unchanged-content detection, release/changelog edits, missing checksums, repository transfers, bounded API reads, cached fallback, actual Git commits, no-op runs, publication retries and a gated concurrent push. Tests use local disposable Git repositories and injected API responses, without publishing fake product releases or exhausting system resources.

`actionlint` checks the workflow. Browser checks cover the new changelog page, theme/layout behavior and navigation. Hosted deployment and a second check-only/no-change run are verified during rollout.
