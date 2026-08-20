"use client";

// Bilden i en bricka, en rutnätscell eller detaljvyn. Alternativen beskriver bara VAD som ska
// ritas (`Media` i model.ts); den här komponenten är enda stället som vet hur.

import Image from "next/image";
import { MiniShelf } from "@/components/Configurator";
import { TILLVAL_PRODUCTS } from "@/lib/tillval";
import type { Media } from "./model";

export default function OptionMedia({
  media,
  sizes,
  /** MiniShelf ritas i 34×22 px – skalan avgör hur stor silhuetten blir i ytan. */
  shelfScale = 2.4,
  /** Luft runt ett produktfoto, som andel av ytan. Träytor får ingen: de fyller. */
  pad = "p-2",
}: {
  media: Media;
  sizes: string;
  shelfScale?: number;
  pad?: string;
}) {
  if (media.kind === "image") {
    const cover = media.fit === "cover";
    return (
      <Image
        src={media.src}
        alt=""
        fill
        sizes={sizes}
        className={`fade-in ${cover ? "object-cover" : `object-contain ${pad}`}`}
        draggable={false}
      />
    );
  }

  if (media.kind === "swatch") {
    return <span className="block h-full w-full" style={{ background: media.color }} />;
  }

  if (media.kind === "shelf") {
    return (
      <span className="flex h-full w-full items-center justify-center text-foreground/70">
        <span style={{ transform: `scale(${shelfScale})` }}>
          <MiniShelf rows={media.rows} cols={media.cols} />
        </span>
      </span>
    );
  }

  if (media.kind === "tillval") {
    // Överlappande runda miniatyrer. Utan val visas de rekommenderade nedtonade – ytan ska
    // visa VAD man kan lägga till, inte gapa tom.
    const picks = TILLVAL_PRODUCTS.filter((p) => media.ids.includes(p.id)).slice(0, 4);
    const shown = picks.length ? picks : TILLVAL_PRODUCTS.filter((p) => p.recommended).slice(0, 4);
    return (
      <span className="flex h-full items-center justify-center">
        {shown.map((p, i) => (
          <span
            key={p.id}
            className="relative -ml-5 block h-20 w-20 shrink-0 overflow-hidden rounded-full border border-border bg-card first:ml-0"
            style={{ zIndex: shown.length - i, opacity: picks.length ? 1 : 0.55 }}
          >
            <Image src={p.image} alt="" fill sizes="80px" className="object-cover" />
          </span>
        ))}
      </span>
    );
  }

  return null;
}
