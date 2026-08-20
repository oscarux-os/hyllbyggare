"use client";

// Alternativbricka: en kvadrat i panelens rutnät, utan text. Namnet står under rutnätet – ett
// alternativ i taget behöver ingen etikett när brickorna är bilder, och skissen (Figma
// "v4 Volvo stil konfig", 108×108) visar just det. `aria-label` bär namnet i stället.
//
// Vald bricka ritas som en 1 px ram i foreground plus en svart bock i nedre högra hörnet.
// Ramen ligger som `outline` med negativ offset: en border hade ändrat brickans innermått och
// fått bilden att hoppa en pixel när man väljer.

import { Check } from "lucide-react";
import OptionMedia from "./OptionMedia";
import type { Option } from "./model";

export default function OptionTile({
  option,
  onClick,
}: {
  option: Option;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={option.selected}
      aria-label={option.name}
      title={option.name}
      className={`relative aspect-square w-full overflow-hidden bg-surface transition-colors duration-fast hover:bg-secondary ${
        option.selected ? "outline outline-1 -outline-offset-1 outline-foreground" : ""
      }`}
    >
      <OptionMedia media={option.media} sizes="120px" shelfScale={2.4} pad="p-3" />
      {option.selected && (
        <span className="check-in absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check size={12} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}
