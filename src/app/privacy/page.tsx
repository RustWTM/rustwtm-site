import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { docs, links } from "@/lib/product";
export const metadata = pageMetadata(
  "Privacy & security",
  "How this website works, where RustWTM keeps local history, what optional integrations contact, and how the product’s permission model works.",
  "/privacy/",
);
export default function Privacy() {
  return (
    <main id="main" className="container subpage">
      <div className="page-heading">
        <div className="breadcrumbs">
          <Link href="/">RustWTM</Link>
          <span>/</span>
          <span>Privacy & security</span>
        </div>
        <h1>
          Clear about your tools.
          <br />
          <span className="muted">Clear about your data.</span>
        </h1>
        <p>
          A practical explanation of this website and the documented desktop application. Last
          reviewed 10 November 2026.
        </p>
      </div>
      <div className="subpage-content">
        <section>
          <h2>This website.</h2>
          <p>
            This is a static product website hosted on GitHub Pages. It does not scan your computer,
            read its processes, or obtain live resource measurements. Application screenshots
            contain example data; the diagrams are explanatory illustrations.
          </p>
          <p>
            The site does not include analytics trackers, advertising scripts, account sign-in or
            forms. Fonts and media are served with the site. GitHub Pages still receives the normal
            network information needed to serve requests; see{" "}
            <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">
              GitHub’s privacy statement
            </a>
            .
          </p>
          <p>
            Your color-theme and animation preferences are stored in your browser’s local storage,
            using <code>rustwtm-theme</code> and <code>rustwtm-motion</code>. They stay in that
            browser and are not sent to an application backend. You can clear them through your
            browser’s site-data settings.
          </p>
        </section>
        <section>
          <h2>The desktop application.</h2>
          <p>
            RustWTM records long-term per-app usage in a local SQLite database. Configuration and
            usage history live in <code>%ProgramData%\RustWTM</code>, in a directory writable only
            by SYSTEM and Administrators. The MSI uninstaller retains that data.
          </p>
          <p>
            Its service runs as LocalSystem. Read-only named-pipe requests are available to
            interactive users; control requests require an elevated administrator. The pipe rejects
            remote clients. The <a href={links.security}>security policy</a> describes the checks
            and protected processes.
          </p>
          <p>
            Automatic enforcement starts in dry-run. Manual commands still execute. Protected
            Windows processes and RustWTM itself cannot be throttled, suspended or terminated by the
            governor’s controls.
          </p>
        </section>
        <section>
          <h2>Connections you choose.</h2>
          <ul>
            <li>
              Installer downloads and update functionality contact GitHub to obtain releases and
              published checksums.
            </li>
            <li>
              The optional Telegram bot communicates through Telegram when configured. Only
              configured allowed chat IDs can use it. Review your settings before enabling it.
            </li>
            <li>
              Docker monitoring reads a supported local Engine named pipe. All Engine operations are
              read-only GET requests. Container statistics and logs are kept in bounded window
              memory, rather than saved in the history database.
            </li>
            <li>
              The MCP server uses standard input/output. It does not open a network listener.
              Read-only is the default; control tools require <code>--allow-control</code>.
            </li>
          </ul>
          <p>
            These are documented behaviors, not a claim that every future version has been
            independently audited. Consult the current <a href={docs("README.md")}>README</a>,{" "}
            <a href={docs("docs/docker.md")}>Docker guide</a> and{" "}
            <a href={links.security}>security policy</a> for details.
          </p>
        </section>
        <section>
          <h2>Report security issues privately.</h2>
          <p>
            Follow <a href={links.security}>SECURITY.md</a> for private reporting. Avoid posting
            vulnerability details in a public issue. For ordinary bugs and feature requests, use{" "}
            <a href={links.issues}>GitHub Issues</a>.
          </p>
        </section>
      </div>
    </main>
  );
}
