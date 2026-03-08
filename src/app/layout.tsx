import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "theSVG - The Open SVG Brand Library",
    template: "%s | theSVG",
  },
  description:
    "4,600+ brand SVGs in one place. Search, preview, copy. Free, open-source, community-driven. No gatekeeping - every brand deserves a place.",
  keywords: [
    "svg",
    "brand icons",
    "logo",
    "svg library",
    "open source",
    "brand assets",
    "svg icons",
    "brand logos",
    "icon library",
    "free icons",
    "svg download",
    "brand svg",
  ],
  metadataBase: new URL("https://thesvg.org"),
  openGraph: {
    title: "theSVG - The Open SVG Brand Library",
    description:
      "4,600+ brand SVGs in one place. Search, preview, copy. Free, open-source, community-driven.",
    url: "https://thesvg.org",
    siteName: "theSVG",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "theSVG - The Open SVG Brand Library",
    description:
      "4,600+ brand SVGs in one place. Search, preview, copy. Free, open-source, community-driven.",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          storageKey="thesvg-theme"
          disableTransitionOnChange
        >
          <Header />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
