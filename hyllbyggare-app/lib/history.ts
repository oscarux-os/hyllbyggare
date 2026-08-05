// Ångra + ändringslogg för byggaren.
//
// Historiken är en lista med ögonblicksbilder av hela State och en markör som pekar ut var
// man står. Ångra flyttar markören bakåt; en ny ändring när man står bakåt kapar svansen och
// lägger sitt steg sist. Att lagra hela state (i stället för inverterade operationer) är
// billigt här – ett State är en handfull rader och fack – och gör varje steg i loggen till
// något man kan hoppa RAKT till, inte bara backa ett i taget.
//
// Etiketterna härleds ur skillnaden mellan två states i stället för att skickas med från
// varje anropsställe. Det är hela poängen: loggen kan inte hamna ur fas med vad som faktiskt
// hände, och byggarens tjugo setS-anrop behöver inte veta att historiken finns.

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CELL_LABEL, COLORS, FRONT_LABEL, HANDLES, LEGS, STYLES,
  colCells, colHeight, furnitureHeightCm, realW, rowCells, stackNo,
  type Amount, type Cell, type ColDef, type Row, type State,
} from "./config";

export interface Change {
  // Grov typ av ändring. Två steg i följd av samma sort slås ihop (se COALESCE_MS) så att
  // ett drag i ett reglage blir ETT steg i loggen och inte tjugo.
  kind: string;
  label: string;
}

export interface HistoryEntry extends Change {
  state: State;
  at: number;
}

// Två ändringar av samma sort inom det här fönstret är samma handling – ett reglagedrag.
const COALESCE_MS = 600;
// Tak för hur långt bak man kan gå. Utgångsläget ligger alltid kvar underst, det är
// mellanstegen som faller bort när listan blir för lång.
const MAX_ENTRIES = 50;

const nameOf = (list: [string, string, string][], id: string) =>
  list.find((x) => x[0] === id)?.[1] ?? id;

const EMPTY_COL: ColDef = { doors: "none", drawers: "none" };

const sameCells = (a: Cell[], b: Cell[]) =>
  a.length === b.length &&
  a.every((c, i) => c.type === b[i].type && c.span === b[i].span && c.front === b[i].front && c.shelves === b[i].shelves && c.h === b[i].h);

// Fronten som något ett fack FICK, inte som ett listval: "en glasfront", inte "Glas".
const FRONT_PHRASE: Record<Cell["front"], string> = {
  plain: "en slät front", slats: "en ribbfront", glass: "en glasfront",
};

// Mängd-valen som en händelse. "Inga/Några/Alla" är rätt i listan man klickar i, men i en
// tidslinje ska det stå vad som hände: raden fick luckor i alla fack.
const amountPhrase = (n: Amount, what: string) =>
  n === "none" ? `fick inga ${what}` : n === "max" ? `fick ${what} i alla fack` : `fick några ${what}`;

// Vad hände med ETT fack? Bara det som faktiskt skiljer nämns – facket har ju redan pekats ut
// av bandets etikett, så resten är underförstått.
function cellDetail(a: Cell, b: Cell): string {
  if (a.type !== b.type) return b.type === "o" ? "blev öppet" : `blev en ${CELL_LABEL[b.type].toLowerCase()}`;
  if (a.front !== b.front) return `fick ${FRONT_PHRASE[b.front]}`;
  if (a.shelves !== b.shelves) return b.shelves ? `fick ${b.shelves} hyllplan` : "fick hyllplanen borttagna";
  if (a.h !== b.h) return `blev ${b.h} cm högt`;
  return "ändrades";
}

