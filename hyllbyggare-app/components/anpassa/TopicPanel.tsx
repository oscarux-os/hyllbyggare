"use client";

// Ämnespanelen: höger kolumn när ett ämne är öppet.
//
// Panelen väljer aldrig ett fack: varje bricka sätter ett värde på HELA möbeln. Det är hela
// skillnaden mot byggarens nivå 2.
//
// Ett ämne kan bära två sektioner (Material + Front, Stil + Storlek). De står under varandra i
// SAMMA scroll – inte som steg. Materialet och fronten är ett och samma beslut sett från två
// sidor: vilken yta möbeln har. Att dela dem i två steg tvingade fram en ordning som inte
// finns, och gjorde det omöjligt att gå tillbaka och jämföra utan att klicka.
//
// Panelen är ett UTKAST: brickorna slår igenom i bilden direkt, men knappen nederst är det som
// bekräftar dem. ✕ i rubriken ångrar allt man gjort sedan panelen öppnades.
//
// Innehållet scrollar; rubriken och knappen står still, och bildytan till vänster rör sig inte
// alls – den är det man tittar på medan man bläddrar bland alternativen.

import Image from "next/image";
import { Check, Plus, X } from "lucide-react";
import {
  COLMAX, ROWMAX, applyStyle, cellsToCm, r, realW,
  type State,
} from "@/lib/config";
import { Heading, Text } from "@/components/Type";
import TillvalCompact from "@/components/TillvalCompact";
import { offerPrice, ordinaryPrice, productById, type CareProduct } from "@/lib/tillval";
import {
  SECTION_TITLE, TOPIC_OFFERS, ctaFor, formatDelta, offerTitleFor, sectionDeltas, sectionOptions,
  sectionsFor, topicById,
  type SectionId, type TopicId,
} from "./model";
import OptionTile from "./OptionTile";
import StepSlider from "./StepSlider";

