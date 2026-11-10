import type { Metadata } from "next";
export function pageMetadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} · RustWTM`,
      description,
      url: path,
      type: "website",
      siteName: "RustWTM",
      locale: "en_US",
      images: [
        {
          url: "/og.png",
          width: 1200,
          height: 630,
          alt: "RustWTM — A clearer view. A calmer PC.",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · RustWTM`,
      description,
      images: ["/og.png"],
    },
  };
}
