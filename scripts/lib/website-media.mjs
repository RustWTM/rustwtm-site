import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rename, rm, stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchJson } from "./product-content.mjs";
export const mediaAssetName = "rustwtm-website-media.zip";
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
async function validFile(capture) {
  const file = path.resolve("public", "." + capture.file);
  const info = await stat(file).catch(() => null);
  return (
    !!info?.isFile() &&
    info.size <= 4 * 1024 * 1024 &&
    hash(await readFile(file)) === capture.sha256
  );
}

export async function fetchPublicAsset(
  asset,
  { fetcher = fetch, maxBytes = 64 * 1024 * 1024 } = {},
) {
  if (!Number.isSafeInteger(asset.size) || asset.size < 1 || asset.size > maxBytes)
    throw new Error("Website asset exceeds size limit");
  // Public downloads never receive the repository's bearer token.
  const response = await fetcher(asset.browser_download_url, {
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`Website asset returned ${response.status}`);
  const reader = response.body.getReader(),
    chunks = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes || size > asset.size) throw new Error("Website asset exceeds size limit");
      chunks.push(value);
    }
  } catch (error) {
    await reader.cancel().catch(() => {});
    throw error;
  } finally {
    reader.releaseLock();
  }
  const bytes = Buffer.concat(chunks);
  if (bytes.length !== asset.size || (asset.digest && asset.digest !== `sha256:${hash(bytes)}`))
    throw new Error("Website asset checksum mismatch");
  return bytes;
}

export async function resolveTagCommit(base, tag, options) {
  let object = (await fetchJson(`${base}/git/ref/tags/${encodeURIComponent(tag)}`, options)).object;
  for (let depth = 0; depth < 4; depth++) {
    if (!/^[a-f\d]{40}$/.test(object?.sha)) throw new Error("Invalid release tag identity");
    if (object.type === "commit") return object.sha;
    if (object.type !== "tag") break;
    object = (await fetchJson(`${base}/git/tags/${object.sha}`, options)).object;
  }
  throw new Error("Unsupported release tag identity");
}

export async function refreshPresentation({
  latest,
  identity,
  previous,
  base,
  options,
  requiredFrom,
}) {
  const archive = latest.assets.find((asset) => asset.name === mediaAssetName);
  const checksum = latest.assets.find((asset) => asset.name === `${mediaAssetName}.sha256`);
  const atLeast = (a, b) => {
    const left = a.slice(1).split(".").map(Number),
      right = b.slice(1).split(".").map(Number);
    for (let i = 0; i < 3; i++) {
      if (left[i] !== right[i]) return left[i] > right[i];
    }
    return true;
  };
  if (!archive || !checksum) {
    if (requiredFrom && atLeast(latest.tag_name, requiredFrom))
      throw new Error("The stable release is missing its website media package");
    return undefined;
  }
  const commit = await resolveTagCommit(base, latest.tag_name, options);
  const sidecar = (await fetchPublicAsset(checksum, { maxBytes: 1024 })).toString("utf8").trim();
  const declared = sidecar.match(
    new RegExp(`^([a-f\\d]{64})\\s+${mediaAssetName.replaceAll(".", "\\.")}\\s*$`),
  )?.[1];
  if (!declared || (archive.digest && archive.digest !== `sha256:${declared}`))
    throw new Error("Website package sidecar mismatch");
  if (
    previous?.version === latest.tag_name &&
    previous.sourceCommit === commit &&
    archive.digest === `sha256:${previous.archiveSha256}` &&
    declared === previous.archiveSha256
  ) {
    if ((await Promise.all(previous.captures.map(validFile))).every(Boolean)) return previous;
  }
  const bytes = await fetchPublicAsset(archive);
  const digest = hash(bytes);
  if (declared !== digest) throw new Error("Website package sidecar mismatch");
  const root = path.resolve("public/screenshots/releases");
  await mkdir(root, { recursive: true });
  const temporary = await mkdtemp(path.join(root, ".stage-"));
  let moved = false;
  try {
    const result = spawnSync(
      process.platform === "win32" ? "python" : "python3",
      [
        fileURLToPath(new URL("../unpack-website-media.py", import.meta.url)),
        "--destination",
        temporary,
        "--version",
        latest.tag_name,
        "--commit",
        commit,
        "--repository-id",
        String(identity.id),
      ],
      {
        input: bytes,
        encoding: "utf8",
        env: { ...process.env, PYTHONUTF8: "1" },
        timeout: 30000,
        maxBuffer: 1024 * 1024,
      },
    );
    if (result.status !== 0)
      throw new Error(`Invalid website media package: ${result.stderr?.slice(-1500)}`);
    const manifest = JSON.parse(result.stdout);
    const folder = `${latest.tag_name}-${digest.slice(0, 16)}`;
    const destination = path.join(root, folder);
    // A retry can reuse the same validated immutable directory.
    const presentation = {
      schemaVersion: 1,
      version: latest.tag_name,
      sourceCommit: commit,
      archiveSha256: digest,
      archiveUrl: archive.browser_download_url,
      hero: manifest.hero,
      captures: manifest.captures.map(({ path: unused, ...capture }) => ({
        ...capture,
        version: latest.tag_name,
        commit,
        file: `/screenshots/releases/${folder}/${capture.id}.webp`,
      })),
    };
    if (!(await stat(destination).catch(() => null))) {
      await rename(temporary, destination);
      moved = true;
    } else if (!(await Promise.all(presentation.captures.map(validFile))).every(Boolean))
      throw new Error("The cached media directory is corrupted");
    return presentation;
  } finally {
    // mkdtemp returned this exact child of the checked workspace media root.
    if (
      !moved &&
      path.dirname(temporary) === root &&
      path.basename(temporary).startsWith(".stage-")
    )
      await rm(temporary, { recursive: true, force: true });
  }
}
