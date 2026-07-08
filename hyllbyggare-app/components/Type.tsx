import { ReactNode } from "react";

// Typografikomponenter enligt design.md – använd dessa, inte råa <h1>/<p> med klasser.

type HeadingLevel = "display-md" | "display-sm" | "h1" | "h2" | "h3" | "h4";
// Bulldog-rubriker använder alltid Medium (vikt 500).
const HEADING: Record<HeadingLevel, string> = {
  "display-md": "font-heading font-medium text-3xl md:text-5xl leading-[0.85]",
  "display-sm": "font-heading font-medium text-2xl md:text-4xl leading-[0.85]",
  h1: "font-heading font-medium text-3xl md:text-5xl leading-tight",
  h2: "font-heading font-medium text-3xl leading-9",
  h3: "font-heading font-medium text-2xl leading-8",
  h4: "font-heading font-medium text-xl leading-7",
};

export function Heading({
  level = "h3",
  as,
  className = "",
  children,
}: {
  level?: HeadingLevel;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  children: ReactNode;
}) {
  const Tag = (as ?? (level.startsWith("display") ? "h2" : (level as keyof JSX.IntrinsicElements))) as any;
  return <Tag className={`${HEADING[level]} tracking-tight ${className}`}>{children}</Tag>;
}

type TextVariant = "lead" | "body" | "small" | "caption";
const TEXT: Record<TextVariant, string> = {
  lead: "font-body text-xl leading-7",
  body: "font-body text-base leading-6",
  small: "font-body text-sm leading-5",
  caption: "font-body text-xs leading-4",
};

export function Text({
  variant = "body",
  as = "p",
  className = "",
  children,
}: {
  variant?: TextVariant;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  children: ReactNode;
}) {
  const Tag = as as any;
  return <Tag className={`${TEXT[variant]} tracking-tight ${className}`}>{children}</Tag>;
}

export function Eyebrow({ className = "", children }: { className?: string; children: ReactNode }) {
  return <span className={`font-body uppercase text-xs leading-4 tracking-tight text-muted-foreground ${className}`}>{children}</span>;
}
