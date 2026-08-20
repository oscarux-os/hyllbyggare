// Valen på produktsidan: vilka ämnen som finns, vad varje ämne innehåller, och vart
// kameran ska titta.
//
// Rutnätsomtaget (Figma "v4 Volvo stil konfig") ställde ett krav som den gamla formen inte
// hade: SAMMA alternativ ska ritas på fyra ställen – som stor bild i rutnätets cell, som
// 108-brickan i panelen, som produktfoto i detaljvyn, och som text i sammanfattningen. Därför
// finns alternativen på ett ställe här (`sectionOptions`) i stället för att skrivas om en gång
// per yta. Modulen är fri från JSX med flit: den beskriver VAD som ska ritas (`Media`), och
// `OptionMedia` avgör hur.
//
// Kameraregeln är oförändrad: den zoomar bara när det man ändrar är FYSISKT LITET i
// förhållande till möbeln (ben, handtag). Storlek, stil och material ändrar helheten – då ska
// hela möbeln synas, för det är helheten man bedömer.

import {
  CATEGORIES, COLORS, LEGS, HANDLES, STYLES, FRONT_LABEL,
  applyStyle, setWoodFront, glazeDoors, priceOf,
  gridCells, colCellHeights, hasFronts, realW, furnitureHeightCm,
  type State, type Cell, type Row, type Material, type Front, type WoodFront,
} from "@/lib/config";
import { LEG_IMAGES, EK_IMAGES, HANDLE_IMAGES, FRONT_IMAGES } from "@/components/Configurator";
import type { ShelfFocus } from "@/components/Configurator";

/** Ett ämne = en cell i rutnätet och en panel när den är öppen. */
export type TopicId = "stil" | "material" | "luckor" | "ben" | "tillbehor";
/** En sektion = en rubrik med alternativ inuti en panel. Ett ämne kan bära två. */
export type SectionId = "stil" | "storlek" | "material" | "front" | "ben" | "beslag" | "tillbehor";

/* -------------------------------------------------------------------------- */
/* Vilket band – och vilket fack i det – ett ytval ska zooma mot               */
/* -------------------------------------------------------------------------- */

// Rent state-val; kameran gör pixlarna. Preferensen är ett fack med front: materialet läser
// bäst på en lucka, och handtag finns bara där. Saknas fronter helt faller vi på möbelns mitt.
//
// wFrac/hFrac är fackets storlek i BANDETS andelar, så anroparen kan strama åt (Handtag) eller
// vidga utan att veta något om axeln: i radläge är ett fack en bråkdel av bandets bredd, i
// kolumnläge av dess höjd. Just den skillnaden hör hemma här, inte i ämnestabellen.
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
  /** Cellens rubrik i rutnätet. */
  title: string;
  /** Texten på panelens bekräftelseknapp. */
  cta: string;
  /** Sektionerna panelen visar, i ordning. Den första ger panelens rubrik. */
  sections: SectionId[];
  /** Kameramålet. Saknas den vilar kameran på hela möbeln. */
  shot?: (S: State) => ShelfFocus;
}

export const SECTION_TITLE: Record<SectionId, string> = {
  stil: "Stil",
  storlek: "Storlek",
  material: "Material",
  front: "Front",
  ben: "Ben",
  beslag: "Handtag",
  tillbehor: "Tillbehör",
};