// Vad hände i ett band? Mängd-valen (luckor/lådor/hyllplan) beskriver sig själva bäst; annars
// pekas det enskilda facket ut och blir självt meningens subjekt ("Fack 3 i rad 2 blev en
// lucka"). Ändrades flera fack på en gång får bandet en samlad etikett – en lista med fem
// fack i loggen säger mindre än "ändrades".
function bandDetail(
  band: string,
  a: { doors: Amount; drawers: Amount; shelves?: number },
  b: { doors: Amount; drawers: Amount; shelves?: number },
  ca: Cell[], cb: Cell[],
  no: (i: number) => number,
): string {
  if (a.doors !== b.doors) return `${band} ${amountPhrase(b.doors, "luckor")}`;
  if (a.drawers !== b.drawers) return `${band} ${amountPhrase(b.drawers, "lådor")}`;
  if ((a.shelves ?? 0) !== (b.shelves ?? 0))
    return b.shelves ? `${band} fick ${b.shelves} hyllplan` : `${band} fick hyllplanen borttagna`;
  const diff: number[] = [];
  for (let i = 0; i < Math.max(ca.length, cb.length); i++) {
    if (!ca[i] || !cb[i] || !sameCells([ca[i]], [cb[i]])) diff.push(i);
  }
  if (diff.length === 1 && ca[diff[0]] && cb[diff[0]])
    return `Fack ${no(diff[0])} i ${band.toLowerCase()} ${cellDetail(ca[diff[0]], cb[diff[0]])}`;
  return `${band} ändrades`;
}

function rowChange(prev: State, next: State): Change | null {
  for (let i = 0; i < next.rows.length; i++) {
    const a: Row | undefined = prev.rows[i];
    const b = next.rows[i];
    if (!a) continue;
    const ca = rowCells(a, prev.cols);
    const cb = rowCells(b, next.cols);
    if (sameCells(ca, cb)) continue;
    const band = `Rad ${stackNo(i, next.rows.length)}`;
    return { kind: `rad-${i}`, label: bandDetail(band, a, b, ca, cb, (k) => k + 1) };
  }
  return null;
}

function colChange(prev: State, next: State): Change | null {
  for (let ci = 0; ci < next.cols; ci++) {
    const a = prev.colDefs?.[ci] ?? EMPTY_COL;
    const b = next.colDefs?.[ci] ?? EMPTY_COL;
    const na = colHeight(prev, ci);
    const nb = colHeight(next, ci);
    const ca = colCells(a, na, prev.front);
    const cb = colCells(b, nb, next.front);
    if (na === nb && sameCells(ca, cb)) continue;
    const band = `Kolumn ${ci + 1}`;
    // Fackantalet i kolumnen ändrades (TV-möbelns egna stommar) – det är den ändringen som
    // syns, inte vad som råkade hamna i facken.
    if (na !== nb)
      return { kind: `kol-${ci}`, label: `${band} fick ett fack ${nb > na ? "till" : "borttaget"}` };
    return { kind: `kol-${ci}`, label: bandDetail(band, a, b, ca, cb, (k) => stackNo(k, cb.length)) };
  }
  return null;
}

// Skillnaden mellan två states som en rad i loggen. null = inget som syns på möbeln ändrades
// (t.ex. att ett band bara markerades som redigerat) – då blir det inget eget steg.
//
// Ordningen är inte godtycklig: en ändring av storlek eller stil bygger om raderna på köpet,
// så de måste läsas av före fackdiffen. Annars hade "Bredd 160 → 200 cm" rapporterats som
// "Rad 2 ändrad".
export function describeChange(prev: State, next: State): Change | null {
  if (prev.cols !== next.cols)
    return { kind: "bredd", label: `Bredden ändrades till ${realW(next.cols)} cm` };

  const shape = (s: State) => s.rows.map((row) => row.h).join("/");
  if (shape(prev) !== shape(next))
    return { kind: "hojd", label: `Höjden ändrades till ${furnitureHeightCm(next)} cm` };

  if (prev.mount !== next.mount)
    return {
      kind: "montering",
      label: next.mount === "vagg" ? "Möbeln hängdes upp på vägg" : "Möbeln ställdes på golvet",
    };

  if (prev.leg !== next.leg)
    return { kind: "ben", label: `Benen ändrades till ${nameOf(LEGS, next.leg).toLowerCase()}` };

  // Materialbytet drar med sig färgen (paletten byts), så de två är ett och samma steg.
  if (prev.material !== next.material)
    return { kind: "material", label: `Materialet ändrades till ${next.material === "ek" ? "ek" : "laminat"}` };

  if (prev.color !== next.color) {
    const name = COLORS[next.material].find((c) => c[0] === next.color)?.[1] ?? next.color;
    return { kind: "farg", label: `Färgen ändrades till ${name.toLowerCase()}` };
  }

  if (prev.front !== next.front)
    return { kind: "front", label: `Frontstilen ändrades till ${FRONT_LABEL[next.front].toLowerCase()}` };

  if (prev.handle !== next.handle)
    return { kind: "beslag", label: `Beslagen ändrades till ${nameOf(HANDLES, next.handle).toLowerCase()}` };

  if (prev.style !== next.style)
    return {
      kind: "stil",
      label: `Stilen ändrades till ${STYLES.find((s) => s.id === next.style)?.name.toLowerCase() ?? "egen"}`,
    };

  return next.axis === "kolumn" ? colChange(prev, next) : rowChange(prev, next);
}

