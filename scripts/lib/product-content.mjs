import { createHash } from "node:crypto";
const stableTag = /^v\d+\.\d+\.\d+$/;
export function parseChangelog(markdown) {
  const entries = new Map();
  let current, fence;
  for (const line of markdown
    .replace(/^\uFEFF/, "")
    .replaceAll("\r\n", "\n")
    .split("\n")) {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (marker) {
      if (!fence) fence = marker[1];
      else if (marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = undefined;
    }
    const heading = !fence && line.match(/^## \[([^\]]+)\]/);
    if (heading) {
      const label = heading[1];
      current = /^unreleased$/i.test(label)
        ? "unreleased"
        : /^\d+\.\d+\.\d+$/.test(label)
          ? `v${label}`
          : undefined;
      if (current) entries.set(current, []);
    } else if (current) entries.get(current).push(line);
  }
  return new Map([...entries].map(([tag, lines]) => [tag, lines.join("\n").trim()]));
}
function repositoryUrl(value, repository, suffix) {
  const url = new URL(value);
  if (
    url.protocol !== "https:" ||
    url.hostname !== "github.com" ||
    url.username ||
    url.password ||
    !url.pathname.toLowerCase().startsWith(`/${repository}/${suffix}`.toLowerCase())
  )
    throw new Error("Unexpected GitHub origin");
  return url.href;
}
export function validCachedSnapshot(value, config) {
  if (value?.schemaVersion !== undefined && value.schemaVersion !== 1)
    throw new Error("Unsupported cached snapshot schema");
  if (!value || !stableTag.test(value.version) || !Array.isArray(value.assets))
    throw new Error("Invalid cached release snapshot");
  if (
    value.presentation &&
    (value.presentation.version !== value.version ||
      !/^[a-f\d]{40}$/.test(value.presentation.sourceCommit) ||
      !/^[a-f\d]{64}$/.test(value.presentation.archiveSha256) ||
      !Array.isArray(value.presentation.captures) ||
      value.presentation.captures.length < 3 ||
      value.presentation.captures.length > 40 ||
      !value.presentation.captures.some((capture) => capture.id === value.presentation.hero))
  )
    throw new Error("Cached presentation does not match the stable release");
  const sameId =
    Number.isSafeInteger(config.repositoryId) && value.repositoryId === config.repositoryId;
  if (config.repositoryId && value.repositoryId && !sameId)
    throw new Error("Cached release repository identity mismatch");
  if (!sameId && value.repository.toLowerCase() !== config.repository.toLowerCase())
    throw new Error("Cached release belongs to another repository; refresh required.");
  repositoryUrl(value.url, value.repository, "releases/");
  for (const asset of value.assets)
    repositoryUrl(asset.url, value.repository, "releases/download/");
  return value;
}
export function buildSnapshot({
  identity,
  latest,
  releases,
  changelog,
  previous,
  now = new Date().toISOString(),
  expectedId,
  presentation,
}) {
  if (
    !Number.isSafeInteger(identity.id) ||
    (expectedId && identity.id !== expectedId) ||
    !/^[\w.-]+\/[\w.-]+$/.test(identity.full_name)
  )
    throw new Error("Product repository identity mismatch");
  const repository = identity.full_name;
  if (!latest || latest.draft || latest.prerelease || !stableTag.test(latest.tag_name))
    throw new Error("Not a stable release");
  if (
    presentation &&
    (presentation.version !== latest.tag_name ||
      !/^[a-f\d]{40}$/.test(presentation.sourceCommit) ||
      !/^[a-f\d]{64}$/.test(presentation.archiveSha256))
  )
    throw new Error("Presentation does not match the stable release");
  const assets = latest.assets
    .filter((asset) => /\.msi$|\.zip$|\.sha256$/.test(asset.name))
    .map((asset) => {
      if (!Number.isSafeInteger(asset.size) || asset.size <= 0)
        throw new Error("Invalid release asset size");
      const url = repositoryUrl(
        asset.browser_download_url,
        repository,
        `releases/download/${latest.tag_name}/`,
      );
      return { name: asset.name, size: asset.size, url, digest: asset.digest ?? null };
    });
  const installer = `RustWTM-${latest.tag_name.slice(1)}-x64.msi`,
    portable = "rustwtm-x86_64-pc-windows-msvc.zip";
  for (const name of [installer, `${installer}.sha256`, portable, `${portable}.sha256`])
    if (!assets.some((asset) => asset.name === name))
      throw new Error(`Expected release package/checksum missing: ${name}`);
  if (
    changelog.type !== "file" ||
    changelog.encoding !== "base64" ||
    !/^[a-f\d]{40,64}$/i.test(changelog.sha) ||
    changelog.size > 512 * 1024
  )
    throw new Error("Invalid changelog response");
  const markdown = Buffer.from(changelog.content, "base64").toString("utf8");
  if (Buffer.byteLength(markdown) > 512 * 1024) throw new Error("Changelog exceeds size limit");
  const entries = parseChangelog(markdown);
  const records = new Map();
  for (const item of [latest, ...releases]) {
    if (
      item.draft ||
      item.prerelease ||
      !stableTag.test(item.tag_name) ||
      records.has(item.tag_name)
    )
      continue;
    if (!item.published_at || !Number.isFinite(Date.parse(item.published_at)))
      throw new Error("Invalid release date");
    records.set(item.tag_name, {
      version: item.tag_name,
      publishedAt: item.published_at,
      url: repositoryUrl(item.html_url, repository, "releases/tag/"),
      body: item.body ?? "",
      changelog: entries.get(item.tag_name) ?? "",
    });
  }
  const content = {
    schemaVersion: 1,
    repository,
    repositoryId: identity.id,
    branch: identity.default_branch,
    version: latest.tag_name,
    publishedAt: latest.published_at,
    url: repositoryUrl(latest.html_url, repository, "releases/tag/"),
    assets,
    history: [...records.values()].slice(0, 20),
    changelog: {
      sha: changelog.sha,
      url: repositoryUrl(changelog.html_url, repository, "blob/"),
      unreleased: entries.get("unreleased") ?? "",
    },
    ...(presentation ? { presentation } : {}),
  };
  const contentHash = createHash("sha256").update(JSON.stringify(content)).digest("hex");
  return {
    ...content,
    checkedAt: previous?.contentHash === contentHash ? previous.checkedAt : now,
    contentHash,
  };
}
export async function fetchJson(url, { token, fetcher = fetch, maxBytes = 2 * 1024 * 1024 } = {}) {
  const response = await fetcher(url, {
    headers: {
      Accept: "application/vnd.github+json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
  return readJsonResponse(response, maxBytes);
}
export async function readJsonResponse(response, maxBytes) {
  const reader = response.body.getReader();
  let size = 0;
  const chunks = [];
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) throw new Error("JSON response exceeds size limit");
      chunks.push(value);
    }
  } catch (error) {
    await reader.cancel().catch(() => {});
    throw error;
  } finally {
    reader.releaseLock();
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
