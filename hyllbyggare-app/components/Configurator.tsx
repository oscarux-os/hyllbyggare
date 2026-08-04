"use client";

import { useRef, useState, useLayoutEffect, useEffect } from "react";
import Image from "next/image";
import { Plus, Minus, Check, ArrowLeft, ChevronLeft, ChevronRight, X, Ruler, Trash2, Sofa, Pencil, Truck, MoreHorizontal } from "lucide-react";
import { Heading, Text } from "./Type";
import Tillval from "./TillvalCompact";
import ProductInfo from "./ProductInfo";
import { TILLVAL_PRODUCTS, offerAmount, formatKr, type TillvalProduct } from "@/lib/tillval";
import {
  COLORS, LEGS, HANDLES, STYLES, FRONT_LABEL, AMOUNT_LABEL, CATEGORIES,
  U, STEP, COLMAX, ROWMAX, HEIGHT_STEPS, type State, type Row, type Amount, type Front, type ColDef, type CellType,
  newRow, r, cellObj, applyStyle, applyColStyle, rowCells, gridCells, fillColumn, allCells, colHeight, cellsToCm, realW, realH, maxShelves, drawersAllowed, fitAmount, hasFronts,
  heightStepToLayout, layoutToHeightStep,
} from "@/lib/config";

const initial: State = {
  cols: 4,
  rows: [newRow(), newRow(), newRow()],
  mount: "staende",
  leg: "ek",
  material: "ek",
  color: "#C9A36A",
  front: "plain",
  handle: "h1",
  style: "mosaik",
};
initial.rows = applyStyle("mosaik", initial.cols, initial.rows);

const lum = (hex: string) => {
  const c = hex.replace("#", "");
  return (0.299 * parseInt(c.slice(0, 2), 16) + 0.587 * parseInt(c.slice(2, 4), 16) + 0.114 * parseInt(c.slice(4, 6), 16)) / 255;
};
const hcol = (bg: string) => (lum(bg) > 0.62 ? "rgba(0,0,0,.45)" : "rgba(255,255,255,.92)");

