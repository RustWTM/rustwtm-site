# Automatic homepage and gallery updates

The website's latest-version cards, hero and entire screenshot gallery now derive from the same validated stable-release snapshot as the download links. There is no hard-coded highlight version or separately maintained gallery version.

## Producer

The product repository's reusable `Website media` workflow checks out `refs/tags/<version>`, runs the real GUI renderer with fixture data on a disposable Windows runner, and renders every navigation page. Both themes, compact/wide layouts, device views, process details and quick setup are included in the render checks. The packager discovers the navigation enum, requires each page's capture, converts the selected frames to WebP and emits a bounded manifest.

`Release` requires the media job before publication. Its provenance job includes the media ZIP, and publication uploads `rustwtm-website-media.zip` and its SHA-256 sidecar together with the installers. A manual backfill mode adds only the missing website assets to an existing stable release, validates its real tag commit and refuses to overwrite different existing bytes. Completion triggers the already installed website notifier.

## Consumer

The updater validates the official repository and package/checksum URLs first. For v0.30.0 onward a complete website package is required. It resolves annotated tags to a bounded exact commit, verifies GitHub's archive digest and the checksum sidecar, then verifies every manifest identity, path, image hash and size. Archives cannot write their own paths: only validated capture IDs become WebP filenames. Unknown entries, duplicates, wrong versions, wrong commits, symlinks and missing core views are rejected.

Validated files are staged in a new directory named by the version and archive hash. Only after staging succeeds does the updater atomically replace `src/data/release.json`, whose `presentation` field owns all gallery labels, file paths, source commits, dimensions and hashes. A Git commit captures the images and JSON together, and the offline build checks their actual dimensions and hashes before deployment. Failures preserve the last complete public site.

Homepage cards come from the latest stable release's notes, falling back to that released changelog entry. Markdown examples are skipped and links/formatting become plain text. Three top-level release bullets are selected in source order, preserving their complete context. Short supplied headings or source-derived headings provide card titles; no AI-generated feature claims or unreleased features are substituted.

## Rechecks and recovery

If the package digest, tag commit and local image hashes still match, images are reused without another archive conversion. Release-note edits can update the cards while retaining the exact same image package. The overall content hash includes presentation metadata, so media changes trigger publication and a no-change check still skips it. `/updates.json` exposes the presentation version, source commit, archive hash and image count.

The existing event-driven notifier is unchanged in scope. The consumer reads public release assets; it does not need product Actions/artifact access or an expanded App installation. The five-minute schedule remains a recovery fallback. Product renderer failures are visible in Actions and prevent an incomplete future release from publishing.

## Rollout evidence

[Producer run 43055386082](https://github.com/RustWTM/RustWTM/actions/runs/43055386082) rendered the actual v0.30.0 source `90dafd5376fbaedbc7b64f961b19f51fc9a14a4b`, passed all four render tests and four packager tests, and published 27 optimized images in the existing stable release. The archive SHA-256 is `6b21d69ed6e45cf099c182eafc3c19051835562b6ddfaf0dad3499f2bbddea4b`. The website imported it through the same public-asset updater used by automation.

The website's 30 checks cover release/highlight edits, media identity/hash changes, invalid archive paths and hashes, matching exported image dimensions and bytes, installer/portable checksum pairing, cached failure behavior, publication retries and concurrent pushes. Browser checks exercised all 27 gallery selections by keyboard, the image dialog, and 390/768/1440 layouts in both themes. No fake product release or developer-host telemetry was used.
