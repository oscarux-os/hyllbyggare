"use client";

// Ämnespanelen. Samma komponent på båda skärmarna – på desktop byter den ut "Dina val" i
// höger kolumn, på mobil är den innehållet i arket underifrån.
//
// Panelen väljer aldrig ett fack: varje bricka sätter ett värde på HELA möbeln. Det är hela
// skillnaden mot byggarens nivå 2.

import { X } from "lucide-react";
import {
  COLORS, LEGS, HANDLES, STYLES, COLMAX, ROWMAX,
  applyStyle, cellsToCm, r, realW,
  type State, type Material,
} from "@/lib/config";
import { MiniShelf, LEG_IMAGES, EK_IMAGES, HANDLE_IMAGES } from "@/components/Configurator";
import TillvalCompact from "@/components/TillvalCompact";
import { topicById, type TopicId } from "./model";
import OptionTile from "./OptionTile";
import StepSlider from "./StepSlider";
import RoundButton from "./RoundButton";

export default function TopicPanel({
  topic,
  S,
  setS,
  added,
  onToggleTillval,
  onClose,
  overlay = false,
}: {
  topic: TopicId;
  S: State;
  setS: (update: (s: State) => State) => void;
  added: Set<string>;
  onToggleTillval: (id: string) => void;
  onClose: () => void;
  /** true = mobilens ark (rubriken pinnas i toppen så den syns när brickorna scrollar). */
  overlay?: boolean;
}) {
  const t = topicById(topic);
  const patch = (p: Partial<State>) => setS((s) => ({ ...s, ...p }));
  // Mobilens remsa scrollar i sidled; desktop lägger brickorna i två kolumner.
  const layout = overlay ? "row" : "grid";
  const wrap = overlay
    ? "no-scrollbar flex gap-px overflow-x-auto"
    : "grid grid-cols-2 gap-px overflow-hidden";

  return (
    // Ett kort, inte staplade block: bara ytterkanten är rundad och sömmarna inuti är de
    // hårstreck som gap-px släpper igenom från sidytan bakom. Samma yta som "Dina val" –
    // panelen byter innehåll när man öppnar ett ämne, inte form.
    <div className="flex flex-col gap-px overflow-hidden rounded-[8px]">
      {/* rubrik */}
      <div className="flex h-16 items-center gap-4 bg-card px-6">
        <h2 className="flex-1 font-heading font-medium text-2xl leading-6 tracking-tight text-foreground">
          {t.title === "Ben & montering" ? "Välj ben" : `Välj ${t.title.toLowerCase()}`}
        </h2>
        <RoundButton label="Stäng" onClick={onClose}>
          <X size={20} />
        </RoundButton>
      </div>

      {/* innehåll */}
      {topic === "storlek" && (
        <div className="flex flex-col gap-px">
          <div className="bg-card">
            <StepSlider
              label="Bredd"
              value={S.cols}
              min={1}
              max={COLMAX}
              format={(v) => `${realW(v)} cm`}
              onSet={(cols) => patch({ cols, rows: applyStyle(S.style ?? "", cols, S.rows) })}
            />
          </div>
          <div className="bg-card">
            <StepSlider
              label="Höjd"
              value={S.rows.length}
              min={1}
              max={ROWMAX}
              format={(v) => `${cellsToCm(v)} cm`}
              onSet={(n) =>
                patch({
                  // Hela 40 cm-moduler: produktsidan har ingen 20 cm-halvsteg som byggaren.
                  rows: applyStyle(S.style ?? "", S.cols, Array.from({ length: n }, () => r({ h: 40 }))),
                })
              }
            />
          </div>
        </div>
      )}

      {topic === "stil" && (
        <div className={wrap}>
          {STYLES.map((style) => (
            <OptionTile
              key={style.id}
              name={style.name}
              desc={style.desc}
              // Brickan visar DIN möbel i den stilen, inte en generisk tumnagel.
              visual={<span className="scale-[1.6]"><MiniShelf rows={applyStyle(style.id, S.cols, S.rows)} cols={S.cols} /></span>}
              selected={S.style === style.id}
              layout={layout}
              onClick={() => patch({ style: style.id, rows: applyStyle(style.id, S.cols, S.rows) })}
            />
          ))}
        </div>
      )}

      {topic === "ben" && (
        <div className={wrap}>
          {/* Montering är föräldern och benet undervalet, så de bor i samma lista: antingen
              hänger möbeln på väggen, eller så står den på ett av benen. */}
          <OptionTile
            name="Väggmonterad"
            desc="Svävar på väggen med fri golvyta under."
            swatch="oklch(0.95 0 0)"
            selected={S.mount === "vagg"}
            layout={layout}
            onClick={() => patch({ mount: "vagg" })}
          />
          {LEGS.map(([id, name, desc]) => (
            <OptionTile
              key={id}
              name={name}
              desc={desc}
              image={LEG_IMAGES[id]}
              selected={S.mount === "staende" && S.leg === id}
              layout={layout}
              onClick={() => patch({ mount: "staende", leg: id })}
            />
          ))}
        </div>
      )}

      {topic === "material" && (
        <div className={wrap}>
          {(Object.keys(COLORS) as Material[]).flatMap((material) =>
            COLORS[material].map(([hex, name, desc]) => (
              <OptionTile
                key={hex}
                name={name}
                desc={desc}
                image={EK_IMAGES[hex]}
                swatch={hex}
                selected={S.material === material && S.color === hex}
                layout={layout}
                onClick={() => patch({ material, color: hex })}
              />
            )),
          )}
        </div>
      )}

      {topic === "beslag" && (
        <div className={wrap}>
          {HANDLES.map(([id, name, desc]) => (
            <OptionTile
              key={id}
              name={name}
              desc={desc}
              image={HANDLE_IMAGES[id]}
              selected={S.handle === id}
              layout={layout}
              onClick={() => patch({ handle: id })}
            />
          ))}
        </div>
      )}

      {topic === "tillbehor" && (
        <div className="overflow-hidden bg-card">
          <TillvalCompact added={added} onToggle={onToggleTillval} />
        </div>
      )}

      {/* bekräftelse – valen gäller redan, knappen stänger bara panelen */}
      <div className="bg-card px-6 pb-6 pt-4 lg:py-6">
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-button bg-primary px-4 py-2.5 font-body text-base font-semibold text-primary-foreground transition-opacity duration-fast hover:opacity-90 active:opacity-80 lg:px-6 lg:py-3 lg:text-xl"
        >
          {t.cta}
        </button>
      </div>
    </div>
  );
}
