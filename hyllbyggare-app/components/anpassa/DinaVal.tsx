"use client";

// "Dina val": rubrik, kortrutnätet och prisraden. Korten är två saker samtidigt – ingången
// till ett val OCH kvittot på vad man valt. Därför bär varje kort sitt nuvarande värde i
// klartext; raden går att läsa som en sammanfattning i ett svep, utan att öppna något.

import Image from "next/image";
import { ArrowUpRight, ChevronUp, Heart, Plus } from "lucide-react";
import { applyStyle, type State } from "@/lib/config";
import { Text } from "@/components/Type";
import { MiniShelf, LEG_IMAGES, EK_IMAGES, HANDLE_IMAGES } from "@/components/Configurator";
import { TILLVAL_PRODUCTS } from "@/lib/tillval";
import { TOPICS, summaryFor, topicDisabled, type TopicId } from "./model";

export default function DinaVal({
  S,
  added,
  onOpen,
  onToggle,
  open,
}: {
  S: State;
  added: Set<string>;
  onOpen: (id: TopicId) => void;
  /** Mobil: rubriken är arkets greppyta – tryck skjuter kortytan upp i vyn. */
  onToggle?: () => void;
  open?: boolean;
}) {
  return (
    <div className="flex flex-col gap-px">
      <button
        type="button"
        onClick={onToggle}
        disabled={!onToggle}
        aria-expanded={onToggle ? !!open : undefined}
        className="flex h-12 w-full items-center gap-3 rounded-[8px] bg-card px-3 text-left lg:h-16 lg:cursor-default lg:px-6"
      >
        <h2 className="flex-1 font-heading font-medium text-2xl leading-6 tracking-tight text-foreground">Dina val</h2>
        {onToggle && (
          <ChevronUp
            size={24}
            className={`shrink-0 text-foreground transition-transform duration-base ease-default ${open ? "rotate-180" : ""}`}
          />
        )}
      </button>

      <div className="grid grid-cols-2 gap-px overflow-hidden lg:rounded-[8px]">
        {TOPICS.map((t, i) => (
          <ValCard
            key={t.id}
            S={S}
            id={t.id}
            index={i}
            added={added}
            onOpen={onOpen}
          />
        ))}
      </div>

      {/* Prisraden hör till desktoppanelen. På mobil sitter pris och Köp högst upp vid
          titeln – två köpknappar på samma skärm är en för mycket. */}
      {/* Priset står vid titeln i stället – där syns det i ALLA lägen, även när den här
          panelen bytts mot ett ämne. Här ligger bara köp-åtgärderna. */}
      <div className="hidden items-center gap-4 bg-card p-6 lg:flex lg:rounded-[8px]">
        <div className="flex-1" />
        <button
          type="button"
          aria-label="Spara"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-button border border-foreground text-foreground transition-colors duration-fast hover:bg-secondary"
        >
          <Heart size={24} />
        </button>
        <button
          type="button"
          className="rounded-button bg-primary px-6 py-3 font-body text-xl font-semibold text-primary-foreground transition-opacity duration-fast hover:opacity-90 active:opacity-80"
        >
          Lägg i varukorg
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function ValCard({
  S,
  id,
  index,
  added,
  onOpen,
}: {
  S: State;
  id: TopicId;
  index: number;
  added: Set<string>;
  onOpen: (id: TopicId) => void;
}) {
  const sum = summaryFor(S, id, added.size);
  const disabled = topicDisabled(S, id);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onOpen(id)}
      // Staggern: korten stiger in ett i taget vid mount. `backwards` behövs – annars står ett
      // kort med fördröjning synligt och hoppar till opacity 0 när dess animation startar.
      style={{ animationDelay: `${index * 40}ms` }}
      className="stagger-in flex min-h-[124px] flex-col justify-between gap-2 rounded-button bg-card p-3 text-left lg:p-6 transition-colors duration-fast hover:bg-secondary active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
    >
      <span className="flex w-full items-start justify-between gap-2">
        <span className="relative block h-14 w-14 shrink-0">
          <Thumb S={S} id={id} added={added} />
        </span>
        <span className="text-foreground">
          {id === "tillbehor" ? <Plus size={24} /> : <ArrowUpRight size={24} />}
        </span>
      </span>
      {/* key på värdet: texten glider upp när valet byts, så kortet kvitterar ändringen */}
      <span key={sum.label} className="copy-enter block">
        <Text as="span" variant="small" className="block text-foreground">{sum.label}</Text>
        {sum.sub && <Text as="span" variant="caption" className="line-clamp-2 block text-muted-foreground">{sum.sub}</Text>}
      </span>
    </button>
  );
}

// Kortets bild visar VALET, inte kategorin: materialkortet visar just den ek du valt.
function Thumb({ S, id, added }: { S: State; id: TopicId; added: Set<string> }) {
  if (id === "storlek") {
    return <Image src="/anpassa/storlek.png" alt="" fill sizes="56px" className="object-contain" />;
  }
  if (id === "stil") {
    return (
      <span className="flex h-full w-full items-center justify-center text-foreground/70">
        <span className="scale-[1.6]">
          <MiniShelf rows={applyStyle(S.style ?? "", S.cols, S.rows)} cols={S.cols} />
        </span>
      </span>
    );
  }
  if (id === "ben") {
    if (S.mount === "vagg") return <span className="block h-full w-full bg-secondary" />;
    const src = LEG_IMAGES[S.leg];
    return src ? <Image src={src} alt="" fill sizes="56px" className="fade-in object-contain" /> : null;
  }
  if (id === "material") {
    const src = EK_IMAGES[S.color];
    return src ? (
      <Image src={src} alt="" fill sizes="56px" className="fade-in object-cover" />
    ) : (
      <span className="block h-full w-full" style={{ background: S.color }} />
    );
  }
  if (id === "beslag") {
    const src = HANDLE_IMAGES[S.handle];
    return src ? <Image src={src} alt="" fill sizes="56px" className="fade-in object-contain" /> : null;
  }
  // Tillbehör: överlappande runda miniatyrer av det man lagt till, som i skissen.
  const picks = TILLVAL_PRODUCTS.filter((p) => added.has(p.id)).slice(0, 4);
  const shown = picks.length ? picks : TILLVAL_PRODUCTS.filter((p) => p.recommended).slice(0, 4);
  return (
    <span className="flex h-full items-center">
      {shown.map((p, i) => (
        <span
          key={p.id}
          className="relative -ml-3 block h-8 w-8 shrink-0 overflow-hidden rounded-full border border-border bg-card first:ml-0"
          style={{ zIndex: shown.length - i, opacity: picks.length ? 1 : 0.55 }}
        >
          <Image src={p.image} alt="" fill sizes="32px" className="object-cover" />
        </span>
      ))}
    </span>
  );
}
