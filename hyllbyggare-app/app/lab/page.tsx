"use client";

// SPIKE / experiment – isolerad route. Visar FORM / FUNCTION-uppdelningen:
//   Form     = globala val (antal, höjd-default, djup, material)
//   Function = per kolumn (innehåll, frontstil, höjd-override)
// Höjd finns på båda nivåerna via default+override: kolumn.height undefined = ärv
// global; sätter man den i Function blir den "anpassad" tills man återställer.
// Allt byggt med konfiguratorns komponenter.

import { useState } from "react";
import { PanelSection, SelectionCopy, ButtonGroup, TileButton, Range, MiniShelf, FrontPicker } from "@/components/Configurator";
import { r, cellObj, type CellType, type Row, type Front } from "@/lib/config";

const UNIT = 56;
const FRAME = "#D8BC8E";
const cmH = (cells: number) => Math.round((cells * 400 - (cells - 1) * 18) / 10);
const woodFor = (m: string) => (m === "ek" ? "#C9A36A" : "#B3A998");

const VARIANTS: { id: string; name: string; desc: string; fill: (n: number) => CellType[] }[] = [
  { id: "open", name: "Öppet", desc: "Alla fack öppna.", fill: (n) => Array(n).fill("o") },
  { id: "open-mid", name: "Öppet mitten", desc: "Öppet i mitten, stängt upptill och nedtill.", fill: (n) => Array.from({ length: n }, (_, i) => (i === 0 || i === n - 1 ? "l" : "o")) },
  { id: "open-low", name: "Öppet nedtill", desc: "Stängt upptill, öppet nedtill.", fill: (n) => Array.from({ length: n }, (_, i) => (i < Math.ceil(n / 2) ? "l" : "o")) },
  { id: "closed", name: "Helt stängt", desc: "Luckor hela vägen.", fill: (n) => Array(n).fill("l") },
];
const fillOf = (id: string, n: number) => VARIANTS.find((v) => v.id === id)!.fill(n);

interface Col {
  variant: string;
  front: Front;
  height?: number; // override; undefined = ärv global
}
const INIT: Col[] = [
  { variant: "closed", front: "slats" },
  { variant: "open-mid", front: "glass", height: 4 },
  { variant: "open", front: "plain" },
  { variant: "open-low", front: "plain", height: 2 },
];

function CellBox({ type, front, wood }: { type: CellType; front: Front; wood: string }) {
  if (type === "o") return <div className="w-full" style={{ height: UNIT, background: "#fff", boxShadow: "inset 0 0 0 1px rgba(0,0,0,.07)" }} />;
  const slats = front === "slats" ? { backgroundImage: "repeating-linear-gradient(90deg,rgba(0,0,0,.10) 0 2px,transparent 2px 7px)" } : {};
  const op = front === "glass" ? 0.4 : 1;
  return (
    <div className="relative w-full" style={{ height: UNIT, background: wood, opacity: op, boxShadow: "inset 0 0 0 1px rgba(0,0,0,.13)", ...slats }}>
      <span className="absolute right-[12%] top-[30%] bottom-[30%] w-[3px] rounded" style={{ background: "rgba(0,0,0,.45)" }} />
    </div>
  );
}
const variantRows = (id: string, n: number): Row[] => fillOf(id, n).map((t) => r({ cells: [cellObj(t, 1, "plain", 0)] }));

