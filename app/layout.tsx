import type { Metadata } from "next";
import { Bricolage_Grotesque, Space_Grotesk } from "next/font/google";
import Link from "next/link";

import "./globals.css";

const fontSans = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-sans"
});

const fontDisplay = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display"
});

export const metadata: Metadata = {
  title: "Boxautomat Challenge Selimiye Bremen",
  description:
    "Sommerfest-App fuer Anmeldung, Freigabe durch Admin und die oeffentliche Rangliste der Boxautomat-Challenge."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${fontSans.variable} ${fontDisplay.variable}`}>
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.35),_transparent_30%),linear-gradient(160deg,_#3f1305_0%,_#111827_45%,_#020617_100%)]">
          <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
            <header className="mb-8 flex items-center justify-center rounded-full border border-white/10 bg-white/8 px-5 py-4 backdrop-blur">
              <Link href="/" className="font-display text-center text-lg text-white sm:text-xl">
                Boxautomat Challenge
              </Link>
            </header>
            <main className="flex-1">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
