import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
  title: "خضارك | طازج من المزرعة إلى بابك",
  description:
    "خضارك — اشتراك أسبوعي أو شهري في الخضروات والفواكه الطازجة، يوصل إلى باب بيتك.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className={`${plusJakartaSans.variable} h-full`}>
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font --
            Material Symbols Outlined isn't in next/font/google's catalog,
            so it can't be self-hosted via next/font; this loads once, in the
            root layout (not a per-page file), for every route. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-background text-on-background font-body-md text-body-md antialiased">
        {children}
      </body>
    </html>
  );
}
