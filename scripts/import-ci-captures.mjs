// Import reviewed renders only from a successful, exact-release GitHub Actions run.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const [checkout, version, runId] = process.argv.slice(2);
if (!checkout || !/^v\d+\.\d+\.\d+$/.test(version ?? "") || !/^\d+$/.test(runId ?? ""))
  throw new Error("Usage: node scripts/import-ci-captures.mjs <product-checkout> <tag> <run-id>");
const commit = execFileSync("git", ["rev-parse", "--verify", `refs/tags/${version}^{commit}`], {
  cwd: checkout,
  encoding: "utf8",
}).trim();
const config = JSON.parse(await readFile("config/product.json", "utf8"));
const gh = (endpoint) =>
  execFileSync("gh", ["api", endpoint], {
    maxBuffer: 128 * 1024 * 1024,
    timeout: 120000,
  });
const identity = JSON.parse(gh(`repositories/${config.repositoryId}`));
const base = `repos/${identity.full_name}`;
const run = JSON.parse(gh(`${base}/actions/runs/${runId}`));
if (
  run.head_sha !== commit ||
  run.conclusion !== "success" ||
  run.repository.id !== config.repositoryId
)
  throw new Error("The render run must succeed on the exact release source.");
const { artifacts } = JSON.parse(gh(`${base}/actions/runs/${runId}/artifacts`));
const artifact = artifacts.find((item) => item.name === "visual-review");
if (!artifact || artifact.expired || artifact.size_in_bytes > 128 * 1024 * 1024)
  throw new Error("A bounded, unexpired visual-review artifact is required.");
const directory = path.resolve(".temp_files", `product-visual-${runId}`);
await mkdir(directory, { recursive: true });
const archivePath = path.join(directory, "visual-review.zip");
const digest = (bytes) => `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
let archive = await readFile(archivePath).catch(() => null);
if (!archive || digest(archive) !== artifact.digest) {
  archive = gh(`${base}/actions/artifacts/${artifact.id}/zip`);
  if (digest(archive) !== artifact.digest) throw new Error("Render archive digest mismatch.");
  await writeFile(archivePath, archive);
}
const screen = (name, theme = "dark") => `visual-review/locales/en/${theme}-wide-${name}.png`;
const files = {
  processes: screen("Processes"),
  "processes-light": screen("Processes", "light"),
  performance: screen("Performance"),
  overview: screen("Overview"),
  containers: screen("Containers"),
  disks: screen("Disks"),
  "performance-timeline": screen("PerformanceInspect"),
  "process-inspection": screen("ProcessInspector"),
  "installed-apps": screen("InstalledApps"),
  "quick-setup": "onboarding-review/welcome-light-4.png",
  "column-layouts": screen("ColumnEditor"),
};
const mappingPath = path.join(directory, "files.json");
await writeFile(mappingPath, JSON.stringify(files));
// Select named entries instead of extracting untrusted archive paths into the workspace.
const extractScript = `$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [IO.Compression.ZipFile]::OpenRead($env:RUSTWTM_CAPTURE_ZIP)
try {
  $files = Get-Content -LiteralPath $env:RUSTWTM_CAPTURE_MAP -Raw | ConvertFrom-Json
  foreach ($file in $files.PSObject.Properties) {
    $entry = $zip.GetEntry($file.Value)
    if (!$entry -or $entry.Length -gt 16777216) { throw ('Invalid capture: ' + $file.Value) }
    $inputStream = $entry.Open()
    $outputStream = [IO.File]::Create((Join-Path $env:RUSTWTM_CAPTURE_DIR ($file.Name + '.png')))
    try { $inputStream.CopyTo($outputStream) } finally { $inputStream.Dispose(); $outputStream.Dispose() }
  }
} finally { $zip.Dispose() }
`;
execFileSync("powershell", ["-NoProfile", "-NonInteractive", "-Command", extractScript], {
  env: {
    ...process.env,
    RUSTWTM_CAPTURE_ZIP: archivePath,
    RUSTWTM_CAPTURE_MAP: mappingPath,
    RUSTWTM_CAPTURE_DIR: directory,
  },
  timeout: 30000,
});
const previous = JSON.parse(await readFile("src/data/screenshots.json", "utf8"));
const captures = new Map(
  previous.captures.map((item) => [
    item.name,
    {
      ...item,
      version: item.version ?? previous.version,
      commit: item.commit ?? previous.commit,
    },
  ]),
);
for (const [name, source] of Object.entries(files)) {
  const input = await readFile(path.join(directory, `${name}.png`));
  const info = await sharp(input).metadata();
  await sharp(input).webp({ quality: 90, effort: 6 }).toFile(`public/screenshots/${name}.webp`);
  captures.set(name, {
    name,
    version,
    commit,
    source,
    sha256: createHash("sha256").update(input).digest("hex"),
    width: info.width,
    height: info.height,
    provenance: {
      type: "github-actions",
      runId: Number(runId),
      url: run.html_url,
      artifactId: artifact.id,
      digest: artifact.digest,
    },
  });
}
await writeFile(
  "src/data/screenshots.json",
  JSON.stringify({ schemaVersion: 2, captures: [...captures.values()] }, null, 2) + "\n",
);
console.log(
  `Imported ${Object.keys(files).length} verified ${version} renders; preserved earlier capture versions.`,
);
