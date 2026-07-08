"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Heading, Text } from "./Type";
import { CATEGORIES, rowCells, type State } from "@/lib/config";

// Frilagda produktbilder per kategori (transparent bakgrund). Saknas bild → linjeskiss.
const CATEGORY_IMAGES: Record<string, string> = {
  hyllor: "/furniture/cut-hylla.png",
  byraar: "/furniture/cut-byra.png",
  vitrin: "/furniture/cut-vitrin.png",
  skankar: "/furniture/cut-skank.png",
  tvbank: "/furniture/cut-tvbank.png",
};

// Per-kategori beskärning (padding kring den frilagda bilden). TV-bänken är bred och
// blir liten i den kvadratiska rutan – mindre luft = hårdare beskärning så den fyller mer.
const CATEGORY_IMG_PAD: Record<string, string> = {
  tvbank: "p-0 md:p-2",
};
const DEFAULT_IMG_PAD = "p-4 md:p-8";

// Liten linjeskiss av en preset (fallback när foto saknas).
function ShelfSketch({ state }: { state: State }) {
  const { rows, cols } = state;
  const CW = 40,
    pad = 3,
    hpx = (h: number) => h * (CW / 40);
  const totalH = rows.reduce((a, x) => a + hpx(x.h), 0);
  const W = cols * CW + pad * 2;
  const H = totalH + pad * 2;
  const out: JSX.Element[] = [];
  let y = pad,
    k = 0;
  rows.forEach((row) => {
    const rh = hpx(row.h);
    const cells = rowCells(row, cols);
    const tot = cells.reduce((a, c) => a + c.span, 0);
    let x = pad;
    cells.forEach((c) => {
      const cw = (c.span / tot) * (cols * CW);
      if (c.type === "o") {
        out.push(<rect key={k++} x={x} y={y} width={cw} height={rh} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.5} />);
        for (let i = 1; i <= c.shelves; i++) {
          const ly = y + (rh * i) / (c.shelves + 1);
          out.push(<line key={k++} x1={x} y1={ly} x2={x + cw} y2={ly} stroke="currentColor" strokeWidth={0.8} opacity={0.4} />);
        }
      } else {
        out.push(<rect key={k++} x={x + 0.6} y={y + 0.6} width={cw - 1.2} height={rh - 1.2} fill="currentColor" opacity={c.front === "glass" ? 0.22 : 0.8} />);
        if (c.type === "l") out.push(<line key={k++} x1={x + cw * 0.8} y1={y + rh * 0.32} x2={x + cw * 0.8} y2={y + rh * 0.68} stroke="#fff" strokeWidth={1.2} />);
        else out.push(<line key={k++} x1={x + cw * 0.3} y1={y + rh * 0.5} x2={x + cw * 0.7} y2={y + rh * 0.5} stroke="#fff" strokeWidth={1.2} />);
      }
      x += cw;
    });
    y += rh;
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: W, height: H }} className="max-h-full max-w-full" preserveAspectRatio="xMidYMid meet">
      {out}
    </svg>
  );
}

// Byggarens första steg enligt Figma: brödsmulor, rubrik och ett rutnät av
// möbelkategorier. Varje kort har en stor centrerad etikett med pil under bilden.
// Bilden zoomar lätt vid hover och pilen glider åt höger.
export default function TypePicker({ onPick }: { onPick: (s: State) => void }) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="flex flex-col gap-6 p-2 md:p-6">
        {/* Brödsmulor */}
        <nav aria-label="Brödsmulor" className="flex items-center gap-0.5 font-body text-base tracking-tight">
          <Link href="/" className="text-muted-foreground transition-opacity duration-fast hover:opacity-70">
            Serier
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link href="/" className="text-muted-foreground transition-opacity duration-fast hover:opacity-70">
            Anamosa
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground" aria-current="page">
            Bygg din egen
          </span>
        </nav>

        {/* Rubrik */}
        <div className="flex flex-col gap-2">
          <Heading level="display-md" as="h1">Vad vill du bygga?</Heading>
          <Text variant="lead" className="max-w-[560px] text-muted-foreground">
            Välj en möbeltyp att utgå från – du finjusterar allt i nästa steg.
          </Text>
        </div>

        {/* Kategorier */}
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-8 md:mt-8 md:gap-x-6 md:gap-y-12 lg:grid-cols-3">
          {CATEGORIES.map((c) => {
            const img = CATEGORY_IMAGES[c.id];
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onPick({ ...c.make(), category: c.id })}
                className="group flex flex-col gap-6 text-center outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <span className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-background">
                  {img ? (
                    <Image
                      src={img}
                      alt={c.name}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className={`object-cover transition-transform duration-500 ease-default group-hover:scale-[1.05] ${CATEGORY_IMG_PAD[c.id] ?? DEFAULT_IMG_PAD}`}
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center p-8 transition-transform duration-500 ease-default group-hover:scale-[1.05]">
                      <ShelfSketch state={c.make()} />
                    </span>
                  )}
                </span>
                <span className="flex items-center justify-center gap-1.5 md:gap-2">
                  <span className="font-heading text-xl font-medium tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">{c.name}</span>
                  <ArrowRight
                    aria-hidden="true"
                    className="h-6 w-6 shrink-0 transition-transform duration-base ease-default group-hover:translate-x-2 md:h-8 md:w-8"
                  />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
