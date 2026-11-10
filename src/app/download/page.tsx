import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { DownloadOptions } from "@/components/download-options";
import { CopyCode } from "@/components/copy-code";
import { Icon } from "@/components/icons";
import { docs, installCommand, links, release } from "@/lib/product";
export const metadata = pageMetadata(
  "Download for Windows",
  "Download the latest stable RustWTM x64 MSI installer or portable ZIP. Windows requirements, installation instructions and a careful first-run guide.",
  "/download/",
);
export default function Download() {
  return (
    <main id="main" className="container subpage">
      <div className="page-heading">
        <div className="breadcrumbs">
          <Link href="/">RustWTM</Link>
          <span>/</span>
          <span>Download</span>
        </div>
        <h1>
          Your PC.
          <br />
          <span className="accent-text">A fresh perspective.</span>
        </h1>
        <p>
          Choose how you get started. Both packages include the native desktop app, command-line
          tools and service binaries.
        </p>
        <div className="release-detail mono">
          <span className="status-dot" />
          {release.version} · Stable ·{" "}
          {new Intl.DateTimeFormat("en", {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "UTC",
          }).format(new Date(release.publishedAt))}
        </div>
      </div>
      <DownloadOptions />
      <div className="download-links">
        <a href={release.url}>
          What’s new <Icon name="external" size={13} />
        </a>
        <a href={links.releases}>
          All releases <Icon name="external" size={13} />
        </a>
        <a href={docs("docs/signing.md")}>
          Signing & verification <Icon name="external" size={13} />
        </a>
      </div>
      <div className="subpage-content">
        <section id="installation">
          <span className="eyebrow">01 / GET INSTALLED</span>
          <h2>
            A familiar setup.
            <br />A deliberate first run.
          </h2>
          <div className="steps">
            <article>
              <h3>Download and install.</h3>
              <p>
                Run the x64 MSI from the official release. It installs to{" "}
                <code>C:\Program Files\RustWTM</code>, adds the tools to PATH, creates a Start Menu
                shortcut, and installs the background service. Administrator rights are required.
              </p>
            </article>
            <article>
              <h3>Look around before changing anything.</h3>
              <p>
                Open Overview, Processes and Performance. The service starts in{" "}
                <strong>dry-run</strong>: automatic decisions are logged without applying their
                process changes. <strong>Manual GUI and CLI commands still execute.</strong>
              </p>
            </article>
            <article>
              <h3>Review Events. Then choose your protection.</h3>
              <p>
                Inspect the event log and validate your rules. Use an elevated window to switch
                Settings from dry-run to enforcing. Check exemptions, foreground protection and app
                budgets for your workloads.
              </p>
              <Link href="/docs/#protection">
                Understand the working modes <Icon name="arrow" size={14} />
              </Link>
            </article>
          </div>
          <p className="important-note">
            <Icon name="shield" size={18} />
            <span>
              RustWTM is an early-release project. Download from the official release and verify the
              published SHA-256. Signing status should be checked on the downloaded package; the
              site does not claim a verified publisher signature.
            </span>
          </p>
        </section>
        <section id="powershell">
          <h2>Prefer PowerShell?</h2>
          <p>
            From an <strong>elevated PowerShell</strong>, the official installer downloads the
            current release, checks its SHA-256, and installs the app and service. You can inspect
            the script before running it.
          </p>
          <CopyCode code={installCommand} label="PowerShell · Administrator" />
          <a
            className="text-link"
            href={`https://github.com/${release.repository}/blob/main/scripts/install.ps1`}
          >
            Read the installer source <Icon name="external" size={13} />
          </a>
        </section>
        <section id="portable">
          <h2>Your tools. Your folder.</h2>
          <p>
            Extract the portable ZIP and open <code>rustwtm.exe</code>, or use <code>wtm.exe</code>{" "}
            from your terminal. The GUI can monitor as a regular user. Privileged controls still
            require elevation; the service is not installed just by extracting the archive.
          </p>
          <p>To use the installer’s download-only mode, save the official script first and run:</p>
          <CopyCode
            code={".\\install.ps1 -DownloadOnly -InstallDir D:\\Tools\\RustWTM"}
            label="PowerShell · Download only"
          />
          <p>
            Automatic elevated startup and Task Manager replacement require a protected
            installation, and are unavailable to portable copies.
          </p>
        </section>
        <section id="requirements">
          <h2>Before you download.</h2>
          <table className="requirement-table">
            <caption className="sr-only">RustWTM system requirements</caption>
            <tbody>
              <tr>
                <th scope="row">Windows</th>
                <td>Windows 10 version 1809 or later, or Windows 11</td>
              </tr>
              <tr>
                <th scope="row">Architecture</th>
                <td>x64 (64-bit). No native ARM64 or 32-bit release package.</td>
              </tr>
              <tr>
                <th scope="row">Permissions</th>
                <td>
                  Regular user for read-only monitoring. Administrator for installation, service
                  configuration and privileged process controls.
                </td>
              </tr>
              <tr>
                <th scope="row">Docker</th>
                <td>
                  Optional. A supported local Docker Engine context using a Windows named pipe;
                  Engine API 1.41 or newer.
                </td>
              </tr>
              <tr>
                <th scope="row">Sensors</th>
                <td>
                  Optional hardware provider. Device support varies; fan-control writes need
                  device-specific validation.
                </td>
              </tr>
              <tr>
                <th scope="row">Languages</th>
                <td>English · Türkçe · Deutsch · Français · Español</td>
              </tr>
            </tbody>
          </table>
          <p>
            The project does not publish a separate minimum CPU or RAM capacity. Resource readings
            and available controls depend on Windows permissions and hardware capabilities.
          </p>
        </section>
        <section id="updates">
          <h2>Keep your perspective current.</h2>
          <p>
            RustWTM can notify you about updates. Its update flow downloads the new installer,
            checks the published SHA-256 and restarts the app after installation. You can also
            download a release manually.
          </p>
          <p>
            Uninstall the MSI through Windows Settings → Apps. Configuration and usage history in{" "}
            <code>%ProgramData%\RustWTM</code> are retained. Review the documentation for cleanup
            and restoration of optional integrations.
          </p>
          <div className="download-links">
            <a href={release.url}>
              Read {release.version} release notes <Icon name="external" size={13} />
            </a>
            <a href={docs("README.md#install")}>
              Full installation reference <Icon name="external" size={13} />
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
