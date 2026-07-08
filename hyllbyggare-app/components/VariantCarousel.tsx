"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ImageIcon } from "lucide-react";
import { Heading, Text, Eyebrow } from "./Type";

// Inspirationskarusell: olika stilar inom varje möbeltyp. Filtreras per kategori,
// dragbar i sidled. Varje kort länkar in i byggaren (senare med förvald config).

const CATS = ["Alla", "Bokhylla", "Skänk", "TV-bänk", "Vitrinskåp", "Byrå"];
type Ex = { cat: string; style: string; blurb: string };
const EXAMPLES: Ex[] = [
  { cat: "Bokhylla", style: "Mosaik", blurb: "Oregelbunden grid som blir ett blickfång." },
  { cat: "Bokhylla", style: "Jämn", blurb: "Rent och stramt för böcker i mängd." },
  { cat: "Bokhylla", style: "Accent", blurb: "Mest öppet med en glasrad som sticker ut." },
  { cat: "Skänk", style: "Sockel", blurb: "Låg med dold förvaring i botten." },
  { cat: "Skänk", style: "Rytm", blurb: "Öppna och stängda sektioner om vartannat." },
  { cat: "TV-bänk", style: "Rytm", blurb: "Öppet för tekniken, stängt runtomkring." },
  { cat: "TV-bänk", style: "Jämn", blurb: "Låg och stram, håller ihop rummet." },
  { cat: "Vitrinskåp", style: "Accent", blurb: "Glasvitriner som lyfter det fina." },
  { cat: "Byrå", style: "Jämn", blurb: "Rader av lådor – praktiskt och stramt." },
  { cat: "Byrå", style: "Sockel", blurb: "Lådor med en öppen hylla på toppen." },
];

export default function VariantCarousel() {
  const [filter, setFilter] = useState("Alla");
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ down: false, x: 0, l: 0, moved: false });
  const list = EXAMPLES.filter((e) => filter === "Alla" || e.cat === filter);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {CATS.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`inline-flex h-9 items-center px-4 text-sm rounded-button border transition-colors duration-fast ${
              filter === c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-accent"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div
        ref={ref}
        className="no-scrollbar flex cursor-grab gap-3 overflow-x-auto pb-2 [scroll-snap-type:x_mandatory] active:cursor-grabbing"
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
      >
        {list.map((e) => (
          <Link
            key={e.cat + e.style}
            href="/"
            onClick={(ev) => drag.current.moved && ev.preventDefault()}
            className="group block w-[260px] shrink-0 border border-border bg-card [scroll-snap-align:start] transition-colors duration-fast hover:border-primary"
          >
            <div className="flex aspect-[3/4] items-center justify-center bg-muted text-muted-foreground">
              <div className="flex flex-col items-center gap-1">
                <ImageIcon size={20} />
                <Text variant="caption">{e.cat} · {e.style}</Text>
              </div>
            </div>
            <div className="p-4">
              <Eyebrow>{e.style}</Eyebrow>
              <Heading level="h4" className="mb-1 mt-1">{e.cat}</Heading>
              <Text variant="small" className="mb-3 text-muted-foreground">{e.blurb}</Text>
              <span className="inline-flex items-center gap-1 font-body text-sm font-semibold">
                Utforska <ArrowRight size={16} className="transition-transform duration-fast group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
