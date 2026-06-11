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
        <div className="relative min-h-screen overflow-hidden bg-[#06101d]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(60,180,160,0.18),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(245,99,66,0.16),transparent_22%),linear-gradient(180deg,#06101d_0%,#071a2d_48%,#08111b_100%)]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent)] opacity-40" />

          <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
            <header className="mb-6 flex items-center justify-between rounded-[1.6rem] border border-white/10 bg-white/[0.06] px-4 py-3 shadow-[0_16px_45px_rgba(2,8,23,0.2)] backdrop-blur">
              <Link href="/" className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f56442,#ffd166)] font-display text-sm text-slate-950">
                  BX
                </span>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">
                    Selimiye Moschee Sommerfest
                  </p>
                  <p className="font-display text-lg text-white sm:text-xl">
                    Box-Automat Challenge
                  </p>
                </div>
              </Link>

              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-emerald-100">
                <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.95)]" />
                Live
              </div>
            </header>
            <main className="flex-1">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
