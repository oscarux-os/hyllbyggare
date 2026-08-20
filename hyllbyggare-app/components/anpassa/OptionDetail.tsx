"use client";

// Nivå 3: ett alternativ som egen sida. "Läs mer" i panelen leder hit – bildytan visar
// produktfotot i stället för möbeln, och panelen blir en specifikation.
//
// Innehållet (leveranstid, säljtext, miljömärkning) är platshållare och bor i `optionSpec`
// i model.ts, inte utspritt här.

import { TreePine, X } from "lucide-react";
import { Heading, Text } from "@/components/Type";
import type { State } from "@/lib/config";
import OptionMedia from "./OptionMedia";
import { SECTION_TITLE, optionSpec, type Option, type SectionId } from "./model";

export default function OptionDetail({
  S,
  section,
  option,
  onSelect,
  onClose,
}: {
  S: State;
  section: SectionId;
  option: Option;
  /** Väljer alternativet och går tillbaka till ämnet. */
  onSelect: () => void;
  onClose: () => void;
}) {
  const spec = optionSpec(S, section, option);

  return (
    <div className="flex h-full min-h-0 flex-col bg-card">
      <div className="flex shrink-0 items-start gap-4">
        <div className="flex-1">
          <Heading level="h2" className="text-[32px] leading-8">{option.name}</Heading>
          <Text variant="small" className="mt-1 text-muted-foreground">{spec.lead}</Text>
        </div>
        <button
          type="button"
          aria-label="Stäng"
          onClick={onClose}
          className="-mr-1 flex h-8 w-8 shrink-0 items-center justify-center text-foreground transition-opacity duration-fast hover:opacity-60"
        >
          <X size={24} />
        </button>
      </div>

      {/* Bara texten och specen scrollar – bilden till vänster står still. */}
      <div className="min-h-0 flex-1 overflow-y-auto">
      <Text className="mt-4 text-foreground">{spec.body}</Text>

      <dl className="mt-6">
        {spec.rows.map(([label, value]) => (
          <div key={label} className="border-t border-border py-3">
            <dt><Text as="span" className="block font-medium text-foreground">{label}</Text></dt>
            <dd><Text as="span" className="block text-muted-foreground">{value}</Text></dd>
          </div>
        ))}
        {spec.eco && (
          <div className="flex items-start gap-4 border-y border-border py-3">
            <div className="flex-1">
              <dt><Text as="span" className="block font-medium text-foreground">Miljömärkningar</Text></dt>
              <dd><Text as="span" className="block text-muted-foreground">{spec.eco}</Text></dd>
            </div>
            <TreePine size={24} className="shrink-0 text-foreground" aria-hidden />
          </div>
        )}
      </dl>
      </div>

      <div className="shrink-0 pt-6">
        <button
          type="button"
          onClick={onSelect}
          className="w-full rounded-button bg-primary px-4 py-2.5 font-body text-base font-semibold leading-5 text-primary-foreground transition-opacity duration-fast hover:opacity-90 active:opacity-80"
        >
          Välj {SECTION_TITLE[section].toLowerCase()}
        </button>
      </div>
    </div>
  );
}

/** Bildytan i detaljläget: alternativets foto, inte möbeln. */
export function DetailMedia({ option }: { option: Option }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-surface">
      <div className="absolute inset-[10%]">
        <OptionMedia media={option.media} sizes="(min-width: 1024px) 60vw, 100vw" shelfScale={6} pad="p-0" />
      </div>
    </div>
  );
}
