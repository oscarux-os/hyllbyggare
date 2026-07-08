"use client";

import { useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { GALLERY } from "./data";

// Inspirationskarusell: hur andra har byggt sin Anamosa. Samma dragbara rad +
// pil-navigering som ConfigCarousel, för att hålla sidan konsekvent (PromotionListCard i Figma).
export default function InspirationGallery() {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ down: false, x: 0, l: 0, moved: false });

  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 840), behavior: "smooth" });
  };

  return (
    <section aria-label="Inspiration">
      {/* Rad med bilder */}
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
        {GALLERY.map((tile) => (
          <div
            key={tile.src}
            className="relative aspect-[579/483] w-[85vw] shrink-0 overflow-hidden bg-muted [scroll-snap-align:start] sm:w-[460px] lg:w-[580px]"
          >
            <Image
              src={tile.src}
              alt={tile.alt}
              fill
              sizes="(min-width: 1024px) 580px, (min-width: 640px) 460px, 85vw"
              className="pointer-events-none object-cover"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* Pil-navigering */}
      <div className="flex justify-end gap-2 px-2 pt-4 md:px-6">
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
    </section>
  );
}
