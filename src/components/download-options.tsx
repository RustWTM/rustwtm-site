import { download, installer, portable, release, links, size } from "@/lib/product";
import { Icon, WindowsIcon } from "./icons";
export function DownloadOptions() {
  return (
    <div className="download-options">
      <div className="download-card recommended">
        <div className="download-card-top">
          <WindowsIcon />
          <span className="mini-tag">RECOMMENDED</span>
        </div>
        <h3>Windows installer</h3>
        <p>
          GUI, command line and background service. A familiar installation with Start Menu
          integration.
        </p>
        <a href={download} className="button">
          Download .msi <Icon name="download" size={18} />
        </a>
        <div className="download-file mono">
          {release.version} · x64{installer ? ` · ${size(installer.size)}` : ""}
        </div>
        <div className="download-details">
          <span>Windows 10 1809+ / Windows 11</span>
          <span>Administrator rights for installation</span>
        </div>
        <a
          className="text-link"
          href={
            release.assets.find((asset) => asset.name.endsWith(".msi.sha256"))?.url ?? links.latest
          }
        >
          SHA-256 checksum <Icon name="external" size={13} />
        </a>
      </div>
      <div className="download-card">
        <div className="download-card-top">
          <Icon name="box" size={23} />
          <span className="mini-tag">TAKE IT WITH YOU</span>
        </div>
        <h3>Portable archive</h3>
        <p>Extract and open the GUI or CLI. Installing the service is a separate, elevated step.</p>
        <a href={portable?.url ?? links.latest} className="button button-secondary">
          Download .zip <Icon name="download" size={18} />
        </a>
        <div className="download-file mono">
          {release.version} · x64{portable ? ` · ${size(portable.size)}` : ""}
        </div>
        <div className="download-details">
          <span>Windows 10 1809+ / Windows 11</span>
          <span>No installer required for the GUI</span>
        </div>
        <a
          className="text-link"
          href={
            release.assets.find((asset) => asset.name.endsWith(".zip.sha256"))?.url ?? links.latest
          }
        >
          SHA-256 checksum <Icon name="external" size={13} />
        </a>
      </div>
    </div>
  );
}
