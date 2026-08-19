"use client";

// Anpassa – en produktsida som råkar vara konfigurerbar.
//
// Skillnaden mot byggaren på /bygg är inte skalet utan vad kunden får styra: här finns bara
// helhetsval (storlek, stil, ben, material, beslag, tillbehör), inga fack och inga band.
// Möbeln äger bilden, valen ligger som kort i "Dina val", och kameran zoomar in bara när det
// man ändrar är fysiskt litet (ben, beslag) – storlek, stil och material rör helheten.
//
// Två lägen, samma innehåll:
//   desktop – två kolumner; höger kolumn byter från "Dina val" till ämnespanelen
//   mobil   – sidan SCROLLAR INTE. Bilden fyller vyn och "Dina val" är ett ark som skjuts upp
//             i bild när man trycker på rubriken eller drar uppåt. Ett ämne ersätter arkets
//             innehåll. Att inte ha någon sidscroll är hela poängen: då finns ingen
//             scrollposition att spara, återställa eller låsa, och inget kan hamna bakom
//             något annat.

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, List, Ruler, Share2 } from "lucide-react";
import {
  CATEGORIES, HANDLES, buildConfigState, priceOf, listPriceOf, realW, furnitureHeightCm,
  FRONT_LABEL, COLORS, LEGS,
} from "@/lib/config";
import { useConfigHistory } from "@/lib/history";
import { RollingPrice, STAGE_T } from "@/components/Configurator";
import ProductInfo from "@/components/ProductInfo";
import { Text } from "@/components/Type";
import { focusFor, topicById, type TopicId } from "./model";
import Stage from "./Stage";
import DinaVal from "./DinaVal";
import TopicPanel from "./TopicPanel";
import RoundButton from "./RoundButton";

// Utgångsläget: en bokhylla i Kollage-stil, samma preset som produktkorten använder.
const START = buildConfigState("hyllor", { style: "kollage", front: "slats" })!;
// Arket är indraget 16 px runt om (Figma: x=16, bredd 368 av 400).
const SHEET_INSET = 16;
// Hur mycket av arkets överkant bilden får fortsätta in bakom, så arket läser som att det
// ligger ÖVER möbeln och inte som nästa sektion under den. Figma: 46 px.
const SHEET_OVERLAP = 46;
// Arkets rubrikhöjd – så mycket tittar fram i vila.
const PEEK = 48;
// Ytan under bilden som redan är reserverad i flödet (punkter, verktyg, arkets tittrand).
// Arket äter av bilden först när det växer förbi den.
const RESERVED = 152;