export interface History {
  S: State;
  setS: (update: State | ((s: State) => State)) => void;
  entries: HistoryEntry[];
  cursor: number;
  canUndo: boolean;
  undo: () => void;
  jumpTo: (i: number) => void;
}

// Byggarens state MED historik. Ersätter useState<State> rakt av: setS tar samma
// uppdaterare som förut och alla anropsställen är oförändrade.
export function useConfigHistory(initial: State): History {
  const [h, setH] = useState(() => ({
    entries: [{ kind: "start", label: "Utgångsläget", state: initial, at: 0 }] as HistoryEntry[],
    cursor: 0,
  }));

  const setS = useCallback((update: State | ((s: State) => State)) => {
    setH((h) => {
      const cur = h.entries[h.cursor].state;
      const next = typeof update === "function" ? (update as (s: State) => State)(cur) : update;
      if (next === cur) return h;
      const change = describeChange(cur, next);
      // Ingen synlig ändring → byt state på plats. Annars hade loggen fyllts med steg som
      // inte går att se skillnad på, och ångra hade känts trasig.
      if (!change) {
        const entries = h.entries.slice();
        entries[h.cursor] = { ...entries[h.cursor], state: next };
        return { entries, cursor: h.cursor };
      }
      const at = Date.now();
      const head = h.entries[h.cursor];
      // Samma sorts ändring i följd är en handling, inte flera: ett drag i breddreglaget
      // ska bli ett steg att ångra, inte tjugo. Bara i loggens ände – har man hoppat bakåt
      // är nästa ändring alltid ett nytt steg.
      const merge = h.cursor === h.entries.length - 1 && head.kind === change.kind && at - head.at < COALESCE_MS;
      const entries = h.entries.slice(0, h.cursor + (merge ? 0 : 1));
      entries.push({ ...change, state: next, at });
      // Utgångsläget ligger kvar underst – det är mellanstegen som faller bort.
      if (entries.length > MAX_ENTRIES) entries.splice(1, entries.length - MAX_ENTRIES);
      return { entries, cursor: entries.length - 1 };
    });
  }, []);

  const undo = useCallback(() => setH((h) => (h.cursor > 0 ? { ...h, cursor: h.cursor - 1 } : h)), []);
  const jumpTo = useCallback(
    (i: number) => setH((h) => (i >= 0 && i < h.entries.length ? { ...h, cursor: i } : h)),
    [],
  );

  // Cmd/Ctrl+Z – ångra är en knapp i bilden, men på desktop förväntar man sig tangenten.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "z" || e.shiftKey) return;
      // Står markören i ett fält är Cmd+Z fältets egen ångra, inte möbelns.
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      e.preventDefault();
      undo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo]);

  return useMemo(
    () => ({
      S: h.entries[h.cursor].state,
      setS,
      entries: h.entries,
      cursor: h.cursor,
      canUndo: h.cursor > 0,
      undo,
      jumpTo,
    }),
    [h, setS, undo, jumpTo],
  );
}