export const TOPICS: Topic[] = [
  // Formvalen bor ihop: silhuetten ÄR valet, och storleken ändrar samma silhuett. Kameran
  // visar hela möbeln.
  { id: "stil", title: "Stil & storlek", cta: "Välj storlek & stil", sections: ["stil", "storlek"] },
  // Materialet gäller HELA möbeln – stomme och fronter – och zoomar därför inte: en närbild på
  // ådringen säger inget om hur möbeln känns i rummet.
  { id: "material", title: "Material", cta: "Välj material", sections: ["material"] },
  {
    // Front och handtag är samma sak sett utifrån: hur luckan ser ut. Handtaget SITTER på
    // fronten, och båda finns bara om möbeln har en front – samma beroende, alltså samma val.
    // Faller fronterna bort försvinner hela cellen, i stället för att en sektion tyst saknas.
    id: "luckor",
    title: "Luckor",
    cta: "Välj front & handtag",
    sections: ["front", "beslag"],
    // Närbild på en lucka: tillräckligt nära för att handtaget ska gå att se, tillräckligt
    // brett för att ribborna ska läsa som ett mönster. Ren makro på beslaget gjorde fronten
    // till en suddig fond.
    shot: (S) => {
      const t = focusTarget(S);
      return {
        kind: "band", index: t.index, xFrac: t.xFrac + t.wFrac * 0.14, yFrac: t.yFrac,
        wFrac: t.wFrac * 0.85, hFrac: Math.min(1, t.hFrac * 0.9), fill: 0.9, max: 3.2,
      };
    },
  },
  {
    id: "ben",
    title: "Ben",
    cta: "Klar",
    sections: ["ben"],
    // Bottenkant + ben + golvspalt, beskuret mot vänstra hörnet: ytterbenet sitter alltid där
    // (Legs har alltid ben i båda ändarna), medan ett mittben bara finns vid fyra sektioner
    // eller fler – en centrerad beskärning skulle på en treradare visa golv utan ben.
    shot: () => ({ kind: "base", wFrac: 0.5, xFrac: 0.16, fill: 0.82, max: 2.4 }),
  },
  { id: "tillbehor", title: "Tillbehör", cta: "Klar", sections: ["tillbehor"] },
];

export const topicById = (id: TopicId) => TOPICS.find((t) => t.id === id)!;

/** Cellerna i rutnätets högra halva. Stil & storlek saknas: den cellen ÄR bildytan. */
export const GRID_CELLS: TopicId[] = ["material", "luckor", "ben", "tillbehor"];

/** Luckor – och därmed front och handtag – finns inte att välja på en helt öppen möbel. */
export const topicDisabled = (S: State, id: TopicId) => id === "luckor" && !hasFronts(S);

/**
 * Sektioner som inte gäller just den här möbeln. Front och handtag bor i ett ämne som redan
 * försvinner utan fronter, så villkoret finns kvar som ett skyddsnät: sätter någon ihop ett
 * ämne där en sektion inte kan gälla ska den inte ritas.
 */
export const sectionDisabled = (S: State, id: SectionId) =>
  (id === "front" || id === "beslag") && !hasFronts(S);

/** Sektionerna ett ämne faktiskt visar just nu. */
export const sectionsFor = (S: State, topic: Topic) =>
  topic.sections.filter((id) => !sectionDisabled(S, id));

/**
 * Texten på bekräftelseknappen. Står alla sektioner kvar är det ämnets egen formulering
 * ("Välj storlek & stil"); faller en bort skrivs knappen om, så den inte lovar ett val som
 * inte finns i panelen.
 */
export function ctaFor(S: State, topic: Topic): string {
  const shown = sectionsFor(S, topic);
  if (shown.length === topic.sections.length) return topic.cta;
  return "Välj " + shown.map((id) => SECTION_TITLE[id].toLowerCase()).join(" & ");
}

/** Kameramålet för ett ämne. null = inget ämne öppet → hela möbeln. */
export function focusFor(S: State, id: TopicId | null): ShelfFocus {
  const shot = id ? topicById(id).shot : undefined;
  return shot ? shot(S) : { kind: "none" };
}

/* -------------------------------------------------------------------------- */
/* Alternativen                                                               */
/* -------------------------------------------------------------------------- */

/** Vad som ska ritas i en bricka, en cell eller en detaljbild. `OptionMedia` gör pixlarna. */
export type Media =
  /** `fit`: träytor och laminat fyller brickan (cover), produktfoton står fritt (contain). */
  | { kind: "image"; src: string; fit?: "cover" | "contain" }
  | { kind: "swatch"; color: string }
  /** Din egen komposition, ritad som MiniShelf – inte en generisk tumnagel. */
  | { kind: "shelf"; rows: Row[]; cols: number }
  /** Överlappande runda miniatyrer av valda tillval. */
  | { kind: "tillval"; ids: string[] }
  | { kind: "none" };

export interface Option {
  id: string;
  name: string;
  desc?: string;
  media: Media;
  selected: boolean;
  /** Valet gäller hela möbeln – panelen väljer aldrig ett fack. */
  apply: (s: State) => State;
}

