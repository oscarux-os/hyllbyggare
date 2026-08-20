"use client";

// Bildytan. Samma renderare som byggaren använder – men utan bandmarkering, utan facklager
// och utan klick i bilden: här är möbeln ett objekt man tittar på, inte ett rutnät man
// redigerar. `pointer-events-none` är det som håller "Redigera"-pillret släckt.
//
// Containern är kamerans RAM: `Shelf` mäter sin förälders content-box. Den är overflow-dold,
// så en inzoomning beskär i stället för att spilla ut på sidan. Ramen ändrar bredd när ett
// ämne öppnas (rutnätets halva → två tredjedelar) och möbeln passar in på nytt – det är
// meningen: den ska fylla den yta den får.

import { useRef, useState } from "react";
import { Shelf, Dims, NO_STAGE, type Stage as StageRect, type ShelfFocus } from "@/components/Configurator";
import { realW, furnitureHeightCm, type State } from "@/lib/config";

export default function Stage({
  S,
  handleId,
  frame,
  focus,
  lift,
  showDims,
  pad = "p-6 md:p-10",
}: {
  S: State;
  handleId: string;
  frame: string;
  focus: ShelfFocus;
  lift: number;
  showDims: boolean;
  /**
   * Luften mellan ramen och möbeln. Den är SYMMETRISK med flit: `Shelf` centrerar möbeln i
   * ramen med den döda ytan som budget (se `rise`), och en tyngre nederkant fick den att se
   * strandad ut i en hög cell. Stilväljarens celler har redan egen padding och skickar "p-0".
   */
  pad?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<StageRect>(NO_STAGE);

  return (
    <div ref={wrapRef} className="relative h-full w-full">
      <div className={`pointer-events-none relative z-10 flex h-full items-end justify-center overflow-hidden ${pad}`}>
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
