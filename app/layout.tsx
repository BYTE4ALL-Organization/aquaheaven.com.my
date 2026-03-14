import type { Metadata, Viewport } from "next";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "@/stack/client";
import { stackServerApp } from "@/stack/server";
import "@/styles/globals.css";
import { satoshi } from "@/styles/fonts";
import HolyLoader from "holy-loader";
import Providers from "./providers";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import AuthSync from "@/components/auth/AuthSync";
import CartSync from "@/components/cart/CartSync";
import { SITE_NAME, SITE_TAGLINE, buildCanonical, getMetadataBase } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_TAGLINE,
  alternates: {
    canonical: buildCanonical("/"),
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: buildCanonical("/"),
    title: SITE_NAME,
    description: SITE_TAGLINE,
    images: [{ url: "/opengraph-image" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_TAGLINE,
    images: ["/twitter-image"],
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={satoshi.className}><StackProvider app={stackClientApp}><StackTheme><StackProvider app={stackServerApp}><StackTheme>
        <HolyLoader color="#868686" />
        <Providers>
          <AuthSync />
          <CartSync />
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </Providers>
      </StackTheme></StackProvider></StackTheme></StackProvider></body>
    </html>
  );
}
