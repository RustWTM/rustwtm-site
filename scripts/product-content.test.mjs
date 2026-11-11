import test from "node:test";
import assert from "node:assert/strict";
import {
  buildSnapshot,
  parseChangelog,
  validCachedSnapshot,
  fetchJson,
} from "./lib/product-content.mjs";
function fixture() {
  const repository = "Example/Product",
    tag = "v1.2.3",
    names = [
      "RustWTM-1.2.3-x64.msi",
      "RustWTM-1.2.3-x64.msi.sha256",
      "rustwtm-x86_64-pc-windows-msvc.zip",
      "rustwtm-x86_64-pc-windows-msvc.zip.sha256",
    ];
  return {
    identity: { id: 42, full_name: repository, default_branch: "main" },
    expectedId: 42,
    latest: {
      tag_name: tag,
      draft: false,
      prerelease: false,
      published_at: "2026-11-10T12:00:00Z",
      html_url: `https://github.com/${repository}/releases/tag/${tag}`,
      body: "### Fixed\n- A published fix.",
      assets: names.map((name) => ({
        name,
        size: 123,
        browser_download_url: `https://github.com/${repository}/releases/download/${tag}/${name}`,
      })),
    },
    releases: [],
    changelog: {
      type: "file",
      encoding: "base64",
      size: 200,
      sha: "a".repeat(40),
      html_url: `https://github.com/${repository}/blob/main/CHANGELOG.md`,
      content: Buffer.from(
        "# Changelog\n\n## [Unreleased]\n\n### Added\n- A future feature.\n\n## [1.2.3] - 2026-11-10\n\n### Fixed\n- A published fix.",
      ).toString("base64"),
    },
  };
}
test("published release, package pairs and development notes stay separate", () => {
  const data = fixture();
  data.releases = [
    { ...data.latest, tag_name: "v1.3.0-beta.1", prerelease: true },
    { ...data.latest, tag_name: "v1.3.0", draft: true },
  ];
  const result = buildSnapshot(data);
  assert.equal(result.schemaVersion, 1);
  assert.equal(result.version, "v1.2.3");
  assert.equal(result.history.length, 1);
  assert.match(result.history[0].body, /published fix/);
  assert.doesNotMatch(result.history[0].body, /future feature/);
  assert.match(result.changelog.unreleased, /future feature/);
  assert.equal(result.assets.length, 4);
});
test("unchanged content keeps its hash and timestamp; release edits and changelog edits change it", () => {
  const data = fixture(),
    first = buildSnapshot({ ...data, now: "2026-01-01T00:00:00Z" });
  const same = buildSnapshot({ ...data, previous: first, now: "2026-02-01T00:00:00Z" });
  assert.deepEqual(same, first);
  const edited = buildSnapshot({
    ...data,
    latest: { ...data.latest, body: "A corrected release note." },
    previous: first,
  });
  assert.notEqual(edited.contentHash, first.contentHash);
  const changed = buildSnapshot({
    ...data,
    changelog: { ...data.changelog, sha: "b".repeat(40) },
    previous: first,
  });
  assert.notEqual(changed.contentHash, first.contentHash);
});
test("a release missing a checksum or using a foreign download origin is rejected", () => {
  const missing = fixture();
  missing.latest.assets.pop();
  assert.throws(() => buildSnapshot(missing), /package\/checksum missing/);
  const foreign = fixture();
  foreign.latest.assets[0].browser_download_url = "https://evil.invalid/file.msi";
  assert.throws(() => buildSnapshot(foreign), /Unexpected GitHub origin/);
  const wrong = fixture();
  wrong.identity.id = 43;
  assert.throws(() => buildSnapshot(wrong), /identity mismatch/);
});
test("repository identity survives rename but refuses a different repository", () => {
  const old = buildSnapshot(fixture());
  assert.throws(
    () =>
      validCachedSnapshot(
        { ...old, schemaVersion: 2 },
        { repository: "Example/Product", repositoryId: 42 },
      ),
    /Unsupported cached snapshot schema/,
  );
  assert.equal(validCachedSnapshot(old, { repository: "Renamed/Product", repositoryId: 42 }), old);
  assert.throws(
    () => validCachedSnapshot(old, { repository: "Example/Product", repositoryId: 43 }),
    /identity mismatch/,
  );
  assert.throws(
    () => validCachedSnapshot(old, { repository: "Other/Product" }),
    /another repository/,
  );
});
test("changelog headings inside code fences are not treated as releases", () => {
  const entries = parseChangelog(
    "## [Unreleased]\n```md\n## [9.9.9]\n```\nA draft.\n## [1.2.3]\nA release.",
  );
  assert.equal(entries.size, 2);
  assert.match(entries.get("unreleased"), /9.9.9/);
  assert.equal(entries.get("v1.2.3"), "A release.");
});

test("presentation changes invalidate the content hash and mismatched versions are rejected", () => {
  const data = fixture();
  const presentation = {
    version: data.latest.tag_name,
    sourceCommit: "a".repeat(40),
    archiveSha256: "b".repeat(64),
    hero: "performance",
    captures: [],
  };
  const first = buildSnapshot({ ...data, presentation, now: "2026-01-01T00:00:00Z" });
  assert.deepEqual(
    buildSnapshot({ ...data, presentation, previous: first, now: "2026-02-01T00:00:00Z" }),
    first,
  );
  assert.notEqual(
    buildSnapshot({ ...data, presentation: { ...presentation, archiveSha256: "c".repeat(64) } })
      .contentHash,
    first.contentHash,
  );
  assert.throws(
    () => buildSnapshot({ ...data, presentation: { ...presentation, version: "v9.9.9" } }),
    /Presentation does not match/,
  );
  assert.throws(
    () =>
      validCachedSnapshot(
        { ...first, presentation: { ...presentation, version: "v9.9.9" } },
        { repositoryId: 42 },
      ),
    /Cached presentation does not match/,
  );
});
test("API read failures and oversized bodies are bounded", async () => {
  await assert.rejects(
    fetchJson("https://api.github.com/test", {
      fetcher: async () => new Response("", { status: 503 }),
    }),
    /503/,
  );
  await assert.rejects(
    fetchJson("https://api.github.com/test", {
      fetcher: async () => new Response("x".repeat(64)),
      maxBytes: 16,
    }),
    /size limit/,
  );
  assert.deepEqual(
    await fetchJson("https://api.github.com/test", {
      fetcher: async () => new Response('{"ok":true}'),
    }),
    { ok: true },
  );
});
