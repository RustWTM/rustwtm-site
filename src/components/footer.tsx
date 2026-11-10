import Link from "next/link";
import { links, release } from "@/lib/product";
import { Icon } from "./icons";
export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-main">
          <div className="footer-intro">
            <Link href="/" className="brand">
              <img src="/brand/rustwtm-icon.svg" width="36" height="36" alt="" />
              <span>
                Rust<span className="brand-wtm">WTM</span>
              </span>
            </Link>
            <p>
              Your machine.
              <br />
              Back in your hands.
            </p>
            <span className="mono muted">Built in Rust. Made for Windows.</span>
          </div>
          <div>
            <h2>Product</h2>
            <Link href="/#features">Features</Link>
            <Link href="/#screenshots">The workspace</Link>
            <Link href="/download/">Download for Windows</Link>
            <a href={links.releases}>
              Releases <Icon name="external" size={12} />
            </a>
          </div>
          <div>
            <h2>Resources</h2>
            <Link href="/docs/">Documentation</Link>
            <Link href="/docs/#first-run">Getting started</Link>
            <Link href="/brand/">Brand assets</Link>
            <Link href="/privacy/">Privacy & security</Link>
          </div>
          <div>
            <h2>Open source</h2>
            <a href={links.github}>
              GitHub <Icon name="external" size={12} />
            </a>
            <a href={links.issues}>Report an issue</a>
            <a href={links.contributing}>Contribute</a>
            <a href={links.license}>MIT license</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getUTCFullYear()} Ersin KOÇ & RustWTM contributors.</span>
          <span className="footer-last">
            <a href={release.url} className="mono">
              <span className="status-dot" />
              {release.version}
            </a>
            <span>Open source. Yours to explore.</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
