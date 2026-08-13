import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { StoreProvider } from "@/components/providers/StoreProvider";
import { env } from "@/lib/env";
import "./globals.css";

// The app's copy is entirely Arabic. The previous font (Plus Jakarta Sans,
// subsets: ["latin"]) carried no Arabic glyphs at all, so every character on
// every page fell back to the OS default face. IBM Plex Sans Arabic covers
// both scripts, so this is also one font download instead of two.
const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  // Resolves relative OpenGraph/Twitter asset paths against the canonical
  // origin instead of leaving them relative (and unusable to crawlers).
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: "خضارك | طازج من المزرعة إلى بابك",
  description:
    "خضارك — اشتراك أسبوعي أو شهري في الخضروات والفواكه الطازجة، يوصل إلى باب بيتك.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className={`${arabic.variable} h-full`}>
      <body className="min-h-full bg-background text-on-background text-body-md antialiased">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
