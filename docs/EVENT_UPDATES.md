# Event-driven website updates

Activation status: active. The private app is installed on the website repository, and a real changelog push triggered a validated site update and successful publication without manual site dispatch.

## Why the schedule is insufficient

The five-minute schedule is enabled, but recorded schedule events arrived hours apart. A successful no-change run proves the updater works; it does not establish timely delivery of the next scheduled event. The new primary trigger belongs to the product repository and runs when publication finishes.

## Product notification flow

`RustWTM/RustWTM/.github/workflows/update-website.yml` accepts:

- Successful completion of the trusted `Release` workflow. This is essential because a release published with `GITHUB_TOKEN` does not start another workflow through its `release` event.
- Publication or editing of a non-draft, non-prerelease GitHub release.
- A change to `CHANGELOG.md` on main.
- Manual dispatch for verification and recovery.

The notifier checks the numeric product repository identity and the release workflow path. It never checks out or executes event-supplied code. A pinned official action mints a short-lived GitHub App token restricted to `rustwtm-site`, then requests `deploy.yml` on main with `check_only=true`. Failed requests are retried; failure remains visible in Actions.

The website re-fetches the official product data instead of trusting a webhook payload. Existing content validation, exact-commit offline builds, no-change skipping and retry of unfinished publications remain in place. The old schedule remains a fallback.

## Access configuration

The private app is owned by RustWTM and installed on **RustWTM/rustwtm-site only**.

| Setting | Value |
| --- | --- |
| App manifest | `config/website-sync-app.json` |
| Repository permissions | Actions: read/write; implicit Metadata: read |
| Product repository variable | `WEBSITE_SYNC_APP_CLIENT_ID` |
| Product repository encrypted secret | `WEBSITE_SYNC_APP_PRIVATE_KEY` |

Actions write can manage workflow runs and artifacts in the selected site repository. It does not grant repository content, secret administration or organization administration access. The notifier requests the same limited permission when minting a token, and the official action revokes the token at job completion. The private key is supplied directly to GitHub's encrypted Actions secret storage; no personal access token is copied into automation.

App setup uses a temporary loopback callback with an unguessable state. The installation must select exactly the website repository before configuration is saved. The bootstrap verification rejects incorrect callback state before performing any GitHub mutation.

## Acceptance

The legitimate automation changelog entry in product commit `e18d4a5cbe8529173d5d250b24589b6c7dedb0c7` triggered [product notification run 43047804969](https://github.com/RustWTM/RustWTM/actions/runs/43047804969). Its installed App token started [website run 43047827875](https://github.com/RustWTM/rustwtm-site/actions/runs/43047827875) eight seconds after the notifier was queued. The website created bot snapshot commit `adf78cc89f248526cb83162592e128a01eccf9c9`, passed all 22 tests, built that verified snapshot and deployed successfully. The public receipt then matched changelog SHA `a30fc186c36dbee237ad3d2ad5dc844c587d20f3` and content hash `c5feaf6325bb25ac124e6dbac9fb844008a532404ac0b0bcb098becdcc4e4e65`.

The notifier log confirmed token revocation at job completion. No fake release was published and no release publication was rerun for this check. The next release's automatic `workflow_run` path is configured and matches the existing publisher's event structure; a future release publication itself has not been simulated.

A second [product notification run 43048099363](https://github.com/RustWTM/RustWTM/actions/runs/43048099363) exercised manual recovery through the same App. Its [website check 43048126112](https://github.com/RustWTM/rustwtm-site/actions/runs/43048126112) passed with build and deployment skipped because the live content was current. Token revocation was confirmed again.

References: [cross-repository GitHub App authentication](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/making-authenticated-api-requests-with-a-github-app-in-a-github-actions-workflow), [workflow trigger behavior](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows), [manifest setup flow](https://docs.github.com/en/apps/sharing-github-apps/registering-a-github-app-from-a-manifest).
