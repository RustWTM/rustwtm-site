import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { releaseHighlights } from "../src/lib/release-highlights.ts";
import { fetchPublicAsset, resolveTagCommit } from "./lib/website-media.mjs";

test("homepage highlights follow new release notes and keep complete bullet context", () => {
  const before = releaseHighlights(
    "### Added\n- **Quick setup:** Review your choices.\n  Skipping keeps the existing settings.\n- Startup apps support search.\n### Fixed\n- A startup crash is fixed.",
  );
  assert.equal(before[0].title, "Quick setup");
  assert.match(before[0].text, /Skipping keeps the existing settings/);
  assert.equal(before[1].title, "Startup apps");
  assert.equal(before[2].kind, "Fixed");
  const after = releaseHighlights(
    "### Added\n- **New device view:** A feature from the next release.",
  );
  assert.equal(after[0].title, "New device view");
  assert.doesNotMatch(JSON.stringify(after), /Quick setup/);
});

test("highlight parsing ignores code examples and has a plain-text fallback", () => {
  const result = releaseHighlights(
    "### Added\n```md\n- A fake feature inside an example.\n```\n- A real [feature](https://example.com) with `<code>` and **formatting**.",
  );
  assert.equal(result.length, 1);
  assert.doesNotMatch(result[0].text, /fake feature|<code>|https:/);
  assert.match(result[0].text, /real feature/);
  assert.equal(releaseHighlights("Release 1.2.3")[0].text, "Release 1.2.3");
});

test("an automatic card heading cannot join text from two sentences", () => {
  const notes =
    "### Added\n- Choose row and column separators independently across tables. Processes can show file descriptions.";
  assert.equal(
    releaseHighlights(notes)[0].title,
    "Choose row and column separators independently across tables.",
  );
});

test("public media reads are bounded, checksum-checked and never send a bearer token", async () => {
  const bytes = Buffer.from("a release asset"),
    digest = "sha256:" + createHash("sha256").update(bytes).digest("hex");
  const asset = {
    size: bytes.length,
    digest,
    browser_download_url: "https://github.com/example/product/releases/download/v1.2.3/site.zip",
  };
  const fetcher = async (_url, options) => {
    assert.equal(options.headers, undefined);
    return new Response(bytes);
  };
  assert.deepEqual(await fetchPublicAsset(asset, { fetcher }), bytes);
  await assert.rejects(
    fetchPublicAsset({ ...asset, digest: "sha256:" + "f".repeat(64) }, { fetcher }),
    /checksum mismatch/,
  );
  await assert.rejects(fetchPublicAsset(asset, { fetcher, maxBytes: 3 }), /size limit/);
  await assert.rejects(fetchPublicAsset({ ...asset, size: 2 }, { fetcher }), /size limit/);
});

test("release tag lookup resolves annotated tags and bounds malformed tag chains", async () => {
  let calls = 0;
  const fetcher = async () =>
    Response.json({
      object:
        ++calls === 1
          ? { type: "tag", sha: "a".repeat(40) }
          : { type: "commit", sha: "b".repeat(40) },
    });
  assert.equal(
    await resolveTagCommit("https://api.github.com/repos/Example/Product", "v1.2.3", { fetcher }),
    "b".repeat(40),
  );
  calls = 0;
  await assert.rejects(
    resolveTagCommit("https://api.github.com/repos/Example/Product", "v1.2.3", {
      fetcher: async () => {
        calls++;
        return Response.json({ object: { type: "tag", sha: "a".repeat(40) } });
      },
    }),
    /Unsupported release tag/,
  );
  assert.equal(calls, 5);
});

async function archiveFixture() {
  const image = await sharp({ create: { width: 2, height: 2, channels: 3, background: "#213547" } })
    .webp()
    .toBuffer();
  const captures = ["processes", "performance", "overview"].map((id) => ({
    id,
    label: id,
    title: id,
    description: "Example product data",
    color: "accent",
    path: `images/${id}.webp`,
    sha256: createHash("sha256").update(image).digest("hex"),
    width: 2,
    height: 2,
    source: `${id}.png`,
  }));
  return {
    manifest: {
      schemaVersion: 1,
      repositoryId: 42,
      version: "v1.2.3",
      sourceCommit: "a".repeat(40),
      hero: "performance",
      captures,
    },
    image,
  };
}
function zip(fixture, extra = []) {
  const result = spawnSync(
    process.platform === "win32" ? "python" : "python3",
    [
      "-c",
      `import sys,json,base64,io,zipfile
data=json.load(sys.stdin); output=io.BytesIO()
with zipfile.ZipFile(output,'w') as z:
 z.writestr('manifest.json',json.dumps(data['manifest']))
 for c in data['manifest']['captures']: z.writestr(c['path'],base64.b64decode(data['image']))
 for name in data['extra']: z.writestr(name,b'Unexpected entry')
sys.stdout.buffer.write(output.getvalue())`,
    ],
    {
      input: JSON.stringify({
        manifest: fixture.manifest,
        image: fixture.image.toString("base64"),
        extra,
      }),
      timeout: 10000,
      maxBuffer: 1024 * 1024,
    },
  );
  assert.equal(result.status, 0, result.stderr?.toString());
  return result.stdout;
}
test("media archive imports exactly one released version and rejects traversal or wrong identities", async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), "rustwtm-media-proof-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const fixture = await archiveFixture();
  const run = (bytes, version = "v1.2.3") =>
    spawnSync(
      process.platform === "win32" ? "python" : "python3",
      [
        "scripts/unpack-website-media.py",
        "--destination",
        directory,
        "--version",
        version,
        "--commit",
        "a".repeat(40),
        "--repository-id",
        "42",
      ],
      { input: bytes, encoding: "utf8", timeout: 10000, maxBuffer: 1024 * 1024 },
    );
  const valid = run(zip(fixture));
  assert.equal(valid.status, 0, valid.stderr);
  assert.equal(JSON.parse(valid.stdout).captures.length, 3);
  assert.deepEqual((await readdir(directory)).sort(), [
    "overview.webp",
    "performance.webp",
    "processes.webp",
  ]);
  assert.deepEqual(await readFile(path.join(directory, "processes.webp")), fixture.image);
  assert.notEqual(run(zip(fixture), "v9.9.9").status, 0);
  const traversing = run(zip(fixture, ["../escape.txt"]));
  assert.notEqual(traversing.status, 0);
  assert.match(traversing.stderr, /Unexpected website archive/);
  fixture.manifest.captures[0].sha256 = "f".repeat(64);
  const corrupt = run(zip(fixture));
  assert.notEqual(corrupt.status, 0);
  assert.match(corrupt.stderr, /checksum mismatch/);
});
