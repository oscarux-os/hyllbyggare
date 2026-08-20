"use client";

// Anpassa – konfiguratorn som ett rutnät.
//
// Skillnaden mot byggaren på /bygg är inte skalet utan vad kunden får styra: här finns bara
// helhetsval (stil, storlek, material, front, ben, handtag, tillbehör), inga fack och inga
// band. Kameran zoomar in bara när det man ändrar är fysiskt litet (ben, handtag) – stil,
// storlek och material rör helheten.
//
// Formen kommer ur skisserna (Figma "v4 Volvo stil konfig"). Tre lägen, samma yta:
//   grid    – topprad med pris och köpknapp, och ett rutnät: möbeln till vänster, valen som
//             fyra celler till höger. Hårstrecken mellan cellerna är sidans vita fond som
//             lyser igenom 1 px.
//   topic   – ett val är öppet. Toppraden SLÄCKS, bilden växer och panelen tar höger kant
//             med brickor i rutnät och bekräftelsen pinnad i botten.
//   detail  – "Läs mer": alternativet som egen sida, med produktfoto i stället för möbel.
// (spec är samma layout som topic, men med produktspecifikationen i panelen.)
//
// Polariteten är omvänd mot den gamla panelformen: YTORNA är ljusa (--surface) och sidan är
// vit, så sömmarna blir vita hårstreck i stället för grå. Inga radier på ytor – bara knappar.

import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { ArrowLeft, List, ReceiptText, Ruler, Share2 } from "lucide-react";
import {
  HANDLES, buildConfigState, priceOf, listPriceOf, realW, furnitureHeightCm,
  FRONT_LABEL, COLORS, LEGS, type State,
} from "@/lib/config";
import { productById } from "@/lib/tillval";
import { useConfigHistory } from "@/lib/history";
import { RollingPrice } from "@/components/Configurator";
import { Heading, Text } from "@/components/Type";
import { focusFor, sectionOptions, summaryFor, topicById, topicDisabled, type SectionId, type TopicId } from "./model";
import Stage from "./Stage";
import ValGrid from "./ValGrid";
import ProduktInfo, { anamosaSections } from "./ProduktInfo";
import Sammanstallning, { lineOf, type CartLine } from "./Sammanstallning";
import TopicPanel from "./TopicPanel";
import OptionDetail, { DetailMedia } from "./OptionDetail";
import RoundButton from "./RoundButton";

// Utgångsläget: en bokhylla i Kollage-stil, samma preset som produktkorten använder.
const START = buildConfigState("hyllor", { style: "kollage", front: "slats" })!;

