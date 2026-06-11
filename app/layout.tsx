import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";
import Link from "next/link";

import "./globals.css";

const fontSans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans"
});

const fontDisplay = Sora({
  subsets: ["latin"],
  variable: "--font-display"
});

export const metadata: Metadata = {
  title: "Selimiye Moschee Sommerfest Box-Automat Challenge",
  description:
    "Sommerfest-App für Anmeldung, Freigabe durch Admin und die öffentliche Rangliste der Box-Automat Challenge."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${fontSans.variable} ${fontDisplay.variable}`}>
        <div className="relative min-h-screen overflow-hidden bg-[#06101d]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,209,102,0.12),transparent_22%),radial-gradient(circle_at_75%_15%,rgba(245,100,66,0.14),transparent_24%),linear-gradient(180deg,#07111e_0%,#081a2b_45%,#071019_100%)]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent)] opacity-40" />

          <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-3 sm:px-6 lg:px-8">
            <header className="mb-5 flex items-center justify-between gap-3 py-2">
              <Link href="/" className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.32em] text-white/45">
                  Selimiye Moschee Sommerfest
                </p>
                <p className="mt-1 truncate font-display text-xl text-white sm:text-2xl">
                  Box-Automat Challenge
                </p>
              </Link>

              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-emerald-100">
                <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.95)]" />
                Live
              </div>
            </header>

            <main className="flex-1">{children}</main>

            <footer className="pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-6 text-center text-xs tracking-[0.16em] text-white/38">
              Made with <span className="text-[#ff7a90]">♥</span> by Flexx
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
