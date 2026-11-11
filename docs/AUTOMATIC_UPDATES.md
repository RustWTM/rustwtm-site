# Automatic product updates

The website checks the official product repository automatically and rebuilds only when published release data or `CHANGELOG.md` actually changes. This keeps the site static on GitHub Pages while making its product content follow GitHub.

## Active flow

1. GitHub Actions checks for changes every five minutes, at minutes 3, 8, 13 … 58. GitHub may delay scheduled jobs; this is a polling target, not an exact delivery deadline.
2. The sync job resolves the product through its immutable GitHub repository ID, then fetches the latest stable release, recent published releases and the default branch’s `CHANGELOG.md`.
3. The updater validates the repository identity, official download origins, expected x64 MSI/ZIP and their checksum companions. It builds one atomic snapshot at `src/data/release.json`.
   The snapshot and public receipt carry schema version 1; legacy snapshots can be refreshed, while unknown future cache schemas are rejected.
4. A content hash ignores polling time and download counters. If the source is unchanged, the job compares the committed hash with the live `/updates.json` receipt. A match skips the build; a mismatch retries publication even when the snapshot is already committed. An unavailable or invalid receipt fails the check and is retried at the next poll.
5. Changed content is committed by the website’s own scoped `GITHUB_TOKEN`. The same workflow builds that exact commit, runs the checks and publishes it with GitHub Pages. The token’s push does not recursively start another build.
6. An API/validation failure stops the automatic publication. The existing live website and its last verified download snapshot remain available. Local ordinary builds can also use the verified cache if GitHub is unavailable.

The publisher retries non-fast-forward pushes against fresh main, regenerating the data rather than discarding another writer’s edit. All reset/switch operations are confined to the ephemeral GitHub Actions checkout; the helper refuses ordinary local execution.

## What updates automatically

- Version badges, release date, MSI/portable URLs, file sizes, checksum links and structured product version metadata.
- The official release-note history on `/changelog/`.
- A separate **In development** section from `[Unreleased]`. These entries are never advertised as features already available in the stable release.
- A changed released-version entry in `CHANGELOG.md`, shown alongside its GitHub release notes when the two sources differ.
- Canonical product links after an owner/name transfer of the same repository ID.
- `/updates.json`, a small public provenance receipt with the version, source hash and changelog SHA.

The system does not generate new marketing claims or replace screenshots based on an unreleased commit. Screenshots retain explicit source/version captions until reviewed assets are imported.

Actual schedule-triggered runs are recorded in Actions, including runs [42949721838](https://github.com/RustWTM/rustwtm-site/actions/runs/42949721838) and [43003738441](https://github.com/RustWTM/rustwtm-site/actions/runs/43003738441). The observed delivery has been much less frequent than the requested five-minute cadence. The timer is enabled, but this deployment cannot promise five-minute freshness from GitHub's scheduler. Manual dispatch uses the same updater when a newly published release needs immediate publication.

## Manual and event-driven entry points

Run **Build and deploy GitHub Pages** from Actions for a forced publication. Select **Deploy only if product content changed or the live site is behind** to run the same check as the schedule.

The workflow also accepts an authenticated `repository_dispatch` event of type `product-content-updated`. It ignores event payload URLs/branches and re-reads the configured official source. A GitHub App scoped to the website repository can use this receiver for immediate product-release notifications in the future.

The current repository policy rejects deploy keys (`Deploy keys are disabled for this repository`). No key or new secret was installed, and that policy was not changed. The active five-minute flow requires no cross-repository credential. An instant cross-repository notifier still requires an approved GitHub App connection; the receiver alone is not claimed as an installed webhook.

## Guarantees and limits

- Snapshot fields and release/checksum pairs come from a single validated content refresh. They are not stitched together in the visitor’s browser.
- Publication uses an immutable source commit and an offline build, so the build cannot silently fetch a newer version than the committed snapshot.
- Raw HTML and images in product Markdown are not rendered. Notes use a server-rendered Markdown component with safe URL handling.
- GitHub’s schedule can be delayed and public-repository schedules can be disabled after extended inactivity. The repository’s Actions history is the operational source of truth.
- Only official stable releases populate download badges. Drafts, prereleases and versions found only in the changelog are excluded from the stable history.

## Validation

The normal test command covers metadata validation, unchanged-content detection, release/changelog edits, missing checksums, repository transfers, bounded API reads, cached fallback, actual Git commits, no-op runs, publication retries and a gated concurrent push. Tests use local disposable Git repositories and injected API responses, without publishing fake product releases or exhausting system resources.

`actionlint` checks the workflow. Browser checks cover the new changelog page, theme/layout behavior and navigation. Hosted deployment and a second check-only/no-change run are verified during rollout.