export function sectionOptions(S: State, id: SectionId): Option[] {
  switch (id) {
    case "stil":
      return STYLES.map((style) => ({
        id: style.id,
        name: style.name,
        desc: style.desc,
        media: { kind: "shelf", rows: applyStyle(style.id, S.cols, S.rows), cols: S.cols },
        selected: S.style === style.id,
        apply: (s) => ({ ...s, style: style.id, rows: applyStyle(style.id, s.cols, s.rows) }),
      }));

    case "material":
      return (Object.keys(COLORS) as Material[]).flatMap((material) =>
        COLORS[material].map(([hex, name, desc]) => ({
          id: hex,
          name,
          desc,
          media: EK_IMAGES[hex] ? ({ kind: "image", src: EK_IMAGES[hex], fit: "cover" } as Media) : ({ kind: "swatch", color: hex } as Media),
          selected: S.material === material && S.color === hex,
          apply: (s: State) => ({ ...s, material, color: hex }),
        })),
      );

    case "front": {
      // Glas finns bara som val om det finns en LUCKA att sätta det i: en låda kan inte vara
      // av glas (se glazeDoors), så på en möbel med bara lådor vore brickan en knapp som inte
      // gör något. Och de tre är ömsesidigt uteslutande: har luckorna glas är det glas som är
      // valt, annars är det trästilen – därför `replaceGlass` när man går tillbaka till trä.
      const glass = hasGlass(S);
      const fronts: Front[] = hasDoors(S) ? ["plain", "slats", "glass"] : ["plain", "slats"];
      return fronts.map((front) => ({
        id: front,
        name: FRONT_LABEL[front],
        desc: FRONT_DESC[front],
        media: { kind: "image", src: FRONT_IMAGES[front] },
        selected: front === "glass" ? glass : !glass && S.front === front,
        apply: (s) => (front === "glass" ? glazeDoors(s) : setWoodFront(s, front as WoodFront, true)),
      }));
    }

    case "ben":
      // Montering är föräldern och benet undervalet, så de bor i samma lista: antingen hänger
      // möbeln på väggen, eller så står den på ett av benen.
      return [
        {
          id: "vagg",
          name: "Väggmonterad",
          desc: "Svävar på väggen med fri golvyta under.",
          media: { kind: "image", src: VAGG_IMAGE },
          selected: S.mount === "vagg",
          apply: (s) => ({ ...s, mount: "vagg" }),
        },
        ...LEGS.map(([id, name, desc]) => ({
          id,
          name,
          desc,
          media: { kind: "image", src: LEG_IMAGES[id] } as Media,
          selected: S.mount === "staende" && S.leg === id,
          apply: (s: State) => ({ ...s, mount: "staende" as const, leg: id }),
        })),
      ];

    case "beslag":
      return HANDLES.map(([id, name, desc]) => ({
        id,
        name,
        desc,
        media: { kind: "image", src: HANDLE_IMAGES[id] },
        selected: S.handle === id,
        apply: (s) => ({ ...s, handle: id }),
      }));

    // Storlek är två reglage och tillbehör en egen lista – inga brickor.
    default:
      return [];
  }
}

// Väggmonterad har ingen produkt att fotografera – det är frånvaron av ben som är valet. Bilden
// visar därför möbeln hängande på väggen. Dess bakgrund är lagd i exakt brickans ton, så rutan
// ser ut som en bricka och inte som ett foto klistrat på en bricka.
const VAGG_IMAGE = "/legs/vaggmonterad.webp";

/** Har möbeln en lucka? Bara luckor kan vara i glas. */
const hasDoors = (S: State) => gridCells(S).some((row) => row.some((c) => c?.type === "l"));
/** Är fronterna i glas? Räcker med en – glaset är då det man ser. */
const hasGlass = (S: State) => gridCells(S).some((row) => row.some((c) => c?.front === "glass"));

const FRONT_DESC: Record<Front, string> = {
  plain: "Slät front i massiv ek – lugn och stram.",
  slats: "Ribbad front – ljuset fångas i spåren.",
  glass: "Glaslucka i träram – visar upp det som står bakom.",
};

/* -------------------------------------------------------------------------- */
/* Vad ett val kostar                                                         */
/* -------------------------------------------------------------------------- */