export default function Anpassa() {
  const { S, setS } = useConfigHistory(START);
  const [topic, setTopic] = useState<TopicId | null>(null);
  const [detail, setDetail] = useState<{ section: SectionId; optionId: string } | null>(null);
  const [showSpec, setShowSpec] = useState(false);
  const [showCart, setShowCart] = useState(false);
  // Möbeln och tillvalen som de stod när ämnet öppnades – dit ✕ återställer.
  const [draftFrom, setDraftFrom] = useState<{ S: State; added: Set<string> } | null>(null);
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [showDims, setShowDims] = useState(false);
  // Vilken vy i karusellen som visas när inget val är öppet: hela möbeln, eller en närbild.
  const [shot, setShot] = useState(0);

  /* ---------------------------------------------------------------- kameran */

  // Vinklarna i vila: hela möbeln, benen, luckorna. Närbilden på luckan faller bort på en helt
  // öppen möbel – det finns ingen lucka att zooma in på. Samma villkor som cellen i rutnätet.
  const SHOTS: (TopicId | null)[] = useMemo(
    () => ([null, "ben", "luckor"] as (TopicId | null)[]).filter((id) => !id || !topicDisabled(S, id)),
    [S],
  );
  // Faller en vinkel bort medan man står på den hamnar vi på den sista som finns kvar.
  const shotIndex = Math.min(shot, SHOTS.length - 1);
  const focus = useMemo(() => focusFor(S, topic ?? SHOTS[shotIndex] ?? null), [S, topic, shotIndex, SHOTS]);

  /* -------------------------------------------------------------- härlett */

  const handleId = HANDLES.some((h) => h[0] === S.handle) ? S.handle : HANDLES[0][0];
  const frame = S.color;
  const lift = S.mount === "vagg" ? 40 : 0;
  // Bildcellens rubrik: vad möbeln ÄR ("Bokhylla Kollage") och måtten under.
  const furnitureSummary = summaryFor(S, "stil");
  // Konfiguratorn lägger flera varor i korgen: möbeln plus varje valt tillbehör. Priset i
  // toppraden är därför summan av dem – annars säger knappen "4 produkter" intill en siffra
  // som bara gäller en av dem.
  const cartLines: CartLine[] = [
    {
      id: "mobel",
      name: furnitureSummary.title,
      detail: `${furnitureSummary.value} · ${COLORS[S.material].find((c) => c[0] === S.color)?.[1] ?? S.color}`,
      price: priceOf(S, handleId),
      listPrice: listPriceOf(S, handleId),
    },
    ...Array.from(added)
      .map(productById)
      .filter((p): p is NonNullable<typeof p> => !!p)
      .map(lineOf),
  ];
  const price = cartLines.reduce((a, l) => a + l.price, 0).toLocaleString("sv-SE");
  const listPrice = cartLines.reduce((a, l) => a + (l.listPrice ?? l.price), 0).toLocaleString("sv-SE");

  // Alternativet detaljvyn handlar om. Hittas det inte (t.ex. för att möbeln ändrats under
  // vägen) faller vi tillbaka till ämnet i stället för att visa en tom sida.
  const detailOption = detail
    ? sectionOptions(S, detail.section).find((o) => o.id === detail.optionId) ?? null
    : null;

  const mode = detailOption ? "detail" : topic ? "topic" : "grid";
  const open = mode !== "grid";
  // Escape och ✕ har något att stänga så länge något ligger över rutnätet.
  const anyOpen = open || showSpec || showCart;

  const toggleTillval = useCallback((id: string) => {
    setAdded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Att öppna ett ämne är att börja på ett utkast: valen syns direkt i bilden, men de gäller
  // först när man bekräftar. ✕ (och Escape) ångrar allt man gjort medan panelen var öppen och
  // lämnar möbeln precis som den stod – annars vore det omöjligt att prova något utan att
  // riskera det man redan valt. Tillvalen är med i ångringen: +-knappen bor i samma panel.
  const openTopic = (id: TopicId) => {
    setShowSpec(false);
    setDetail(null);
    setDraftFrom({ S, added: new Set(added) });
    setTopic(id);
  };

  /** Bekräfta: valen står kvar, utkastet slängs. */
  const confirmTopic = useCallback(() => {
    setDraftFrom(null);
    setTopic(null);
  }, []);

  /** Avbryt: möbeln och tillvalen tillbaka till läget innan panelen öppnades. */
  const cancelTopic = useCallback(() => {
    if (draftFrom) {
      setS(() => draftFrom.S);
      setAdded(draftFrom.added);
    }
    setDraftFrom(null);
    setTopic(null);
  }, [draftFrom, setS]);

  // Ett steg tillbaka: detaljvyn stängs mot ämnet, specen mot rutnätet, och ämnet ångras.
  const back = useCallback(() => {
    // Överläggen ligger överst och stängs först.
    if (showCart) setShowCart(false);
    else if (showSpec) setShowSpec(false);
    else if (detail) setDetail(null);
    else cancelTopic();
  }, [showCart, showSpec, detail, cancelTopic]);

  useEffect(() => {
    if (!anyOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") back(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [anyOpen, back]);

  // Vyn är hela fönstret: skissen har ingen sajtheader ovanför rutnätet, och en header hade
  // skjutit cellerna ur bild. Regeln (och den vita fonden) ligger i globals.css.
  useLayoutEffect(() => {
    document.body.classList.add("anpassa-page");
    return () => document.body.classList.remove("anpassa-page");
  }, []);

  const spec: [string, string][] = [
    ["Bredd", realW(S.cols) + " cm"],
    ["Höjd", furnitureHeightCm(S) + " cm"],
    ["Djup", "40 cm"],
    ["Material", COLORS[S.material].find((c) => c[0] === S.color)?.[1] ?? S.color],
    ["Frontstil", FRONT_LABEL[S.front]],
    ["Handtag", HANDLES.find((h) => h[0] === handleId)?.[1] ?? "-"],
    ["Montering", S.mount === "vagg" ? "Väggmonterad" : "Stående på " + (LEGS.find((l) => l[0] === S.leg)?.[1] ?? "ben")],
  ];

  /* --------------------------------------------------------------- render */

  return (
    // Desktop: exakt en vyhöjd, ingen scroll – rutnätet ÄR sidan. Mobil scrollar som vanligt
    // (staplat), tills den får en egen runda.
    <main className="min-h-[100svh] bg-card text-foreground lg:h-[100svh] lg:overflow-hidden">
      <div className="flex h-full min-h-0 flex-col p-4 lg:p-6">
        {/* ---- topprad: bara i vila. Ett öppet val äger hela vyn (skissen). ---- */}
        {!open && (
          <div className="mb-4 flex flex-col gap-4 sm:h-16 sm:flex-row sm:items-center lg:mb-px">
            {/* Tillbaka står först i läsordningen, inte mitt i bildens vänsterkant: att lämna
                sidan är navigation och hör ihop med rubriken, inte med verktygen för bilden. */}
            <div className="flex min-w-0 flex-1 items-center gap-2">
              {/* Tillbaka till serien, inte till historiken: sidan nås också via delade länkar
                  och då finns det inget "bakåt" att gå till. */}
              <RoundButton label="Tillbaka till Anamosa" tone="bare" href="/anamosa">
                <ArrowLeft size={24} />
              </RoundButton>
              <Heading level="h2" as="h1" className="min-w-0 flex-1 text-[32px] leading-8">
                Bygg din egen Anamosa
              </Heading>
            </div>
            <div className="flex items-center gap-6">
              <p className="flex items-baseline gap-2">
                <span className="font-heading font-medium text-2xl leading-6 tracking-tight text-sale">
                  <RollingPrice value={price} />:-
                </span>
                <span className="font-heading font-medium text-2xl leading-6 tracking-tight text-muted-foreground line-through">
                  {listPrice}:-
                </span>
              </p>
              {/* Två knappar i par: den vänstra visar VILKA varor det blir, den högra säger hur
                  många och lägger dem i korgen. Samma höjd och radie – den ena i kontur, den
                  andra fylld, så det syns vilken som är handlingen. Själva köpet finns inte i
                  labbet: primärknappen är attrapp, som förut. */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Visa varorna som läggs i varukorgen"
                  title="Visa varorna"
                  onClick={() => setShowCart(true)}
                  // 40 × 40: exakt samma höjd som köpknappen intill (Figmas Button/md är 16/20
                  // + 10 px luft = 40), så paret står jämnt.
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-button border border-foreground bg-card text-foreground transition-colors duration-fast hover:bg-secondary"
                >
                  <ReceiptText size={20} />
                </button>
                <button
                  type="button"
                  className="rounded-button bg-primary px-4 py-2.5 font-body text-base font-semibold leading-5 text-primary-foreground transition-opacity duration-fast hover:opacity-90 active:opacity-80"
                >
                  {cartLines.length === 1 ? "Lägg i varukorg" : `Lägg ${cartLines.length} produkter i varukorg`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---- rutnätet ---- */}
        <div
          className={`grid min-h-0 flex-1 gap-px bg-card ${
            open ? "lg:grid-cols-[1fr_463px]" : "lg:grid-cols-2"
          }`}
        >
          {/* vänster: bildytan. I detaljläget visas alternativets foto i stället för möbeln. */}
          <section className="relative flex min-h-[52svh] flex-col bg-surface lg:min-h-0">
            {mode === "detail" && detailOption ? (
              <DetailMedia option={detailOption} />
            ) : (
              <>
                {/* Rubriken i bildcellen är samtidigt ingången till stil och storlek. */}
                {!open && (
                  <button
                    type="button"
                    aria-label="Välj storlek och stil"
                    onClick={() => openTopic("stil")}
                    className="group flex flex-col items-start p-6 text-left"
                  >
                    <Text as="span" className="font-medium text-foreground group-hover:underline">
                      {furnitureSummary.title}
                    </Text>
                    <Text as="span" variant="small" className="text-muted-foreground">
                      {furnitureSummary.value}
                    </Text>
                  </button>
                )}

                <div className="relative min-h-0 flex-1">
                  <Stage S={S} handleId={handleId} frame={frame} focus={focus} lift={lift} showDims={showDims} />

                  {/* Möbeln själv är en knapp: trycker man på den öppnas panelen där storlek
                      och stil väljs i samma vy (Figma 251:17385). Formen är det man pekar på
                      när man pekar på möbeln. */}
                  {!open && (
                    <button
                      type="button"
                      aria-label="Välj storlek och stil"
                      onClick={() => openTopic("stil")}
                      className="absolute inset-0 z-10"
                    />
                  )}

                  {/* Verktygen står som en lodrät kolumn vid vänsterkanten, som i skissen –
                      och bara i vila: ett öppet val äger vyn och stängs med ✕ eller Escape. */}
                  {!open && (
                  <div className="absolute left-4 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-2">
                    <RoundButton
                      label="Dela"
                      tone="bare"
                      onClick={() => {
                        if (typeof navigator !== "undefined" && navigator.share) navigator.share({ url: window.location.href }).catch(() => {});
                        else navigator.clipboard?.writeText(window.location.href);
                      }}
                    >
                      <Share2 size={20} />
                    </RoundButton>
                    <RoundButton label="Visa mått" tone="bare" onClick={() => setShowDims((v) => !v)}>
                      <Ruler size={20} className={showDims ? "text-sale" : undefined} />
                    </RoundButton>
                    <RoundButton label="Specifikation" tone="bare" onClick={() => setShowSpec(true)}>
                      <List size={20} />
                    </RoundButton>
                  </div>
                  )}
                </div>

                {/* Vinklarna: hela möbeln, benen, handtagen. Bara i vila – ett öppet val
                    styr kameran självt, och raden ska inte äta höjd när den är tom. */}
                {!open && (
                  <div className="flex h-6 shrink-0 items-center justify-center gap-2 pb-6">
                    {SHOTS.map((sh, i) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={sh ? "Närbild: " + topicById(sh).title : "Hela möbeln"}
                        onClick={() => setShot(i)}
                        className={`h-1.5 w-1.5 rounded-full transition-colors duration-fast ${i === shotIndex ? "bg-foreground" : "bg-border"}`}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </section>

          {/* höger: valen i vila, panelen när något är öppet. */}
          <div key={mode + (topic ?? "") + (detail?.optionId ?? "")} className={open ? "panel-enter-right min-h-0 p-4 lg:p-0 lg:pl-6" : "panel-enter-left min-h-0"}>
            {mode === "detail" && detailOption ? (
              <OptionDetail
                S={S}
                section={detail!.section}
                option={detailOption}
                onSelect={() => { setS(detailOption.apply); setDetail(null); }}
                onClose={back}
              />
            ) : mode === "topic" && topic ? (
              <TopicPanel
                topic={topic}
                S={S}
                setS={setS}
                added={added}
                onToggleTillval={toggleTillval}
                onConfirm={confirmTopic}
                onCancel={cancelTopic}
                onDetail={(section, optionId) => setDetail({ section, optionId })}
              />
            ) : (
              <ValGrid S={S} added={added} onOpen={openTopic} />
            )}
          </div>
        </div>
      </div>

      {/* ---- sammanställningen: vad knappen faktiskt lägger i korgen ---- */}
      {showCart && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 lg:p-8"
          onClick={back}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal
            aria-label="Sammanställning"
            onClick={(e) => e.stopPropagation()}
            className="sheet-enter flex max-h-[86svh] w-full min-h-0 flex-col bg-card sm:max-w-[560px]"
          >
            <Sammanstallning lines={cartLines} onClose={() => setShowCart(false)} onAdd={() => setShowCart(false)} />
          </div>
        </div>
      )}

      {/* ---- produktinfon som överlägg: sidan ligger kvar bakom och mörknar ---- */}
      {showSpec && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 lg:p-8"
          onClick={back}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal
            aria-label="Produktinformation"
            onClick={(e) => e.stopPropagation()}
            className="sheet-enter flex h-[86svh] w-full min-h-0 flex-col bg-card p-6 lg:h-[80svh] lg:w-[80vw]"
          >
            <ProduktInfo sections={anamosaSections(spec)} onClose={back} />
          </div>
        </div>
      )}
    </main>
  );
}
