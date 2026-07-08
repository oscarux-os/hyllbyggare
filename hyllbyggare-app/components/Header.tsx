import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { Search, User, Heart, ShoppingCart, ChevronDown } from "lucide-react";

// Global sidhuvud enligt Figma ("Header"): svart topprad + vit huvudrad med logga,
// Bulldog-navlänkar, sökfält och ikonknappar (varukorg med antal-badge).
const NAV = ["Produkter", "Kampanj", "Upptäck"];

function IconButton({
  label,
  badge,
  children,
}: {
  label: string;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="relative flex size-10 items-center justify-center rounded-full text-foreground transition-colors duration-fast hover:bg-accent"
    >
      {children}
      {badge && (
        <span className="absolute right-1 top-1 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 py-0.5 font-body text-xs font-semibold leading-none text-primary-foreground">
          {badge}
        </span>
      )}
    </button>
  );
}

export default function Header() {
  return (
    <header id="site-header">
      {/* Topprad – butiksinfo (bg-inverse i Figma). Bakgrunden går ut i kanten,
          innehållet håller sig till max-bredden. */}
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto flex w-full max-w-content items-center justify-between px-4 py-2.5 md:px-6">
          <span className="font-body text-sm tracking-tight">74 butiker</span>
          <button
            type="button"
            className="inline-flex items-center gap-1 font-body text-sm tracking-tight transition-opacity duration-fast hover:opacity-80"
          >
            Välj Mio-butik
            <ChevronDown size={16} aria-hidden />
          </button>
        </div>
      </div>

      {/* Huvudrad – logga, navigering, sök och ikoner */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto flex w-full max-w-content items-center gap-6 px-4 py-2 md:px-6">
        <div className="flex shrink-0 items-center gap-6">
          <Link href="/" aria-label="Mio – till startsidan" className="block">
            <Image src="/brand/mio-logo.svg" alt="Mio" width={72} height={32} priority />
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {NAV.map((label) => (
              <Link
                key={label}
                href="#"
                className="font-heading text-xl font-medium tracking-tight text-foreground transition-opacity duration-fast hover:opacity-70"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end gap-4">
          <label className="hidden min-w-0 max-w-[400px] flex-1 items-center gap-3 border border-[#8c8c8c] bg-background px-4 py-2 md:flex">
            <Search size={16} className="shrink-0 text-muted-foreground" aria-hidden />
            <input
              type="search"
              placeholder="Vad letar du efter?"
              aria-label="Sök"
              className="min-w-0 flex-1 bg-transparent font-body text-base tracking-tight text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </label>
          <div className="flex shrink-0 items-center gap-2">
            <IconButton label="Mitt konto">
              <User size={24} aria-hidden />
            </IconButton>
            <IconButton label="Favoriter">
              <Heart size={24} aria-hidden />
            </IconButton>
            <IconButton label="Varukorg" badge="1">
              <ShoppingCart size={24} aria-hidden />
            </IconButton>
          </div>
        </div>
        </div>
      </div>
    </header>
  );
}