const handleOf = (s: State) => (HANDLES.some((h) => h[0] === s.handle) ? s.handle : HANDLES[0][0]);

/**
 * Prisskillnaden mellan alternativen i en sektion, räknad från det billigaste. Ek kostar mer
 * än laminat, glas mer än trä, ett bygelhandtag mer än push – och det ska synas VID valet, inte
 * bara i totalen. Nollan visas inte: "om det är en prisförändring" är hela poängen.
 *
 * Räknas genom att faktiskt tillämpa varje alternativ och prissätta resultatet, så siffran kan
 * aldrig glida ifrån `priceOf`. Fem–sju alternativ per sektion – billigt nog att göra i render.
 */
export function sectionDeltas(S: State, id: SectionId): Map<string, number> {
  const opts = sectionOptions(S, id);
  if (!opts.length) return new Map();
  const prices = opts.map((o) => priceOf(o.apply(S), handleOf(o.apply(S))));
  const base = Math.min(...prices);
  return new Map(opts.map((o, i) => [o.id, prices[i] - base]));
}

/** "+1.200:-" – tomt när valet inte ändrar priset. */
export const formatDelta = (d: number) =>
  d === 0 ? "" : `${d > 0 ? "+" : "−"}${Math.abs(d).toLocaleString("sv-SE")}:-`;

/* -------------------------------------------------------------------------- */
/* Cellernas innehåll                                                         */
/* -------------------------------------------------------------------------- */

// Korta specrader i stället för LEGS/HANDLES prosabeskrivningar: cellen är en sammanfattning
// man läser i ett svep, inte en säljtext. Den långa texten hör hemma på brickan i panelen.
const HANDLE_SUB: Record<string, string> = {
  h1: "Massiv ek",
  h2: "Mässing",
  h3: "Metall",
  push: "Utan beslag",
};

export interface Summary {
  /** Cellens överrad. */
  title: string;
  /** Det valda värdet – cellens andra rad. */
  value: string;
}

export function summaryFor(S: State, id: TopicId, tillval = 0): Summary {
  switch (id) {
    // Möbelcellen skriver ut vad möbeln ÄR ("Bokhylla Kollage") och måtten under, som i
    // skissen – ämnesnamnet "Stil & storlek" står bara på panelen.
    case "stil": {
      const cat = CATEGORIES.find((c) => c.id === S.category)?.name ?? "Bokhylla";
      const style = STYLES.find((x) => x.id === S.style);
      return {
        title: style ? `${cat} ${style.name}` : cat,
        value: `${realW(S.cols)} x ${furnitureHeightCm(S)} cm`,
      };
    }
    case "material": {
      const name = COLORS[S.material].find((c) => c[0] === S.color)?.[1] ?? S.color;
      return { title: "Material", value: name };
    }
    case "luckor": {
      const handle = HANDLES.find((x) => x[0] === S.handle)?.[1] ?? "Handtag";
      return { title: "Luckor", value: `${frontLabelOf(S)}, ${handle.toLowerCase()}` };
    }
    case "ben":
      return {
        title: "Ben",
        value: S.mount === "vagg" ? "Väggmonterad" : LEGS.find((l) => l[0] === S.leg)?.[1] ?? "Ben",
      };
    case "tillbehor":
      return {
        title: "Tillbehör",
        value: tillval ? `${tillval} ${tillval === 1 ? "valt" : "valda"}` : "Lägg till tillbehör",
      };
  }
}

/** "Glas" när luckorna är glasade, annars trästilen. Samma regel som frontbrickorna. */
export const frontLabelOf = (S: State) => (hasGlass(S) ? FRONT_LABEL.glass : FRONT_LABEL[S.front]);

/** Bilden i en rutnätscell visar VALET, inte kategorin. */
export function cellMedia(S: State, id: TopicId, added: Set<string>): Media {
  switch (id) {
    case "stil":
      return { kind: "shelf", rows: S.rows, cols: S.cols };
    case "material":
      return EK_IMAGES[S.color] ? { kind: "image", src: EK_IMAGES[S.color], fit: "cover" } : { kind: "swatch", color: S.color };
    case "ben":
      return S.mount === "vagg"
        ? { kind: "image", src: VAGG_IMAGE }
        : { kind: "image", src: LEG_IMAGES[S.leg] };
    case "luckor":
      // Luckan är det man ser i rummet; handtaget står i cellens text.
      return { kind: "image", src: FRONT_IMAGES[hasGlass(S) ? "glass" : S.front] };
    case "tillbehor":
      return { kind: "tillval", ids: Array.from(added) };
  }
}

