"use client";

import { useState } from "react";
import Image from "next/image";
import { Heading } from "../Type";
import { cn } from "@/lib/utils";
import { ButtonGroup } from "../Configurator";
import { SWATCHES, SWATCH_SELECTED, FUNKTION, FRONT, BESLAG, PREVIEW_IMAGE } from "./data";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
      <span className="w-16 shrink-0 font-heading text-xl font-medium leading-5 tracking-tight">{label}</span>
      {children}
    </div>
  );
}

// Valmöjligheter: färg, funktion, front och beslag. Valen speglas direkt i kontrollerna.
export default function Valmojligheter() {
  const [color, setColor] = useState(SWATCH_SELECTED);
  const [funktion, setFunktion] = useState<string>(FUNKTION[0]);
  const [front, setFront] = useState<string>(FRONT[0]);
  const [beslag, setBeslag] = useState<string>(BESLAG[0]);

  return (
    <section id="valmojligheter" className="mx-auto grid max-w-[1200px] gap-10 px-2 py-12 md:grid-cols-2 md:items-center md:px-6 md:py-16 scroll-mt-6">
      <div className="flex flex-col gap-6">
        <Heading level="display-sm" as="h2">Valmöjligheter</Heading>

        <Row label="Färg">
          <div className="flex flex-wrap items-center gap-3">
            {SWATCHES.map((hex, i) => {
              const sel = i === color;
              return (
                <button
                  key={i}
                  type="button"
                  aria-label={`Färg ${hex}`}
                  aria-pressed={sel}
                  onClick={() => setColor(i)}
                  className={cn(
                    "flex items-center justify-center rounded-full transition-transform duration-fast hover:scale-105",
                    sel ? "h-9 w-9 border-2 border-foreground p-1" : "h-8 w-8",
                  )}
                >
                  <span className="block h-full w-full rounded-full" style={{ backgroundColor: hex }} />
                </button>
              );
            })}
          </div>
        </Row>

        <Row label="Funktion"><ButtonGroup options={FUNKTION.map((o) => [o, o])} value={funktion} onSet={setFunktion} /></Row>
        <Row label="Front"><ButtonGroup options={FRONT.map((o) => [o, o])} value={front} onSet={setFront} /></Row>
        <Row label="Beslag"><ButtonGroup options={BESLAG.map((o) => [o, o])} value={beslag} onSet={setBeslag} /></Row>
      </div>

      <div className="relative order-first h-[360px] md:order-none md:h-[600px]">
        <Image src={PREVIEW_IMAGE} alt="Vald Anamosa-konfiguration" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-contain" />
      </div>
    </section>
  );
}
