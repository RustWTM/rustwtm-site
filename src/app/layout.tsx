import type { Metadata } from "next";
import localFont from "next/font/local";
import { SiteShell } from "@/components/site-shell";
import { Footer } from "@/components/footer";
import "./globals.css";
const space = localFont({
  src: "../../public/fonts/space-grotesk.woff2",
  variable: "--font-space-grotesk",
  weight: "400 700",
  display: "swap",
  fallback: ["Arial"],
});
const jetbrains = localFont({
  src: "../../public/fonts/jetbrains-mono.woff2",
  variable: "--font-jetbrains",
  weight: "400 500",
  display: "swap",
  fallback: ["Courier New"],
  preload: false,
});
export const metadata: Metadata = {
  metadataBase: new URL("https://rustwtm.com"),
  title: { default: "RustWTM — Your Windows PC, back in your hands.", template: "%s · RustWTM" },
  description:
    "See what is running. Understand what is slowing you down. A native Windows task manager, resource monitor and configurable background governor, built in Rust.",
  applicationName: "RustWTM",
  openGraph: {
    type: "website",
    siteName: "RustWTM",
    locale: "en_US",
    title: "RustWTM — Your Windows PC, back in your hands.",
    description: "A clearer view. A calmer PC. The open-source Windows task manager built in Rust.",
    images: [
      {
        url: "/opengraph.png",
        width: 1200,
        height: 630,
        alt: "RustWTM — A clearer view. A calmer PC.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RustWTM — A clearer view. A calmer PC.",
    description: "The open-source Windows task manager built in Rust.",
    images: ["/opengraph.png"],
  },
  icons: {
    icon: [
      { url: "/brand/rustwtm-icon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};
const init = `(function(){var d=document.documentElement,t='system',m='on';try{t=localStorage.getItem('rustwtm-theme')||'system';m=localStorage.getItem('rustwtm-motion')||'on'}catch(e){}if(!['light','dark','system'].includes(t))t='system';d.dataset.preference=t;d.dataset.theme=t==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;d.dataset.motion=matchMedia('(prefers-reduced-motion: reduce)').matches?'off':m})();`;
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: init }} />
      </head>
      <body className={`${space.variable} ${jetbrains.variable}`}>
        <SiteShell>
          {children}
          <Footer />
        </SiteShell>
      </body>
    </html>
  );
}