/* -------------------------------------------------------------------------- */
/* Detaljvyn ("Läs mer")                                                      */
/* -------------------------------------------------------------------------- */

// PLATSHÅLLARE. Skissen visar leveranstid, säljtext och miljömärkning per alternativ – det
// finns inte som data någonstans. Allt påhittat innehåll bor här, på ett ställe, så det är
// tydligt vad som ska bytas mot riktigt när det finns.
const SPEC_BODY =
  "Massiv ek som får synas. Ytan är oljad för hand, vilket gör ådringen tydlig och " +
  "reparerbar: en repa går att olja bort i stället för att bli permanent. Möbeln " +
  "tillverkas i Europa och levereras omonterad.";

export interface OptionSpec {
  /** Raden under namnet, t.ex. leveranstid. */
  lead: string;
  body: string;
  rows: [string, string][];
  /** Miljömärkning, visas med FSC-märket. */
  eco?: string;
}

export function optionSpec(S: State, section: SectionId, option: Option): OptionSpec {
  const material = S.material === "ek" ? "Massiv ek" : "Laminat";
  const color = COLORS[S.material].find((c) => c[0] === S.color)?.[1] ?? "-";

  let rows: [string, string][];
  switch (section) {
    case "material":
      rows = [["Material", material], ["Färg", option.name]];
      break;
    case "front":
      rows = [["Material", option.id === "glass" ? "Glas i träram" : material], ["Färg", color]];
      break;
    case "ben":
      rows = option.id === "vagg"
        ? [["Material", "Väggskena i stål"], ["Montering", "Skruvas i vägg"]]
        : [["Material", "Metall eller massivt trä"], ["Höjd", "12 cm"]];
      break;
    case "beslag":
      rows = [
        ["Material", HANDLE_SUB[option.id] ?? "Metall"],
        ["Montering", option.id === "push" ? "Tryckbeslag" : "Skruvas i fronten"],
      ];
      break;
    default:
      rows = [["Material", material], ["Moduler", `${S.cols} × ${S.rows.length}`]];
  }

  return {
    lead: "Beställningsvara 6–7 veckor",
    body: option.desc ? `${option.desc} ${SPEC_BODY}` : SPEC_BODY,
    rows,
    eco: "FSC-certifierad",
  };
}

/* -------------------------------------------------------------------------- */
/* Tillbehör i ämnespanelen                                                   */
/* -------------------------------------------------------------------------- */

// Tillbehöret ska höra till valet man står i: möbeltassar under Ben, waxolja under Material
// (skissen). Handtag och stil har inget självklart tillbehör, och då visas inget – ett kort med
// en produkt som inte hör ihop med valet är sämre än inget kort.
//
// Id:n ur CARE_PRODUCTS i lib/tillval.ts.
export const TOPIC_OFFERS: Partial<Record<TopicId, string[]>> = {
  material: ["vard-waxolja"],
  ben: ["vard-tassar"],
};

// Vardagsordet för vad tillbehöret hör till. Skiljer sig med flit från sektionsrubriken:
// sektionen heter "Front", men man skyddar och vårdar en LUCKA. Rubriken skrivs av de
// sektioner som faktiskt visas, så den aldrig nämner luckor på en helt öppen möbel.
const OFFER_WORD: Record<SectionId, string> = {
  stil: "stilen",
  storlek: "storleken",
  material: "material",
  front: "luckor",
  ben: "ben",
  beslag: "handtag",
  tillbehor: "tillbehör",
};

/** "Tillbehör till material och luckor" – så det syns vad tillbehöret är till. */
export function offerTitleFor(S: State, topic: Topic): string {
  const words = sectionsFor(S, topic).map((id) => OFFER_WORD[id]);
  const list = words.length > 1 ? `${words.slice(0, -1).join(", ")} och ${words[words.length - 1]}` : words[0];
  return `Tillbehör till ${list}`;
}
