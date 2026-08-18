"use client";

// Alternativbricka i en ämnespanel. Vågrät komposition ur skissen: bild till vänster, namn och
// en rad text till höger, och en svart bock som överlappar bilden när alternativet är valt.
//
// Två lägen, samma bricka: `grid` är desktopens tvåkolumnsrutnät, `row` är mobilens
// horisontella remsa (fast bredd så nästa bricka glimtar fram i kanten).

import Image from "next/image";
import { Check } from "lucide-react";
import { Text } from "@/components/Type";

export default function OptionTile({
  name,
  desc,
  image,
  swatch,
  visual,
  selected,
  layout = "grid",
  onClick,
}: {
  name: string;
  desc?: string;
  /** Produktbild. Saknas den ritas `swatch` som färgruta i stället. */
  image?: string;
  swatch?: string;
  /** Egen ritning i stället för foto – t.ex. stilarnas MiniShelf-skiss. */
  visual?: React.ReactNode;
  selected: boolean;
  layout?: "grid" | "row";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`relative flex rounded-button bg-card transition-colors duration-fast active:scale-[0.98] hover:bg-secondary ${
        layout === "row"
          ? "w-[127px] shrink-0 flex-col items-center justify-center gap-4 p-2 text-center"
          : "items-center gap-4 p-6 text-left"
      }`}
    >
      <span className="relative block h-14 w-14 shrink-0">
        {visual ? (
          <span className="flex h-full w-full items-center justify-center text-foreground/70">{visual}</span>
        ) : image ? (
          <Image src={image} alt="" fill sizes="56px" className="fade-in object-contain" />
        ) : (
          <span className="block h-full w-full" style={{ background: swatch }} />
        )}
        {selected && layout === "grid" && <Tick className="-right-2 -top-2" />}
      </span>
      {selected && layout === "row" && <Tick className="right-2 top-2" />}
      <span className={layout === "row" ? "w-full min-w-0" : "min-w-0 flex-1"}>
        <Text as="span" variant="small" className="block truncate text-foreground">{name}</Text>
        {desc && <Text as="span" variant="caption" className="mt-0.5 line-clamp-2 block text-muted-foreground">{desc}</Text>}
      </span>
    </button>
  );
}

// Svart bock, 24 px, som fjädrar in när alternativet väljs (.check-in = ease-spring). På
// desktop överlappar den bildens hörn; på mobil sitter den i brickans hörn, för där är bilden
// centrerad och ett märke på den hade hamnat mitt i brickan.
function Tick({ className }: { className: string }) {
  return (
    <span className={`check-in absolute flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground ${className}`}>
      <Check size={12} strokeWidth={3} />
    </span>
  );
}
