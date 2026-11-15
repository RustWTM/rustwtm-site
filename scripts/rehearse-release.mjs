// Exercise the real updater, Git commit, production build and HTTP export without
// publishing a product release or writing to either real repository's remote.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { once } from "node:events";
import { cp, mkdir, mkdtemp, readFile, stat, symlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";
import { buildSnapshot, parseChangelog } from "./lib/product-content.mjs";
import { releaseHighlights } from "../src/lib/release-highlights.ts";

const source = fileURLToPath(new URL("../", import.meta.url));
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
function command(cwd, executable, args, options = {}) {
  const result = spawnSync(executable, args, {
    cwd,
    encoding: "utf8",
    timeout: 30000,
    maxBuffer: 4 * 1024 * 1024,
    ...options,
  });
  assert.equal(
    result.status,
    0,
    `${executable} ${args.join(" ")}\n${result.stderr}\n${result.stdout}`,
  );
  return result.stdout.trim();
}
const git = (cwd, ...args) => command(cwd, "git", args);
await mkdir(path.join(source, ".temp_files"), { recursive: true });
const root = await mkdtemp(path.join(source, ".temp_files/release-rehearsal-"));
const checkout = path.join(root, "checkout");
const remote = path.join(root, "remote.git");
const fixtureFile = path.join(root, "github-fixture.json");
const publishedReceipt = path.join(root, "published-receipt.json");
const output = path.join(root, "sync-outputs.txt");
const report = {
  startedAt: new Date().toISOString(),
  sourceCommit: git(source, "rev-parse", "HEAD"),
  scenarios: [],
};
const passed = (name) => {
  report.scenarios.push(name);
  console.log(`PASS ${name}`);
};
let baseline = JSON.parse(await readFile(path.join(source, "src/data/release.json"), "utf8"));
const [major, minor] = baseline.version.slice(1).split(".").map(Number);
const nextVersion = `v${major}.${minor + 1}.0`;
const laterVersion = `v${major}.${minor + 2}.0`;
const nextCommit = "b".repeat(40);
const developmentEntries = parseChangelog(
  "## [Unreleased]\n" +
    baseline.changelog.unreleased.replace(/^## v(\d+\.\d+\.\d+) — In development$/gm, "## [$1]"),
);
const preparedNotes = developmentEntries.get(nextVersion);
const notes =
  preparedNotes ||
  `### Added
- **Release rehearsal ${nextVersion}:** These are isolated test notes, not a published feature.
- **New screenshot package:** All gallery images change with this simulated version.
### Fixed
- **Together on publication:** Cards and images must identify the same release.`;
report.from = baseline.version;
report.to = nextVersion;
report.captures = baseline.presentation.captures.length;
report.preparedNotesSource = preparedNotes ? "committed preparation notes" : "isolated test notes";
report.remainingDevelopmentVersion = laterVersion;
await mkdir(checkout);
// Copy tracked source and media, never a user's untracked files, credentials or Git state.
const tracked = git(source, "ls-files", "-z").split("\0").filter(Boolean);
for (const file of tracked) {
  const destination = path.join(checkout, file);
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(path.join(source, file), destination);
}
await symlink(path.join(source, "node_modules"), path.join(checkout, "node_modules"), "junction");
// The dependency junction is inside this workspace; allow Turbopack to resolve it.
const nextConfig = path.join(checkout, "next.config.ts");
await writeFile(
  nextConfig,
  (await readFile(nextConfig, "utf8")).replace(
    "export default config;",
    `export default { ...config, turbopack: { root: ${JSON.stringify(source)} } };`,
  ),
);
git(root, "init", "--bare", remote);
git(checkout, "init", "-b", "main");
git(checkout, "config", "user.name", "Release rehearsal");
git(checkout, "config", "user.email", "rehearsal@example.invalid");
git(checkout, "add", ".");
git(checkout, "commit", "-m", "Isolated release baseline");
git(checkout, "remote", "add", "origin", remote);
git(checkout, "push", "origin", "main");
assert.equal(git(checkout, "remote", "get-url", "origin"), remote);
const remoteHead = () => git(root, "--git-dir", remote, "rev-parse", "main");
const snapshot = () =>
  JSON.parse(git(root, "--git-dir", remote, "show", "main:src/data/release.json"));
const rawChangelog = [
  "## [Unreleased]\n- DO NOT SHOW UNRELEASED REHEARSAL CONTENT",
  `## [${laterVersion.slice(1)}]\n- PREPARED NOTES STAY IN DEVELOPMENT`,
  `## [${nextVersion.slice(1)}]\n${notes}`,
  ...baseline.history.map(
    (item) => `## [${item.version.slice(1)}]\n${item.changelog || item.body}`,
  ),
].join("\n\n");
const input = {
  identity: {
    id: baseline.repositoryId,
    full_name: baseline.repository,
    default_branch: baseline.branch,
  },
  latest: {
    tag_name: nextVersion,
    published_at: new Date(Date.parse(baseline.publishedAt) + 86400000).toISOString(),
    html_url: `https://github.com/${baseline.repository}/releases/tag/${nextVersion}`,
    body: notes,
    assets: baseline.assets
      .filter((asset) => !asset.name.includes("website-media"))
      .map((asset) => ({
        name: asset.name.replace(baseline.version.slice(1), nextVersion.slice(1)),
        size: asset.size,
        browser_download_url: asset.url
          .replaceAll(baseline.version, nextVersion)
          .replaceAll(baseline.version.slice(1), nextVersion.slice(1)),
      })),
  },
  releases: baseline.history.map((item) => ({
    tag_name: item.version,
    published_at: item.publishedAt,
    html_url: item.url,
    body: item.body,
  })),
  changelog: {
    type: "file",
    encoding: "base64",
    sha: "c".repeat(40),
    size: Buffer.byteLength(rawChangelog),
    html_url: `https://github.com/${baseline.repository}/blob/main/CHANGELOG.md`,
    content: Buffer.from(rawChangelog).toString("base64"),
  },
  commit: nextCommit,
};
// Seed the same prepared notes before publication, even when no real preparation
// exists yet. Both phases use this one changelog; only GitHub's stable release changes.
baseline = buildSnapshot({
  ...input,
  latest: {
    tag_name: baseline.version,
    published_at: baseline.publishedAt,
    html_url: baseline.url,
    body: baseline.history.find((item) => item.version === baseline.version).body,
    assets: baseline.assets.map(({ url, ...asset }) => ({ ...asset, browser_download_url: url })),
  },
  presentation: baseline.presentation,
  previous: baseline,
});
await writeFile(
  path.join(checkout, "src/data/release.json"),
  JSON.stringify(baseline, null, 2) + "\n",
);
git(checkout, "add", "src/data/release.json");
git(checkout, "commit", "-m", "Prepare the upcoming release in the isolated fixture");
git(checkout, "push", "origin", "main");
const preload = path.join(root, "github-boundary.mjs");
await writeFile(
  preload,
  `import fs from 'node:fs';
const data = JSON.parse(fs.readFileSync(process.env.REHEARSAL_FIXTURE, 'utf8'));
globalThis.fetch = async (url, options = {}) => {
 const target = new URL(url);
 if (target.hostname === 'rustwtm.com' && target.pathname === '/updates.json') {
  if (options.headers?.Authorization) throw new Error('Credential on public receipt');
  return Response.json(JSON.parse(fs.readFileSync(process.env.REHEARSAL_PUBLISHED, 'utf8')));
 }
 if (target.hostname === 'github.com') {
  if (options.headers?.Authorization) throw new Error('Credential on public asset');
  if (!target.pathname.includes('/releases/download/' + data.latest.tag_name + '/')) throw new Error('Unexpected release asset URL');
  return new Response(target.pathname.endsWith('.sha256') ? Buffer.from(data.checksum) : Buffer.from(data.archive, 'base64'));
 }
 if (target.hostname !== 'api.github.com') throw new Error('Unexpected network request: ' + url);
 if (target.pathname.includes('/git/ref/tags/')) return Response.json({object:{type:'tag', sha:'d'.repeat(40)}});
 if (target.pathname.includes('/git/tags/')) return Response.json({object:{type:'commit', sha:data.commit}});
 if (target.pathname === '/repositories/' + data.identity.id) return Response.json(data.identity);
 if (target.pathname.endsWith('/releases/latest')) return Response.json(data.latest);
 if (target.pathname.endsWith('/releases')) return Response.json(data.releases);
 if (target.pathname.endsWith('/contents/CHANGELOG.md')) return Response.json(data.changelog);
 throw new Error('Unexpected API request: ' + url);
};`,
);
const sync = async () => {
  await writeFile(fixtureFile, JSON.stringify(input));
  await writeFile(output, "");
  const result = spawnSync(process.execPath, ["scripts/sync-product.mjs"], {
    cwd: checkout,
    encoding: "utf8",
    timeout: 60000,
    maxBuffer: 4 * 1024 * 1024,
    env: {
      ...process.env,
      GITHUB_ACTIONS: "true",
      GITHUB_TOKEN: "rehearsal-not-a-credential",
      RUSTWTM_CONTENT_OFFLINE: "",
      CONTENT_CHECK_ONLY: "true",
      GITHUB_OUTPUT: output,
      NODE_OPTIONS: `--import=${pathToFileURL(preload).href}`,
      REHEARSAL_FIXTURE: fixtureFile,
      REHEARSAL_PUBLISHED: publishedReceipt,
    },
  });
  const outputs = await readFile(output, "utf8");
  return { ...result, outputs };
};
const build = async (label) => {
  console.log(`Building ${label} with the production build command...`);
  assert.ok(process.env.npm_execpath, "Run this rehearsal with npm run check:release-transition");
  const log = command(checkout, process.execPath, [process.env.npm_execpath, "run", "build"], {
    timeout: 180000,
    env: {
      ...process.env,
      RUSTWTM_CONTENT_OFFLINE: "1",
      NEXT_TELEMETRY_DISABLED: "1",
      NODE_OPTIONS: "",
    },
  });
  await writeFile(path.join(root, `${label}-build.log`), log);
  const published = path.join(root, label);
  await cp(path.join(checkout, "out"), published, { recursive: true });
  return published;
};

let publishedRoot = await build("before");
await writeFile(publishedReceipt, await readFile(path.join(publishedRoot, "updates.json")));
const server = createServer(async (req, res) => {
  try {
    let file = path.resolve(
      publishedRoot,
      "." + decodeURIComponent(new URL(req.url, "http://localhost").pathname),
    );
    assert.ok(file === publishedRoot || file.startsWith(publishedRoot + path.sep));
    if ((await stat(file)).isDirectory()) file = path.join(file, "index.html");
    const mime = {
      ".html": "text/html; charset=utf-8",
      ".json": "application/json",
      ".webp": "image/webp",
      ".js": "text/javascript",
      ".css": "text/css",
      ".svg": "image/svg+xml",
      ".woff2": "font/woff2",
      ".png": "image/png",
      ".txt": "text/plain",
    };
    res.writeHead(200, {
      "Content-Type": mime[path.extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404).end();
  }
});
server.listen(0, "127.0.0.1");
await once(server, "listening");
const url = `http://127.0.0.1:${server.address().port}`;
const readHttp = async (route) => {
  const response = await fetch(url + route, { signal: AbortSignal.timeout(10000) });
  assert.equal(response.status, 200, route);
  return Buffer.from(await response.arrayBuffer());
};
const receipt = async () => JSON.parse(await readHttp("/updates.json"));
try {
  assert.equal((await receipt()).version, baseline.version);
  const beforeHome = (await readHttp("/")).toString();
  const beforeChangelog = (await readHttp("/changelog/")).toString();
  const developmentSection = (html) =>
    html.match(/<section class="release-entry development-entry"[\s\S]*?<\/section>/)?.[0];
  assert.ok(developmentSection(beforeChangelog)?.includes(`${nextVersion} — In development`));
  assert.ok(baseline.changelog.unreleased.includes(notes), "The exact notes start in development");
  const beforeSpotlight = beforeHome.match(
    /<section class="container release-spotlight"[\s\S]*?<\/section>/,
  )?.[0];
  assert.ok(
    beforeSpotlight?.replace(/<[^>]*>/g, "").startsWith(`WHAT’S NEW IN ${baseline.version}`),
  );
  assert.ok(!beforeHome.includes(`${nextVersion} — In development`));
  assert.ok(
    beforeHome.includes(
      `/releases/download/${baseline.version}/RustWTM-${baseline.version.slice(1)}-x64.msi`,
    ),
  );
  for (const capture of baseline.presentation.captures) {
    assert.ok(
      beforeHome.includes(capture.file),
      "Before publication the gallery retains its stable image paths",
    );
    assert.equal(hash(await readHttp(capture.file)), capture.sha256);
  }
  passed(
    "the exact upcoming release notes start in development while cards and images stay stable",
  );
  const initialHead = remoteHead();
  const reject = async (name, message) => {
    const result = await sync();
    assert.notEqual(result.status, 0, name);
    assert.match(result.stderr, message);
    assert.equal(result.outputs, "", "A rejected update cannot request publication");
    assert.equal(remoteHead(), initialHead, "A rejected update cannot commit half a release");
    assert.equal((await receipt()).contentHash, baseline.contentHash);
    passed(name);
  };
  await reject(
    "new notes without the new media package preserve the entire old release",
    /missing its website media package/,
  );
  const images = [];
  for (const capture of baseline.presentation.captures) {
    const badge = Buffer.from(
      `<svg width="${capture.width}" height="70"><rect width="100%" height="70" fill="#942c38"/><text x="20" y="44" fill="white" font-size="26">REHEARSAL ${nextVersion} — ${capture.id}</text></svg>`,
    );
    const bytes = await sharp(path.join(source, "public", capture.file))
      .composite([{ input: badge, top: 0, left: 0 }])
      .webp({ quality: 90 })
      .toBuffer();
    images.push({
      ...capture,
      path: `images/${capture.id}.webp`,
      sha256: hash(bytes),
      bytes: bytes.toString("base64"),
      description: `Isolated ${nextVersion} release rehearsal. This is test media.`,
    });
  }
  const manifest = {
    schemaVersion: 1,
    repositoryId: baseline.repositoryId,
    version: nextVersion,
    sourceCommit: nextCommit,
    hero: baseline.presentation.hero,
    captures: images.map(
      ({ bytes: unused, file: oldFile, version: oldVersion, commit: oldCommit, ...capture }) =>
        capture,
    ),
  };
  const setMedia = async (packageManifest = manifest, corrupt = false) => {
    const archive = Buffer.from(
      command(
        root,
        process.platform === "win32" ? "python" : "python3",
        [
          "-c",
          `import json,sys,io,base64,zipfile
d=json.load(sys.stdin); b=io.BytesIO()
with zipfile.ZipFile(b,'w') as z:
 z.writestr('manifest.json',json.dumps(d['manifest']))
 for c in d['images']: z.writestr(c['path'],base64.b64decode(c['bytes']))
print(base64.b64encode(b.getvalue()).decode())`,
        ],
        { input: JSON.stringify({ manifest: packageManifest, images }), timeout: 15000 },
      ),
      "base64",
    );
    input.archive = archive.toString("base64");
    input.checksum = `${hash(archive)}  rustwtm-website-media.zip\n`;
    input.latest.assets = input.latest.assets.filter(
      (asset) => !asset.name.includes("website-media"),
    );
    for (const [name, bytes] of [
      ["rustwtm-website-media.zip", archive],
      ["rustwtm-website-media.zip.sha256", Buffer.from(input.checksum)],
    ])
      input.latest.assets.push({
        name,
        size: bytes.length,
        digest: `sha256:${hash(bytes)}`,
        browser_download_url: `https://github.com/${baseline.repository}/releases/download/${nextVersion}/${name}`,
      });
    if (corrupt) {
      archive[archive.length - 1] ^= 1;
      input.archive = archive.toString("base64");
    }
  };
  await setMedia({ ...manifest, version: baseline.version });
  await reject(
    "new notes with old-version images are rejected together",
    /media identity or release mismatch/,
  );
  await setMedia({ ...manifest, sourceCommit: "e".repeat(40) });
  await reject(
    "new-version images from a different source commit are rejected",
    /media identity or release mismatch/,
  );
  await setMedia(manifest, true);
  await reject(
    "a corrupted new image package cannot replace the old public site",
    /asset checksum mismatch/,
  );
  await setMedia();
  const accepted = await sync();
  assert.equal(accepted.status, 0, accepted.stderr);
  assert.match(accepted.outputs, /changed=true\npublish=true/);
  const committed = remoteHead(),
    next = snapshot();
  assert.notEqual(committed, initialHead);
  assert.equal(next.version, nextVersion);
  assert.equal(next.presentation.version, nextVersion);
  assert.equal(next.presentation.sourceCommit, nextCommit);
  assert.equal(next.history.find((item) => item.version === nextVersion).body, notes);
  assert.ok(!next.changelog.unreleased.includes(`## ${nextVersion} — In development`));
  assert.ok(
    !next.changelog.unreleased.includes(notes),
    "Promoted notes leave the development snapshot",
  );
  assert.ok(next.changelog.unreleased.includes(laterVersion), "Later work remains in development");
  assert.equal(next.presentation.captures.length, baseline.presentation.captures.length);
  const committedFiles = git(
    root,
    "--git-dir",
    remote,
    "diff-tree",
    "--no-commit-id",
    "--name-only",
    "-r",
    committed,
  ).split(/\r?\n/);
  assert.ok(committedFiles.includes("src/data/release.json"));
  for (const capture of next.presentation.captures) {
    assert.equal(capture.version, nextVersion);
    assert.equal(capture.commit, nextCommit);
    assert.ok(
      committedFiles.includes("public" + capture.file),
      capture.id + " committed with notes",
    );
    assert.notEqual(
      capture.sha256,
      baseline.presentation.captures.find((old) => old.id === capture.id).sha256,
    );
  }
  passed("new notes and all changed images are committed atomically to the same new version");
  const oldReceipt = await receipt();
  assert.equal(oldReceipt.version, baseline.version);
  const retry = await sync();
  assert.equal(retry.status, 0, retry.stderr);
  assert.match(retry.outputs, /changed=false\npublish=true/);
  assert.equal(remoteHead(), committed);
  passed("an unpublished committed update retries publication while the old site stays intact");
  const after = await build("after");
  const html = await readFile(path.join(after, "index.html"), "utf8");
  const spotlight = html.match(
    /<section class="container release-spotlight"[\s\S]*?<\/section>/,
  )?.[0];
  assert.ok(spotlight, "Rendered release section");
  const escapeHtml = (text) =>
    text.replace(
      /[&<>"']/g,
      (character) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;" })[character],
    );
  const expectedHighlights = releaseHighlights(notes);
  for (const highlight of expectedHighlights) {
    assert.ok(spotlight.includes(`<h3>${escapeHtml(highlight.title)}</h3>`), highlight.title);
    assert.ok(
      spotlight.includes(`<p>${escapeHtml(highlight.text)}</p>`),
      "Full prepared bullet context reaches the homepage",
    );
  }
  assert.ok(spotlight.replace(/<[^>]*>/g, "").startsWith(`WHAT’S NEW IN ${nextVersion}`));
  assert.ok(!spotlight.includes("DO NOT SHOW UNRELEASED"));
  assert.ok(!spotlight.includes("PREPARED NOTES STAY IN DEVELOPMENT"));
  const changelogHtml = await readFile(path.join(after, "changelog/index.html"), "utf8");
  assert.ok(changelogHtml.includes('id="in-development"'));
  const remainingDevelopment = developmentSection(changelogHtml);
  assert.ok(remainingDevelopment?.includes(`${laterVersion} — In development`));
  assert.ok(remainingDevelopment.includes("PREPARED NOTES STAY IN DEVELOPMENT"));
  assert.ok(!remainingDevelopment.includes(`${nextVersion} — In development`));
  assert.ok(!remainingDevelopment.includes(escapeHtml(expectedHighlights[0].text)));
  assert.ok(
    changelogHtml.includes(
      `id="${nextVersion.replaceAll(".", "-")}" class="release-entry release-latest"`,
    ),
  );
  passed(
    "publication removes the prepared version from development and promotes the same notes to stable cards",
  );
  const installerPath = `/releases/download/${nextVersion}/RustWTM-${nextVersion.slice(1)}-x64.msi`;
  assert.ok(html.includes(installerPath), "Homepage download follows the new release");
  assert.ok(
    (await readFile(path.join(after, "download/index.html"), "utf8")).includes(installerPath),
    "Download page follows the same new release",
  );
  for (const old of baseline.presentation.captures)
    assert.ok(!html.includes(old.file), old.id + " has no stale rendered reference");
  for (const capture of next.presentation.captures) {
    assert.ok(html.includes(capture.file), capture.id + " is present in the new gallery props");
    assert.equal(hash(await readFile(path.join(after, capture.file))), capture.sha256);
  }
  publishedRoot = after;
  await writeFile(publishedReceipt, await readFile(path.join(after, "updates.json")));
  const live = await receipt();
  assert.equal(live.version, nextVersion);
  assert.equal(live.contentHash, next.contentHash);
  assert.equal(live.presentation.version, nextVersion);
  assert.equal(live.presentation.sourceCommit, nextCommit);
  assert.equal(live.presentation.captures, next.presentation.captures.length);
  for (const capture of next.presentation.captures)
    assert.equal(hash(await readHttp(capture.file)), capture.sha256);
  const publishedHome = (await readHttp("/")).toString();
  assert.ok(publishedHome.includes(`<h3>${escapeHtml(expectedHighlights[0].title)}</h3>`));
  const publishedDevelopment = developmentSection((await readHttp("/changelog/")).toString());
  assert.ok(publishedDevelopment?.includes(laterVersion));
  assert.ok(!publishedDevelopment.includes(`${nextVersion} — In development`));
  passed(
    "the real static build and HTTP site expose new cards, hero, gallery and receipt together",
  );
  const repeated = await sync();
  assert.equal(repeated.status, 0, repeated.stderr);
  assert.match(repeated.outputs, /changed=false\npublish=false/);
  assert.equal(remoteHead(), committed);
  passed("a repeated completed release check skips commit, build and publication");
  report.completedAt = new Date().toISOString();
  report.result = "passed";
  report.baselineContentHash = baseline.contentHash;
  report.newContentHash = next.contentHash;
  report.fixtureCommit = committed;
  report.previewUrl = url;
  report.promotedHeadings = expectedHighlights.map((highlight) => highlight.title);
  report.before = {
    stable: baseline.version,
    development: nextVersion,
    images: baseline.presentation.version,
  };
  report.after = {
    stable: next.version,
    development: laterVersion,
    images: next.presentation.version,
  };
  await writeFile(path.join(root, "report.json"), JSON.stringify(report, null, 2) + "\n");
  console.log(
    `Release rehearsal passed: ${report.scenarios.length} scenarios, ${report.captures} changed images.`,
  );
  console.log(`Evidence: ${root}`);
  if (process.env.REHEARSAL_PREVIEW === "1") {
    console.log(`Preview: ${url}/#release-spotlight-title`);
    console.log("This is an isolated rehearsal; the public site has not changed.");
    await new Promise((resolve) => {
      process.once("SIGINT", resolve);
      process.once("SIGTERM", resolve);
    });
  }
} finally {
  server.closeAllConnections();
  server.close();
}