export default function Lab() {
  const [tab, setTab] = useState("form");
  // FORM (globalt)
  const [gHeight, setGHeight] = useState(3);
  const [gDepth, setGDepth] = useState("36");
  const [material, setMaterial] = useState("ek");
  const [columns, setColumns] = useState<Col[]>(INIT);
  const [sel, setSel] = useState(0);

  const wood = woodFor(material);
  const hOf = (c: Col) => c.height ?? gHeight;

  const setCount = (n: number) =>
    setColumns((cs) => {
      const next = [...cs];
      while (next.length < n) next.push({ variant: "open", front: "plain" });
      while (next.length > n) next.pop();
      return next;
    });
  const setCol = (patch: Partial<Col>) => setColumns((cs) => cs.map((c, i) => (i === sel ? { ...c, ...patch } : c)));
  const pickCol = (i: number) => { setSel(i); setTab("function"); };

  const col = columns[Math.min(sel, columns.length - 1)];
  const variant = VARIANTS.find((v) => v.id === col.variant)!;
  const colCells = hOf(col);
  const hasClosed = fillOf(col.variant, colCells).some((t) => t !== "o");
  const overridden = col.height !== undefined;

  return (
    <main className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-12">
      {/* preview */}
      <section className="relative flex min-h-[50svh] items-center justify-center bg-muted p-10 lg:col-span-8 lg:min-h-screen">
        <p className="absolute left-6 top-6 text-xs uppercase tracking-tight text-muted-foreground">Spike – ej kopplad till flödet</p>
        <div className="flex items-end">
          {columns.map((c, ci) => (
            <div
              key={ci}
              onClick={() => pickCol(ci)}
              className={`flex cursor-pointer flex-col gap-1.5 p-1.5 ${tab === "function" && sel === ci ? "outline outline-2 outline-offset-2 outline-ring" : ""}`}
              style={{ background: FRAME, width: UNIT + 12 }}
            >
              {fillOf(c.variant, hOf(c)).map((t, ri) => <CellBox key={ri} type={t} front={c.front} wood={wood} />)}
            </div>
          ))}
        </div>
      </section>

      {/* panel */}
      <aside className="bg-card p-6 lg:col-span-4 lg:h-screen lg:overflow-y-auto">
        <ButtonGroup className="mb-5" options={[["form", "Form"], ["function", "Funktion"]]} value={tab} onSet={setTab} />

        {tab === "form" ? (
          <>
            <PanelSection title="Antal kolumner">
              <Range label="Kolumner" value={columns.length} max={6} pill={`${columns.length} st`} onSet={setCount} />
            </PanelSection>
            <PanelSection title="Höjd">
              <Range label="Höjd" value={gHeight} max={5} pill={`${cmH(gHeight)} cm`} onSet={setGHeight} />
              <SelectionCopy title="Global höjd" desc="Gäller alla kolumner som inte fått en egen höjd i Funktion." />
            </PanelSection>
            <PanelSection title="Djup">
              <ButtonGroup className="mb-5" options={[["27", "27 cm"], ["36", "36 cm"], ["45", "45 cm"], ["60", "60 cm"]]} value={gDepth} onSet={setGDepth} />
            </PanelSection>
            <PanelSection title="Material">
              <ButtonGroup className="mb-5" options={[["ek", "Ek"], ["laminat", "Laminat"]]} value={material} onSet={setMaterial} />
            </PanelSection>
          </>
        ) : (
          <>
            <PanelSection title="Kolumn">
              <div className="flex flex-wrap items-center gap-1.5">
                {columns.map((_, ci) => (
                  <button
                    key={ci}
                    onClick={() => setSel(ci)}
                    className={`h-9 min-w-9 rounded-button border px-3 text-sm font-semibold transition-colors ${sel === ci ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-foreground/40"}`}
                  >
                    {ci + 1}
                  </button>
                ))}
              </div>
            </PanelSection>

            <PanelSection title="Innehåll">
              <div className="flex flex-wrap gap-1">
                {VARIANTS.map((v) => (
                  <TileButton key={v.id} label={v.name} selected={col.variant === v.id} onClick={() => setCol({ variant: v.id })}>
                    <span className="flex h-full w-full items-center justify-center text-foreground/70">
                      <MiniShelf rows={variantRows(v.id, colCells)} cols={1} />
                    </span>
                  </TileButton>
                ))}
              </div>
              <SelectionCopy title={variant.name} desc={variant.desc} />
            </PanelSection>

            {hasClosed && (
              <PanelSection title="Frontstil">
                <FrontPicker value={col.front} onSet={(front) => setCol({ front })} />
              </PanelSection>
            )}

            <PanelSection title="Höjd">
              <Range label="Höjd" value={colCells} max={5} pill={`${cmH(colCells)} cm`} onSet={(v) => setCol({ height: v })} />
              {overridden ? (
                <button onClick={() => setCol({ height: undefined })} className="mt-3 text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Anpassad höjd · återställ till global ({cmH(gHeight)} cm)
                </button>
              ) : (
                <SelectionCopy title="Ärver global höjd" desc="Ändra här för att ge just den här kolumnen en egen höjd." />
              )}
            </PanelSection>
          </>
        )}
      </aside>
    </main>
  );
}
