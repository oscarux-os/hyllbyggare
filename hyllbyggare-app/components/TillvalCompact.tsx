"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Check } from "lucide-react";
import { Heading, Text } from "./Type";
import {
  TILLVAL_FILTERS,
  filterProducts,
  offerPrice,
  ordinaryPrice,
  type TillvalProduct,
} from "@/lib/tillval";

// Kompakt variant av Tillval – inspirerad av Apple Podcasts "More to Discover":
// tvåkolumners lista med kvadratisk produktbild, namn/detaljer och en pill som
// visar erbjudandepriset och fungerar som lägg-till-knapp. Tätare än karusellen
// (Tillval.tsx) så fler tillval syns utan att scrolla.
export default function TillvalCompact({
  added,
  onToggle,
}: {
  added: Set<string>;
  onToggle: (id: string) => void;
}) {
  const [filter, setFilter] = useState("rekommenderade");
  const products = filterProducts(filter);

  return (
    <section className="flex w-full flex-col bg-white pb-12 pt-12 lg:py-16">
      {/* rubrik + kampanj + filter */}
      <div className="mb-8 flex flex-col gap-4 px-4 md:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <Heading level="h2" className="text-[22px] leading-none lg:text-[2rem]">Tillval</Heading>
          <span className="w-fit bg-sale px-3 py-1.5 font-body text-sm font-medium leading-none text-sale-foreground">
            50 % på alla tillval vid köp av Anamosa
          </span>
        </div>
        <div className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1">
          {TILLVAL_FILTERS.map((f) => {
            const on = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`shrink-0 whitespace-nowrap rounded-button px-6 py-2 font-body font-medium transition-colors duration-fast ${
                  on
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground hover:bg-accent"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* kompakt lista – två kolumner på bredare skärmar */}
      <div className="grid grid-cols-1 gap-x-10 px-4 md:px-6 lg:grid-cols-2">
        {products.map((p) => (
          <TillvalRow key={p.id} product={p} added={added.has(p.id)} onToggle={() => onToggle(p.id)} />
        ))}
      </div>
    </section>
  );
}

function TillvalRow({
  product,
  added,
  onToggle,
}: {
  product: TillvalProduct;
  added: boolean;
  onToggle: () => void;
}) {
  return (
    <article className="flex items-center gap-4 border-b border-border py-4">
      {/* produktbild */}
      <div className="relative h-[76px] w-[76px] shrink-0 bg-white">
        <Image
          src={product.image}
          alt={`${product.name} – ${product.details}`}
          fill
          sizes="76px"
          className="object-contain p-2"
          draggable={false}
        />
      </div>

      {/* namn + detaljer + pris (ursprungsdesign) */}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="min-w-0">
          <Text variant="body" className="truncate font-medium">{product.name}</Text>
          <Text variant="small" className="truncate text-muted-foreground">{product.details}</Text>
        </div>
        <div className="flex items-end gap-4">
          <div className="flex flex-col gap-1">
            <Text variant="small" className="text-sale">Pris med erbjudande</Text>
            <span className="font-heading text-2xl font-medium leading-6 tracking-tight text-sale">
              {offerPrice(product)}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <Text variant="small">Ordinarie pris</Text>
            <span className="font-heading text-2xl font-medium leading-6 tracking-tight text-foreground">
              {ordinaryPrice(product)}
            </span>
          </div>
        </div>
      </div>

      {/* köpknapp längst till höger */}
      <button
        onClick={onToggle}
        aria-pressed={added}
        aria-label={added ? `Ta bort ${product.name}` : `Lägg till ${product.name}`}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity duration-fast hover:opacity-90 active:opacity-80"
      >
        {added ? <Check size={18} /> : <Plus size={18} />}
      </button>
    </article>
  );
}
