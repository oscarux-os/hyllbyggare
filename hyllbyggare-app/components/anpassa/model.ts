// Ämnena på produktsidan, och vart kameran ska titta för varje.
//
// Produktsidan (/lab/anpassa) är inte en byggare: den redigerar aldrig ett fack eller ett
// band, bara helheten. Därför finns ingen markering i bilden – i stället styr ÄMNET kameran.
//
// Regeln: kameran zoomar bara när det man ändrar är FYSISKT LITET i förhållande till möbeln
// (ben, beslag). Storlek, stil och material ändrar helheten – då ska hela möbeln synas, för
// det är helheten man bedömer.

import {
  COLORS, LEGS, HANDLES, STYLES,
  gridCells, colCellHeights, hasFronts, realW, furnitureHeightCm,
  type State, type Cell,
} from "@/lib/config";
import type { ShelfFocus } from "@/components/Configurator";

export type TopicId = "storlek" | "stil" | "ben" | "material" | "beslag" | "tillbehor";

/* -------------------------------------------------------------------------- */
/* Vilket band – och vilket fack i det – ett ytval ska zooma mot               */
/* -------------------------------------------------------------------------- */

// Rent state-val; kameran gör pixlarna. Preferensen är ett fack med front: materialet läser
// bäst på en lucka, och beslag finns bara där. Saknas fronter helt faller vi på möbelns mitt.
//
// wFrac/hFrac är fackets storlek i BANDETS andelar, så anroparen kan strama åt (Beslag) eller
// vidga (Material) utan att veta något om axeln: i radläge är ett fack en bråkdel av bandets
// bredd, i kolumnläge av dess höjd. Just den skillnaden hör hemma här, inte i ämnestabellen.
export interface FocusTarget {
  index: number;
  xFrac: number;
  yFrac: number;
  wFrac: number;
  hFrac: number;
}

const isFront = (c?: Cell) => !!c && c.type !== "o";

export function focusTarget(S: State): FocusTarget {
  const grid = gridCells(S); // rader × kolumner, uppifrån och ner
  const isCol = S.axis === "kolumn";
  // Ett band är en rad (grid-raden) eller en kolumn (samma index tvärs raderna).
  const bands: Cell[][] = isCol
    ? Array.from({ length: S.cols }, (_, ci) => grid.map((row) => row[ci]).filter(Boolean))
    : grid;

  // Rader lagras uppifrån och ner (se stackNo), så "översta bandet med front" är index 0 och
  // uppåt. Kolumner räknas från vänster.
  let index = bands.findIndex((b) => b.some(isFront));
  if (index < 0) index = Math.floor(bands.length / 2);
  const band = bands[index] ?? [];
  if (!band.length) return { index, xFrac: 0.5, yFrac: 0.5, wFrac: 1, hFrac: 1 };

  const pick = band.findIndex(isFront);
  const ci = pick >= 0 ? pick : Math.floor(band.length / 2);

  if (isCol) {
    // Bandet är en modul brett → ingen breddbeskärning. Facket pekas ut på höjden, viktat med
    // fackens verkliga höjder (en TV-bänk kan ha ett högt fack bland låga).
    const hs = colCellHeights(S, index);
    const total = hs.reduce((a, h) => a + h, 0) || 1;
    let acc = 0;
    for (let i = 0; i < ci; i++) acc += hs[i] ?? 40;
    const h = hs[ci] ?? 40;
    return { index, xFrac: 0.5, yFrac: (acc + h / 2) / total, wFrac: 1, hFrac: h / total };
  }
  // Radläge: facken är span-viktade (Cube får flex: span), så andelen räknas ur SPANNEN och
  // inte ur antalet fack – en span-2-lucka är dubbelt så bred som sina grannar.
  const total = band.reduce((a, c) => a + c.span, 0) || 1;
  let acc = 0;
  for (let i = 0; i < ci; i++) acc += band[i].span;
  return {
    index,
    xFrac: (acc + band[ci].span / 2) / total,
    yFrac: 0.5,
    wFrac: band[ci].span / total,
    hFrac: 1,
  };
}

/* -------------------------------------------------------------------------- */
/* Ämnesregistret                                                             */
/* -------------------------------------------------------------------------- */

export interface Topic {
  id: TopicId;
  /** Etiketten på kortet och rubriken i panelen ("Välj " + title på knappen). */
  title: string;
  /** Texten på panelens bekräftelseknapp. */
  cta: string;
  /** Kameramålet. Saknas den vilar kameran på hela möbeln. */
  shot?: (S: State) => ShelfFocus;
}

