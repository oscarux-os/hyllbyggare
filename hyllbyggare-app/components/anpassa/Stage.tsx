"use client";

// Bildytan. Samma renderare som byggaren använder – men utan bandmarkering, utan facklager
// och utan klick i bilden: här är möbeln ett objekt man tittar på, inte ett rutnät man
// redigerar. `pointer-events-none` är det som håller "Redigera"-pillret släckt.
//
// Containern är kamerans RAM: `Shelf` mäter sin förälders content-box. Den är overflow-dold,
// så en inzoomning beskär i stället för att spilla ut på sidan.

import { useRef, useState } from "react";
import { Shelf, Dims, NO_STAGE, STAGE_T, type Stage as StageRect, type ShelfFocus } from "@/components/Configurator";
import { realW, furnitureHeightCm, type State } from "@/lib/config";

export default function Stage({
  S,
  handleId,
  frame,
  focus,
  lift,
  showDims,
  padBottom = 0,
  shiftUp = 0,
}: {
  S: State;
  handleId: string;
  frame: string;
  focus: ShelfFocus;
  lift: number;
  showDims: boolean;
  /**
   * Extra luft i nederkanten (px) så möbeln går fri från arket när det är uppe. Ramen ÄR den
   * här containerns content-box, så en ändring här får hyllan att passa in på nytt – samma
   * mekanik som byggaren använder när dess ark ändrar höjd, bara uttryckt som padding.
   */
  padBottom?: number;
  /**
   * Px som hela bilden flyttas UPP när arket lägger sig över dess nederkant. Till skillnad
   * från `padBottom` ändrar den ingenting i inpassningen: möbeln behåller exakt sin storlek
   * och glider bara upp i den yta som fortfarande syns.
   */
  shiftUp?: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<StageRect>(NO_STAGE);

  // Förskjutningen ligger på YTTERSTA elementet, inte på ramen inuti. Två skäl: måttlinjerna
  // bor här och ska följa möbeln, och `Shelf` mäter sin geometri som skillnaden mellan den
  // här noden och ramen – flyttar båda lika mycket är den skillnaden oförändrad, så ingen
  // omätning och ingen omskalning triggas. Transformen påverkar heller inte layoutmåtten,
  // så ResizeObserver ser ingenting och kan inte hamna i en återkopplingsloop.
  //
  // Taket är möbelns egen överkant: bilden får glida upp tills möbeln nuddar ramens tak,
  // aldrig förbi – då hade den vandrat upp i rubriken i stället.
  const shift = Math.max(0, Math.min(shiftUp, Math.max(0, stage.y - 8)));

  return (
    <div
      ref={wrapRef}
      style={{ transform: shift ? `translateY(-${shift}px)` : undefined, transition: `transform ${STAGE_T}` }}
      className="relative h-full w-full"
    >
      <div
        style={{ paddingBottom: padBottom ? `calc(4rem + ${padBottom}px)` : undefined, transition: `padding-bottom ${STAGE_T}` }}
        className="pointer-events-none relative z-10 flex h-full items-end justify-center overflow-hidden px-6 pb-16 pt-10 md:px-12 md:pt-12"
      >
        <Shelf
          S={S}
          handleId={handleId}
          frame={frame}
          active={null}
          hovered={null}
          onHover={() => {}}
          onOpen={() => {}}
          wrapRef={wrapRef}
          onMeasure={setStage}
          lift={lift}
          focus={focus}
        />
      </div>
      {/* Måttlinjerna hör till helhetsvyn – ett inzoomat utsnitt har inget mått att skriva ut. */}
      {showDims && focus.kind === "none" && stage.w > 0 && (
        <Dims
          rect={stage}
          glide={stage.glide}
          width={`${realW(S.cols)} cm`}
          height={`${furnitureHeightCm(S)} cm`}
        />
      )}
    </div>
  );
}
