import config from "../../config/product.json";
import release from "@/data/release.json";
export const product = config;
export { release };
export const repo = `https://github.com/${release.repository}`;
export const docs = (path: string) => `${repo}/blob/${release.branch ?? config.branch}/${path}`;
export const releaseNotesHref = `/changelog/#${release.version.replaceAll(".", "-")}`;
export const links = {
  github: repo,
  releases: `${repo}/releases`,
  latest: `${repo}/releases/latest`,
  issues: `${repo}/issues`,
  contributing: docs("CONTRIBUTING.md"),
  license: docs("LICENSE"),
  security: docs("SECURITY.md"),
};
export const installer = release.assets.find((asset) => asset.name.endsWith("-x64.msi"));
export const portable = release.assets.find((asset) =>
  asset.name.endsWith("x86_64-pc-windows-msvc.zip"),
);
export const download = installer?.url ?? links.latest;
export const installCommand = `irm https://raw.githubusercontent.com/${release.repository}/${release.branch ?? config.branch}/scripts/install.ps1 | iex`;
export const size = (bytes: number) => `${(bytes / 1000 / 1000).toFixed(1)} MB`;
