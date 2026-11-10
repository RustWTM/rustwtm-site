import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { CopyCode } from "@/components/copy-code";
import { Icon } from "@/components/icons";
import { docs, links } from "@/lib/product";
export const metadata = pageMetadata(
  "Documentation & getting started",
  "Get started with RustWTM. Understand monitoring, dry-run and enforcing modes, app budgets, CLI, local Docker monitoring and the security model.",
  "/docs/",
);
const guides = [
  {
    title: "Device health & incident replay",
    text: "Per-device charts, NVMe health, resource history and the limits of hardware readings.",
    path: "docs/product-expansion.md",
  },
  {
    title: "Installed apps & reviewed updates",
    text: "Microsoft Store inventory, optional WinGet discovery and what happens after you select an update.",
    path: "docs/inventory-app-management.md",
  },
  {
    title: "Desktop controls",
    text: "Optional numeric tray icons, shortcuts and Task Manager integration.",
    path: "docs/desktop-controls.md",
  },
  {
    title: "Interface languages",
    text: "Supported languages, Windows defaults and how to choose a different language.",
    path: "docs/localization.md",
  },
  {
    title: "Process workspace",
    text: "List, Tree and Apps views, the adaptive inspector and stable-row behavior.",
    path: "docs/process-workspace.md",
  },
  {
    title: "Column layouts",
    text: "Choose profiles, reorder columns and keep your preferred process workspace.",
    path: "docs/process-columns.md",
  },
  {
    title: "Performance timelines",
    text: "Shared cursors, pinning, zoom, live mode and explicit sampling gaps.",
    path: "docs/performance-timeline.md",
  },
  {
    title: "Resource measurements",
    text: "CPU tiers, GPU engines, resource units and measurement boundaries.",
    path: "docs/performance-resources.md",
  },
  {
    title: "Local Docker monitoring",
    text: "Supported contexts, health, logs, sampling limits and read-only behavior.",
    path: "docs/docker.md",
  },
  {
    title: "Display preferences",
    text: "Appearance, scale, compact layouts, charts and remembered settings.",
    path: "docs/display-preferences.md",
  },
  {
    title: "Sensors & cooling",
    text: "Optional provider setup, hardware support and fan-control validation limits.",
    path: "docs/hardware.md",
  },
  {
    title: "CPU & power controls",
    text: "Hybrid CPU tiers, affinity and the separate restore behavior of shared power policies.",
    path: "docs/cpu-controls.md",
  },
];
export default function Docs() {
  return (
    <main id="main" className="container subpage">
      <div className="page-heading">
        <div className="breadcrumbs">
          <Link href="/">RustWTM</Link>
          <span>/</span>
          <span>Documentation</span>
        </div>
        <h1>
          Get your bearings.
          <br />
          <span className="muted">Then go deeper.</span>
        </h1>
        <p>
          A practical starting point, with direct links to the maintained product documentation.
        </p>
      </div>
      <div className="docs-layout">
        <nav className="docs-nav" aria-label="Documentation contents">
          <span className="eyebrow">IN THIS GUIDE</span>
          <a href="#first-run">First run</a>
          <a href="#protection">Protection & rules</a>
          <a href="#workspace">Explore the workspace</a>
          <a href="#cli">Command line & MCP</a>
          <a href="#security">Privacy & permissions</a>
          <a href="#contribute">Get involved</a>
        </nav>
        <div className="subpage-content">
          <section id="first-run">
            <span className="eyebrow">START HERE</span>
            <h2>See first. Decide second.</h2>
            <div className="steps">
              <article>
                <h3>Install the latest release.</h3>
                <p>
                  Use the x64 installer on Windows 10 1809+ or Windows 11. The installer includes
                  the background service. Prefer no installation? Choose the portable ZIP.
                </p>
                <Link href="/download/">
                  Choose a download <Icon name="arrow" size={14} />
                </Link>
              </article>
              <article>
                <h3>Start with the system overview.</h3>
                <p>
                  Check resource gauges and busy apps, then open Processes for a searchable list,
                  process tree or grouped Apps view. Pause process-list updates with F6 to inspect a
                  stable snapshot while monitoring continues.
                </p>
              </article>
              <article>
                <h3>Review what protection would do.</h3>
                <p>
                  In the default dry-run mode, the service logs its automatic decisions. Read
                  Events, adjust the configuration and review exclusions before turning on
                  enforcement.
                </p>
              </article>
            </div>
          </section>
          <section id="protection">
            <h2>Your rules. Your responsibility.</h2>
            <p>
              RustWTM separates read-only observation, automatic policy enforcement and explicit
              manual actions. The service’s <code>dry_run</code> setting controls automatic
              decisions. It does not turn manual process actions into previews.
            </p>
            <CopyCode
              label="config.toml · Illustrated excerpt"
              code={
                "dry_run = true\n\n[governor]\nhigh_cpu_percent = 90.0\nsustain_secs = 5\nrecover_cpu_percent = 70.0"
              }
              note="An excerpt, not a complete configuration. Validate your file and review the full reference before applying it."
            />
            <p>
              Rules can match process names or paths, including wildcards, and optionally require
              sustained CPU, memory or GPU conditions. Actions include priority changes, efficiency
              mode, caps and termination. The visual rule editor lets you preview how a rule would
              evaluate before applying it. CPU percentages use the whole machine as their scale.
            </p>
            <p>
              App limits share CPU and memory budgets across matching app instances and their
              children. Foreground protection exempts the active app and its descendants by default.
              Critical and core Windows processes, and RustWTM itself, remain protected.
            </p>
            <p className="important-note">
              <Icon name="shield" size={18} />
              <span>
                Use an elevated client to validate and apply service configuration. Automatic
                process adjustments are tracked by source and restored when the service stops;
                shared power-plan settings persist until separately restored. Hardware fan control
                has additional requirements and validation limits.
              </span>
            </p>
            <a className="text-link" href={docs("docs/configuration.md")}>
              Complete configuration reference <Icon name="external" size={13} />
            </a>
          </section>
          <section id="workspace">
            <h2>Go where the question leads.</h2>
            <div className="doc-grid">
              {guides.map((guide) => (
                <a key={guide.path} className="doc-link" href={docs(guide.path)}>
                  <h3>
                    {guide.title}
                    <Icon name="external" size={14} />
                  </h3>
                  <p>{guide.text}</p>
                  <span className="eyebrow">PRODUCT DOCUMENTATION ↗</span>
                </a>
              ))}
            </div>
          </section>
          <section id="cli">
            <h2>Another way into the same system.</h2>
            <p>
              The <code>wtm</code> command-line tool exposes process inspection, JSON output and
              explicit controls. These first commands are read-only:
            </p>
            <CopyCode
              label="PowerShell · Read-only inspection"
              code={
                "wtm list --sort mem -n 20\nwtm list --json\nwtm info chrome\nwtm ports --known\nwtm history --hours 24"
              }
            />
            <h3>Validate before applying.</h3>
            <CopyCode
              code={"wtm config show\nwtm config check my.toml"}
              label="PowerShell · Configuration inspection"
            />
            <h3>An MCP server, on your terms.</h3>
            <p>
              Run <code>wtm mcp</code> to connect an MCP client over standard input/output.
              Read-only is the default, and nothing listens on the network. Starting with{" "}
              <code>--allow-control</code> explicitly adds control tools. Elevation requirements
              still apply.
            </p>
            <CopyCode
              label="MCP client configuration · Read-only"
              code={
                '{\n  "mcpServers": {\n    "rustwtm": {\n      "command": "C:\\\\Program Files\\\\RustWTM\\\\wtm.exe",\n      "args": ["mcp"]\n    }\n  }\n}'
              }
            />
            <a className="text-link" href={docs("README.md#cli")}>
              All CLI commands & MCP tools <Icon name="external" size={13} />
            </a>
          </section>
          <section id="security">
            <h2>Local tools. Explicit permissions.</h2>
            <p>
              RustWTM’s service runs as LocalSystem. It accepts control requests only from elevated
              administrators over a local named pipe, rejects remote clients and protects its data
              directory. Read-only requests are available to interactive users.
            </p>
            <p>
              Usage history and configuration live in <code>%ProgramData%\RustWTM</code>. Optional
              Telegram functionality communicates externally when configured. Update checks and
              installer downloads contact GitHub. See the product’s security policy for the actual
              trust boundaries.
            </p>
            <div className="download-links">
              <a href={links.security}>
                Security model <Icon name="external" size={13} />
              </a>
              <Link href="/privacy/">
                Privacy & data handling <Icon name="arrow" size={14} />
              </Link>
            </div>
          </section>
          <section id="contribute">
            <h2>Help make the tool better.</h2>
            <p>
              RustWTM is MIT licensed. Report reproducible bugs through GitHub Issues, include the
              version and steps, and follow the contribution guide for source changes. Report
              vulnerabilities privately through the security policy.
            </p>
            <div className="download-links">
              <a href={links.issues}>
                Report an issue <Icon name="external" size={13} />
              </a>
              <a href={links.contributing}>
                Contribution guide <Icon name="external" size={13} />
              </a>
              <a href={links.security}>
                Report a vulnerability privately <Icon name="external" size={13} />
              </a>
            </div>
            <p style={{ marginTop: 24 }}>
              The roadmap documents future work separately. A roadmap item is not a promise that a
              feature is available in your installed release.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
