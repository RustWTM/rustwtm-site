import { readFile, writeFile } from "node:fs/promises";
const config = JSON.parse(
  await readFile(new URL("../config/product.json", import.meta.url), "utf8"),
);
const destination = new URL("../src/data/release.json", import.meta.url);
try {
  const response = await fetch(
    `https://api.github.com/repos/${config.repository}/releases/latest`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        ...(process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {}),
      },
      signal: AbortSignal.timeout(15000),
    },
  );
  if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
  const release = await response.json();
  if (release.draft || release.prerelease || !/^v\d+\.\d+\.\d+$/.test(release.tag_name))
    throw new Error("Not a stable release");
  const assets = release.assets
    .filter((a) => /\.msi$|\.zip$|\.sha256$/.test(a.name))
    .map((a) => ({ name: a.name, size: a.size, url: a.browser_download_url, digest: a.digest }));
  if (
    !assets.some((a) => /-x64\.msi$/.test(a.name)) ||
    !assets.some((a) => /x86_64-pc-windows-msvc\.zip$/.test(a.name))
  )
    throw new Error("Expected Windows x64 packages missing");
  for (const asset of assets)
    if (!asset.url.startsWith(`https://github.com/${config.repository}/releases/download/`))
      throw new Error("Unexpected asset origin");
  await writeFile(
    destination,
    JSON.stringify(
      {
        repository: config.repository,
        version: release.tag_name,
        publishedAt: release.published_at,
        url: release.html_url,
        checkedAt: new Date().toISOString(),
        assets,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(`Release metadata refreshed: ${release.tag_name}`);
} catch (error) {
  const cached = JSON.parse(await readFile(destination, "utf8"));
  if (cached.repository !== config.repository)
    throw new Error("Cached release belongs to another repository; refresh required.");
  console.warn(`Using verified ${cached.version} release snapshot (${error.message}).`);
}
