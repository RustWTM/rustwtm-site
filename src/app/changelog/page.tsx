import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";
import { release, links, download } from "@/lib/product";
import { ReleaseNotes } from "@/components/release-notes";
import { Icon } from "@/components/icons";
export const metadata = pageMetadata(
  "Changelog",
  "The latest RustWTM releases, fixes and improvements, synchronized from the official product repository. Development changes are listed separately.",
  "/changelog/",
);
export default function Changelog() {
  const history = release.history.slice(0, 8);
  return (
    <main id="main" className="container subpage">
      <div className="page-heading">
        <div className="breadcrumbs">
          <Link href="/">RustWTM</Link>
          <span>/</span>
          <span>Changelog</span>
        </div>
        <h1>
          Always moving.
          <br />
          <span className="accent-text">Every change, in view.</span>
        </h1>
        <p>
          Release notes from the official repository. Published releases and work in progress,
          clearly separated.
        </p>
        <div className="download-links">
          <a href={download} className="text-link">
            Download {release.version} <Icon name="download" size={15} />
          </a>
          <a href={links.releases}>
            All releases on GitHub <Icon name="external" size={13} />
          </a>
          {release.changelog.unreleased && (
            <a href="#in-development">
              In development <Icon name="arrow" size={15} />
            </a>
          )}
        </div>
      </div>
      <div className="changelog-layout">
        <nav className="changelog-nav" aria-label="Release history">
          <span className="eyebrow">RELEASE HISTORY</span>
          {history.map((item) => (
            <a key={item.version} href={`#${item.version.replaceAll(".", "-")}`}>
              <span className="mono">{item.version}</span>
              {item.version === release.version && <span className="status-dot" />}
            </a>
          ))}
          <a href={release.changelog.url}>
            Source changelog <Icon name="external" size={12} />
          </a>
          <p>
            Synced automatically
            <br />
            from the product repository.
          </p>
        </nav>
        <div className="changelog-entries">
          {history.map((item) => (
            <article
              id={item.version.replaceAll(".", "-")}
              className={`release-entry ${item.version === release.version ? "release-latest" : ""}`}
              key={item.version}
            >
              <header>
                <div>
                  <span className="eyebrow">
                    {item.version === release.version
                      ? "LATEST STABLE RELEASE"
                      : "PUBLISHED RELEASE"}
                  </span>
                  <h2>{item.version}</h2>
                </div>
                <time dateTime={item.publishedAt}>
                  {new Intl.DateTimeFormat("en", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    timeZone: "UTC",
                  }).format(new Date(item.publishedAt))}
                </time>
              </header>
              {item.body ? (
                <ReleaseNotes body={item.body} />
              ) : (
                <p>Read the release notes in the official repository.</p>
              )}
              {item.changelog.trim() && item.changelog.trim() !== item.body.trim() && (
                <details className="source-changelog">
                  <summary>Repository changelog entry</summary>
                  <ReleaseNotes body={item.changelog} />
                </details>
              )}
              <a className="text-link" href={item.url}>
                View release on GitHub <Icon name="external" size={13} />
              </a>
            </article>
          ))}
          {release.changelog.unreleased && (
            <section className="release-entry development-entry" id="in-development">
              <span className="eyebrow">IN DEVELOPMENT</span>
              <h2>What’s taking shape.</h2>
              <p className="development-notice">
                These changes are not part of the latest stable release. Availability may change
                before publication.
              </p>
              <ReleaseNotes body={release.changelog.unreleased} />
              <a className="text-link" href={release.changelog.url}>
                Follow the source changelog <Icon name="external" size={13} />
              </a>
            </section>
          )}
          <p className="changelog-provenance">
            Source snapshot <code>{release.changelog.sha.slice(0, 7)}</code> · Last content update{" "}
            {new Intl.DateTimeFormat("en", {
              day: "numeric",
              month: "short",
              year: "numeric",
              timeZone: "UTC",
            }).format(new Date(release.checkedAt))}
            . <a href="/updates.json">Update metadata</a>
          </p>
        </div>
      </div>
    </main>
  );
}
