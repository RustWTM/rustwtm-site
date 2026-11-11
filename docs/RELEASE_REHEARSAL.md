# New-release update rehearsal

The release-transition gate runs the real updater, Git commit and push, production static export and HTTP serving in isolation. Run it with `npm run check:release-transition`. The Git remote is a disposable local bare repository, not either project's real remote. The GitHub boundary supplies an annotated release tag, new stable-release notes, a changelog with an unreleased sentinel and a valid website media ZIP. All existing gallery views receive new bytes and a visible rehearsal watermark. The target is the next minor version after the committed stable snapshot.

The script builds the previous website, imports the new release through `sync-product.mjs`, builds the updated website through the normal `npm run build` command, and checks the rendered release section, hero and gallery references, version receipt and every image's HTTP checksum. A local publication pointer switches only after a successful build. Dependency installation is shared through a local junction; only the isolated copy's Turbopack resolution root changes. Production source, snapshot, product tags and release assets remain untouched.

## Required scenarios

1. New release notes without the new image package fail before commit or publication; the previous website remains complete.
2. A package claiming the previous version is rejected with the new notes.
3. A package with the new version but a different source commit is rejected.
4. Corrupted archive bytes fail the official digest check.
5. A valid new release commits its notes, version and all changed images in the same Git commit.
6. An update committed before a failed publication requests publication again, without a duplicate content commit. The old HTTP site stays intact until replacement.
7. The production export exposes the new cards, hero, gallery, downloads and `/updates.json` together. Every image is fetched over HTTP and compared with its new SHA-256. Old gallery paths and unreleased claims must be absent from the rendered release section.
8. A repeated completed check requests neither another commit nor another publication.

The workflow runs this gate after the normal integration suite and before uploading a Pages artifact. A failed rehearsal blocks publication. Logs, the local before/after exports and `report.json` are retained under `.temp_files/release-rehearsal-*/`. On a developer machine, setting `REHEARSAL_PREVIEW=1` keeps the isolated HTTP preview running until interrupted.

## Verification boundary

On 11 November 2026, the local rehearsal exercised v0.30.0 to a simulated v0.31.0 with all 27 gallery images changed. The browser also exercised all 27 selections and verified the new version paths, updated hero, release cards and absence of console warnings/errors. This simulated version was not published to GitHub Releases or the public website.

The test does not pretend to render a future product version that does not exist. Real product rendering, official asset upload, GitHub App dispatch and hosted website handling are checked separately against the existing stable release. A manual notifier check [43072117847](https://github.com/RustWTM/RustWTM/actions/runs/43072117847) successfully started receiver [43072139204](https://github.com/RustWTM/rustwtm-site/actions/runs/43072139204); the receiver correctly skipped build/deploy because the complete live v0.30.0 snapshot was already current. The public product release and website remain v0.30.0.
