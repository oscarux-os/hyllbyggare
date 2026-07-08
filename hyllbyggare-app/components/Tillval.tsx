"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Plus, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Heading, Text } from "./Type";
import {
  TILLVAL_FILTERS,
  filterProducts,
  offerPrice,
  ordinaryPrice,
  type TillvalProduct,
} from "@/lib/tillval";

// Tillval-sektionen ("Armstöd"/Tillval i Figma). Visas i fullskärm efter
// handtagssteget: rekommenderade tillval till den byggda hyllan, filtrerbara per
// kategori. Korten ligger i en dragbar karusell (som seriesidan) så raden alltid
// är fylld – inga tomma ytor när en kategori har få produkter. Kampanj: 50 % på
// tillval vid köp av Anamosa.
//
// Urvalet (added) lyfts upp till Configurator så att summeringen kan visa samma
// valda tillval.
export default function Tillval({
  added,
  onToggle,
}: {
  added: Set<string>;
  onToggle: (id: string) => void;
}) {
  const [filter, setFilter] = useState("rekommenderade");

  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ down: false, x: 0, l: 0, moved: false });
  // svälj klicket på plus-knappen om gesten var ett drag (annars togglas av misstag).
  const guardedToggle = (id: string) => {
    if (drag.current.moved) return;
    onToggle(id);
  };
  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 840), behavior: "smooth" });
  };

  const products = filterProducts(filter);

  return (
    <section className="flex w-full flex-col bg-white pb-12 pt-12 lg:py-16">
      {/* rubrik + filter – indenterad; karusellen går i fullskärm */}
      <div className="mb-8 flex flex-col gap-4 px-4 md:px-6">
        <Heading level="h2" className="text-[22px] leading-none lg:text-[2rem]">Tillval</Heading>
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

      {/* produktkarusell – fullskärm, dragbar, korten ligger kloss an */}
      <div
        ref={ref}
        className="no-scrollbar flex cursor-grab gap-px overflow-x-auto border-y border-border bg-border [scroll-snap-type:x_mandatory] active:cursor-grabbing"
        onPointerDown={(e) => {
          drag.current = { down: true, x: e.clientX, l: ref.current!.scrollLeft, moved: false };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d.down) return;
          if (Math.abs(e.clientX - d.x) > 4) d.moved = true;
          ref.current!.scrollLeft = d.l - (e.clientX - d.x);
        }}
        onPointerUp={() => (drag.current.down = false)}
        onPointerLeave={() => (drag.current.down = false)}
      >
        {products.map((p) => (
          <TillvalCard key={p.id} product={p} added={added.has(p.id)} onToggle={() => guardedToggle(p.id)} />
        ))}
      </div>

      {/* pil-navigering */}
      <div className="flex justify-end gap-2 px-4 pt-4 md:px-6">
        <button
          type="button"
          aria-label="Föregående"
          onClick={() => scrollBy(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors duration-fast hover:bg-accent"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          aria-label="Nästa"
          onClick={() => scrollBy(1)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors duration-fast hover:bg-accent"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}

function TillvalCard({
  product,
  added,
  onToggle,
}: {
  product: TillvalProduct;
  added: boolean;
  onToggle: () => void;
}) {
  return (
    <article className="flex w-[80vw] shrink-0 flex-col gap-3 bg-card p-4 [scroll-snap-align:start] sm:w-[360px] lg:w-[calc(100vw/3.5)] xl:w-[calc(100vw/4.5)]">
      {/* bild + kampanjetikett */}
      <div className="relative aspect-square w-full bg-white">
        <Image
          src={product.image}
          alt={`${product.name} – ${product.details}`}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 360px, 80vw"
          className="object-contain p-6"
          draggable={false}
        />
        <span className="absolute left-0 top-0 bg-sale px-2 py-1 font-body text-sm font-normal leading-4 text-sale-foreground">
          50% vid köp av Anamosa
        </span>
      </div>

      {/* namn + detaljer + pris + lägg till */}
      <div className="flex items-end gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div>
            <Text variant="body" className="font-medium">{product.name}</Text>
            <Text variant="body" className="text-muted-foreground">{product.details}</Text>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <Text variant="small" className="text-sale">Pris med erbjudande</Text>
              <span className="font-heading text-2xl font-medium leading-6 tracking-tight text-sale">
                {offerPrice(product)}
              </span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <Text variant="small">Ordinarie pris</Text>
              <span className="font-heading text-2xl font-medium leading-6 tracking-tight text-foreground">
                {ordinaryPrice(product)}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onToggle}
          aria-pressed={added}
          aria-label={added ? `Ta bort ${product.name}` : `Lägg till ${product.name}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity duration-fast hover:opacity-90 active:opacity-80"
        >
          {added ? <Check size={18} /> : <Plus size={18} />}
        </button>
      </div>
    </article>
  );
}
