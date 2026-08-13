"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { buildConfigState, gridCells, fillColumn, colHeight, U, type State, type Amount } from "@/lib/config";
import { Cube, Legs } from "../Configurator";
import type { Config } from "./data";

// Ramfärg – samma regel som i konfiguratorn (frameColor).
const frameColor = (s: State) => (s.material === "ek" ? "#D8BC8E" : s.color === "#ECE8DF" ? "#E2DCCF" : s.color);

// Renderad förhandsvisning av en färdig konfiguration, i stället för en platshållarbild.
// Bygger samma state som "Välj" öppnar (buildConfigState) och ritar möbeln med
// konfiguratorns egna byggstenar (Cube/Legs) – statiskt, utan hover/redigering.
export default function ConfigPreview({ config }: { config: Config }) {
  // Handkodad layout vinner (matchar fotot exakt); annars byggs ett state från
  // kategori + mått som förut.
  const S = config.layout ?? buildConfigState(config.category, {
    style: config.style,
    material: config.material,
    color: config.color,
    front: config.front,
    cols: config.cols,
    heightUnits: config.heightUnits,
  });
  if (!S) return null;
  return <PreviewShelf S={S} />;
}

function PreviewShelf({ S }: { S: State }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Skala ner så möbeln får plats i kortet (samma idé som Shelf, men utan mätning
  // för AR-overlay). transformOrigin center → den centreras i förhandsytan.
  useLayoutEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;
    const measure = () => {
      const pw = parent.clientWidth;
      const ph = parent.clientHeight;
      setScale(Math.min(1, pw / el.offsetWidth, ph / el.offsetHeight));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(parent);
    return () => ro.disconnect();
  }, [S]);

  const frame = frameColor(S);
  const grid = gridCells(S);
  const perCol = S.axis === "kolumn" && S.category === "tvbank";

  return (
    <div
      ref={ref}
      className="flex flex-col"
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "center center",
      }}
    >
      {/* Ramfärgen målas bara på stommen, så benen nedan står fritt i stället för mot en
          fullbred ramskiva (samma uppdelning som i Shelf). */}
      <div
        className="flex flex-col gap-1.5 p-1.5"
        style={{
          background: perCol ? "transparent" : frame,
          width: perCol ? undefined : S.cols * U + 12,
        }}
      >
      {perCol ? (
        // TV-bänk: kolumner med egen höjd, golv-justerade. Ingen gap – stommarna möts så
        // sömmen blir sammanhängande ram i stället för en genomsiktlig glipa (se Shelf).
        <div className="flex items-end">
          {Array.from({ length: S.cols }, (_, ci) => {
            const def = S.colDefs?.[ci] ?? { doors: "none" as Amount, drawers: "none" as Amount };
            const types = fillColumn(def, colHeight(S, ci));
            return (
              <div key={ci} className="flex flex-col gap-1.5 p-1.5" style={{ background: frame }}>
                {types.map((t, k) => (
                  <Cube key={k} type={t} front={S.front} shelves={0} span={1} color={S.color} handle={S.handle} frame={frame} sizeStyle={{ height: U, width: U }} />
                ))}
              </div>
            );
          })}
        </div>
      ) : S.axis === "kolumn" ? (
        // Kolumnläge (byrå/skänk): vertikala sektioner sida vid sida.
        <div className="flex gap-1.5">
          {Array.from({ length: S.cols }, (_, ci) => (
            <div key={ci} className="flex flex-1 flex-col gap-1.5">
              {S.rows.map((row, ri) => {
                const c = grid[ri][ci];
                return <Cube key={ri} type={c.type} front={c.front} shelves={c.shelves} span={1} color={S.color} handle={S.handle} frame={frame} sizeStyle={{ height: (row.h / 40) * U, width: "100%" }} />;
              })}
            </div>
          ))}
        </div>
      ) : (
        // Radläge (hylla/vitrin): horisontella band.
        S.rows.map((row, ri) => (
          <div key={ri} className="flex gap-1.5" style={{ height: (row.h / 40) * U }}>
            {grid[ri].map((c, ci) => (
              <Cube key={ci} type={c.type} front={c.front} shelves={c.shelves} span={c.span} color={S.color} handle={S.handle} frame={frame} />
            ))}
          </div>
        ))
      )}
      </div>
      {S.mount === "staende" && <Legs S={S} frame={frame} />}
    </div>
  );
}
