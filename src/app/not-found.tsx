import Link from "next/link";
import { Icon } from "@/components/icons";
export const metadata = { title: "Page not found", robots: { index: false, follow: true } };
export default function NotFound() {
  return (
    <main id="main" className="container not-found">
      <span className="eyebrow">404 / NO PROCESS FOUND</span>
      <h1>
        A little off track.
        <br />
        <span className="muted">Easy to get back.</span>
      </h1>
      <p>This page is not here. Your next clearer view is a click away.</p>
      <div>
        <Link className="button" href="/">
          Back to the overview <Icon name="arrow" size={17} />
        </Link>
        <Link className="button button-secondary" href="/docs/">
          Open documentation
        </Link>
      </div>
    </main>
  );
}
