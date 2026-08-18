"use client";

// Rund ikonknapp: tillbaka-pilen, verktygen under bilden och ✕ i panelen.
// Två toner ur skissen – vit (flyter över bild/bakgrund) och grå (sitter på ett vitt kort).
// Ingen skugga: separationen kommer ur tonskillnaden mot underlaget, som design.md säger.

export default function RoundButton({
  label,
  tone = "card",
  size = 40,
  onClick,
  children,
}: {
  /** Läses upp av skärmläsare – knapparna har bara ikon. */
  label: string;
  tone?: "card" | "muted";
  size?: 40 | 48;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={{ width: size, height: size }}
      className={`flex shrink-0 items-center justify-center rounded-full transition-colors duration-fast active:scale-[0.96] ${
        tone === "card"
          ? "bg-card text-foreground hover:bg-secondary"
          : "bg-secondary text-foreground hover:bg-[oklch(0.91_0_0)]"
      }`}
    >
      {children}
    </button>
  );
}
