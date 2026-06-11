import Link from "next/link";

type ScoreEntryButtonProps = {
  href: string;
};

export function ScoreEntryButton({ href }: ScoreEntryButtonProps) {
  return (
    <Link
      href={href}
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 inline-flex items-center gap-3 rounded-full border border-orange-200/20 bg-[linear-gradient(135deg,rgba(245,100,66,0.95),rgba(255,138,76,0.95))] px-4 py-3 text-sm font-semibold text-white shadow-[0_20px_45px_rgba(245,100,66,0.35)] transition hover:translate-y-[-1px] sm:right-6"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/16 text-xl leading-none">
        +
      </span>
      <span>Score eintragen</span>
    </Link>
  );
}
