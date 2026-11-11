import type { Metadata } from "next";
import Link from "next/link";
import { Icon, WindowsIcon } from "@/components/icons";
import { ScreenshotLightbox } from "@/components/lightbox";
import { Gallery } from "@/components/gallery";
import { Governor } from "@/components/governor";
import { CopyCode } from "@/components/copy-code";
import { DownloadOptions } from "@/components/download-options";
import {
  docs,
  download,
  interfaceLanguages,
  links,
  release,
  releaseNotesHref,
} from "@/lib/product";
import screenshots from "@/data/screenshots.json";
export const metadata: Metadata = { alternates: { canonical: "/" } };
const capabilities = [
  {
    icon: "cpu" as const,
    title: "Every process. The full picture.",
    description:
      "List, Tree or Apps views. Searchable columns, live values and an inspector that stays out of your way.",
    label: "PROCESS WORKSPACE",
    color: "cpu",
  },
  {
    icon: "activity" as const,
    title: "Follow the spike to its source.",
    description:
      "CPU, memory, GPU, disk and network. A shared timeline with real timestamps and explicit sampling gaps.",
    label: "RESOURCE MONITORING",
    color: "memory",
  },
  {
    icon: "shield" as const,
    title: "Make room for what matters.",
    description:
      "A background governor with staged CPU protection, memory guard and per-app budgets. You choose when it acts.",
    label: "CONFIGURABLE PROTECTION",
    color: "accent",
  },
];
const faq = [
  [
    "Is RustWTM free?",
    "Yes. RustWTM is open source under the MIT license, including for commercial use. You can inspect, modify and contribute to its source on GitHub.",
  ],
  [
    "Which Windows versions can I use?",
    "Windows 10 version 1809 or later and Windows 11, on x64 systems. The current release provides an x64 MSI installer and an x64 portable ZIP. An ARM64 package is not published.",
  ],
  [
    "Will it change my processes as soon as I install it?",
    "Automatic enforcement starts off in dry-run mode: decisions are recorded without applying automatic process changes. Manual commands from the GUI or CLI still execute. Review Events before switching to enforcing mode.",
  ],
  [
    "Do I need administrator rights?",
    "Read-only monitoring can run as a regular user. Installing the service and performing privileged actions requires administrator rights. Per-process network and file tracing use the service or an elevated window. Some protected processes remain inaccessible.",
  ],
  [
    "Can it replace Windows Task Manager?",
    "An optional setting can route Ctrl+Shift+Esc and other Task Manager entry points to RustWTM. It requires administrator rights and a protected installed copy. Turn it off to restore Windows Task Manager; portable and development copies cannot enable it.",
  ],
  [
    "Does RustWTM manage my Docker containers?",
    "It monitors a supported local Docker Engine context through a Windows named pipe. Container statistics, health, ports and bounded logs are read-only. It does not start, stop, restart or modify containers, and does not support remote contexts.",
  ],
  [
    "Which languages are supported?",
    `The desktop interface and notifications are available in ${interfaceLanguages} languages, including English, Türkçe, Deutsch, Español, 日本語 and 简体中文. The default follows Windows, with English as a fallback. Choose a language in Settings → This window.`,
  ],
];
const highlights = [
  {
    icon: "settings",
    title: "Start on your terms",
    text: "A five-step quick setup brings language, appearance, process layout and tray preferences together. Review before applying, or skip and keep your existing choices.",
  },
  {
    icon: "monitor",
    title: "Make the workspace yours",
    text: "Show readable process descriptions, choose table separators independently, and right-click a process header to sort, fit widths or change your column layout.",
  },
  {
    icon: "file",
    title: "Get to the answer faster",
    text: "Search and filter startup apps, copy details where you find them, and reach process diagnostics through compact context menus that fit your window.",
  },
] as const;
const highlightsVersion = "v0.30.0";
const captureMetadata = Object.fromEntries(
  screenshots.captures.map(({ name, version, width, height }) => [
    name,
    { version, width, height },
  ]),
);
export default function Home() {
  return (
    <main id="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "RustWTM",
            applicationCategory: "UtilitiesApplication",
            operatingSystem: "Windows 10 1809+; Windows 11 (x64)",
            softwareVersion: release.version.replace(/^v/, ""),
            downloadUrl: download,
            url: "https://rustwtm.com",
            license: links.license,
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            publisher: { "@type": "Organization", name: "OXOGNET OÜ", url: "https://oxog.net" },
          }),
        }}
      />
      <section className="hero container" aria-labelledby="hero-title">
        <div className="hero-copy">
          <a className="release-pill" href={releaseNotesHref}>
            <span className="status-dot" />
            <span className="mono">{release.version}</span>
            <span className="pill-divider" />
            <span>See what’s new</span>
            <Icon name="arrow" size={15} />
          </a>
          <div className="eyebrow hero-eyebrow">THE WINDOWS TASK MANAGER, RECONSIDERED</div>
          <h1 id="hero-title">
            A clearer view.
            <br />A{" "}
            <span className="accent-word">
              calmer PC.
              <svg viewBox="0 0 350 18" fill="none" aria-hidden="true">
                <path
                  d="M3 12C92 2 226 1 347 9M12 17c102-9 221-10 327-5"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </span>
          </h1>
          <p className="hero-description">
            See what’s running. Understand what’s slowing you down. Give your important apps room to
            breathe.
          </p>
          <p className="hero-subcopy">
            A native Windows task manager and configurable background governor. Built in Rust. Put
            to work by you.
          </p>
          <div className="hero-cta">
            <a className="button" href={download}>
              <WindowsIcon />
              Download for Windows
              <Icon name="download" size={18} />
            </a>
            <Link className="button button-ghost" href="/#screenshots">
              Take a closer look
              <Icon name="arrow" size={17} />
            </Link>
          </div>
          <div className="hero-meta">
            <span>
              <Icon name="check" size={14} />
              Free & open source
            </span>
            <span>Windows 10 / 11 · x64</span>
            <span>MIT licensed</span>
          </div>
        </div>
        <div className="hero-product">
          <div className="product-window">
            <div className="window-bar">
              <div>
                <img src="/brand/rustwtm-icon.svg" width="18" height="18" alt="" />
                <span>RustWTM</span>
                <span className="muted">/</span>
                <span className="muted">Performance</span>
              </div>
              <span className="window-controls" aria-hidden="true">
                ─ &nbsp; □ &nbsp; ×
              </span>
            </div>
            <ScreenshotLightbox
              src="/screenshots/performance.webp"
              alt="RustWTM Performance workspace with CPU, memory, GPU, disk and network charts and example data"
              priority
            />
          </div>
          <div className="product-caption">
            <span className="mono">
              <span className="status-dot" />A REAL WORKSPACE. A WIDER VIEW.
            </span>
            <span>Actual app capture · {captureMetadata.performance.version} · Example data</span>
          </div>
          <div className="hero-corner-mark" aria-hidden="true">
            01 — SYSTEM CLARITY
          </div>
        </div>
      </section>
      <div className="signal-strip">
        <div className="container">
          <span className="signal-intro">
            YOUR SYSTEM.
            <br />
            <strong>IN FOCUS.</strong>
          </span>
          <span>
            <Icon name="cpu" />
            Process intelligence
          </span>
          <span>
            <Icon name="activity" />
            Resource timelines
          </span>
          <span>
            <Icon name="shield" />
            Background protection
          </span>
          <span>
            <Icon name="terminal" />
            Native GUI + CLI
          </span>
        </div>
      </div>
      <section className="section container" id="features">
        <div className="section-heading">
          <div>
            <span className="eyebrow">01 / UNDERSTAND YOUR MACHINE</span>
            <h2>
              Less guesswork.
              <br />
              More <span className="muted">understanding.</span>
            </h2>
          </div>
          <p>
            From a busy processor to a runaway build,
            <br className="desktop-break" /> go from “what’s happening?” to “I’ve got this.”
          </p>
        </div>
        <div className="capabilities">
          {capabilities.map((cap, i) => (
            <article className={`capability ${cap.color}`} key={cap.title}>
              <div className="capability-top">
                <span className="icon-tile">
                  <Icon name={cap.icon} size={25} />
                </span>
                <span className="mono">0{i + 1}</span>
              </div>
              <span className="eyebrow">{cap.label}</span>
              <h3>{cap.title}</h3>
              <p>{cap.description}</p>
              <div className={`capability-art art-${i}`} aria-hidden="true">
                {i === 0 ? (
                  <div className="process-art">
                    <span>
                      work.exe <b>foreground</b>
                    </span>
                    <span>
                      └ background.exe <i>budgeted</i>
                    </span>
                    <span>
                      └ worker.exe <i>inspected</i>
                    </span>
                  </div>
                ) : i === 1 ? (
                  <svg viewBox="0 0 350 75">
                    <path d="M0 60H350M0 30H350" stroke="var(--border)" />
                    <path
                      d="M0 60 25 53 50 56 75 45 100 48 125 19 150 35 175 15 200 30 225 29 250 43 275 36 300 47 325 40 350 46"
                      fill="none"
                      stroke="var(--cpu)"
                      strokeWidth="2"
                    />
                    <path
                      d="M0 66C70 65 110 42 175 48S280 58 350 32"
                      fill="none"
                      stroke="var(--memory)"
                      strokeWidth="2"
                    />
                    <path d="M230 0v75" stroke="var(--muted)" strokeDasharray="3 4" />
                  </svg>
                ) : (
                  <div className="protection-art">
                    <span>
                      <Icon name="shield" size={16} />
                      Foreground protected
                    </span>
                    <div>
                      <span>Observe</span>
                      <Icon name="arrow" size={15} />
                      <span>Decide</span>
                      <Icon name="arrow" size={15} />
                      <span>Restore</span>
                    </div>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="container release-spotlight" aria-labelledby="release-spotlight-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">INTRODUCED IN {highlightsVersion}</span>
            <h2 id="release-spotlight-title">A smoother start. A workspace that fits.</h2>
          </div>
          <a className="text-link" href={`${links.releases}/tag/${highlightsVersion}`}>
            Read the {highlightsVersion} release notes <Icon name="external" size={14} />
          </a>
        </div>
        <div className="toolbox-grid">
          {highlights.map(({ icon, title, text }) => (
            <article key={title}>
              <Icon name={icon} size={24} />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="section workspace-section" id="screenshots">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">02 / MEET YOUR NEW WORKSPACE</span>
              <h2>
                Look closer.
                <br />
                <span className="muted">It’s all connected.</span>
              </h2>
            </div>
            <p>
              One application. A view for every question.
              <br />
              Explore the real interface, screen by screen.
            </p>
          </div>
          <Gallery captures={captureMetadata} />
        </div>
      </section>
      <section className="section container protection-section" id="protection">
        <div className="protection-copy">
          <span className="eyebrow">03 / MONITOR FIRST. ACT WITH INTENT.</span>
          <h2>
            Your work stays
            <br />
            in the <span className="accent-text">foreground.</span>
          </h2>
          <p className="section-lead">Background work should know its place.</p>
          <p>
            When sustained load crosses your thresholds, the governor can lower priority, enable
            efficiency mode and apply CPU caps in stages. Your foreground app and its children stay
            protected by default.
          </p>
          <div className="numbered-notes">
            <div>
              <span>01</span>
              <div>
                <h3>Start by observing.</h3>
                <p>
                  Dry-run records automatic decisions. Review Events and tune your configuration
                  before enabling enforcement.
                </p>
              </div>
            </div>
            <div>
              <span>02</span>
              <div>
                <h3>Set the boundaries.</h3>
                <p>
                  Match processes by name or path. Add sustained CPU, memory or GPU conditions, and
                  define per-app budgets.
                </p>
              </div>
            </div>
            <div>
              <span>03</span>
              <div>
                <h3>Recover gracefully.</h3>
                <p>
                  The governor rolls its process adjustments back after recovery. Shared Windows
                  power-plan settings have their own restore behavior.
                </p>
              </div>
            </div>
          </div>
          <p className="important-note">
            <Icon name="shield" size={17} />
            <span>
              Dry-run affects automatic enforcement. Manual GUI and CLI actions still execute and
              may require administrator rights.
            </span>
          </p>
          <a className="text-link" href={docs("docs/configuration.md")}>
            Read the configuration guide <Icon name="arrow" size={16} />
          </a>
        </div>
        <Governor />
      </section>
      <section className="section toolbox-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">04 / BEYOND THE PROCESS LIST</span>
              <h2>
                A proper toolkit.
                <br />
                <span className="muted">For the everyday, and the unexpected.</span>
              </h2>
            </div>
          </div>
          <div className="toolbox-grid">
            {[
              {
                icon: "network" as const,
                title: "Find the port. Meet the process.",
                text: "See what’s listening and which program owns it. Inspect per-process traffic and connection details; elevated tracing unlocks deeper network visibility.",
                url: "docs/desktop-controls.md",
              },
              {
                icon: "box" as const,
                title: "Keep your containers in sight.",
                text: "Local Docker statistics, health, Compose projects and bounded logs. Read-only monitoring, with no remote daemon exposure required.",
                url: "docs/docker.md",
              },
              {
                icon: "memory" as const,
                title: "Budgets for background work.",
                text: "Share CPU and memory budgets across an app and its child processes. Track long-term per-app usage and investigate suspected resource leaks.",
                url: "docs/configuration.md",
              },
              {
                icon: "settings" as const,
                title: "The rest of your system, too.",
                text: "Startup apps, Windows services, users and disk analysis. Read supported hardware sensors with the optional provider; cooling control varies by device.",
                url: "docs/hardware.md",
              },
              {
                icon: "terminal" as const,
                title: "At home in your terminal.",
                text: "List, inspect and control processes from the CLI. Export JSON or connect an MCP client over standard input/output; control is an explicit opt-in.",
                url: "README.md#cli",
              },
              {
                icon: "shield" as const,
                title: "Know what gets the keys.",
                text: "The local service accepts control from elevated administrators. Core Windows processes, critical processes and RustWTM itself are protected.",
                url: "SECURITY.md",
              },
            ].map((tool) => (
              <article key={tool.title}>
                <Icon name={tool.icon} size={25} />
                <h3>{tool.title}</h3>
                <p>{tool.text}</p>
                <a href={docs(tool.url)} aria-label={`Documentation: ${tool.title}`}>
                  Explore the docs <Icon name="arrow" size={15} />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section container workflow-section" id="workflows">
        <div>
          <span className="eyebrow">05 / MADE FOR THE WAY YOU WORK</span>
          <h2>
            Build. Play. Investigate.
            <br />
            <span className="muted">Keep your bearings.</span>
          </h2>
          <div className="workflow-list">
            <article>
              <span className="mono">FOR DEVELOPERS</span>
              <h3>Keep the build in its lane.</h3>
              <p>
                Give background workers an app budget. Find the process holding a development port,
                and monitor your local Docker stack alongside Windows.
              </p>
            </article>
            <article>
              <span className="mono">FOR FOCUSED WORK & PLAY</span>
              <h3>Let the front window lead.</h3>
              <p>
                Foreground protection keeps configured governor actions away from the app you’re
                using. Game mode can adjust background priority and restore it afterward.
              </p>
            </article>
            <article>
              <span className="mono">FOR TROUBLESHOOTING</span>
              <h3>Ask a more precise question.</h3>
              <p>
                Inspect wait chains, loaded modules, usage history and diagnostic events. Understand
                a hung app before choosing a manual action.
              </p>
            </article>
          </div>
        </div>
        <div className="terminal-showcase">
          <div className="terminal-heading">
            <span>
              <Icon name="terminal" size={17} />
              Same machine. Another perspective.
            </span>
            <span className="mini-tag">CLI</span>
          </div>
          <CopyCode
            label="Read-only inspection"
            code={"wtm list --sort mem -n 20\nwtm ports --known\nwtm history --hours 24"}
            note="Commands run locally after installing RustWTM. These examples are not executed by this website."
          />
          <div className="terminal-foot">
            <Icon name="check" size={16} />
            <span>
              GUI for the big picture.
              <br />
              CLI for the way you think.
            </span>
          </div>
          <a className="text-link" href="/docs/#cli">
            Explore the command line <Icon name="arrow" size={16} />
          </a>
        </div>
      </section>
      <section className="section download-section" id="download">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">06 / YOUR NEXT CLEARER MOMENT</span>
              <h2>
                Meet your machine.
                <br />
                <span className="accent-text">All over again.</span>
              </h2>
            </div>
            <div>
              <p>Free. Open source. Ready for Windows.</p>
              <div className="release-detail mono">
                <span className="status-dot" />
                {release.version} <span>·</span> Stable release <span>·</span> x64
              </div>
            </div>
          </div>
          <DownloadOptions />
          <div className="download-links">
            <Link href="/download/">
              Installation & first-run guide <Icon name="arrow" size={15} />
            </Link>
            <a href={release.url}>
              Release notes <Icon name="external" size={13} />
            </a>
            <a href={links.releases}>
              All releases <Icon name="external" size={13} />
            </a>
          </div>
          <p className="release-caveat">
            An early-release project. Test protection settings with your workloads. Sensor and
            cooling support depends on your hardware.
          </p>
        </div>
      </section>
      <section className="section container faq-section" id="faq">
        <div>
          <span className="eyebrow">A FEW GOOD QUESTIONS</span>
          <h2>
            Before you
            <br />
            <span className="muted">take control.</span>
          </h2>
          <p>Curious about something else?</p>
          <a className="text-link" href={links.issues}>
            Talk with us on GitHub <Icon name="arrow" size={16} />
          </a>
        </div>
        <div className="faq-list">
          {faq.map(([q, a], i) => (
            <details key={q}>
              <summary>
                <span className="mono">{String(i + 1).padStart(2, "0")}</span>
                {q}
                <span className="faq-plus" aria-hidden="true">
                  +
                </span>
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="open-source-banner container">
        <div className="source-mark" aria-hidden="true">
          &#123; &#125;
        </div>
        <div>
          <span className="eyebrow">OPEN SOURCE. OPEN POSSIBILITIES.</span>
          <h2>Good tools get better together.</h2>
          <p>Read the code. Ask a question. Make your contribution.</p>
        </div>
        <a className="button button-secondary" href={links.github}>
          <Icon name="github" size={19} />
          Explore on GitHub
          <Icon name="external" size={14} />
        </a>
      </section>
    </main>
  );
}