export default function Configurator({ initialState = initial, onBack }: { initialState?: State; onBack?: () => void }) {
  const [S, setS] = useState<State>(initialState);
  // active = index på bandet som redigeras i panelen (nivå 2); null = globala val (nivå 1).
  const [active, setActive] = useState<number | null>(null);
  // hovrat band – tänder markering + "Redigera"-knappen (öppnar inte nivå 2 av sig självt).
  const [hovered, setHovered] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  // hyllans faktiska (skalade) rektangel relativt wrapRef – förankrar lägg-till-knapparna
  const [stage, setStage] = useState<Stage>(NO_STAGE);
  const [showDims, setShowDims] = useState(false);
  // rumsdekoren (växt + lampa) är avstängd som standard – den slås på via "Visa miljö".
  const [showScene, setShowScene] = useState(false);
  // mobil: verktygsknapparna fälls ihop bakom en mer-knapp i hörnet så de inte tar
  // hela toppen. Öppnas som en liten kolumn under knappen. Desktop visar dem inline.
  const [toolsOpen, setToolsOpen] = useState(false);
  // köpribban (pris + produktinfo) ligger fast i toppen och följer med ända
  // över Tillval – döljs när varukorgen i summeringen kommer in i vy.
  const cartRef = useRef<HTMLElement | null>(null);
  const [showBuyBar, setShowBuyBar] = useState(true);
  useEffect(() => {
    const el = cartRef.current;
    if (!el) return;
    // döljs först när en bit (~140px) av varukorgen syns, inte vid minsta glimt.
    const io = new IntersectionObserver(([e]) => setShowBuyBar(!e.isIntersecting), {
      threshold: 0,
      rootMargin: "0px 0px -140px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  // valda tillval (delas mellan Tillval-karusellen och summeringen).
  // Map id → antal så att man kan välja fler av samma tillval i varukorgen.
  const [addedTillval, setAddedTillval] = useState<Map<string, number>>(new Map());
  const toggleTillval = (id: string) =>
    setAddedTillval((s) => {
      const next = new Map(s);
      next.has(id) ? next.delete(id) : next.set(id, 1);
      return next;
    });
  // sätt antal; 0 eller mindre tar bort tillvalet ur varukorgen.
  const setTillvalQty = (id: string, qty: number) =>
    setAddedTillval((s) => {
      const next = new Map(s);
      qty <= 0 ? next.delete(id) : next.set(id, qty);
      return next;
    });
  // Set med valda id:n till väljar-komponenterna (deras API är oförändrat).
  const addedTillvalIds = new Set(addedTillval.keys());

  const set = (patch: Partial<State>) => setS((s) => ({ ...s, ...patch }));
  const frameColor = () => (S.material === "ek" ? "#D8BC8E" : S.color === "#ECE8DF" ? "#E2DCCF" : S.color);

  // ---- storlek ----
  const setCols = (n: number) =>
    setS((s) => {
      const cols = Math.min(COLMAX, Math.max(1, n));
      // radstilar hör till radaxeln – i kolumnläge styr stilen colDefs istället
      const rows = s.style && s.axis !== "kolumn" ? applyStyle(s.style, cols, s.rows) : s.rows;
      let colDefs = s.colDefs;
      if (colDefs) {
        colDefs = colDefs.slice(0, cols);
        while (colDefs.length < cols) colDefs.push({ doors: "none", drawers: "none" });
        // aktiv stil: låt nya (och olåsta) kolumner följa stilmönstret
        if (s.axis === "kolumn" && s.style) colDefs = applyColStyle(s.style, cols, colDefs);
      }
      return { ...s, cols, rows, colDefs };
    });
  const setRows = (n: number) =>
    setS((s) => {
      n = Math.min(ROWMAX, Math.max(1, n));
      let rows = [...s.rows];
      while (rows.length < n) rows.push(newRow());
      while (rows.length > n) rows.pop();
      if (s.style && s.axis !== "kolumn") rows = applyStyle(s.style, s.cols, rows);
      return { ...s, rows };
    });

  // Höjd-reglaget: 20 cm-steg, byggt nerifrån och uppåt. Basen (nedersta raden)
  // ligger fast; nya rader läggs till överst och översta raden fylls 20 → 40 först.
  const setHeight = (step: number) =>
    setS((s) => {
      const { count, half } = heightStepToLayout(step);
      let rows = [...s.rows];
      while (rows.length < count) rows.unshift(newRow());
      while (rows.length > count) rows.shift();
      rows = rows.map((row, i) => {
        const h = half && i === 0 ? 20 : 40;
        if (row.h === h) return row;
        const nr: Row = { ...row, h };
        nr.shelves = Math.min(nr.shelves, maxShelves(h));
        if (!drawersAllowed(h)) nr.drawers = "none";
        delete nr.cells;
        return nr;
      });
      if (s.style && s.axis !== "kolumn") rows = applyStyle(s.style, s.cols, rows);
      return { ...s, rows };
    });

  // ---- stil ----
  // Radaxel: stilen komponerar om raderna. Kolumnaxel (skänk, byrå, TV-bänk …): stilen
  // komponerar om kolumnernas innehåll via colDefs – silhuetten (per-kolumn-höjder)
  // behålls. Att välja stil släpper alla manuella lås, som förut.
  const pickStyle = (id: string) =>
    setS((s) => {
      if (s.axis === "kolumn") {
        const prev = (s.colDefs ?? Array.from({ length: s.cols }, emptyCol)).map((d) => ({ ...d, locked: false }));
        return { ...s, style: id, colDefs: applyColStyle(id, s.cols, prev) };
      }
      const rows = applyStyle(id, s.cols, s.rows.map((row) => ({ ...row, locked: false })));
      return { ...s, style: id, rows };
    });

  // ---- per rad ----
  const editRow = (i: number, patch: Partial<Row>) =>
    setS((s) => {
      const rows = s.rows.map((row, idx) => {
        if (idx !== i) return row;
        const nr: Row = { ...row, ...patch, locked: true };
        delete nr.cells;
        // luckor och lådor delar på raden: sätter man den ena ger den andra plats
        if (patch.doors !== undefined) nr.drawers = fitAmount(nr.drawers, patch.doors);
        if (patch.drawers !== undefined) nr.doors = fitAmount(nr.doors, patch.drawers);
        if (patch.h !== undefined) {
          nr.shelves = Math.min(nr.shelves, maxShelves(nr.h));
          if (!drawersAllowed(nr.h)) nr.drawers = "none";
        }
        return nr;
      });
      return { ...s, rows };
    });

  const removeRow = (i: number) =>
    setS((s) => (s.rows.length <= 1 ? s : { ...s, rows: s.rows.filter((_, idx) => idx !== i) }));

  // ---- per kolumn (kolumnläge) – samma mängd-modell som raderna ----
  const emptyCol = (): ColDef => ({ doors: "none", drawers: "none" });
  const editCol = (ci: number, patch: Partial<ColDef>) =>
    setS((s) => {
      const colDefs = (s.colDefs ?? Array.from({ length: s.cols }, emptyCol)).map((d, idx) => {
        if (idx !== ci) return d;
        const nd: ColDef = { ...d, ...patch, locked: true };
        // luckor och lådor delar på kolumnen
        if (patch.doors !== undefined) nd.drawers = fitAmount(nd.drawers, patch.doors);
        if (patch.drawers !== undefined) nd.doors = fitAmount(nd.doors, patch.drawers);
        return nd;
      });
      return { ...s, colDefs };
    });
  const removeCol = (ci: number) =>
    setS((s) => {
      if (s.cols <= 1) return s;
      const colDefs = (s.colDefs ?? Array.from({ length: s.cols }, emptyCol)).filter((_, idx) => idx !== ci);
      return { ...s, cols: s.cols - 1, colDefs };
    });

  // Öppna nivå 2 för ett band. Redigeringen sker nu i panelen (ingen flytande popover).
  // Den hopfällda verktygsmenyn (mobil) stängs samtidigt – den göms i nivå 2 och ska inte
  // stå kvar öppen när man kommer tillbaka till helheten.
  const openBand = (i: number) => { setActive(i); setToolsOpen(false); };
  const backToLevel1 = () => setActive(null);

  // När man går in i bandredigering (nivå 2) kan man redan ha scrollat långt ner förbi den
  // höga nivå 1-panelen. Nollställ sidscrollen så att bandpanelen syns från toppen, men
  // kom ihåg var man var: när man går tillbaka till nivå 1 återställs scrollen så att
  // sidan inte hoppar utan man landar vid samma val som innan.
  const lvl1Scroll = useRef(0);
  const prevActive = useRef<number | null>(null);
  useLayoutEffect(() => {
    const was = prevActive.current;
    prevActive.current = active;
    if (typeof window === "undefined") return;
    // Mobil: lås bakgrundsscrollen medan overlayn är öppen så vi slipper två scrollytor –
    // overlayn har sin egen inre scroll. Enbart under lg (overlayn är lg:hidden); på desktop
    // scrollar sidan som vanligt. Låset ligger i samma (layout-)effekt som scroll-återställningen
    // så ordningen blir deterministisk: lås upp innan vi återställer scrollpositionen vid stängning.
    const mobile = window.matchMedia("(max-width: 1023px)").matches;
    if (was === null && active !== null) {
      lvl1Scroll.current = window.scrollY;
      window.scrollTo({ top: 0 });
      if (mobile) document.body.style.overflow = "hidden";
    } else if (was !== null && active === null) {
      document.body.style.overflow = "";
      window.scrollTo({ top: lvl1Scroll.current });
    }
  }, [active]);

  // Säkerhet: om komponenten avmonteras medan overlayn är öppen (t.ex. tillbaka-knappen
  // mitt i bandredigeringen) – återställ alltid bakgrundsscrollen.
  useEffect(() => () => { document.body.style.overflow = ""; }, []);

  // Konfiguratorn har egen köpribba – dölj den globala headern medan den är öppen,
  // och börja alltid längst upp (nollställ scrollpositionen) när man kliver in.
  useEffect(() => {
    document.body.classList.add("hide-site-header");
    window.scrollTo(0, 0);
    return () => document.body.classList.remove("hide-site-header");
  }, []);

  // Mät den fasta köpribbans höjd. Ribban ligger nu i toppen på både mobil och desktop,
  // så både verktygsraden i bilden och (på desktop) valpanelen måste börja under den.
  const buyBarRef = useRef<HTMLDivElement>(null);
  const [barH, setBarH] = useState(0);
  const [isLg, setIsLg] = useState(false);
  useLayoutEffect(() => {
    const el = buyBarRef.current;
    if (!el) return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => { setBarH(el.getBoundingClientRect().height); setIsLg(mq.matches); };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    mq.addEventListener("change", update);
    return () => { ro.disconnect(); mq.removeEventListener("change", update); };
  }, []);
  // Verktygsraden i bilden börjar alltid strax under ribban (mobil + desktop). Valpanelen
  // ligger bredvid bilden bara på desktop – på mobil scrollar den under bilden och behöver
  // därför ingen offset.
  const toolbarPadTop = barH > 0 ? barH + (isLg ? 24 : 12) : undefined;
  const panelPadTop = isLg && barH > 0 ? barH + 24 : undefined;

  // Redigeringsläget (nivå 2) nås genom att klicka på en rad/kolumn i bilden. Bilden zoomar
  // då in på det bandet, och man stegar mellan banden med steppern i panelhuvudet. Att lägga
  // till en rad/kolumn sker via "Lägg till"-knapparna i helhetsvyn (de göms i det inzoomade
  // läget) – därför ingen +-knapp i steppern.

  const validHandles = HANDLES;
  const handleId = validHandles.some((h) => h[0] === S.handle) ? S.handle : validHandles[0][0];

  // Per-kolumn-höjd (ojämn/trappstegs-topp) är en TV-möbel-funktion – i övriga typer
  // hålls kolumnerna på Form-defaultens enhetliga höjd. Se Konfigurationsval.md.
  const perColHeight = S.axis === "kolumn" && S.category === "tvbank";
  const widthCm = realW(S.cols);
  const colHeights = S.axis === "kolumn" ? Array.from({ length: S.cols }, (_, ci) => colHeight(S, ci)) : [];
  const heightCm = perColHeight ? cellsToCm(Math.max(1, ...colHeights)) : realH(S.rows);
  // Mått för det inzoomade bandet (nivå 2). Rad: möbelns bredd × radens höjd. Kolumn: en
  // modulbredd × kolumnens höjd. null → helhetens mått (nivå 1).
  const bandDims = (() => {
    if (active === null || !stage.band) return null;
    if (S.axis === "kolumn")
      return active < S.cols
        ? { rect: stage.band, width: `${realW(1)} cm`, height: `${perColHeight ? cellsToCm(colHeights[active]) : heightCm} cm` }
        : null;
    const row = S.rows[active];
    return row ? { rect: stage.band, width: `${widthCm} cm`, height: `${row.h} cm` } : null;
  })();
  let closed = 0;
  allCells(S).forEach((c) => c.type !== "o" && (closed += c.span));
  const priceNum =
    S.cols * S.rows.length * 650 +
    closed * 420 +
    (S.mount === "staende" ? 500 : 0) +
    (S.material === "ek" ? 1200 : 0) +
    (S.front === "glass" ? 900 : S.front === "slats" ? 500 : 0) +
    (handleId === "push" ? 400 : handleId === "h3" ? 250 : handleId === "h2" ? 150 : 0);
  const price = priceNum.toLocaleString("sv-SE");
  // Ordinarie pris så att kampanjpriset är exakt 30 % rabatt (pris = 0,7 × ordinarie),
  // avrundat till jämna 5 kr – matchar "−30%"-badgen i köpribban.
  const listPriceNum = Math.round(priceNum / 0.7 / 5) * 5;
  const listPrice = listPriceNum.toLocaleString("sv-SE");

  const curStyle = STYLES.find((style) => style.id === S.style);
  // väggmonterad: golvet och rummet står stilla – hyllan lyfts i stället upp och hängs
  // på väggen. `lift` är hur långt hyllan flyttas upp; golvlinjen kompenseras med +lift
  // nedan så den ligger kvar på samma plats (annars skulle golvet följa med uppåt).
  const lift = S.mount === "vagg" ? 40 : 0;
  // skala miljön efter hyllans verkliga höjd: golvlinjen ligger vid hyllans bas
  // (+ lyftet när hyllan hänger – golvet ska ligga kvar även när hyllan skjuts upp).
  // Lyftet är i hyllans egna pixlar, så det måste följa kamerans inzoomning (stage.z) –
  // annars glider golvet ur läge när bilden zoomar in på ett band i en väggmonterad hylla.
  const pxPerCm = stage.h > 0 && heightCm > 0 ? stage.h / heightCm : 0;
  const floorY = stage.y + stage.h + lift * stage.z;
  // dekor för att antyda ett rum och ge skala – växt till vänster, golvlampa till höger
  const plantPx = pxPerCm * 130;
  const plantW = plantPx * (100 / 300);
  const plantLeft = Math.max(16, stage.x * 0.5 - plantW / 2);
  const lampPx = pxPerCm * 165;
  const lampW = lampPx * (90 / 300);
  const lampLeft = stage.x + stage.w + stage.x * 0.5 - lampW / 2;
  const curColor = COLORS[S.material].find((c) => c[0] === S.color) || COLORS[S.material][0];
  const curLeg = LEGS.find((l) => l[0] === S.leg) || LEGS[0];
  const curHandle = HANDLES.find((h) => h[0] === handleId)!;
  // Summeringens värden bygger på faktiska val.
  const colorName = displayColorName(curColor[1], S.material);
  const frontLabel = hasFronts(S) ? FRONT_LABEL[S.front] : null;
  const handleName = curHandle[1];
  const depthCm = 40; // Anamosa-modulernas djup
  const categoryName = CATEGORIES.find((c) => c.id === S.category)?.name ?? "Hylla";
  const ribbonDims = `B${widthCm} × H${heightCm} × D${depthCm} cm`;
  const tillvalItems = TILLVAL_PRODUCTS
    .filter((p) => addedTillval.has(p.id))
    .map((p) => ({ product: p, qty: addedTillval.get(p.id)! }));

  // Redigeringspanelen (nivå 2) för aktivt band. Samma innehåll på desktop (inbyggd i
  // sidopanelen) och mobil (i en overlay över grundvalen) – overlay-flaggan byter bara
  // panelhuvudets tillbaka-affordans (pil på desktop, kryss-raden i overlayn på mobil).
  const bandPanel = (overlay: boolean) => (
    <BandPanel
      S={S}
      index={active as number}
      overlay={overlay}
      handle={handleId}
      onSetHandle={(v) => set({ handle: v })}
      onSelect={setActive}
      onEditRow={editRow}
      onEditCol={editCol}
      onRemoveRow={(i) => { removeRow(i); backToLevel1(); }}
      onRemoveCol={(i) => { removeCol(i); backToLevel1(); }}
      onBack={backToLevel1}
    />
  );
  // Verktygen delas mellan desktop (inline-rad) och mobil (hopfälld meny).
  // keepOpen: verktyg som bara ger direkt feedback på hyllan (visa miljö/mått) låter
  // mobilmenyn stå kvar öppen; ett verktyg som öppnar egen yta sätter false och stänger menyn.
  const tools = [
    { label: "Visa miljö", icon: <Sofa size={18} />, active: showScene, onClick: () => setShowScene((v) => !v), keepOpen: true },
    { label: "Visa mått", icon: <Ruler size={18} />, active: showDims, onClick: () => setShowDims((v) => !v), keepOpen: true },
  ];

  return (
    <>
    <main className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-12">
      {/* ---- förhandsvisning (8 av 12 kolumner) ---- */}
      {/* mobil: 40svh sticky bild överst, konfiguration (60%) scrollar under. desktop: 8/12-kolumn, full höjd. */}
      {/* Mobil under bandredigering: bilden pinnas till viewportens topp (fixed) så den
          tilar exakt med overlayns top-[50svh] – annars trycker det globala sidhuvudet
          (ej sticky) ner bilden och overlayn glider upp över dess nederkant. Desktop och
          grundvyn behåller sticky-beteendet. */}
      <section className={`z-20 bg-muted lg:col-span-8 lg:h-screen lg:self-start ${
        active !== null
          ? "fixed inset-x-0 top-0 h-[50svh] lg:sticky lg:inset-x-auto lg:top-0 lg:h-screen"
          : "relative sticky top-0 h-[50svh]"
      }`}>
        {/* ---- topp-rad / verktyg ---- */}
        {/* Ribban ligger fast i toppen (mobil + desktop) → verktygsraden börjar strax under
            den. På desktop ger samma offset som valpanelen att tillbaka/ikonknappar linjerar
            med titeln "Stil". */}
        <div
          className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4 lg:px-6 lg:pb-6"
          style={toolbarPadTop !== undefined ? { paddingTop: toolbarPadTop } : undefined}
        >
          <button
            onClick={() => (onBack ? onBack() : typeof window !== "undefined" && window.history.back())}
            className="group flex items-center gap-3"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity duration-fast group-hover:opacity-90">
              <ArrowLeft size={14} />
            </span>
            <Text variant="body" className="font-semibold">Tillbaka</Text>
          </button>
          {/* desktop: verktygen inline i toppen. mobil: hopfällda i nedre vänstra
              hörnet – se mer-knappen längre ner i sektionen. */}
          <div className="hidden items-center gap-2 lg:flex">
            {tools.map((t) => (
              <ToolButton key={t.label} label={t.label} active={t.active} onClick={t.onClick}>
                {t.icon}
              </ToolButton>
            ))}
          </div>
        </div>

        <div ref={wrapRef} className="relative h-full">
          {stage.w > 0 && (
            <Scene
              stage={stage}
              floorY={floorY}
              plantPx={plantPx}
              plantLeft={plantLeft}
              lampPx={lampPx}
              lampLeft={lampLeft}
              showRoom={showScene}
              lift={lift}
            />
          )}
          <div className="relative z-10 flex h-full items-end justify-center overflow-hidden px-8 pb-14 pt-20 md:px-16 md:pb-[120px] md:pt-28">
            {/* hyllan bottenankras 120px från nederkanten och växer uppåt */}
            <Shelf S={S} handleId={handleId} frame={frameColor()} active={active} hovered={hovered} onHover={setHovered} onOpen={openBand} wrapRef={wrapRef} onMeasure={setStage} lift={lift} />
          </div>
          {/* Lägg-till-knapparna gäller hela möbeln och göms medan bilden är inzoomad på ett
              band (nivå 2) – där skulle de dessutom ligga utanför bild. Man lägger till rader
              och kolumner i helhetsvyn, ett klick bort via "Gå tillbaka". */}
          {stage.w > 0 && active === null && (
            <>
              <AddButton className="-translate-x-1/2 translate-y-[calc(-100%-24px)]" style={{ left: stage.x + stage.w / 2, top: stage.y, transition: stageMove(stage.glide, "left", "top") }} label="Lägg till rad" onClick={() => setRows(S.rows.length + 1)} />
              <AddButton className="-translate-y-1/2 translate-x-6" style={{ left: stage.x + stage.w, top: stage.y + stage.h / 2, transition: stageMove(stage.glide, "left", "top") }} label="Lägg till kolumn" onClick={() => setCols(S.cols + 1)} />
            </>
          )}
          {/* Måttlinjer: hela möbeln i helhetsvyn – det inzoomade bandets egna mått i nivå 2.
              Samma komponent i båda fallen, så linjerna GLIDER mellan helheten och bandet i
              takt med kameran istället för att hoppa. */}
          {showDims && stage.w > 0 && (
            <Dims
              rect={bandDims?.rect ?? stage}
              glide={stage.glide}
              width={bandDims?.width ?? `${widthCm} cm`}
              height={bandDims?.height ?? `${heightCm} cm`}
            />
          )}
        </div>

        {/* mobil: verktygen hopfällda i nedre vänstra hörnet bakom en mer-knapp. Knapparna
            fälls ut uppåt som en kolumn när man trycker; bakgrundsklick stänger menyn igen.
            Knapparna är alltid monterade och tonas/glider med en transition (spring vid
            öppning, mjuk in-easing vid stängning) så både ut- och infällning blir smidig.
            Stäng-stegningen är omvänd så den närmast mer-knappen försvinner sist.
            Göms medan bilden är inzoomad på ett band (nivå 2): då ska bara bandet vara i
            fokus, inte vyinställningar för hela möbeln. */}
        <div className={`absolute bottom-4 left-4 z-20 lg:hidden ${active !== null ? "hidden" : ""}`}>
          {toolsOpen && (
            <button
              aria-hidden
              tabIndex={-1}
              onClick={() => setToolsOpen(false)}
              className="fixed inset-0 -z-10 cursor-default"
            />
          )}
          <div className="absolute bottom-full left-0 mb-2 flex flex-col-reverse items-start gap-2">
            {tools.map((t, i) => (
              <div
                key={t.label}
                style={{
                  opacity: toolsOpen ? 1 : 0,
                  transform: toolsOpen ? "none" : "translateY(12px) scale(0.7)",
                  transformOrigin: "bottom left",
                  pointerEvents: toolsOpen ? "auto" : "none",
                  transition: toolsOpen
                    ? "opacity 200ms ease-out, transform 340ms cubic-bezier(0.34, 1.56, 0.64, 1)"
                    : "opacity 160ms ease-in, transform 200ms cubic-bezier(0.4, 0, 1, 1)",
                  // stegning: öppning nerifrån och upp, stängning uppifrån och ned
                  transitionDelay: `${(toolsOpen ? i : tools.length - 1 - i) * 45}ms`,
                }}
              >
                <ToolButton
                  label={t.label}
                  active={t.active}
                  onClick={() => {
                    t.onClick?.();
                    if (!t.keepOpen) setToolsOpen(false);
                  }}
                >
                  {t.icon}
                </ToolButton>
              </div>
            ))}
          </div>
          <ToolButton
            label={toolsOpen ? "Stäng verktyg" : "Fler verktyg"}
            active={toolsOpen}
            onClick={() => setToolsOpen((v) => !v)}
          >
            <span
              className="transition-transform duration-base ease-default"
              style={{ transform: toolsOpen ? "rotate(90deg)" : "none" }}
            >
              {toolsOpen ? <X size={18} /> : <MoreHorizontal size={18} />}
            </span>
          </ToolButton>
        </div>
      </section>

      {/* ---- panel (4 av 12 kolumner) ---- */}
      {/* ingen egen scroll – hela sidan scrollar valen medan bilden ligger fast (sticky).
          pt kompenserar för den fasta köpribban så tabbarna inte hamnar under den.
          min-h-screen: bandpanelen (nivå 2) är mycket kortare än nivå 1 – utan minsta höjd
          skulle Tillval glida upp nästan direkt när man scrollar mitt i bandredigeringen.
          i nivå 2 pinnas innehållet (sticky) så att en scroll nedåt inte lämnar en tom yta
          – valen följer med tills hela panelen scrollas förbi mot Tillval. */}
      <aside className="bg-card lg:col-span-4 lg:min-h-screen">
        {/* mjuk uttoning i toppen av valen där de möter bilden – sticky vid sömmen */}
        <div aria-hidden className="pointer-events-none sticky top-[50svh] z-30 -mb-10 h-10 bg-gradient-to-b from-card to-transparent lg:top-0" />
        <div
          className={`p-4 pb-6 lg:p-6 lg:pb-6 ${active !== null ? "lg:sticky lg:top-0" : ""}`}
          style={panelPadTop !== undefined ? { paddingTop: panelPadTop } : undefined}
        >
          {/* Desktop: nivå 2 ersätter grundvalen i sidopanelen (steppern sköter navigeringen).
              Mobil: nivå 2 visas i en overlay längst ner i fragmentet – grundvalen ligger kvar. */}
          {active !== null && (
            <div key="lvl2" className="hidden panel-enter-right lg:block">
              {bandPanel(false)}
            </div>
          )}
          {/* Grundvalen: alltid i DOM på mobil (overlayn läggs ovanpå), döljs på desktop under redigering. */}
          <div key="lvl1" className={`panel-enter-left ${active !== null ? "lg:hidden" : ""}`}>
          <PanelSection title="Stil">
            <StylePicker S={S} onPick={pickStyle} />
            <SelectionCopy
              title={curStyle?.name ?? "Mosaik"}
              desc={curStyle?.desc ?? "Olika stora fack i en fri komposition."}
            />
          </PanelSection>

          <PanelSection title="Storlek">
            <Range label="Bredd" value={S.cols} max={COLMAX} pill={`${widthCm} cm`} onSet={setCols} />
            {perColHeight ? (
              <Range label="Höjd" value={S.rows.length} max={ROWMAX} pill={`${cellsToCm(S.rows.length)} cm`} onSet={setRows} />
            ) : (
              <Range label="Höjd" value={layoutToHeightStep(S.rows)} max={HEIGHT_STEPS} pill={`${heightCm} cm`} onSet={setHeight} />
            )}
          </PanelSection>

          <PanelSection title="Montering">
            <ButtonGroup
              options={[
                ["staende", "Stående"],
                ["vagg", "Väggmonterad"],
              ]}
              value={S.mount}
              onSet={(v) => set({ mount: v as State["mount"] })}
            />
          </PanelSection>

          {S.mount === "staende" && (
            <PanelSection title="Ben">
              <LegPicker value={S.leg} onSet={(v) => set({ leg: v })} />
              <SelectionCopy title={curLeg[1]} desc={curLeg[2]} />
            </PanelSection>
          )}

          <PanelSection title="Material">
            <ButtonGroup
              className="mb-5"
              options={[
                ["ek", "Ek"],
                ["laminat", "Laminat"],
              ]}
              value={S.material}
              onSet={(v) => set({ material: v as State["material"], color: COLORS[v as State["material"]][0][0] })}
            />
            <MaterialPicker colors={COLORS[S.material]} value={S.color} onSet={(color) => set({ color })} />
            <SelectionCopy title={displayColorName(curColor[1], S.material)} desc={curColor[2]} />
          </PanelSection>

          {hasFronts(S) && (
            <PanelSection title="Frontstil">
              <FrontPicker value={S.front} onSet={(front) => setS((s) => ({ ...s, front, rows: s.rows.map((row) => ({ ...row, front, cells: row.cells?.map((c) => ({ ...c, front })) })) }))} />
              <SelectionCopy title={FRONT_LABEL[S.front]} desc={frontDescription(S.front)} />
            </PanelSection>
          )}

          {hasFronts(S) && (
            <PanelSection title="Beslag">
              <HandlePicker options={validHandles} value={handleId} onSet={(v) => set({ handle: v })} />
              <SelectionCopy title={curHandle[1]} desc={curHandle[2]} />
            </PanelSection>
          )}
          </div>
        </div>
      </aside>
    </main>

    {/* Mobil: redigeringen (nivå 2) som overlay över grundvalen. Ligger under den sticky
        bilden (top-[50svh]) så man ser bygget uppdateras. Rundade topphörn och ett
        stängkryss i panelhuvudet (i BandStepper) längst till höger. */}
    {active !== null && (
      <div className="no-scrollbar sheet-enter fixed inset-x-0 bottom-0 top-[50svh] z-50 overflow-y-auto rounded-t-2xl bg-card shadow-[0_-8px_24px_rgba(0,0,0,0.12)] lg:hidden">
        <div className="px-4 pb-8">
          {bandPanel(true)}
        </div>
      </div>
    )}

    {/* Tillval: fullskärm efter handtagssteget – rekommenderade tillbehör till
        den byggda hyllan, filtrerbara per kategori. */}
    <Tillval added={addedTillvalIds} onToggle={toggleTillval} />

    {/* Summering: "Färdig!" – stor bild av bygget + varukorg med valda produkter. */}
    <Summary
      cartRef={cartRef}
      S={S}
      handleId={handleId}
      frame={frameColor()}
      colorName={colorName}
      frontLabel={frontLabel}
      handleName={handleName}
      widthCm={widthCm}
      heightCm={heightCm}
      depthCm={depthCm}
      priceNum={priceNum}
      listPriceNum={listPriceNum}
      tillval={tillvalItems}
      onSetTillvalQty={setTillvalQty}
    />

    {/* Fast köpribba – följer med över konfigurator + tillval, döljs vid summeringen.
        Ligger fast i toppen på både mobil och desktop; glider upp ur vy när den döljs. */}
    <div
      ref={buyBarRef}
      className={`fixed inset-x-0 top-0 z-40 border-b border-border bg-card transition-transform duration-300 ease-out ${
        showBuyBar ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {/* remsan går kant till kant; innehållet hålls till max-bredden som sidhuvudet */}
      <div className="mx-auto flex w-full max-w-content items-center justify-between gap-4 px-4 py-3 md:px-6 lg:py-4">
        <div className="min-w-0">
          <Text variant="body" className="text-lg font-semibold leading-tight lg:text-xl">Anamosa</Text>
          <Text variant="small" className="truncate text-muted-foreground">{categoryName}, {ribbonDims}</Text>
        </div>
        <div className="shrink-0 text-right">
          <div className="flex items-center justify-end gap-2">
            <span className="bg-sale px-1.5 py-1 font-body text-sm font-medium leading-none text-sale-foreground">−30%</span>
            <span className="font-heading text-xl font-medium leading-none text-sale lg:text-2xl">
              <RollingPrice value={`${price}:-`} />
            </span>
            <span className="relative font-heading text-xl font-medium leading-none text-muted-foreground lg:text-2xl">
              <RollingPrice value={`${listPrice}:-`} />
              <span className="pointer-events-none absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-current" />
            </span>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

/* ---------- summering ("Färdig! Så här blev din Anamosa") ---------- */

// Leveransval som kan läggas till i varukorgen (läggs på totalen).
const DELIVERY = {
  leverans: { label: "Hemleverans", price: 595 },
  montering: { label: "Hemleverans + montering", price: 1195 },
} as const;
type DeliveryKey = keyof typeof DELIVERY;

// Nedbrytning per band (rad eller kolumn) till summeringens specifikation: höjd + vad
// bandet innehåller (luckor, lådor, öppna fack med ev. hyllplan, samt frontstil).
function bandBreakdown(S: State): { title: string; desc: string }[] {
  const frontWord: Record<Front, string> = { plain: "släta fronter", slats: "ribbade fronter", glass: "glasfronter" };
  const describe = (cells: { type: CellType; front: Front }[], shelves: number, heightCm: number) => {
    const l = cells.filter((c) => c.type === "l").length;
    const d = cells.filter((c) => c.type === "d").length;
    const o = cells.filter((c) => c.type === "o").length;
    const parts: string[] = [];
    if (l) parts.push(`${l} ${l === 1 ? "lucka" : "luckor"}`);
    if (d) parts.push(`${d} ${d === 1 ? "låda" : "lådor"}`);
    if (o) parts.push(`${o} öppna fack${shelves ? ` med ${shelves} hyllplan` : ""}`);
    const fronts = [...new Set(cells.filter((c) => c.type !== "o").map((c) => c.front))];
    if (fronts.length === 1) parts.push(frontWord[fronts[0]]);
    else if (fronts.length > 1) parts.push("blandade fronter");
    return `${heightCm} cm · ${parts.join(", ") || "öppet"}`;
  };
  if (S.axis === "kolumn") {
    return Array.from({ length: S.cols }, (_, ci) => {
      const def = S.colDefs?.[ci] ?? { doors: "none" as Amount, drawers: "none" as Amount };
      const n = colHeight(S, ci);
      const cells = fillColumn(def, n).map((type) => ({ type, front: S.front }));
      return { title: `Kolumn ${ci + 1}`, desc: describe(cells, def.shelves ?? 0, cellsToCm(n)) };
    });
  }
  return S.rows.map((row, i) => ({
    title: `Rad ${i + 1}`,
    desc: describe(rowCells(row, S.cols).map((c) => ({ type: c.type, front: c.front })), row.shelves, row.h),
  }));
}

function Summary({
  cartRef, S, handleId, frame, colorName, frontLabel, handleName, widthCm, heightCm, depthCm, priceNum, listPriceNum, tillval, onSetTillvalQty,
}: {
  cartRef?: React.Ref<HTMLElement>;
  S: State; handleId: string; frame: string; colorName: string;
  frontLabel: string | null; handleName: string;
  widthCm: number; heightCm: number; depthCm: number;
  priceNum: number; listPriceNum: number;
  tillval: { product: TillvalProduct; qty: number }[];
  onSetTillvalQty: (id: string, qty: number) => void;
}) {
  // egen mätning av hyllans rektangel för att placera scenens golv (som i förhandsvisningen).
  const wrapRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<Stage>(NO_STAGE);
  // valt leveransalternativ (ömsesidigt uteslutande, kan avmarkeras).
  const [delivery, setDelivery] = useState<DeliveryKey | null>(null);
  // väggmonterad: hyllan lyfts upp på väggen (golvet står kvar) som i förhandsvisningen
  const lift = S.mount === "vagg" ? 40 : 0;
  const pxPerCm = stage.h > 0 && heightCm > 0 ? stage.h / heightCm : 0;
  // stage.z är alltid 1 här (summeringen har ingen bandredigering) – samma formel som i
  // förhandsvisningen så golvlinjen räknas ut på ett ställe i koden.
  const floorY = stage.y + stage.h + lift * stage.z;
  const plantPx = pxPerCm * 130;
  const plantW = plantPx * (100 / 300);
  const plantLeft = Math.max(16, stage.x * 0.5 - plantW / 2);
  const lampPx = pxPerCm * 165;
  const lampW = lampPx * (90 / 300);
  const lampLeft = stage.x + stage.w + stage.x * 0.5 - lampW / 2;

  // totaler: erbjudandepris (hyllan + halva priset på tillval) mot ordinarie pris.
  // Leverans läggs på totalen men ingår inte i kampanjrabatten.
  const tillvalOffer = tillval.reduce((a, { product, qty }) => a + offerAmount(product) * qty, 0);
  const tillvalOrd = tillval.reduce((a, { product, qty }) => a + product.price * qty, 0);
  const deliveryCost = delivery ? DELIVERY[delivery].price : 0;
  const productsTotal = priceNum + tillvalOffer;
  const ordinarie = listPriceNum + tillvalOrd;
  const rabatt = productsTotal - ordinarie;
  const total = productsTotal + deliveryCost;

  const dims = `B${widthCm} × H${heightCm} × D${depthCm} cm`;
  // specifikationslista till "Om produkten".
  const materialLabel = S.material === "ek" ? "Massiv ek" : "Laminat";
  const specList: [string, string][] = [
    ["Bredd", `${widthCm} cm`],
    ["Höjd", `${heightCm} cm`],
    ["Djup", `${depthCm} cm`],
    ["Material", materialLabel],
    ["Färg", colorName],
    // Front + beslag är bara relevanta när möbeln har luckor/lådor (frontLabel null annars).
    ...(frontLabel ? ([["Front", frontLabel], ["Beslag", handleName]] as [string, string][]) : []),
  ];
  // nedbrytning per rad/kolumn – vad som ingår i varje band.
  const bands = bandBreakdown(S);
  const bandsTitle = S.axis === "kolumn" ? "Kolumner" : "Rader";
  // löptext med alla val: färg, ev. front, beslag och mått.
  const specs = [
    colorName,
    frontLabel ? `${frontLabel.toLowerCase()} front` : null,
    frontLabel ? handleName.toLowerCase() : null,
    dims,
  ].filter(Boolean).join(", ");

  return (
    <section className="w-full bg-white pb-16 pt-12 lg:pt-16">
      {/* rubrik i full bredd ovanför – så bild och varukorg börjar på samma höjd på desktop */}
      <div className="mb-6 flex flex-col gap-0 px-4 md:px-6 lg:mb-8 lg:px-6">
        <Heading level="display-md" className="leading-[0.9]">Färdig! Så här blev din Anamosa</Heading>
        <Text variant="lead" className="text-muted-foreground">{specs}</Text>
      </div>
      <div className="grid grid-cols-1 gap-8 px-4 md:px-6 lg:grid-cols-12 lg:items-start lg:gap-x-6 lg:px-6">
        {/* vänster: stor bild av bygget + mer information om produkten */}
        <div className="flex flex-col gap-8 lg:col-span-8">
          <div ref={wrapRef} className="relative h-[340px] w-full overflow-hidden bg-muted sm:h-[420px] lg:h-[600px]">
            {stage.w > 0 && (
              <Scene stage={stage} floorY={floorY} plantPx={plantPx} plantLeft={plantLeft} lampPx={lampPx} lampLeft={lampLeft} showRoom lift={lift} />
            )}
            <div className="pointer-events-none relative z-10 flex h-full items-end justify-center overflow-hidden px-8 pb-14 pt-16 md:px-16 md:pb-[110px] md:pt-24">
              <Shelf S={S} handleId={handleId} frame={frame} active={null} hovered={null} onHover={() => {}} onOpen={() => {}} wrapRef={wrapRef} onMeasure={setStage} lift={lift} />
            </div>
          </div>
          <ProductInfo spec={specList} bands={bands} bandsTitle={bandsTitle} />
        </div>

        {/* höger: varukorg – sticky till höger på desktop */}
        <aside ref={cartRef} className="flex flex-col gap-4 border border-border p-4 lg:col-span-4 lg:sticky lg:top-6 lg:self-start lg:p-6">
          <div className="flex flex-col gap-4">
            <Heading level="h2" className="text-2xl leading-none lg:text-3xl">Varukorg</Heading>
            <div>
              {/* hyllan */}
              <CartRow
                thumb={<div className="flex h-14 w-14 items-center justify-center"><MiniShelf rows={S.rows} cols={S.cols} /></div>}
                name="Anamosa"
                desc={`${colorName} · ${dims}`}
                price={formatKr(priceNum)}
              />
              {/* valda tillval – går att justera antal och ta bort */}
              {tillval.map(({ product: p, qty }) => (
                <CartRow
                  key={p.id}
                  thumb={
                    <div className="relative h-14 w-14 shrink-0 bg-white">
                      <Image src={p.image} alt={p.name} fill sizes="56px" className="object-contain p-1" />
                    </div>
                  }
                  name={p.name}
                  desc={p.details}
                  price={formatKr(offerAmount(p) * qty)}
                  qty={qty}
                  onInc={() => onSetTillvalQty(p.id, qty + 1)}
                  onDec={() => onSetTillvalQty(p.id, qty - 1)}
                />
              ))}
              {/* valt leveransalternativ – som egen rad, går att ta bort */}
              {delivery && (
                <CartRow
                  thumb={<div className="flex h-14 w-14 shrink-0 items-center justify-center bg-secondary"><Truck size={22} /></div>}
                  name={DELIVERY[delivery].label}
                  desc={delivery === "montering" ? "Leverans och montering hemma" : "Leverans hem till dörren"}
                  price={formatKr(deliveryCost)}
                  onRemove={() => setDelivery(null)}
                />
              )}
            </div>

            {/* leverans – visas tills ett alternativ valts (då ligger det som rad i varukorgen) */}
            {!delivery && (
              <div className="flex flex-col gap-2">
                <Heading level="h4" as="h3" className="text-xl leading-5">Leverans</Heading>
                <div className="border border-border">
                  {(Object.keys(DELIVERY) as DeliveryKey[]).map((key, i) => (
                    <DeliveryOption
                      key={key}
                      label={DELIVERY[key].label}
                      price={DELIVERY[key].price}
                      selected={false}
                      divider={i > 0}
                      onToggle={() => setDelivery(key)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* totaler – ordinarie pris och rabatt först, totalen som slutsumma underst */}
            <div className="flex flex-col gap-2 py-2">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-4">
                  <Text variant="small" className="flex-1">Ordinarie pris</Text>
                  <Text variant="body">{formatKr(ordinarie)}</Text>
                </div>
                {rabatt < 0 && (
                  <div className="flex items-center gap-4 text-sale">
                    <Text variant="small" className="flex-1">Rabatt</Text>
                    <Text variant="body">{formatKr(rabatt)}</Text>
                  </div>
                )}
              </div>
              <div className="h-px w-full bg-border" />
              <div className="flex items-center gap-4 font-heading text-xl font-medium leading-5">
                <span className="flex-1">Totalt</span>
                <span>{formatKr(total)}</span>
              </div>
            </div>
          </div>

          {/* köp + leverans */}
          <div className="flex flex-col gap-2">
            <button className="flex w-full items-center justify-center bg-primary px-6 py-3 font-body text-lg font-semibold text-primary-foreground rounded-button transition-opacity duration-fast hover:opacity-90 active:opacity-80">
              Fortsätt till kassan
            </button>
            {/* lagerstatus – online + butik (Figma: StockStatusContainer) */}
            <div className="flex flex-col border border-border">
              {/* online */}
              <div className="flex flex-col gap-1.5 bg-card px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="flex w-4 shrink-0 items-center justify-center">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#00814c" }} />
                  </span>
                  <Text variant="body" className="flex-1">Byggs på beställning</Text>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="flex w-4 shrink-0 items-center justify-center"><Truck size={14} /></span>
                  <Text variant="body" className="flex-1">Levereras inom 2–4 veckor, från 49:-</Text>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

// Ett leveransalternativ (Figma: PairsWithCardPart). Namn + pris till vänster,
// rund lägg-till-knapp till höger. Vald visar bock; klick igen avmarkerar.
function DeliveryOption({
  label, price, selected, divider, onToggle,
}: {
  label: string; price: number; selected: boolean; divider: boolean; onToggle: () => void;
}) {
  return (
    <div className={`flex items-center gap-3 bg-card p-4 ${divider ? "border-t border-border" : ""} ${selected ? "bg-accent" : ""}`}>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Text variant="body" className="truncate font-medium">{label}</Text>
        <span className="font-heading text-2xl font-medium leading-6 tracking-tight">{formatKr(price)}</span>
      </div>
      <button
        onClick={onToggle}
        aria-pressed={selected}
        aria-label={selected ? `Ta bort ${label}` : `Lägg till ${label}`}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity duration-fast hover:opacity-90 active:opacity-80"
      >
        {selected ? <Check size={16} /> : <Plus size={16} />}
      </button>
    </div>
  );
}

function CartRow({ thumb, name, desc, price, onRemove, qty, onInc, onDec }: {
  thumb: React.ReactNode; name: string; desc: string; price: string;
  onRemove?: () => void;
  // antal + stegning – när dessa finns visas en stepper (tillval).
  qty?: number; onInc?: () => void; onDec?: () => void;
}) {
  const hasQty = qty != null && onInc && onDec;
  return (
    <div className="flex items-center gap-3 border-b border-border py-4">
      <div className="shrink-0">{thumb}</div>
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <div>
          <Text variant="body" className="font-medium">{name}</Text>
          <Text variant="small" className="text-muted-foreground">{desc}</Text>
        </div>
        <div className="flex items-end gap-2">
          <span className="flex-1 font-heading text-xl font-medium leading-5">{price}</span>
          {hasQty ? (
            <div className="flex items-center border border-border">
              <button onClick={onDec} aria-label={qty === 1 ? "Ta bort" : "Minska antal"} className="flex h-7 w-7 items-center justify-center text-foreground transition-colors duration-fast hover:bg-accent">
                <Minus size={14} />
              </button>
              <span className="min-w-7 text-center font-body text-sm font-medium leading-none">{qty}</span>
              <button onClick={onInc} aria-label="Öka antal" className="flex h-7 w-7 items-center justify-center text-foreground transition-colors duration-fast hover:bg-accent">
                <Plus size={14} />
              </button>
            </div>
          ) : onRemove ? (
            <button onClick={onRemove} className="font-body text-sm leading-5 text-muted-foreground underline">Ta bort</button>
          ) : (
            <Text variant="small">1 st</Text>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- panel UI ---------- */

export function PanelSection({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <section className="mt-10 first:mt-8 lg:mt-16 lg:first:mt-0">
      <div className="mb-4 lg:mb-5">
        <Heading level="h2" className="text-[22px] leading-none lg:text-[2rem]">{title}</Heading>
      </div>
      {children}
    </section>
  );
}

export function SelectionCopy({ title, desc, note }: { title: string; desc: string; note?: string }) {
  return (
    // key på titeln: texten glider upp på nytt varje gång valet byts
    <div key={title} className="copy-enter mt-3">
      <Text variant="body" className="font-semibold">{title}</Text>
      <Text className="text-muted-foreground">{desc}</Text>
      {note && <Text variant="caption" className="mt-1 text-muted-foreground">{note}</Text>}
    </div>
  );
}

/* ---------- rullande pris (jackpot-känsla) ---------- */

// Remsa med 0-9 upprepade – lång nog för ett par varvs rullning innan vi normaliserar.
const REEL_DIGITS = Array.from({ length: 60 }, (_, i) => i % 10);

function RollDigit({ char, delayMs }: { char: string; delayMs: number }) {
  const isDigit = char >= "0" && char <= "9";
  // baseRef = senast landade siffra (0-9). offset räknas alltid från denna fasta bas och
  // SÄTTS (ackumuleras aldrig), så det hålls inom remsan även vid snabba drag.
  const baseRef = useRef(isDigit ? Number(char) : 0);
  const settleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [offset, setOffset] = useState(() => (isDigit ? Number(char) : 0));
  const [withTransition, setWithTransition] = useState(true);

  // Snäpp till en normaliserad siffra (0-9) utan animation – samma synliga siffra eftersom
  // remsan upprepar 0-9, så det syns inte. Uppdaterar basen för nästa rullning.
  const settle = (digit: number) => {
    if (settleRef.current) { clearTimeout(settleRef.current); settleRef.current = null; }
    baseRef.current = digit;
    setWithTransition(false);
    setOffset(digit);
  };

  // När siffran ändras: rulla nedåt till målet + ett extra helt varv, räknat från fast bas.
  useEffect(() => {
    if (!isDigit) return;
    const cur = baseRef.current;
    const target = Number(char);
    const advance = ((target - cur + 10) % 10) + 10;
    setWithTransition(true);
    setOffset(cur + advance); // alltid i [10, 19] + cur → långt inom remsan
    // Fallback: normalisera även om onTransitionEnd missas (avbrutna transitions under drag).
    if (settleRef.current) clearTimeout(settleRef.current);
    settleRef.current = setTimeout(() => settle(target), 900 + delayMs);
    return () => { if (settleRef.current) clearTimeout(settleRef.current); };
  }, [char, isDigit, delayMs]);

  const handleEnd = () => { if (isDigit) settle(Number(char)); };
  useEffect(() => {
    if (!withTransition) {
      const id = requestAnimationFrame(() => setWithTransition(true));
      return () => cancelAnimationFrame(id);
    }
  }, [withTransition]);

  if (!isDigit) {
    return (
      <span className="inline-block text-center" style={{ height: "1em", lineHeight: "1em" }}>
        {char === " " ? " " : char}
      </span>
    );
  }

  return (
    <span className="inline-block overflow-hidden align-top" style={{ height: "1em" }}>
      <span
        onTransitionEnd={handleEnd}
        className="flex flex-col"
        style={{
          transform: `translateY(-${offset}em)`,
          transition: withTransition ? "transform 0.85s cubic-bezier(0.16, 1, 0.3, 1)" : "none",
          transitionDelay: withTransition ? `${delayMs}ms` : "0ms",
        }}
      >
        {REEL_DIGITS.map((n, i) => (
          <span key={i} className="block text-center" style={{ height: "1em", lineHeight: "1em" }}>
            {n}
          </span>
        ))}
      </span>
    </span>
  );
}

function RollingPrice({ value }: { value: string }) {
  return (
    <span className="inline-flex items-center" style={{ lineHeight: 1 }}>
      {value.split("").map((ch, i) => (
        <RollDigit key={i} char={ch} delayMs={i * 55} />
      ))}
    </span>
  );
}

function OptionCheck() {
  return (
    <span className="check-in absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
      <Check size={14} strokeWidth={3} />
    </span>
  );
}

// Knappgrupp (button group) enligt Figma: fristående pillar, vald = svart fyllning,
// ovald = ljus yta. Wrappar så vi kan lägga till fler alternativ. Ersätter tabbarna
// på alla val – tabbarna behålls bara för Global ↔ Kolumner/Rader.
export function ButtonGroup({ options, value, onSet, className = "", scroll = false }: {
  options: [string, string][]; value: string; onSet: (v: string) => void; className?: string; scroll?: boolean;
}) {
  return (
    <div className={`flex gap-1 ${scroll ? "no-scrollbar flex-nowrap overflow-x-auto" : "flex-wrap"} ${className}`}>
      {options.map(([v, label]) => {
        const selected = value === v;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onSet(v)}
            aria-pressed={selected}
            className={`flex items-center justify-center rounded-[4px] px-4 py-2 text-base font-medium leading-6 tracking-[-0.2px] transition-[background-color,color,transform] duration-base ease-default active:scale-[0.97] lg:px-6 ${
              scroll ? "shrink-0 whitespace-nowrap" : ""
            } ${
              selected
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-foreground hover:bg-[oklch(0.91_0_0)]"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function TileButton({ selected, label, onClick, children, className = "" }: {
  selected: boolean;
  label: string;
  onClick: () => void;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className={`relative h-[84px] w-[84px] shrink-0 overflow-hidden border bg-card transition-[border-color,transform] duration-base ease-default active:scale-[0.96] ${
        selected ? "border-2 border-primary" : "border-border hover:border-foreground/40"
      } ${className}`}
    >
      {children}
      {selected && <OptionCheck />}
    </button>
  );
}

// Stil-tumnagel i kolumnläge: rita stilens kolumnmönster som en låg, bred silhuett
// (samma cell-modell som MiniShelf förväntar sig).
function colPreviewRows(styleId: string, cols = 4, units = 2): Row[] {
  const defs = applyColStyle(styleId, cols);
  const arrs = defs.map((d) => fillColumn(d, units));
  return Array.from({ length: units }, (_, ri) =>
    r({ h: 40, cells: arrs.map((a, ci) => cellObj(a[ri], 1, "plain", a[ri] === "o" ? defs[ci].shelves ?? 0 : 0)) }),
  );
}

function StylePicker({ S, onPick }: { S: State; onPick: (id: string) => void }) {
  const isCol = S.axis === "kolumn";
  return (
    <div className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto pb-1">
      {STYLES.map((style) => (
        <TileButton key={style.id} label={style.name} selected={S.style === style.id} onClick={() => onPick(style.id)}>
          <span className="flex h-full w-full items-center justify-center text-foreground/70">
            <MiniShelf rows={isCol ? colPreviewRows(style.id) : style.gen(4, [r({}), r({}), r({})])} cols={4} />
          </span>
        </TileButton>
      ))}
      <div className="h-[84px] w-px shrink-0" />
    </div>
  );
}

const LEG_IMAGES: Record<string, string> = {
  ek: "/legs/ek.png",
  valnot: "/legs/valnot.png",
  svart: "/legs/svart.png",
  stal: "/legs/stal.png",
  massing: "/legs/massing.png",
};

function LegPicker({ value, onSet }: { value: string; onSet: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      {LEGS.map(([id, label]) => {
        const img = LEG_IMAGES[id];
        return (
          <TileButton key={id} label={label} selected={value === id} onClick={() => onSet(id)}>
            {img ? (
              <Image src={img} alt={label} fill sizes="84px" className="object-contain p-1" />
            ) : (
              <LegVisual id={id} />
            )}
          </TileButton>
        );
      })}
    </div>
  );
}

const EK_IMAGES: Record<string, string> = {
  "#C9A36A": "/materials/naturlig-ek.png",
  "#DAC7B0": "/materials/vitpigmenterad-ek.png",
  "#6B4F3A": "/materials/morkbetsad-ek.png",
};

function MaterialPicker({ colors, value, onSet }: { colors: [string, string, string][]; value: string; onSet: (color: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      {colors.map(([color, label]) => {
        const img = EK_IMAGES[color];
        return (
          <TileButton key={color} label={label} selected={value === color} onClick={() => onSet(color)}>
            {img ? (
              <Image src={img} alt={label} fill sizes="84px" className="object-cover" />
            ) : (
              <span className="block h-full w-full" style={{ backgroundColor: color }} />
            )}
          </TileButton>
        );
      })}
    </div>
  );
}

const FRONT_IMAGES: Record<Front, string> = {
  plain: "/fronts/slat.png",
  slats: "/fronts/ribbad.png",
  glass: "/fronts/glas.jpeg",
};

export function FrontPicker({ value, onSet, fronts = ["plain", "slats", "glass"] }: {
  value: Front; onSet: (front: Front) => void; fronts?: Front[];
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {fronts.map((front) => {
        const img = FRONT_IMAGES[front];
        return (
          <TileButton key={front} label={FRONT_LABEL[front]} selected={value === front} onClick={() => onSet(front)}>
            {img ? (
              <Image src={img} alt={FRONT_LABEL[front]} fill sizes="84px" className="object-cover" />
            ) : (
              <FrontVisual front={front} />
            )}
          </TileButton>
        );
      })}
    </div>
  );
}

const HANDLE_IMAGES: Record<string, string> = {
  h1: "/handles/traknopp.avif",
  h2: "/handles/knopp.avif",
  h3: "/handles/handtag.webp",
  push: "/handles/push.jpeg",
};

function HandlePicker({ options, value, onSet }: { options: [string, string, string][]; value: string; onSet: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map(([id, label]) => {
        const img = HANDLE_IMAGES[id];
        return (
          <TileButton key={id} label={label} selected={value === id} onClick={() => onSet(id)}>
            {img ? (
              <Image src={img} alt={label} fill sizes="84px" className="object-cover" />
            ) : (
              <HandleVisual id={id} />
            )}
          </TileButton>
        );
      })}
    </div>
  );
}

function WoodVisual({ color }: { color: string }) {
  return (
    <span
      className="block h-full w-full"
      style={{
        backgroundColor: color,
        backgroundImage:
          "radial-gradient(ellipse at 24% 28%, rgba(255,255,255,.30), transparent 38%), repeating-radial-gradient(ellipse at 40% 55%, rgba(70,35,12,.16) 0 1px, transparent 1px 8px), linear-gradient(115deg, rgba(255,255,255,.18), rgba(0,0,0,.10))",
      }}
    />
  );
}

function FrontVisual({ front }: { front: Front }) {
  if (front === "glass") {
    return <span className="block h-full w-full bg-[linear-gradient(135deg,rgba(250,250,250,.74),rgba(114,92,76,.42)),linear-gradient(90deg,#9a6d4f,#6d4933)]" />;
  }
  return (
    <span
      className="block h-full w-full bg-[#bd8c68]"
      style={{
        backgroundImage:
          front === "slats"
            ? "repeating-linear-gradient(90deg, rgba(80,42,22,.45) 0 3px, rgba(232,190,155,.7) 3px 10px), linear-gradient(120deg, rgba(255,255,255,.18), rgba(0,0,0,.14))"
            : "repeating-radial-gradient(ellipse at 35% 50%, rgba(75,40,20,.17) 0 1px, transparent 1px 9px), linear-gradient(120deg, rgba(255,255,255,.18), rgba(0,0,0,.12))",
      }}
    />
  );
}

function HandleVisual({ id }: { id: string }) {
  return (
    <span className="relative block h-full w-full overflow-hidden bg-[#c99d79]">
      <WoodVisual color="#c99d79" />
      {id === "h1" && <span className="absolute left-0 right-0 top-3 h-2 bg-black/75" />}
      {id === "h2" && <span className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d1b28b] shadow" />}
      {id === "h3" && <span className="absolute left-1/2 top-1/2 h-4 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#d1b28b]" />}
    </span>
  );
}

function LegVisual({ id }: { id: string }) {
  const isBall = id.startsWith("klot");
  const dark = id.includes("svart") || id.includes("mork") || id === "valnot";
  const metal = id === "stal";
  const color = metal ? "#d8d8d8" : dark ? "#44291c" : "#c99561";
  return (
    <span className="relative block h-full w-full bg-[radial-gradient(ellipse_at_center,#fff,transparent_60%)]">
      {metal && (
        <span className="absolute left-6 top-4 h-12 w-9 border-l-4 border-t-4 border-[#bfc2c1]">
          <span className="absolute -right-8 -top-1 h-2 w-10 bg-[#a7aaa9]" />
        </span>
      )}
      {!metal && !isBall && (
        <>
          <span className="absolute left-1/2 top-4 h-2 w-10 -translate-x-1/2 bg-[#555]" />
          <span className="absolute left-1/2 top-5 h-14 w-5 -translate-x-1/2 rounded-b-full" style={{ background: color, transform: "translateX(-50%) rotate(-7deg)" }} />
        </>
      )}
      {isBall && <span className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-inner" style={{ background: color }} />}
    </span>
  );
}

export function Range({ label, value, max, pill, onSet }: { label: string; value: number; max: number; pill: string; onSet: (v: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const frac = max > 1 ? (value - 1) / (max - 1) : 0;
  const idxFromX = (clientX: number) => {
    const el = ref.current!;
    const rect = el.getBoundingClientRect();
    const f = Math.max(0, Math.min(1, (clientX - rect.left - 4) / (rect.width - 8)));
    return Math.round(f * (max - 1)) + 1;
  };
  return (
    <div className="mb-8 last:mb-0">
      <Text variant="body" className="mb-2 block">{label}</Text>
      <div
        ref={ref}
        className="relative h-12 w-full touch-none select-none"
        onPointerDown={(e) => {
          dragging.current = true;
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          onSet(idxFromX(e.clientX));
        }}
        onPointerMove={(e) => dragging.current && onSet(idxFromX(e.clientX))}
        onPointerUp={() => (dragging.current = false)}
      >
        <div className="absolute left-1 right-1 top-1/2 h-[2px] -translate-y-1/2 bg-primary" />
        {Array.from({ length: max }, (_, i) => i + 1).map((i) => {
          const f = max > 1 ? (i - 1) / (max - 1) : 0;
          return (
            <span
              key={i}
              className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"
              style={{ left: `calc(4px + (100% - 8px) * ${f})` }}
            />
          );
        })}
        <span
          className="pointer-events-none absolute top-1/2 border border-border bg-card px-3 py-1.5 text-sm font-semibold leading-none transition-[left,transform] duration-fast ease-default"
          style={{ left: `calc(4px + (100% - 8px) * ${frac})`, transform: `translate(${-frac * 100}%, -50%)` }}
        >
          {pill}
        </span>
      </div>
    </div>
  );
}

function ToolButton({ label, active = false, onClick, children }: {
  label: string; active?: boolean; onClick?: () => void; children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      aria-pressed={active}
      onClick={onClick}
      className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-fast ${
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-foreground/40"
      }`}
    >
      {children}
    </button>
  );
}

function AddButton({ style, className = "", label, onClick }: { style: React.CSSProperties; className?: string; label: string; onClick: () => void }) {
  // Knappen placeras från hyllans rektangel via inline left/top. En inline `transition`
  // slår ut klassens färgövergång, så ramfärgen måste in i samma sträng.
  const transition = [style.transition, "border-color 250ms cubic-bezier(0.4, 0, 0.2, 1)"]
    .filter((t) => t && t !== "none").join(", ");
  return (
    <button
      onClick={onClick}
      style={{ ...style, transition }}
      className={`group absolute z-10 flex h-10 items-center overflow-hidden border border-border bg-card rounded-button hover:border-primary ${className}`}
    >
      <span className="flex h-9 w-9 items-center justify-center"><Plus size={18} /></span>
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold opacity-0 transition-all duration-base group-hover:max-w-[180px] group-hover:pr-4 group-hover:opacity-100">
        {label}
      </span>
    </button>
  );
}

export interface Rect { x: number; y: number; w: number; h: number }
// Hyllans rapporterade rektangel (relativt wrap). `glide` säger om hyllan FLYTTAR SIG mjukt
// dit (transform-transition, t.ex. väggmontering eller omskalning) eller snäpper direkt
// (layoutbyte, t.ex. ny rad). Allt som placeras från rektangeln – scenen, plus-knapparna,
// måttlinjerna – följer den flaggan och rör sig därför i takt med hyllan istället för att
// halka efter.
// `z` är kamerans inzoomning (1 = hela möbeln) och `band` det fokuserade bandets rektangel
// i samma koordinater – måttlinjerna i fokusläget hänger på den.
export interface Stage extends Rect { z: number; band: Rect | null; glide: boolean }
const NO_STAGE: Stage = { x: 0, y: 0, w: 0, h: 0, z: 1, band: null, glide: false };
// samma tajming som hyllans egen transform-transition (duration-slow / ease-default)
const STAGE_T = "350ms cubic-bezier(0.4, 0, 0.2, 1)";
const stageMove = (glide: boolean, ...props: string[]) =>
  glide ? props.map((x) => `${x} ${STAGE_T}`).join(", ") : "none";

/* ---------- måttlinjer: bredd under och höjd till vänster om en rektangel ---------- */
// Används både för hela möbeln (nivå 1) och för det inzoomade bandet (nivå 2) – därför tar
// den en rektangel och etiketter, inte state. Följer samma glide-flagga som scenen.
function Dims({ rect, glide, width, height }: { rect: Rect; glide: boolean; width: string; height: string }) {
  const move = (...props: string[]) => stageMove(glide, ...props);
  return (
    <>
      {/* bredd – under */}
      <div className="pointer-events-none absolute z-10" style={{ left: rect.x, top: rect.y + rect.h + 16, width: rect.w, transition: move("left", "top", "width") }}>
        <div className="h-px w-full bg-foreground/40" />
        <span className="absolute left-0 top-0 h-3 w-px -translate-y-1/2 bg-foreground/40" />
        <span className="absolute right-0 top-0 h-3 w-px -translate-y-1/2 bg-foreground/40" />
        <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 border border-border bg-card px-2 py-0.5 text-xs font-semibold">{width}</span>
      </div>
      {/* höjd – till vänster */}
      <div className="pointer-events-none absolute z-10" style={{ left: rect.x - 16, top: rect.y, height: rect.h, transition: move("left", "top", "height") }}>
        <div className="h-full w-px bg-foreground/40" />
        <span className="absolute left-0 top-0 h-px w-3 -translate-x-1/2 bg-foreground/40" />
        <span className="absolute left-0 bottom-0 h-px w-3 -translate-x-1/2 bg-foreground/40" />
        <span className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap border border-border bg-card px-2 py-0.5 text-xs font-semibold">{height}</span>
      </div>
    </>
  );
}

/* ---------- scen: golv, vägg, skuggor och enkel rumsdekor (växt + lampa) ---------- */
function Scene({ stage, floorY, plantPx, plantLeft, lampPx, lampLeft, showRoom, lift = 0 }: {
  stage: Stage;
  floorY: number; plantPx: number; plantLeft: number; lampPx: number; lampLeft: number; showRoom: boolean;
  // hyllan hänger `lift` px ovanför golvlinjen (väggmonterad) – skuggan mjukas upp
  lift?: number;
}) {
  const cx = stage.x + stage.w / 2;
  // Golv, vägg, skuggor och dekor förankras alla i hyllans rektangel / golvlinjen och måste
  // röra sig EXAKT som hyllan – annars läser man skuggan som slarvig.
  //  • Hyllan glider (transform-transition: väggmontering, omskalning) → scenen glider med
  //    samma tajming och hamnar i takt.
  //  • Hyllan snäpper (layoutbyte: ny rad/kolumn ändrar layoutmåttet, vilket inte kan
  //    animeras) → scenen måste snäppa också. Animerade vi här skulle skuggan glida 350 ms
  //    efter en hylla som redan är framme. Det var den efterhalkande skuggan.
  const move = (...props: string[]) => stageMove(stage.glide, ...props);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      {/* vägg (togglas) */}
      {showRoom && (
        <div className="absolute inset-x-0 top-0" style={{ height: floorY, background: "linear-gradient(180deg,#e7e7e6 0%,#efefed 100%)", transition: move("height") }} />
      )}
      {/* golv – ligger vid hyllans bas så bygget står på marken */}
      <div className="absolute inset-x-0 bottom-0" style={{ top: floorY, background: "linear-gradient(180deg,#f4f3f1 0%,#e6e5e3 100%)", transition: move("top") }} />
      {showRoom && (
        <>
          {/* mjuk skugga där vägg möter golv */}
          <div className="absolute inset-x-0" style={{ top: floorY - 30, height: 30, background: "linear-gradient(180deg,transparent,rgba(0,0,0,0.06))", transition: move("top") }} />
          {/* hyllans skugga mot väggen */}
          <div className="absolute" style={{ left: stage.x, top: stage.y, width: stage.w, height: stage.h, boxShadow: "44px 22px 60px rgba(0,0,0,0.11)", transition: move("left", "top", "width", "height") }} />
          {/* enkel rumsdekor för känsla och skala */}
          {plantPx > 0 && <PottedPlant style={{ left: plantLeft, top: floorY - plantPx, height: plantPx, transition: move("left", "top", "height") }} />}
          {lampPx > 0 && <FloorLamp style={{ left: lampLeft, top: floorY - lampPx, height: lampPx, transition: move("left", "top", "height") }} />}
        </>
      )}
      {/* kontaktskugga mot golvet (alltid – förankrar hyllan). Väggmonterad: mjukare,
          diffusare skugga eftersom hyllan hänger en bit ovanför golvet. */}
      <div className="absolute" style={{ left: cx - (stage.w * 1.04) / 2, top: floorY - 6, width: stage.w * 1.04, height: 20, background: `radial-gradient(ellipse at center, rgba(0,0,0,${lift > 0 ? 0.1 : 0.22}) 0%, transparent 72%)`, filter: lift > 0 ? "blur(5px)" : "blur(2px)", transition: move("left", "top", "width", "filter") }} />
    </div>
  );
}

function PottedPlant({ style }: { style: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 100 300"
      preserveAspectRatio="xMidYMax meet"
      className="pointer-events-none absolute"
      style={{ width: "auto", aspectRatio: "100 / 300", ...style }}
      fill="rgba(0,0,0,0.08)"
    >
      {/* blad – överlappande, lite lutade för en buskig kruka */}
      <ellipse cx="50" cy="112" rx="22" ry="97" />
      <ellipse cx="40" cy="110" rx="13" ry="60" transform="rotate(-13 40 110)" />
      <ellipse cx="60" cy="110" rx="13" ry="60" transform="rotate(13 60 110)" />
      <ellipse cx="28" cy="135" rx="14" ry="55" transform="rotate(-30 28 135)" />
      <ellipse cx="72" cy="135" rx="14" ry="55" transform="rotate(30 72 135)" />
      {/* kruka */}
      <path d="M30 206 L70 206 L70 214 L30 214 Z" />
      <path d="M32 214 L68 214 L61 290 L39 290 Z" />
    </svg>
  );
}

function FloorLamp({ style }: { style: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 90 300"
      preserveAspectRatio="xMidYMax meet"
      className="pointer-events-none absolute"
      style={{ width: "auto", aspectRatio: "90 / 300", ...style }}
      fill="rgba(0,0,0,0.08)"
    >
      {/* skärm */}
      <path d="M33 6 L57 6 L77 60 L13 60 Z" />
      {/* stång */}
      <path d="M43 60 L47 60 L47 288 L43 288 Z" />
      {/* fot */}
      <ellipse cx="45" cy="291" rx="20" ry="6" />
    </svg>
  );
}

/* ---------- stilkort ---------- */
function StyleCards({ S, onPick }: { S: State; onPick: (id: string) => void }) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:-mx-5 md:px-5">
      {STYLES.map((s) => (
        <button
          key={s.id}
          onClick={() => onPick(s.id)}
          className={`min-h-28 w-32 shrink-0 border p-2 text-left transition-colors duration-fast ${
            S.style === s.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-accent"
          }`}
        >
          <span className={`flex h-12 items-center justify-center border ${S.style === s.id ? "border-primary-foreground/30" : "border-border"}`}>
            <MiniShelf rows={s.gen(4, [r({}), r({}), r({})])} cols={4} />
          </span>
          <span className="mt-2 block">
            <span className="block font-heading text-xl leading-6">{s.name}</span>
            <span className={`mt-0.5 line-clamp-2 block text-xs leading-4 ${S.style === s.id ? "text-primary-foreground/75" : "text-muted-foreground"}`}>
              {s.desc}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}

function displayColorName(name: string, material: State["material"]) {
  if (material === "ek" && name === "Naturlig ek") return "Ljusbetsad ek";
  return material === "laminat" ? `Laminat ${name}` : name;
}

function frontDescription(front: Front) {
  if (front === "plain") return "En lugn, slät front utan struktur.";
  if (front === "slats") return "Ribbad front med tydlig träkänsla och mer skugga.";
  return "Glasfront för en lättare vitrinkänsla.";
}

/* ---------- skiss ---------- */
export function MiniShelf({ rows, cols }: { rows: Row[]; cols: number }) {
  const W = 34, H = 22, p = 1.5;
  const totalH = rows.reduce((a, x) => a + x.h, 0);
  const out: JSX.Element[] = [];
  let y = p, k = 0;
  rows.forEach((row, ri) => {
    const rh = (row.h / totalH) * (H - 2 * p);
    const cells = rowCells(row, cols);
    const tot = cells.reduce((a, c) => a + c.span, 0);
    let x = p;
    cells.forEach((c) => {
      const cw = (c.span / tot) * (W - 2 * p);
      if (c.type === "o") {
        out.push(<rect key={k++} x={x} y={y} width={cw} height={rh} fill="none" stroke="currentColor" strokeWidth={0.7} opacity={0.55} />);
        for (let i = 1; i <= c.shelves; i++) {
          const ly = y + (rh * i) / (c.shelves + 1);
          out.push(<line key={k++} x1={x} y1={ly} x2={x + cw} y2={ly} stroke="currentColor" strokeWidth={0.6} opacity={0.4} />);
        }
      } else {
        out.push(<rect key={k++} x={x + 0.4} y={y + 0.4} width={cw - 0.8} height={rh - 0.8} fill="currentColor" opacity={c.front === "glass" ? 0.4 : 0.85} />);
        if (c.type === "l") out.push(<line key={k++} x1={x + cw * 0.78} y1={y + rh * 0.3} x2={x + cw * 0.78} y2={y + rh * 0.7} stroke="#fff" strokeWidth={0.8} />);
        else out.push(<line key={k++} x1={x + cw * 0.3} y1={y + rh * 0.5} x2={x + cw * 0.7} y2={y + rh * 0.5} stroke="#fff" strokeWidth={0.8} />);
      }
      x += cw;
    });
    y += rh;
    void ri;
  });
  return <svg width={W} height={H} className="text-foreground">{out}</svg>;
}

/* ---------- kamera: inzoomning på det band som redigeras ---------- */
// Kameran ligger OVANPÅ inpassningen (scale/lift): `z` skalar kring hyllans golvpunkt och
// x/y förskjuter i wrap-pixlar. Identitet = hela möbeln i bild (nivå 1).
interface Cam { z: number; x: number; y: number }
const NO_CAM: Cam = { z: 1, x: 0, y: 0 };
// Hur stor del av ramen det fokuserade bandet får ta, och tak för inzoomningen. Taket finns
// för smala band: en enda kolumn i ett litet bygg skulle annars zoomas till oigenkännlighet.
const FOCUS_FILL = 0.86, FOCUS_MAX = 2.6;
// Kamerans avbildning av en rektangel: skala kring golvpunkten `o`, förskjut sedan.
const viaCam = (r: Rect, o: { x: number; y: number }, c: Cam): Rect => ({
  x: o.x + c.x + c.z * (r.x - o.x),
  y: o.y + c.y + c.z * (r.y - o.y),
  w: r.w * c.z,
  h: r.h * c.z,
});
const near = (a: Rect | null, b: Rect | null) =>
  a === b || (!!a && !!b && Math.abs(a.x - b.x) < 0.5 && Math.abs(a.y - b.y) < 0.5 && Math.abs(a.w - b.w) < 0.5 && Math.abs(a.h - b.h) < 0.5);
// Bandets kumulativa offset inom hyllan. offsetLeft/-Top är LAYOUTmått och påverkas inte av
// transformen (till skillnad från getBoundingClientRect). Kedjan av offsetParent slutar i
// hyllan eftersom den är position: relative.
function offsetIn(el: HTMLElement, root: HTMLElement) {
  let x = 0, y = 0;
  for (let n: HTMLElement | null = el; n && n !== root; n = n.offsetParent as HTMLElement | null) {
    x += n.offsetLeft;
    y += n.offsetTop;
  }
  return { x, y };
}

function Shelf({ S, handleId, frame, active, hovered, onHover, onOpen, wrapRef, onMeasure, lift = 0 }: {
  S: State; handleId: string; frame: string; active: number | null; hovered: number | null;
  onHover: (i: number | null) => void; onOpen: (i: number) => void;
  wrapRef: React.RefObject<HTMLDivElement>; onMeasure: (r: Stage) => void;
  // px som hyllan lyfts från golvlinjen (väggmonterad hänger på väggen)
  lift?: number;
}) {
  const shelfRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  // Första passningen (mount) sätter skalan från 1 → uträknad storlek. Utan detta animeras
  // det språnget som en "zoom in-och-krymp" varje gång vyn öppnas. animate hålls false tills
  // efter första målningen så inpassningen sker direkt; därefter animeras äkta ändringar
  // (t.ex. när man ändrar storlek och hyllan skalas om för att rymmas) mjukt som förut.
  const [animate, setAnimate] = useState(false);
  // Kameran (nivå 2): zoomar in på det band som redigeras i stället för att bara ringa in
  // det. Se `Cam`/`viaCam` ovan.
  const [cam, setCam] = useState<Cam>(NO_CAM);
  // ett element per band (rad eller kolumn) – kameran mäter det fokuserade bandet härifrån
  const bandRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reported = useRef<{ rect: Rect; band: Rect | null; z: number }>({ rect: { x: 0, y: 0, w: 0, h: 0 }, band: null, z: 1 });
  // Redigerar man ETT band (nivå 2) fryses bildens INPASSNING: ingen omskalning av ramen.
  // Bara kameran rör sig – annars känns det som att hela bilden ändras för mycket vid varje
  // val. När man går tillbaka till helheten ställs ramen mjukt om till den nya passningen.
  const editing = active !== null;
  // spegel av `editing` som den stabila ResizeObserver-closuren (satt upp en gång) kan läsa
  const editingRef = useRef(editing);
  editingRef.current = editing;
  // Senast rapporterade transform – avgör om nästa rapport beror på att hyllan FLYTTAR SIG
  // (scale/lift/kamera ändras → transform-transition) eller på att den byter layout (rad/
  // kolumn läggs till → snäpper direkt). Scenen ska glida i det första fallet och snäppa i
  // det andra.
  const lastTf = useRef({ scale, lift, cam });
  // Hyllans geometri i wrap-koordinater: ramen (containerns content-box), golvpunkten
  // (= transform-origin) och hyllans rektangel FÖRE kameran.
  //
  // Rektanglarna RÄKNAS UT, de mäts inte med getBoundingClientRect på hyllan. Anledningen:
  // rect:en innehåller transformen, och under en pågående transform-transition returnerar
  // den det interpolerade värdet – alltså läget hyllan är i just nu, inte det den är på väg
  // till. Väntar man i stället på transitionend kommer målet 350 ms för sent och skuggan
  // halkar efter hela vägen. Vi känner målet direkt: containern är otransformerad, och
  // scale/lift/cam är vårt eget state.
  const geomRef = useRef<() => { base: Rect; origin: { x: number; y: number }; frame: Rect } | null>(() => null);
  geomRef.current = () => {
    const el = shelfRef.current, wrap = wrapRef.current, parent = el?.parentElement;
    if (!el || !wrap || !parent) return null;
    const pr = parent.getBoundingClientRect(), wr = wrap.getBoundingClientRect();
    const cs = getComputedStyle(parent);
    const padL = parseFloat(cs.paddingLeft), padR = parseFloat(cs.paddingRight);
    const padT = parseFloat(cs.paddingTop), padB = parseFloat(cs.paddingBottom);
    // transform-origin är "bottom center": scale håller underkanten still vid layoutens
    // underkant (content-boxens nederkant, items-end) och translateY lyfter den `lift` px.
    // Den punkten är också golvlinjen – och det kameran skalar kring.
    const origin = {
      x: pr.left - wr.left + padL + (parent.clientWidth - padL - padR) / 2,
      y: pr.bottom - wr.top - padB,
    };
    const w = el.offsetWidth * scale, h = el.offsetHeight * scale;
    return {
      base: { x: origin.x - w / 2, y: origin.y - lift - h, w, h },
      origin,
      frame: { x: pr.left - wr.left + padL, y: pr.top - wr.top + padT, w: parent.clientWidth - padL - padR, h: parent.clientHeight - padT - padB },
    };
  };
  // Bandets rektangel före kameran (layoutmått × inpassningens scale, från hyllans hörn).
  const bandRect = (base: Rect, i: number): Rect | null => {
    const el = bandRefs.current[i], root = shelfRef.current;
    if (!el || !root) return null;
    const o = offsetIn(el, root);
    return { x: base.x + o.x * scale, y: base.y + o.y * scale, w: el.offsetWidth * scale, h: el.offsetHeight * scale };
  };
  // Rapportera hyllans (och det fokuserade bandets) rektangel efter kameran – scenen (golv,
  // skugga, dekor), plus-knapparna och måttlinjerna placeras alla från den.
  const reportRef = useRef<() => void>(() => {});
  reportRef.current = () => {
    const g = geomRef.current();
    if (!g) return;
    const rect = viaCam(g.base, g.origin, cam);
    const b = active !== null ? bandRect(g.base, active) : null;
    const band = b && viaCam(b, g.origin, cam);
    const p = reported.current;
    if (near(p.rect, rect) && near(p.band, band) && p.z === cam.z) return;
    reported.current = { rect, band, z: cam.z };
    const t = lastTf.current;
    const glide = animate && (t.scale !== scale || t.lift !== lift || t.cam !== cam);
    lastTf.current = { scale, lift, cam };
    onMeasure({ ...rect, z: cam.z, band, glide });
  };
  // Ställ kameran mot det fokuserade bandet: zooma så bandet fyller FOCUS_FILL av ramen och
  // lägg dess mitt i ramens mitt. Utan fokus (nivå 1) går kameran tillbaka till identitet.
  const focusRef = useRef<() => void>(() => {});
  focusRef.current = () => {
    if (active === null) {
      setCam((c) => (c === NO_CAM ? c : NO_CAM));
      return;
    }
    const g = geomRef.current();
    const b = g && bandRect(g.base, active);
    if (!g || !b || b.w <= 0 || b.h <= 0) return;
    const z = Math.max(1, Math.min(FOCUS_MAX, (g.frame.w * FOCUS_FILL) / b.w, (g.frame.h * FOCUS_FILL) / b.h));
    const next: Cam = {
      z,
      x: g.frame.x + g.frame.w / 2 - g.origin.x - z * (b.x + b.w / 2 - g.origin.x),
      y: g.frame.y + g.frame.h / 2 - g.origin.y - z * (b.y + b.h / 2 - g.origin.y),
    };
    setCam((c) => (Math.abs(c.z - next.z) < 0.002 && Math.abs(c.x - next.x) < 0.5 && Math.abs(c.y - next.y) < 0.5 ? c : next));
  };
  // Stabil mätfunktion (senaste closure) så ResizeObservern kan sättas upp en gång.
  const measureRef = useRef<() => void>(() => {});
  measureRef.current = () => {
    const el = shelfRef.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;
    // Skala hyllan så den ryms inom containerns content-box (paddingen är responsiv
    // och ger luften) MINUS en fast reserv för lägg-till-knapparna som ligger 24px
    // utanför hyllan (ovanför + till höger). Då får allt plats även när rader/
    // kolumner läggs till, istället för att knapparna kläms mot kanten/verktygsraden.
    const BTN = 64; // knapp (40px) + gap (24px)
    const cs = getComputedStyle(parent);
    const pw = parent.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - BTN * 2;
    // hyllan skalas likadant oavsett montering – väggmontering flyttar bara golvet, inte hyllan
    const ph = parent.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - BTN;
    // Skalan sätts av RAMEN, inte av det aktuella bygget: vi väljer den skala där
    // MAXBYGGET (6 × 6 moduler) precis ryms, och ritar alla bygg i den. Rummet får
    // alltså ett fast "kameraavstånd" per skärmstorlek. Två konsekvenser, båda önskade:
    //  • Stor skärm → stor ram → stor möbel. Bilden växer med viewporten i stället för
    //    att toppa vid 1:1 och lägga sig som en liten möbel i nederkanten.
    //  • Storleken i bild speglar den verkliga storleken. En låg hylla ser låg ut, och
    //    när man lägger till en rad VÄXER hyllan uppåt i ramen i stället för att hela
    //    vyn zoomar om. Luften ovanför hyllan är alltså inte slack – det är utrymmet
    //    kvar att bygga på.
    // Referensen är maxbygget, inte ett "typiskt" bygg – bara då gäller skalan hela
    // storleksregistret och alla bygg kan jämföras mot varandra.
    const GAP = 6, PAD = 6, LEG = 18; // gap-1.5 / p-1.5 / benens höjd
    const refW = COLMAX * U + PAD * 2;
    const refH = ROWMAX * U + (ROWMAX - 1) * GAP + PAD * 2 + (LEG + GAP);
    const ref = Math.min(pw / refW, ph / refH);
    // Två spärrar runt referensskalan:
    //  • Math.max(1, …): i en knapp ram (mobilens 50svh, liten laptop) ryms maxbygget
    //    bara i miniatyr, och då skulle ETT bygg ritas som ett frimärke. Under 1:1 faller
    //    vi därför tillbaka på det gamla beteendet – fyll ramen. Storlekstroheten gäller
    //    alltså överallt där den inte kostar för mycket, och kostar aldrig något.
    //  • Inpassningen (de två sista termerna) är skyddsnätet: bygget ska aldrig spilla
    //    ut ur ramen, oavsett skala.
    // golv på 0.05: en dold/kollapsad container ger negativa mått – utan golvet skulle
    // skalan (och --inv nedan) bli meningslös.
    setScale(Math.max(0.05, Math.min(Math.max(1, ref), pw / el.offsetWidth, ph / el.offsetHeight)));
    reportRef.current();
  };
  // Fönster-/containerstorlek ändras → passa alltid in på nytt. Sätts upp en gång.
  // Refitning här (mount + layout som sätter sig + fönsterresize) sker utan animation;
  // bara användarens egna ändringar (nedan) animeras.
  useLayoutEffect(() => {
    const parent = shelfRef.current?.parentElement;
    if (!parent) return;
    measureRef.current();
    // Medan man redigerar ett band (nivå 2) är ramen fryst – hoppa över refit, ställ bara
    // om kameran mot bandet i den nya ramen. Annars zoomar hyllan till när vyn byter layout
    // (mobil: section blir `fixed`/100vw och scrollen låses → containerns bredd ändras → ny
    // skala), vilket ser ryckigt ut.
    // Observera både ramen (fönsterresize) och hyllan (dess layoutmått ändras när rader/
    // kolumner tillkommer). ResizeObserver rapporterar content-box och påverkas därför
    // inte av transformen – ingen risk att en pågående omskalning triggar en loop.
    const ro = new ResizeObserver(() => { editingRef.current ? focusRef.current() : measureRef.current(); });
    ro.observe(parent);
    if (shelfRef.current) ro.observe(shelfRef.current);
    return () => ro.disconnect();
  }, []);
  // Innehållsändring (bredd/höjd/kolumninnehåll) → passa in och rapportera – men INTE
  // medan man redigerar ett enskilt band. Då fryses ramen (se `editing` ovan). När man
  // lämnar redigeringen (editing → false) körs den och ställer om mjukt till ny passning.
  // Första körningen är mount (layouten sätter sig, ingen animation önskas). Från och med
  // första ÄKTA ändringen slås övergångar på så att omskalning (t.ex. ändrad storlek) och
  // kamerans in-/utzoomning glider mjukt istället för att animera vid första målningen.
  const settled = useRef(false);
  useLayoutEffect(() => {
    if (settled.current) setAnimate(true);
    else settled.current = true;
    if (editing) return;
    measureRef.current();
  }, [S.cols, S.rows, S.colDefs, lift, editing]);
  // Kameran ställs om när fokus byts (klick/steppern) och när bandets mått ändras medan man
  // redigerar det (t.ex. ny radhöjd) – då följer inzoomningen med bandet.
  useLayoutEffect(() => { focusRef.current(); }, [active, scale, lift, S.cols, S.rows, S.colDefs, S.axis, S.category]);
  // Ny scale/lift/kamera committad → rapportera det nya MÅLET direkt (se reportRef ovan).
  // Scenen får samma tajming som hyllans transform-transition och glider därför i takt med
  // den, istället för att starta när hyllan redan är framme.
  useLayoutEffect(() => { reportRef.current(); }, [scale, lift, cam]);

  const grid = gridCells(S);
  // Per-kolumn-höjd bara för TV-möbler (ojämn topp). Då ritas varje kolumn som en egen
  // låda med egen höjd, golv-justerad – annars delad stomme med enhetlig höjd som förr.
  const perCol = S.axis === "kolumn" && S.category === "tvbank";

  // Markering på bandet: svart ring när det redigeras (nivå 2), ljus ring vid hover.
  // Outline ligger alltid ute (transparent) så layouten inte hoppar när den tänds.
  const bandRing = (i: number) =>
    active === i ? "outline-ring" : hovered === i ? "outline-foreground/25" : "outline-transparent";
  // Ringen är gränssnitt, inte möbel: --inv håller den hårfin även när hyllan (och kameran)
  // skalar upp – annars blir 2px en klumpig 5px-ram vid inzoomat band.
  const ringStyle: React.CSSProperties = { outlineWidth: "calc(2px * var(--inv, 1))", outlineOffset: "calc(2px * var(--inv, 1))" };
  // Ett element per band så kameran kan mäta det fokuserade bandet. Listan trimmas till
  // antalet band så borttagna rader/kolumner inte lämnar kvar döda element.
  const bandCount = S.axis === "kolumn" ? S.cols : S.rows.length;
  bandRefs.current.length = bandCount;
  const bandRef = (i: number) => (el: HTMLDivElement | null) => { bandRefs.current[i] = el; };

  return (
    <div ref={shelfRef} className={`relative flex flex-col gap-1.5 p-1.5 ${animate ? "transition-[transform,background-color] duration-slow ease-default" : "transition-none"}`} style={{ background: perCol ? "transparent" : frame, width: perCol ? undefined : S.cols * U + 12, transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.z}) translateY(${-lift}px) scale(${scale})`, transformOrigin: "bottom center", ["--inv" as string]: 1 / (scale * cam.z) }}>
      {perCol ? (
        // TV-möbel: kolumner med egen höjd, golv-justerade. Varje kolumn är en egen stomme.
        <div className="flex items-end gap-1.5">
          {Array.from({ length: S.cols }, (_, ci) => {
            const def = S.colDefs?.[ci] ?? { doors: "none" as Amount, drawers: "none" as Amount };
            const types = fillColumn(def, colHeight(S, ci));
            return (
              <div
                key={ci}
                ref={bandRef(ci)}
                onMouseEnter={() => onHover(ci)}
                onMouseLeave={() => onHover(null)}
                onClick={() => onOpen(ci)}
                className={`group relative flex cursor-pointer flex-col gap-1.5 p-1.5 outline transition-[outline-color] duration-base ${bandRing(ci)}`}
                style={{ background: frame, ...ringStyle }}
              >
                {types.map((t, k) => (
                  <Cube key={k} type={t} front={S.front} shelves={t === "o" ? def.shelves ?? 0 : 0} span={1} color={S.color} handle={handleId} frame={frame} sizeStyle={{ height: U, width: U }} />
                ))}
                {active !== ci && <EditPill onClick={() => onOpen(ci)} />}
              </div>
            );
          })}
        </div>
      ) : S.axis === "kolumn" ? (
        // kolumnläge: vertikala sektioner sida vid sida; klick redigerar en kolumn i panelen
        <div className="flex gap-1.5">
          {Array.from({ length: S.cols }, (_, ci) => (
            <div
              key={ci}
              ref={bandRef(ci)}
              onMouseEnter={() => onHover(ci)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onOpen(ci)}
              className={`group relative flex flex-1 cursor-pointer flex-col gap-1.5 outline transition-[outline-color] duration-base ${bandRing(ci)}`}
              style={ringStyle}
            >
              {S.rows.map((row, ri) => {
                const c = grid[ri][ci];
                return <Cube key={ri} type={c.type} front={c.front} shelves={c.shelves} span={1} color={S.color} handle={handleId} frame={frame} sizeStyle={{ height: (row.h / 40) * U, width: "100%" }} />;
              })}
              {active !== ci && <EditPill onClick={() => onOpen(ci)} />}
            </div>
          ))}
        </div>
      ) : (
        S.rows.map((row, ri) => (
          <div
            key={ri}
            ref={bandRef(ri)}
            onMouseEnter={() => onHover(ri)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onOpen(ri)}
            className={`group relative flex cursor-pointer gap-1.5 outline transition-[outline-color] duration-base ${bandRing(ri)}`}
            style={{ height: (row.h / 40) * U, ...ringStyle }}
          >
            {grid[ri].map((c, ci) => <Cube key={ci} type={c.type} front={c.front} shelves={c.shelves} span={c.span} color={S.color} handle={handleId} frame={frame} />)}
            {active !== ri && <EditPill onClick={() => onOpen(ri)} />}
          </div>
        ))
      )}
      {S.mount === "staende" && <Legs S={S} frame={frame} />}
    </div>
  );
}

// "Redigera"-knapp som bara tänds på bandet vid hover (desktop). På touch/mobil används
// tabbarna i panelen för att välja band – därför ingen forcerad hover-knapp där. Aktivt band
// markeras enbart med ringen, annars ser det aktiva bandet ut som att det hovras.
// Pillret ligger inuti hyllans skalning men är gränssnitt, inte möbel: --inv (satt på
// hyllan) skalar tillbaka det så texten är lika stor oavsett hur stor hyllan ritas.
function EditPill({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Redigera bandet"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={{ transform: "translate(-50%, -50%) scale(var(--inv, 1))" }}
      className="pointer-events-auto absolute left-1/2 top-1/2 z-20 flex items-center gap-1.5 whitespace-nowrap border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground shadow-sm rounded-button opacity-0 transition-opacity duration-fast group-hover:opacity-100"
    >
      <Pencil size={14} /> Redigera
    </button>
  );
}

export function Cube({ type, front, shelves, span, color, handle, frame, sizeStyle }: {
  type: string; front: Front; shelves: number; span: number; color: string; handle: string; frame: string;
  sizeStyle?: React.CSSProperties;
}) {
  const style: React.CSSProperties = sizeStyle ?? { flex: span };
  if (type === "o") {
    return (
      <div className="relative" style={{ ...style, background: "#fff", boxShadow: "inset 0 0 0 1px rgba(0,0,0,.07)" }}>
        {Array.from({ length: shelves }, (_, i) => i + 1).map((i) => (
          <div key={i} className="copy-enter absolute left-0 right-0 transition-colors duration-slow" style={{ top: `${(i / (shelves + 1)) * 100}%`, height: 3, background: frame, boxShadow: "0 0 0 1px rgba(0,0,0,.1)" }} />
        ))}
      </div>
    );
  }
  // Glaslucka: träram runt en kall, ljus glasruta med reflex – ska tydligt läsas som glas.
  if (type === "l" && front === "glass") {
    return (
      <div className="relative overflow-hidden transition-colors duration-slow" style={{ ...style, background: color, boxShadow: "inset 0 0 0 1px rgba(0,0,0,.18)" }}>
        {/* glasrutan (inramad av luckfärgen runtom) */}
        <div
          className="absolute inset-[3px] overflow-hidden"
          style={{
            background:
              "linear-gradient(160deg, rgba(226,238,243,.82) 0%, rgba(198,216,224,.62) 40%, rgba(176,197,206,.5) 100%)",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,.4), inset 0 0 10px rgba(120,150,165,.25)",
          }}
        >
          {/* bred, mjuk reflex + smalt skarpt ljusstreck på diagonalen */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(122deg, transparent 26%, rgba(255,255,255,.5) 40%, rgba(255,255,255,.12) 46%, transparent 52%, rgba(255,255,255,.32) 62%, transparent 70%)",
            }}
          />
        </div>
        <Handle type={type} handle={handle} color="rgba(52,62,68,.85)" />
      </div>
    );
  }
  const slats = front === "slats" ? { backgroundImage: "repeating-linear-gradient(90deg,rgba(0,0,0,.10) 0 2px,transparent 2px 7px)" } : {};
  return (
    <div className="relative transition-colors duration-slow" style={{ ...style, background: color, boxShadow: "inset 0 0 0 1px rgba(0,0,0,.13)", ...slats }}>
      <Handle type={type} handle={handle} color={hcol(color)} />
    </div>
  );
}

function Handle({ type, handle, color }: { type: string; handle: string; color: string }) {
  if (handle === "push") return null;
  if (handle === "h1" || handle === "h2") // knopp (trä/mässing)
    return type === "d" ? (
      <span className="fade-in absolute left-1/2 top-1/2 h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-slow" style={{ background: color }} />
    ) : (
      <span className="fade-in absolute right-[14%] top-1/2 h-[7px] w-[7px] -translate-y-1/2 rounded-full transition-colors duration-slow" style={{ background: color }} />
    );
  // h3 bygelhandtag
  return type === "d" ? (
    <span className="fade-in absolute left-1/2 top-1/2 h-1 w-[42%] -translate-x-1/2 -translate-y-1/2 rounded-[3px] transition-colors duration-slow" style={{ background: color }} />
  ) : (
    <span className="fade-in absolute right-[12%] top-1/2 h-[40%] w-1 -translate-y-1/2 rounded-[3px] transition-colors duration-slow" style={{ background: color }} />
  );
}

export function Legs({ S }: { S: State; frame: string }) {
  const lc =
    S.leg === "stal" ? "#9a9d9c" :
    S.leg === "massing" ? "#B8975A" :
    S.leg === "svart" ? "#222" :
    S.leg === "valnot" ? "#5b4636" :
    "#C9A36A"; // ek
  return (
    <div className="flex justify-between px-2">
      <span className="transition-colors duration-slow" style={{ width: 5, height: 18, background: lc }} />
      <span className="transition-colors duration-slow" style={{ width: 5, height: 18, background: lc }} />
    </div>
  );
}

/* ---------- nivå 2: bandredigering i panelen ---------- */

// Panelhuvud i redigeringsläget (nivå 2). Rubrik "Rad N av M" med runda ‹ ›-steg för att
// bläddra mellan banden. Stäng-affordansen skiljer sig mellan lägena:
//  • desktop (overlay=false): en svart "Gå tillbaka"-knapp överst tar tillbaka till hela möbeln.
//  • mobil (overlay=true): ett kryss längst till höger stänger overlayn (ingen tillbaka-knapp).
function BandStepper({ count, index, isCol, overlay = false, onSelect, onBack }: {
  count: number; index: number; isCol: boolean; overlay?: boolean;
  onSelect: (i: number) => void; onBack: () => void;
}) {
  const noun = isCol ? "Kolumn" : "Rad";
  // Runda, ljusgrå ikonknappar (‹ › och ✕) – samma neutrala yta som segmentkontrollerna.
  const roundBtn = "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground transition-colors duration-fast hover:bg-[oklch(0.91_0_0)] disabled:pointer-events-none disabled:opacity-40";
  const stepper = (
    <div className="flex items-center gap-2">
      <button onClick={() => onSelect(index - 1)} disabled={index <= 0} aria-label={`Föregående ${noun.toLowerCase()}`} className={roundBtn}>
        <ChevronLeft size={20} />
      </button>
      <button onClick={() => onSelect(index + 1)} disabled={index >= count - 1} aria-label={`Nästa ${noun.toLowerCase()}`} className={roundBtn}>
        <ChevronRight size={20} />
      </button>
    </div>
  );

  if (overlay) {
    // Mobil overlay: rubrik + steg till vänster, stängkryss längst till höger.
    return (
      <div className="sticky top-0 z-10 -mx-4 mb-6 flex items-center gap-4 bg-card px-4 pb-4 pt-4">
        <Heading level="h3" className="shrink-0 whitespace-nowrap leading-none">{noun} {index + 1} av {count}</Heading>
        {stepper}
        <button onClick={onBack} aria-label="Stäng" className={`ml-auto ${roundBtn}`}>
          <X size={20} />
        </button>
      </div>
    );
  }

  // Desktop: svart "Gå tillbaka"-knapp överst, sedan stor rubrik med steg bredvid.
  return (
    <div className="mb-8">
      <button onClick={onBack} className="group mb-6 flex items-center gap-3">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity duration-fast group-hover:opacity-90">
          <ArrowLeft size={14} />
        </span>
        <Text variant="body" className="font-semibold">Gå tillbaka</Text>
      </button>
      <div className="flex items-center gap-4">
        <Heading level="h2" className="whitespace-nowrap text-[22px] leading-none lg:text-[2rem]">{noun} {index + 1} av {count}</Heading>
        {stepper}
      </div>
    </div>
  );
}

// Segmenterad kontroll i panelbredd (svart = vald). Samma mönster som stegen i nivå 1.
function BandSegmented({ label, options, value, onSet }: {
  label: string; options: [string, string][]; value: string; onSet: (v: string) => void;
}) {
  return (
    <div className="mb-6">
      <Text variant="body" className="mb-2 block font-semibold">{label}</Text>
      <ButtonGroup options={options} value={value} onSet={onSet} />
    </div>
  );
}

function BandMsg({ children }: { children: React.ReactNode }) {
  return <Text variant="small" className="-mt-2 mb-6 text-muted-foreground">{children}</Text>;
}

const AMOUNT_OPTS: [string, string][] = (["none", "some", "max"] as Amount[]).map((a) => [a, AMOUNT_LABEL[a]]);

// BandPanel byter ut hela panelinnehållet (nivå 2). Redigerar en rad (rad-axeln) eller
// en kolumn (kolumnläge). All villkorslogik lånas från lib/config.ts – inget skrivs om här.
function BandPanel({ S, index, overlay = false, handle, onSetHandle, onSelect, onEditRow, onEditCol, onRemoveRow, onRemoveCol, onBack }: {
  S: State; index: number;
  // overlay: renderas i mobilens overlay (stängs med krysset i overlay-huvudet). Byter
  // panelhuvudets stäng-affordans: krysset i overlayn på mobil, "Gå tillbaka" på desktop.
  overlay?: boolean;
  // handtag är ett globalt val (hela möbeln) men går även att nå här i bandredigeringen
  handle: string; onSetHandle: (v: string) => void;
  onSelect: (i: number) => void;
  onEditRow: (i: number, patch: Partial<Row>) => void;
  onEditCol: (ci: number, patch: Partial<ColDef>) => void;
  onRemoveRow: (i: number) => void;
  onRemoveCol: (ci: number) => void;
  onBack: () => void;
}) {
  const isCol = S.axis === "kolumn";
  const row = S.rows[index];
  // Bandet kan ha försvunnit (t.ex. borttaget) – gå tillbaka till nivå 1.
  useEffect(() => {
    if (isCol ? index >= S.cols : !row) onBack();
  }, [isCol, index, S.cols, row, onBack]);
  if (isCol ? index >= S.cols : !row) return null;

  const count = isCol ? S.cols : S.rows.length;
  const canRemove = isCol ? S.cols > 1 : S.rows.length > 1;

  return (
    <div>
      {/* Panelhuvud för redigeringsläget: stäng-affordans (Gå tillbaka / kryss) samt en
          stepper som bläddrar mellan banden (rad/kolumn) utan att man klickar i bilden. */}
      <BandStepper
        count={count}
        index={index}
        isCol={isCol}
        overlay={overlay}
        onSelect={onSelect}
        onBack={onBack}
      />

      {isCol ? (
        <ColumnBand S={S} index={index} handle={handle} onSetHandle={onSetHandle} onEdit={onEditCol} />
      ) : (
        <RowBand row={row} index={index} cols={S.cols} handle={handle} onSetHandle={onSetHandle} onEdit={onEditRow} />
      )}

      {canRemove && (
        <div className="mt-4 border-t border-border pt-5">
          <button
            onClick={() => (isCol ? onRemoveCol(index) : onRemoveRow(index))}
            className="flex h-11 items-center gap-2 rounded-button border border-destructive/40 px-4 text-base font-semibold text-destructive transition-colors duration-fast hover:border-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 size={16} /> {isCol ? "Ta bort kolumn" : "Ta bort rad"}
          </button>
        </div>
      )}
    </div>
  );
}

// Radredigering: höjd, luckor, lådor, hyllplan – med exakt samma villkor/meddelanden
// som tidigare RowPopover.
function RowBand({ row, index, cols, handle, onSetHandle, onEdit }: {
  row: Row; index: number; cols: number;
  handle: string; onSetHandle: (v: string) => void;
  onEdit: (i: number, patch: Partial<Row>) => void;
}) {
  const maxSh = maxShelves(row.h);
  const cells = rowCells(row, cols);
  const hasOpen = cells.some((c) => c.type === "o");
  // Frontstil per rad är bara relevant när raden har luckor/lådor; glas kräver en lucka.
  const hasClosed = row.doors !== "none" || row.drawers !== "none";
  const glassOk = row.doors !== "none";

  return (
    <>
      <BandSegmented
        label="Radhöjd"
        options={[20, 40, 80].map((v) => [String(v), `${v} cm`])}
        value={String(row.h)}
        onSet={(v) => onEdit(index, { h: +v })}
      />
      <BandSegmented label="Luckor" options={AMOUNT_OPTS} value={row.doors} onSet={(v) => onEdit(index, { doors: v as Amount })} />

      {drawersAllowed(row.h) ? (
        <BandSegmented label="Lådor" options={AMOUNT_OPTS} value={row.drawers} onSet={(v) => onEdit(index, { drawers: v as Amount })} />
      ) : (
        <>
          <Text variant="body" className="mb-2 block font-semibold">Lådor</Text>
          <BandMsg>Lådor trivs i låga rader – sänk höjden till 40 cm så dyker de upp.</BandMsg>
        </>
      )}
      {drawersAllowed(row.h) && row.doors !== "none" && row.drawers !== "none" && (
        <BandMsg>Luckor och lådor delar på facken – ökar du den ena ger den andra plats.</BandMsg>
      )}

      <Text variant="body" className="mb-2 block font-semibold">Hyllplan (öppna fack)</Text>
      {maxSh === 0 ? (
        <BandMsg>Höj raden lite så får du plats med hyllplan.</BandMsg>
      ) : !hasOpen ? (
        <BandMsg>Hyllplan behöver ett öppet fack – ta bort en lucka eller låda så frigörs ett.</BandMsg>
      ) : (
        <ButtonGroup
          className="mb-6"
          options={Array.from({ length: maxSh + 1 }, (_, v) => [String(v), String(v)])}
          value={String(row.shelves)}
          onSet={(v) => onEdit(index, { shelves: +v })}
        />
      )}

      {hasClosed && (
        <div className="mb-2">
          <Text variant="body" className="mb-2 block font-semibold">Frontstil</Text>
          <FrontPicker
            fronts={glassOk ? (["plain", "slats", "glass"] as Front[]) : (["plain", "slats"] as Front[])}
            value={row.front}
            onSet={(v) => onEdit(index, { front: v })}
          />
          {!glassOk && <Text variant="small" className="mt-3 text-muted-foreground">Glasfront sitter bara på luckor – lägg till en lucka först.</Text>}
        </div>
      )}

      {/* Handtag: globalt val för hela möbeln, men går att nå här när raden har fronter. */}
      {hasClosed && (
        <div className="mt-6">
          <Text variant="body" className="mb-2 block font-semibold">Beslag</Text>
          <HandlePicker options={HANDLES} value={handle} onSet={onSetHandle} />
          <Text variant="small" className="mt-3 text-muted-foreground">Beslaget gäller hela möbeln.</Text>
        </div>
      )}
    </>
  );
}

// Kolumnredigering (kolumnläge): luckor/lådor fördelas nedåt – samma modell som ColumnPopover.
function ColumnBand({ S, index, handle, onSetHandle, onEdit }: {
  S: State; index: number;
  handle: string; onSetHandle: (v: string) => void;
  onEdit: (ci: number, patch: Partial<ColDef>) => void;
}) {
  const def = S.colDefs?.[index] ?? { doors: "none", drawers: "none" };
  // Egen höjd per kolumn – bara TV-möbler (ojämn topp), som default+override mot Form-höjden.
  const perColHeight = S.category === "tvbank";
  const globalCells = S.rows.length;
  const cells = def.height ?? globalCells;
  const overridden = def.height !== undefined;
  // Hyllplan sitter i kolumnens öppna fack – finns inga (allt är luckor/lådor) visas
  // samma hjälptext som i radläget. Facken är 40 cm → max 1 hyllplan per fack.
  const hasOpen = fillColumn(def, colHeight(S, index)).some((t) => t === "o");
  const maxSh = maxShelves(40);
  return (
    <>
      {perColHeight && (
        <div className="mb-6">
          <Range label="Höjd" value={cells} max={ROWMAX} pill={`${cellsToCm(cells)} cm`} onSet={(v) => onEdit(index, { height: v })} />
          {overridden ? (
            <button
              onClick={() => onEdit(index, { height: undefined })}
              className="text-sm text-muted-foreground transition-colors duration-fast hover:text-foreground"
            >
              Anpassad höjd · återställ till global ({cellsToCm(globalCells)} cm)
            </button>
          ) : (
            <BandMsg>Ärver den globala höjden. Ändra här för att ge just den här sektionen en egen höjd – t.ex. lägre för TV:n.</BandMsg>
          )}
        </div>
      )}
      <BandSegmented label="Luckor" options={AMOUNT_OPTS} value={def.doors} onSet={(v) => onEdit(index, { doors: v as Amount })} />
      <BandSegmented label="Lådor" options={AMOUNT_OPTS} value={def.drawers} onSet={(v) => onEdit(index, { drawers: v as Amount })} />
      {def.doors !== "none" && def.drawers !== "none" && (
        <BandMsg>Luckor och lådor delar på kolumnen – ökar du den ena ger den andra plats.</BandMsg>
      )}

      <Text variant="body" className="mb-2 block font-semibold">Hyllplan (öppna fack)</Text>
      {!hasOpen ? (
        <BandMsg>Hyllplan behöver ett öppet fack – ta bort en lucka eller låda så frigörs ett.</BandMsg>
      ) : (
        <ButtonGroup
          className="mb-6"
          options={Array.from({ length: maxSh + 1 }, (_, v) => [String(v), String(v)])}
          value={String(def.shelves ?? 0)}
          onSet={(v) => onEdit(index, { shelves: +v })}
        />
      )}

      {/* Handtag: globalt val för hela möbeln, men går att nå här när kolumnen har fronter. */}
      {(def.doors !== "none" || def.drawers !== "none") && (
        <div className="mt-6">
          <Text variant="body" className="mb-2 block font-semibold">Beslag</Text>
          <HandlePicker options={HANDLES} value={handle} onSet={onSetHandle} />
          <Text variant="small" className="mt-3 text-muted-foreground">Beslaget gäller hela möbeln.</Text>
        </div>
      )}
    </>
  );
}

function LegIcon() {
  return (
    <svg width="26" height="20"><rect x="3" y="2" width="20" height="9" fill="none" stroke="currentColor" strokeWidth="1.5" /><line x1="6" y1="11" x2="6" y2="18" stroke="currentColor" strokeWidth="1.5" /><line x1="20" y1="11" x2="20" y2="18" stroke="currentColor" strokeWidth="1.5" /></svg>
  );
}
function HandleIcon() {
  return (
    <svg width="26" height="20"><rect x="4" y="2" width="18" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" /><circle cx="18" cy="10" r="1.8" fill="currentColor" /></svg>
  );
}