export default function Anpassa() {
  const router = useRouter();
  const { S, setS } = useConfigHistory(START);
  const [topic, setTopic] = useState<TopicId | null>(null);
  const [valOpen, setValOpen] = useState(false);
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [showDims, setShowDims] = useState(false);
  const [showSpec, setShowSpec] = useState(false);
  // Vilken vy i karusellen som visas när inget ämne är öppet: hela möbeln, eller en närbild.
  const [shot, setShot] = useState(0);

  const [isLg, setIsLg] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const read = () => setIsLg(mq.matches);
    read();
    mq.addEventListener("change", read);
    return () => mq.removeEventListener("change", read);
  }, []);
  useEffect(() => { if (isLg) setValOpen(false); }, [isLg]);

  /* ---------------------------------------------------------------- kameran */

  const SHOTS: (TopicId | null)[] = useMemo(() => [null, "ben", "beslag"], []);
  const focus = useMemo(() => focusFor(S, topic ?? SHOTS[shot] ?? null), [S, topic, shot, SHOTS]);

  /* ------------------------------------------------------------------ arket */

  const sheetRef = useRef<HTMLDivElement>(null);
  const [sheetH, setSheetH] = useState(0);
  // Arket är uppe när ett ämne är öppet, eller när man skjutit upp kortytan. `valOpen` gäller
  // bara mobil: på desktop finns inget ark, och ett kvarglömt true skulle gömma verktygen.
  const up = topic !== null || (!isLg && valOpen);

  // Höjden mäts på INNEHÅLLET: höjden vi sätter på arket är vårt eget resultat, så att
  // observera arket självt vore att observera sig själv.
  useEffect(() => {
    const el = sheetRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSheetH(el.offsetHeight));
    ro.observe(el);
    setSheetH(el.offsetHeight);
    return () => ro.disconnect();
  }, [topic, isLg]);

  // Vem som viker sig när arket är uppe – möbeln eller bilden – beror på vad arket visar.
  //
  // "Dina val" är en sammanfattning man skjuter upp för att läsa och ner igen. Den lägger
  // sig ÖVER bilden: möbeln står kvar i exakt samma storlek och arket skymmer nederkanten
  // så länge man tittar. Att i stället trycka undan möbeln kostade nästan hela bilden –
  // arket är högt, och kompensationen krympte möbeln till en bråkdel för en yta man ändå
  // stänger igen efter ett par sekunder.
  //
  // Ett ämne är tvärtom något man ARBETAR i: då måste det man ändrar synas medan man
  // ändrar det, så där flyttar möbeln undan – förutom SHEET_OVERLAP, som arket får
  // överlappa med flit så att det läser som att ligga över bilden och inte under den.
  const padBottom = !isLg && up && topic
    ? Math.max(0, SHEET_INSET + sheetH - RESERVED - SHEET_OVERLAP)
    : 0;

  // Att arket lägger sig över bilden får inte betyda att möbeln hamnar bakom det. Den flyttar
  // därför upp i stället – halva den yta arket döljer, vilket är precis vad som krävs för att
  // en möbel som stod mitt i ramen ska stå mitt i det som är kvar av den. Storleken rörs inte;
  // det är hela skillnaden mot `padBottom`, som köper samma frihöjd genom att krympa möbeln.
  const coveredByVal = !isLg && up && !topic ? Math.max(0, SHEET_INSET + sheetH - RESERVED) : 0;

  // Gester: dra eller scrolla uppåt skjuter upp kortytan, nedåt lägger den tillbaka. Sidan har
  // ingen egen scroll, så hjulet och dragningen är lediga att betyda precis det här.
  useEffect(() => {
    if (isLg || topic) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 8) return;
      setValOpen(e.deltaY > 0);
    };
    let y0: number | null = null;
    const onStart = (e: TouchEvent) => { y0 = e.touches[0]?.clientY ?? null; };
    const onMove = (e: TouchEvent) => {
      if (y0 === null) return;
      const dy = (e.touches[0]?.clientY ?? y0) - y0;
      if (Math.abs(dy) < 28) return;
      setValOpen(dy < 0); // finger uppåt = arket upp
      y0 = null;
    };
    const onEnd = () => { y0 = null; };
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [isLg, topic]);

  // Sidan är en produktsida och ska sitta i sajten – därför står den globala headern kvar
  // på desktop. På mobil döljer klassen den: vyn är exakt en skärmhöjd utan scroll, och en
  // header ovanför skulle skjuta arket ur bild. Regeln ligger i globals.css.
  useLayoutEffect(() => {
    document.body.classList.add("anpassa-page");
    return () => document.body.classList.remove("anpassa-page");
  }, []);

  /* -------------------------------------------------------------- härlett */

  const handleId = HANDLES.some((h) => h[0] === S.handle) ? S.handle : HANDLES[0][0];
  const frame = S.color;
  const lift = S.mount === "vagg" ? 40 : 0;
  const price = priceOf(S, handleId).toLocaleString("sv-SE");
  const listPrice = listPriceOf(S, handleId).toLocaleString("sv-SE");
  const category = CATEGORIES.find((c) => c.id === S.category);

  const toggleTillval = useCallback((id: string) => {
    setAdded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const open = (id: TopicId) => { setShowSpec(false); setTopic(id); };
  const close = () => setTopic(null);

  useEffect(() => {
    if (!topic && !showSpec) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (showSpec) setShowSpec(false);
      else close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [topic, showSpec]);

  const spec: [string, string][] = [
    ["Bredd", realW(S.cols) + " cm"],
    ["Höjd", furnitureHeightCm(S) + " cm"],
    ["Djup", "40 cm"],
    ["Material", COLORS[S.material].find((c) => c[0] === S.color)?.[1] ?? S.color],
    ["Frontstil", FRONT_LABEL[S.front]],
    ["Beslag", HANDLES.find((h) => h[0] === handleId)?.[1] ?? "-"],
    ["Montering", S.mount === "vagg" ? "Väggmonterad" : "Stående på " + (LEGS.find((l) => l[0] === S.leg)?.[1] ?? "ben")],
  ];

  // Samma innehåll oavsett var det visas: höger kolumn på desktop, arket på mobil.
  const panel = topic ? (
    <TopicPanel
      topic={topic}
      S={S}
      setS={setS}
      added={added}
      onToggleTillval={toggleTillval}
      onClose={close}
      overlay={!isLg}
    />
  ) : (
    <DinaVal
      S={S}
      added={added}
      price={price}
      listPrice={listPrice}
      onOpen={open}
      onToggle={isLg ? undefined : () => setValOpen((v) => !v)}
      open={valOpen}
    />
  );

  /* --------------------------------------------------------------- render */

  return (
    // Mobil: exakt en vyhöjd, ingen scroll. Desktop: vanligt flöde.
    <main className="flex h-[100svh] flex-col overflow-hidden bg-surface text-foreground lg:block lg:h-auto lg:min-h-0 lg:overflow-visible">
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col overflow-hidden lg:grid lg:grid-cols-2 lg:gap-0 lg:overflow-visible lg:px-[120px] lg:pt-16">
        {/* ---- vänster: rubrik + bild ---- */}
        <div className="flex min-h-0 flex-1 flex-col lg:flex-none">
          <div className="flex flex-col gap-3 px-4 pt-4 lg:flex-row lg:items-center lg:gap-6 lg:px-0 lg:pt-0">
            <div className="flex">
              <RoundButton label="Tillbaka" size={isLg ? 48 : 40} onClick={() => router.back()}>
                <ArrowLeft size={20} />
              </RoundButton>
            </div>
            <div className="flex flex-1 items-start justify-between gap-4 lg:block">
              <div>
                <h1 className="font-heading font-medium text-2xl leading-6 tracking-tight text-foreground">Anamosa</h1>
                <Text className="text-muted-foreground lg:mt-1">{category?.name ?? "Bokhylla"}</Text>
                {/* Mobil: priset står vid titeln, för där finns ingen annan plats som syns
                    i alla lägen. Desktop: det sitter nere vid köpknappen i "Dina val". */}
                <p className="mt-1 flex items-baseline gap-2 lg:hidden">
                  <span className="font-heading font-medium text-2xl leading-6 tracking-tight text-sale">
                    <RollingPrice value={price} />:-
                  </span>
                  <span className="font-heading font-medium text-2xl leading-6 tracking-tight text-muted-foreground line-through">{listPrice}:-</span>
                </p>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-button bg-primary px-6 py-3 font-body text-xl font-semibold text-primary-foreground transition-opacity duration-fast hover:opacity-90 active:opacity-80 lg:hidden"
              >
                Köp
              </button>
            </div>
          </div>

          {/* stage-cap: taket som håller punkterna och verktygen kvar vid bilden i höga
              ramar i stället för att låta ramen växa förbi vad möbeln kan fylla. */}
          <section className="stage-cap min-h-0 flex-1 lg:h-[484px] lg:flex-none">
            <Stage
              S={S}
              handleId={handleId}
              frame={frame}
              focus={focus}
              lift={lift}
              showDims={showDims}
              padBottom={padBottom}
              shiftUp={coveredByVal / 2}
            />
          </section>

          {/* Punkter och verktyg har FAST höjd även när innehållet är borta: annars ändrar
              bildens höjd sig i samma ögonblick som arket rör sig, och de två rörelserna
              slåss om samma 350 ms. */}
          <div className="flex h-6 items-center justify-center gap-2 lg:hidden">
            {!up &&
              SHOTS.map((sh, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={sh ? "Närbild: " + topicById(sh).title : "Hela möbeln"}
                  onClick={() => setShot(i)}
                  className={"h-1.5 w-1.5 rounded-full transition-colors duration-fast " + (i === shot ? "bg-foreground" : "bg-border")}
                />
              ))}
          </div>
          <div className="flex h-14 items-center justify-center lg:h-auto lg:pt-2">
            {!up && (
              <div className="flex items-center justify-center gap-3">
                <RoundButton
                  label="Dela"
                  size={isLg ? 48 : 40}
                  onClick={() => {
                    if (typeof navigator !== "undefined" && navigator.share) navigator.share({ url: window.location.href }).catch(() => {});
                    else navigator.clipboard?.writeText(window.location.href);
                  }}
                >
                  <Share2 size={20} />
                </RoundButton>
                <RoundButton label="Visa mått" size={isLg ? 48 : 40} onClick={() => setShowDims((v) => !v)}>
                  <Ruler size={20} className={showDims ? "text-sale" : undefined} />
                </RoundButton>
                <RoundButton label="Specifikation" size={isLg ? 48 : 40} onClick={() => setShowSpec((v) => !v)}>
                  <List size={20} />
                </RoundButton>
              </div>
            )}
          </div>
          {/* Tittranden: arkets rubrik ligger här i vila. */}
          <div className="shrink-0 lg:hidden" style={{ height: PEEK + SHEET_INSET }} />
        </div>

        {/* ---- höger: bara desktop. På mobil bor samma innehåll i arket nedan. ----
             Villkoret är JS och inte bara CSS: `panel` innehåller sex kort med bilder och
             egna animationer, och två uppsättningar i DOM:en vore dubbla knappar, dubbla
             bildhämtningar och dubbel stagger. */}
        {isLg && (
        <div className="flex min-h-[684px] flex-col justify-center pl-[120px]">
          {showSpec ? (
            <div key="spec" className="panel-enter-right rounded-[8px] bg-card p-6">
              <ProductInfo spec={spec} />
            </div>
          ) : (
            <div key={topic ?? "dinaval"} className={topic ? "panel-enter-right" : "panel-enter-left"}>
              {panel}
            </div>
          )}
        </div>
        )}
      </div>

      {/* ---- mobilens ark: kortytan i vila, ämnet när ett är öppet ---- */}
      {!isLg && (
        <div
          style={{
            transform: up ? undefined : "translateY(calc(100% - " + PEEK + "px))",
            transition: "transform " + STAGE_T,
          }}
          className="no-scrollbar fixed inset-x-4 bottom-4 z-40 max-h-[calc(100svh-8rem)] overflow-y-auto"
        >
          <div ref={sheetRef}>{panel}</div>
        </div>
      )}
    </main>
  );
}
