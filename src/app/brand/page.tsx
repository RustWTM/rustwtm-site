import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { Icon } from "@/components/icons";
export const metadata = pageMetadata(
  "Brand assets",
  "Download the original RustWTM vector icon and website wordmarks, with the project’s colors and typography.",
  "/brand/",
);
export default function Brand() {
  return (
    <main id="main" className="container subpage">
      <div className="page-heading">
        <div className="breadcrumbs">
          <Link href="/">RustWTM</Link>
          <span>/</span>
          <span>Brand assets</span>
        </div>
        <h1>
          One familiar mark.
          <br />
          <span className="muted">Everywhere it belongs.</span>
        </h1>
        <p>
          The original gauge icon, with its green-to-copper arc. Ready for light and dark
          surroundings.
        </p>
      </div>
      <div className="brand-preview">
        <div>
          <img
            src="/brand/rustwtm-wordmark-dark.svg"
            width="440"
            height="110"
            alt="RustWTM wordmark on a dark background"
          />
          <a href="/brand/rustwtm-wordmark-dark.svg" download className="text-link">
            Download dark-surface SVG <Icon name="download" size={16} />
          </a>
        </div>
        <div>
          <img
            src="/brand/rustwtm-wordmark-light.svg"
            width="440"
            height="110"
            alt="RustWTM wordmark on a light background"
          />
          <a href="/brand/rustwtm-wordmark-light.svg" download className="text-link">
            Download light-surface SVG <Icon name="download" size={16} />
          </a>
        </div>
      </div>
      <div className="subpage-content">
        <section>
          <h2>Keep the character intact.</h2>
          <p>
            The icon comes directly from the product’s original SVG. Its geometry, proportions,
            background and gauge are preserved. The website pairs it with a Space Grotesk wordmark.
            Keep clear space around the mark and avoid stretching or recoloring the original icon.
          </p>
          <div className="download-links">
            <a href="/brand/rustwtm-icon.svg" download>
              Original vector icon <Icon name="download" size={15} />
            </a>
            <a href="/og.png" download>
              Social sharing image <Icon name="download" size={15} />
            </a>
          </div>
        </section>
        <section>
          <h2>A focused palette.</h2>
          <div className="brand-colors">
            {[
              ["Gauge green", "#4fc778"],
              ["Gauge copper", "#de783d"],
              ["Icon slate", "#171a2b"],
              ["Web accent", "#f09a65"],
            ].map(([name, color]) => (
              <div className="brand-color" key={color}>
                <span style={{ background: color }} />
                <p>
                  {name}
                  <br />
                  {color}
                </p>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 24 }}>
            Light-mode accent: #a94f22. Website surface, text, border and data-category colors adapt
            together through central theme variables.
          </p>
        </section>
        <section>
          <h2>Type with purpose.</h2>
          <p>
            Space Grotesk carries the interface and headlines. JetBrains Mono gives technical values
            and commands a distinct rhythm. Both are self-hosted and distributed under the SIL Open
            Font License.
          </p>
          <div className="download-links">
            <a href="/fonts/Space-Grotesk-OFL.txt">Space Grotesk license</a>
            <a href="/fonts/JetBrains-Mono-OFL.txt">JetBrains Mono license</a>
          </div>
        </section>
      </div>
    </main>
  );
}
