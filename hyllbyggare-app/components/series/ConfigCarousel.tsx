"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Heading, Text } from "../Type";
import ConfigCard from "./ConfigCard";
import { ButtonGroup } from "../Configurator";
import { CONFIGS, CONFIG_FILTERS, type ConfigType } from "./data";

// Karusell med färdiga konfigurationer. Flikar filtrerar, raden är dragbar och
// pilarna nederst till höger stegar i sidled.
export default function ConfigCarousel() {
  const [filter, setFilter] = useState<ConfigType>("Bokhylla");
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ down: false, x: 0, l: 0, moved: false });
  const list = CONFIGS.filter((c) => c.type === filter);

  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 840), behavior: "smooth" });
  };

  return (
    <section aria-label="Färdiga konfigurationer">
      {/* Sektionstitel – skapar hierarki ovanför valen (PageHead i Figma) */}
      <div className="px-2 pt-12 md:px-6 md:pt-16">
        <Heading level="display-sm" as="h2">Förvaring som formar sig efter dig</Heading>
      </div>

      {/* Flikar + Filtrera */}
      <div className="flex items-center justify-between gap-4 px-2 py-6 md:px-6">
        <ButtonGroup
          scroll
          className="min-w-0"
          options={CONFIG_FILTERS.map((f) => [f, f])}
          value={filter}
          onSet={(v) => setFilter(v as ConfigType)}
        />
        <button
          type="button"
          aria-label="Filtrera"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-foreground font-body font-semibold rounded-button transition-colors duration-fast hover:bg-accent sm:w-auto sm:px-4"
        >
          <SlidersHorizontal size={16} className="sm:hidden" />
          <span className="hidden sm:inline">Filtrera</span>
        </button>
      </div>

      {/* Rad med kort */}
      {list.length > 0 ? (
        <>
          <div
            ref={ref}
            className="no-scrollbar flex cursor-grab gap-px overflow-x-auto [scroll-snap-type:x_mandatory] active:cursor-grabbing"
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
            {list.map((c) => (
              <ConfigCard key={c.id} config={c} />
            ))}
          </div>

          {/* Pil-navigering */}
          <div className="hidden justify-end gap-2 px-2 pt-4 md:flex md:px-6">
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
        </>
      ) : (
        <div className="mx-2 flex flex-col items-start gap-3 bg-secondary px-6 py-12 md:mx-6">
          <Text className="text-muted-foreground">
            Inga färdiga konfigurationer för {filter.toLowerCase()} än – men du kan bygga en själv på några minuter.
          </Text>
          <Link
            href="/bygg"
            className="inline-flex h-11 items-center bg-primary px-6 font-body font-semibold text-primary-foreground rounded-button transition-opacity duration-fast hover:opacity-90 active:opacity-80"
          >
            Bygg din egen
          </Link>
        </div>
      )}
    </section>
  );
}
