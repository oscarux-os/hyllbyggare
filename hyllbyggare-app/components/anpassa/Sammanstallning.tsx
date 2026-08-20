"use client";

// "Det här läggs i varukorgen" – raderna bakom knappen.
//
// Konfiguratorn lägger inte EN vara i korgen: möbeln är en, och varje tillbehör är sitt eget
// artikelnummer. Knappen säger hur många det blir, och den här vyn säger vilka. Utan den är
// antalet en siffra man får lita på; med den är det något man kan läsa.
//
// Ingen redigering här: tillbehören väljs där de hör hemma, i sina paneler. Det här är kvittot
// före köpet, inte en varukorg.

import Image from "next/image";
import { X } from "lucide-react";
import { Heading, Text } from "@/components/Type";
import { formatKr, offerAmount, type CareProduct } from "@/lib/tillval";

export interface CartLine {
  id: string;
  name: string;
  /** Raden under namnet: mått och material för möbeln, produktdetaljer för tillbehören. */
  detail: string;
  image?: string;
  /** Priset som faktiskt läggs i korgen. */
  price: number;
  /** Ordinarie pris, om det är högre – visas överstruket. */
  listPrice?: number;
}

export default function Sammanstallning({
  lines,
  onClose,
  onAdd,
}: {
  lines: CartLine[];
  onClose: () => void;
  onAdd: () => void;
}) {
  const total = lines.reduce((a, l) => a + l.price, 0);
  const listTotal = lines.reduce((a, l) => a + (l.listPrice ?? l.price), 0);

  return (
    <div className="flex min-h-0 flex-col bg-card p-6">
      <div className="flex shrink-0 items-start gap-4">
        <Heading level="h2" className="flex-1 text-[32px] leading-8">Det här läggs i varukorgen</Heading>
        <button
          type="button"
          aria-label="Stäng"
          onClick={onClose}
          className="-mr-1 mt-1 flex h-8 w-8 shrink-0 items-center justify-center text-foreground transition-opacity duration-fast hover:opacity-60"
        >
          <X size={24} />
        </button>
      </div>

      <Text variant="small" className="mt-1 shrink-0 text-muted-foreground">
        {lines.length === 1 ? "En vara" : `${lines.length} varor`}
      </Text>

      <ul className="mt-6 min-h-0 flex-1 overflow-y-auto">
        {lines.map((l) => (
          <li key={l.id} className="flex items-center gap-4 border-t border-border py-4">
            <span className="relative block h-16 w-16 shrink-0 bg-surface">
              {l.image && (
                <Image src={l.image} alt="" fill sizes="64px" className="fade-in object-contain" draggable={false} />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <Text as="span" className="block truncate font-medium text-foreground">{l.name}</Text>
              <Text as="span" variant="small" className="block truncate text-muted-foreground">{l.detail}</Text>
            </span>
            <span className="shrink-0 text-right">
              <span className="block font-heading text-2xl font-medium leading-6 tracking-tight text-sale">
                {formatKr(l.price)}
              </span>
              {l.listPrice != null && l.listPrice > l.price && (
                <Text as="span" variant="small" className="block text-muted-foreground line-through">
                  {formatKr(l.listPrice)}
                </Text>
              )}
            </span>
          </li>
        ))}
      </ul>

      <div className="shrink-0 border-t border-border pt-4">
        <div className="flex items-baseline justify-between gap-4">
          <Text as="span" className="font-medium text-foreground">Totalt</Text>
          <span className="flex items-baseline gap-2">
            <span className="font-heading text-2xl font-medium leading-6 tracking-tight text-sale">{formatKr(total)}</span>
            {listTotal > total && (
              <span className="font-heading text-2xl font-medium leading-6 tracking-tight text-muted-foreground line-through">
                {formatKr(listTotal)}
              </span>
            )}
          </span>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="mt-4 w-full rounded-button bg-primary px-4 py-2.5 font-body text-base font-semibold leading-5 text-primary-foreground transition-opacity duration-fast hover:opacity-90 active:opacity-80"
        >
          {lines.length === 1 ? "Lägg i varukorg" : `Lägg ${lines.length} produkter i varukorg`}
        </button>
      </div>
    </div>
  );
}

/** Raden för ett tillbehör – erbjudandepriset är vad som faktiskt läggs i korgen. */
export const lineOf = (p: CareProduct): CartLine => ({
  id: p.id,
  name: p.name,
  detail: p.details,
  image: p.image,
  price: offerAmount(p),
  listPrice: p.price,
});
