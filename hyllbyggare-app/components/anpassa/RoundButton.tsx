"use client";

// Rund ikonknapp: tillbaka-pilen och verktygen vid bildens kant.
// Tre toner – vit (flyter över bild/bakgrund), grå (sitter på ett vitt kort) och naken (bara
// ikonen, som verktygen i rutnätsskissen; ytan dyker upp först vid hover).
// Ingen skugga: separationen kommer ur tonskillnaden mot underlaget, som design.md säger.

import Link from "next/link";

const TONE = {
  card: "bg-card text-foreground hover:bg-secondary",
  muted: "bg-secondary text-foreground hover:bg-[oklch(0.91_0_0)]",
  bare: "text-foreground hover:bg-card",
} as const;

export default function RoundButton({
  label,
  tone = "card",
  size = 40,
  href,
  onClick,
  children,
}: {
  /** Läses upp av skärmläsare – knapparna har bara ikon. */
  label: string;
  tone?: keyof typeof TONE;
  size?: 40 | 48;
  /** Navigering. Med href blir knappen en riktig länk: går att öppna i ny flik och att kopiera. */
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const cls = `flex shrink-0 items-center justify-center rounded-full transition-colors duration-fast active:scale-[0.96] ${TONE[tone]}`;
  const size2 = { width: size, height: size };

  if (href) {
    return (
      <Link href={href} aria-label={label} style={size2} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" aria-label={label} onClick={onClick} style={size2} className={cls}>
      {children}
    </button>
  );
}