export const TOPICS: Topic[] = [
  // Formvalen: silhuetten ÄR valet, så kameran ska visa hela möbeln.
  { id: "storlek", title: "Storlek", cta: "Välj storlek" },
  { id: "stil", title: "Stil", cta: "Välj stil" },
  // Ytvalen: skillnaden syns bara nära.
  {
    id: "ben",
    title: "Ben & montering",
    cta: "Välj ben",
    // Bottenkant + ben + golvspalt, beskuret mot vänstra hörnet: ytterbenet sitter alltid där
    // (Legs har alltid ben i båda ändarna), medan ett mittben bara finns vid fyra sektioner
    // eller fler – en centrerad beskärning skulle på en treradare visa golv utan ben.
    shot: () => ({ kind: "base", wFrac: 0.5, xFrac: 0.16, fill: 0.82, max: 2.4 }),
  },
  // Material zoomar INTE: färgen gäller hela möbeln, så det är helheten man vill bedöma.
  // En närbild på ådringen säger inget om hur möbeln känns i rummet.
  { id: "material", title: "Material", cta: "Välj material" },
  {
    id: "beslag",
    title: "Beslag",
    cta: "Välj beslag",
    // Nästan makro, förskjutet mot fackets högra kant: luckans handtag sitter där, lådans i
    // mitten – nudgen tar med båda.
    shot: (S) => {
      const t = focusTarget(S);
      return {
        kind: "band", index: t.index, xFrac: t.xFrac + t.wFrac * 0.22, yFrac: t.yFrac,
        wFrac: t.wFrac * 0.7, hFrac: Math.min(1, t.hFrac * 0.8), fill: 0.9, max: 4.5,
      };
    },
  },
  { id: "tillbehor", title: "Tillbehör", cta: "Klar" },
];

export const topicById = (id: TopicId) => TOPICS.find((t) => t.id === id)!;

/** Beslag går inte att välja på en helt öppen möbel – samma villkor som byggaren använder. */
export const topicDisabled = (S: State, id: TopicId) => id === "beslag" && !hasFronts(S);

/** Kameramålet för ett ämne. null = inget ämne öppet → hela möbeln. */
export function focusFor(S: State, id: TopicId | null): ShelfFocus {
  const shot = id ? topicById(id).shot : undefined;
  return shot ? shot(S) : { kind: "none" };
}

/* -------------------------------------------------------------------------- */
/* Kortens innehåll                                                           */
/* -------------------------------------------------------------------------- */

// Korta specrader i stället för LEGS/HANDLES prosabeskrivningar: kortet är en sammanfattning
// man läser i ett svep, inte en säljtext. Den långa texten hör hemma på brickan i panelen.
const HANDLE_SUB: Record<string, string> = {
  h1: "Massiv ek",
  h2: "Mässing",
  h3: "Metall",
  push: "Utan beslag",
};

export interface Summary {
  /** Ämnets namn – kortets överrad. */
  title: string;
  /** Det valda värdet – kortets huvudrad. */
  label: string;
  /** En rad spec under värdet. */
  sub?: string;
}

export function summaryFor(S: State, id: TopicId, tillval = 0): Summary {
  const t = topicById(id);
  switch (id) {
    // Storleken är det enda kortet där ÄMNET är huvudraden: "116 × 155 cm" i sig säger inte
    // vad det är ett mått på, medan "Ljusbetsad EK" bär sitt eget sammanhang.
    case "storlek":
      return { title: t.title, label: "Storlek", sub: `${realW(S.cols)} × ${furnitureHeightCm(S)} cm` };
    case "stil": {
      const style = STYLES.find((x) => x.id === S.style);
      return { title: t.title, label: style?.name ?? "Egen", sub: style?.desc ?? "Din egen komposition" };
    }
    case "ben":
      if (S.mount === "vagg") return { title: t.title, label: "Väggmonterad", sub: "Fri golvyta under" };
      return { title: t.title, label: LEGS.find((l) => l[0] === S.leg)?.[1] ?? "Ben", sub: "12 cm högt" };
    case "material": {
      const name = COLORS[S.material].find((c) => c[0] === S.color)?.[1] ?? S.color;
      return { title: t.title, label: name, sub: S.material === "ek" ? "Massiv ek" : "Laminat" };
    }
    case "beslag": {
      const h = HANDLES.find((x) => x[0] === S.handle);
      return { title: t.title, label: h?.[1] ?? "Beslag", sub: HANDLE_SUB[S.handle] };
    }
    case "tillbehor":
      return {
        title: t.title,
        label: "Lägg till tillbehör",
        sub: tillval ? `${tillval} ${tillval === 1 ? "vald" : "valda"}` : undefined,
      };
  }
}