export default function TopicPanel({
  topic,
  S,
  setS,
  added,
  onToggleTillval,
  onConfirm,
  onCancel,
  onDetail,
}: {
  topic: TopicId;
  S: State;
  setS: (update: (s: State) => State) => void;
  added: Set<string>;
  onToggleTillval: (id: string) => void;
  /** Knappen nederst: behåll valen och stäng. */
  onConfirm: () => void;
  /** ✕ i rubriken: ångra allt sedan panelen öppnades. */
  onCancel: () => void;
  /** "Läs mer" – öppnar alternativet som egen sida. */
  onDetail: (section: SectionId, optionId: string) => void;
}) {
  const t = topicById(topic);
  const sections = sectionsFor(S, t);
  const offers = (TOPIC_OFFERS[topic] ?? [])
    .map(productById)
    .filter((p): p is CareProduct => !!p);

  return (
    <div className="flex h-full min-h-0 flex-col bg-card">
      {/* Rubriken – första sektionens namn – och ✕ står still, så vägen ut aldrig scrollar bort. */}
      <div className="flex shrink-0 items-start gap-4">
        <Heading level="h2" className="flex-1 text-[32px] leading-8">{SECTION_TITLE[sections[0]]}</Heading>
        <button
          type="button"
          aria-label="Avbryt"
          title="Avbryt – ångra ändringarna"
          onClick={onCancel}
          className="-mr-1 mt-1 flex h-8 w-8 shrink-0 items-center justify-center text-foreground transition-opacity duration-fast hover:opacity-60"
        >
          <X size={24} />
        </button>
      </div>

      {/* Allt innehåll i en och samma scroll. */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {sections.map((section, i) => (
          <section key={section} className={i === 0 ? "" : "mt-6 border-t border-border pt-6"}>
            {/* Första sektionens rubrik står i huvudet ovanför; de följande bär sin egen. */}
            {i > 0 && (
              <Heading level="h2" className="text-[32px] leading-8">{SECTION_TITLE[section]}</Heading>
            )}
            <SectionBody
              section={section}
              S={S}
              setS={setS}
              added={added}
              onToggleTillval={onToggleTillval}
              onDetail={onDetail}
            />
          </section>
        ))}

        {offers.length > 0 && (
          <div className="mt-6 border-t border-border pt-6">
            <Text as="h3" className="mb-4 font-medium text-foreground">{offerTitleFor(S, t)}</Text>
            <div className="flex flex-col gap-px">
              {offers.map((p) => (
                <Offer key={p.id} product={p} added={added.has(p.id)} onToggle={() => onToggleTillval(p.id)} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Knappen står still i botten – den är vägen ut som BEHÅLLER valen. */}
      <div className="shrink-0 pt-6">
        <button
          type="button"
          onClick={onConfirm}
          className="w-full rounded-button bg-primary px-4 py-2.5 font-body text-base font-semibold leading-5 text-primary-foreground transition-opacity duration-fast hover:opacity-90 active:opacity-80"
        >
          {ctaFor(S, t)}
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function SectionBody({
  section,
  S,
  setS,
  added,
  onToggleTillval,
  onDetail,
}: {
  section: SectionId;
  S: State;
  setS: (update: (s: State) => State) => void;
  added: Set<string>;
  onToggleTillval: (id: string) => void;
  onDetail: (section: SectionId, optionId: string) => void;
}) {
  const patch = (p: Partial<State>) => setS((s) => ({ ...s, ...p }));

  if (section === "storlek") {
    return (
      <div className="mt-4 flex flex-col gap-2">
        <StepSlider
          label="Bredd"
          value={S.cols}
          min={1}
          max={COLMAX}
          format={(v) => `${realW(v)} cm`}
          onSet={(cols) => patch({ cols, rows: applyStyle(S.style ?? "", cols, S.rows) })}
        />
        <StepSlider
          label="Höjd"
          value={S.rows.length}
          min={1}
          max={ROWMAX}
          format={(v) => `${cellsToCm(v)} cm`}
          onSet={(n) =>
            patch({
              // Hela 40 cm-moduler: produktsidan har ingen 20 cm-halvsteg som byggaren.
              rows: applyStyle(S.style ?? "", S.cols, Array.from({ length: n }, () => r({ h: 40 }))),
            })
          }
        />
      </div>
    );
  }

  if (section === "tillbehor") {
    // Tillvalslistan bär sin egen luft; i en 438 px panel är dess py-12 för mycket.
    return (
      <div className="mt-2 overflow-hidden [&>section]:!py-0">
        <TillvalCompact added={added} onToggle={onToggleTillval} />
      </div>
    );
  }

  const options = sectionOptions(S, section);
  const current = options.find((o) => o.selected);
  // Prislappen hör till valet, inte till totalen: den står längst ut på namnraden så man ser
  // vad just det här alternativet kostar jämfört med det billigaste i sektionen.
  const delta = current ? formatDelta(sectionDeltas(S, section).get(current.id) ?? 0) : "";

  return (
    <>
      {/* Brickorna: fyra i bredd, hårstreckssömmar (den vita panelen lyser igenom). */}
      <div className="mt-4 grid grid-cols-4 gap-px">
        {options.map((o) => (
          <OptionTile key={o.id} option={o} onClick={() => setS(o.apply)} />
        ))}
      </div>
      {/* Namnet står under rutnätet, inte på brickan – ett namn i taget räcker.
          `key` på värdet: texten glider in när valet byts, så panelen kvitterar. */}
      {current && (
        <div key={current.id} className="copy-enter mt-4">
          <div className="flex items-baseline justify-between gap-4">
            <Text as="p" className="min-w-0 flex-1 font-medium text-foreground">{current.name}</Text>
            {delta && <Text as="p" className="shrink-0 font-medium text-foreground">{delta}</Text>}
          </div>
          {current.desc && <Text as="p" className="text-muted-foreground">{current.desc}</Text>}
          <button
            type="button"
            onClick={() => onDetail(section, current.id)}
            className="mt-1 font-body text-base leading-6 tracking-tight text-foreground underline transition-opacity duration-fast hover:opacity-60"
          >
            Läs mer
          </button>
        </div>
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */

// Kontextuell upsell: tillbehöret som hör till just det man håller på med. Erbjudandepriset
// är kampanjens halva pris – samma räknare som Tillval-listorna använder.
function Offer({
  product,
  added,
  onToggle,
}: {
  product: CareProduct;
  added: boolean;
  onToggle: () => void;
}) {
  return (
    <article className="flex items-center gap-4 border border-border p-4">
      {/* Ytan bakom bilden bara när bilden saknas – annars ramar den in ett foto som redan
          står fritt. */}
      <span className={`relative block h-16 w-16 shrink-0 ${product.image ? "" : "bg-surface"}`}>
        {product.image && (
          <Image src={product.image} alt="" fill sizes="64px" className="fade-in object-contain" draggable={false} />
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-2">
        <span className="min-w-0">
          <Text as="span" className="block truncate font-medium text-foreground">{product.name}</Text>
          <Text as="span" variant="small" className="block truncate text-muted-foreground">{product.details}</Text>
        </span>
        <span className="flex items-end gap-4">
          <span className="flex flex-col">
            <Text as="span" variant="small" className="text-sale">Pris med erbjudande</Text>
            <span className="font-heading text-2xl font-medium leading-6 tracking-tight text-sale">{offerPrice(product)}</span>
          </span>
          <span className="flex flex-col">
            <Text as="span" variant="small" className="text-muted-foreground">Ordinarie pris</Text>
            <span className="font-heading text-2xl font-medium leading-6 tracking-tight text-foreground">{ordinaryPrice(product)}</span>
          </span>
        </span>
      </span>
      <button
        type="button"
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
