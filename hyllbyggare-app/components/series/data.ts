// Data för Anamosa-seriesidan. Inline TS i samma stil som lib/config.ts – ingen JSON.
// Copy i Mios ton (se Tonalitet.md): vänligt du-tilltal, kort och rakt.

import { r, cellObj as x, type Material, type Front, type State, type Row } from "@/lib/config";

/* ---------- Konfigurationer (karusell) ---------- */

export type ConfigType = "Bokhylla" | "Skänk" | "TV-bänk" | "Byrå" | "Skåp & Vitringskåp";

export type Config = {
  id: string;
  name: string;
  dims: string;
  type: ConfigType;
  priceSale: string;
  priceOrig: string;
  discount: string;
  image?: string; // foto om det finns; annars renderas en förhandsvisning av bygget
  placeholder?: boolean; // true = inget foto än, kortet visar en renderad förhandsvisning
  // Handkodat bygge som matchar fotot. Finns det ett layout öppnar "Välj" byggaren i
  // exakt detta läge (i stället för kategorins generiska default) – se Studio och
  // ConfigPreview. Byggs med lib/config-primitiverna r() och cellObj().
  layout?: State;
  // Byggar-preset som "Välj" öppnar (se buildConfigState i lib/config.ts).
  category: string; // kategori-id i CATEGORIES
  style?: string; // stil-id i STYLES
  material?: Material;
  color?: string;
  front?: Front;
  cols?: number; // bredd i sektioner (~40 cm styck) – styr förhandsvisningen
  heightUnits?: number; // höjd i 40 cm-moduler – styr förhandsvisningen
};

// Ordningen styr flikarna i karusellen. Bokhylla är förvald.
export const CONFIG_FILTERS: ConfigType[] = [
  "Bokhylla",
  "Skänk",
  "TV-bänk",
  "Byrå",
  "Skåp & Vitringskåp",
];

/* ---------- Bygge-layouter för foto-korten ---------- */
// Varje layout är "översatt" från motsvarande foto: samma komposition av öppna fack,
// luckor och lådor. Radmodellen kan inte göra en cell som är både 2-radig lucka och
// öppet-över-lådor i samma kolumn, så höga luckor uttrycks som en h:80-rad och de
// blir därför en nära approximation snarare än pixelperfekta.
const layoutState = (over: Partial<State> & { rows: Row[] }): State => ({
  cols: 4, mount: "staende", leg: "ek", material: "ek", color: "#C9A36A",
  front: "plain", handle: "h1", style: null, ...over,
});

// Config 1 – ljus ek, helöppen bokhylla (4×4 öppna fack, några med hyllplan).
const layout1: State = layoutState({
  category: "hyllor", material: "ek", color: "#C9A36A", front: "plain",
  rows: [
    r({ h: 40, cells: [x("o", 1, "plain", 1), x("o", 1), x("o", 1), x("o", 1, "plain", 1)] }),
    r({ h: 40, cells: [x("o", 1), x("o", 1), x("o", 1), x("o", 1)] }),
    r({ h: 40, cells: [x("o", 1, "plain", 1), x("o", 1), x("o", 1), x("o", 1, "plain", 1)] }),
    r({ h: 40, cells: [x("o", 1), x("o", 1), x("o", 1), x("o", 1)] }),
  ],
});

// Config 2 – ek med ribbad lucka + lådor upptill, ribbad och slät storlucka nedtill.
const layout2: State = layoutState({
  category: "hyllor", material: "ek", color: "#C9A36A", front: "slats",
  rows: [
    r({ h: 40, cells: [x("o", 1, "plain", 1), x("o", 1), x("l", 1, "slats"), x("o", 1, "plain", 1)] }),
    r({ h: 40, cells: [x("o", 1), x("o", 1), x("d", 1), x("o", 1)] }),
    r({ h: 80, cells: [x("l", 1, "slats"), x("l", 1, "plain"), x("o", 1, "plain", 2), x("o", 1, "plain", 2)] }),
  ],
});

// Config 3/4/5/6 – bred ribbad lucka upptill höger, ribbad + slät storlucka nedtill
// vänster, lådor nedtill höger. Delas av de gröna/taupe korten (hylla resp. vitrin).
const layoutC = (over: Partial<State> = {}): State => layoutState({
  category: "hyllor", material: "laminat", color: "#5E7560", front: "slats",
  rows: [
    r({ h: 40, cells: [x("o", 1), x("o", 1), x("l", 2, "slats")] }),
    r({ h: 40, cells: [x("o", 1), x("o", 1), x("o", 1), x("o", 1)] }),
    r({ h: 80, cells: [x("l", 1, "slats"), x("l", 1, "plain"), x("d", 1), x("d", 1)] }),
  ],
  ...over,
});

export const CONFIGS: Config[] = [
  { id: "1", name: "Konfiguration 1", dims: "162x45x79 cm", type: "Bokhylla", priceSale: "18.546:-", priceOrig: "26.495:-", discount: "-30%", image: "/series/config-1.png", category: "hyllor", style: "mosaik", material: "ek", color: "#C9A36A", layout: layout1 },
  { id: "2", name: "Konfiguration 2", dims: "165x38x83 cm", type: "Bokhylla", priceSale: "18.546:-", priceOrig: "26.495:-", discount: "-30%", image: "/series/config-2.png", category: "hyllor", style: "rytm", material: "ek", color: "#C9A36A", front: "slats", layout: layout2 },
  { id: "3", name: "Konfiguration 3", dims: "150x42x85 cm", type: "Bokhylla", priceSale: "18.546:-", priceOrig: "26.495:-", discount: "-30%", image: "/series/config-3.png", category: "hyllor", style: "kollage", material: "laminat", color: "#5E7560", layout: layoutC() },
  { id: "4", name: "Konfiguration 4", dims: "160x44x80 cm", type: "Bokhylla", priceSale: "18.546:-", priceOrig: "26.495:-", discount: "-30%", image: "/series/config-4.png", category: "hyllor", style: "mosaik", material: "laminat", color: "#B3A998", layout: layoutC({ color: "#B3A998" }) },
  // De gröna med luckor fungerar även som skåp/vitrin – så filtret har något att visa.
  { id: "5", name: "Konfiguration 5", dims: "150x42x85 cm", type: "Skåp & Vitringskåp", priceSale: "16.796:-", priceOrig: "23.995:-", discount: "-30%", image: "/series/config-3.png", category: "vitrin", material: "laminat", color: "#5E7560", layout: layoutC({ category: "vitrin" }) },
  { id: "6", name: "Konfiguration 6", dims: "160x44x80 cm", type: "Skåp & Vitringskåp", priceSale: "17.496:-", priceOrig: "24.995:-", discount: "-30%", image: "/series/config-4.png", category: "vitrin", material: "laminat", color: "#B3A998", layout: layoutC({ category: "vitrin", color: "#B3A998" }) },

  // Genererade konfigurationer för produkttyper utan foto. "Välj" öppnar rätt kategori
  // i byggaren och kortet visar en renderad förhandsvisning av just detta bygge
  // (cols = bredd i sektioner, heightUnits = höjd i 40 cm-moduler).
  { id: "7", name: "Konfiguration 1", dims: "180x45x86 cm", type: "Skänk", priceSale: "12.596:-", priceOrig: "17.995:-", discount: "-30%", placeholder: true, category: "skankar", material: "ek", color: "#C9A36A", cols: 4, heightUnits: 2 },
  { id: "8", name: "Konfiguration 2", dims: "200x45x86 cm", type: "Skänk", priceSale: "13.996:-", priceOrig: "19.995:-", discount: "-30%", placeholder: true, category: "skankar", material: "laminat", color: "#5E7560", cols: 5, heightUnits: 2 },
  { id: "9", name: "Konfiguration 1", dims: "180x42x78 cm", type: "TV-bänk", priceSale: "9.796:-", priceOrig: "13.995:-", discount: "-30%", placeholder: true, category: "tvbank", material: "ek", color: "#C9A36A", cols: 4, heightUnits: 2 },
  { id: "10", name: "Konfiguration 2", dims: "220x42x78 cm", type: "TV-bänk", priceSale: "11.196:-", priceOrig: "15.995:-", discount: "-30%", placeholder: true, category: "tvbank", material: "laminat", color: "#3C3C3A", cols: 5, heightUnits: 2 },
  { id: "11", name: "Konfiguration 1", dims: "120x45x86 cm", type: "Byrå", priceSale: "8.396:-", priceOrig: "11.995:-", discount: "-30%", placeholder: true, category: "byraar", material: "ek", color: "#C9A36A", cols: 3, heightUnits: 2 },
  { id: "12", name: "Konfiguration 2", dims: "90x45x120 cm", type: "Byrå", priceSale: "7.696:-", priceOrig: "10.995:-", discount: "-30%", placeholder: true, category: "byraar", material: "ek", color: "#6B4F3A", cols: 2, heightUnits: 3 },

  // Fler genererade konfigurationer så varje kategori fyller karusellen.
  // Bokhylla
  { id: "13", name: "Konfiguration 5", dims: "140x40x120 cm", type: "Bokhylla", priceSale: "19.596:-", priceOrig: "27.995:-", discount: "-30%", placeholder: true, category: "hyllor", style: "rytm", material: "ek", color: "#C9A36A", cols: 3, heightUnits: 3 },
  { id: "14", name: "Konfiguration 6", dims: "200x45x90 cm", type: "Bokhylla", priceSale: "22.396:-", priceOrig: "31.995:-", discount: "-30%", placeholder: true, category: "hyllor", style: "kollage", material: "laminat", color: "#445362", cols: 5, heightUnits: 2 },
  { id: "15", name: "Konfiguration 7", dims: "120x38x160 cm", type: "Bokhylla", priceSale: "20.996:-", priceOrig: "29.995:-", discount: "-30%", placeholder: true, category: "hyllor", style: "mosaik", material: "ek", color: "#6B4F3A", cols: 3, heightUnits: 4 },
  // Skänk
  { id: "16", name: "Konfiguration 3", dims: "160x45x86 cm", type: "Skänk", priceSale: "11.896:-", priceOrig: "16.995:-", discount: "-30%", placeholder: true, category: "skankar", material: "ek", color: "#6B4F3A", cols: 4, heightUnits: 2 },
  { id: "17", name: "Konfiguration 4", dims: "220x45x86 cm", type: "Skänk", priceSale: "15.396:-", priceOrig: "21.995:-", discount: "-30%", placeholder: true, category: "skankar", material: "laminat", color: "#445362", front: "slats", cols: 5, heightUnits: 2 },
  { id: "18", name: "Konfiguration 5", dims: "120x38x86 cm", type: "Skänk", priceSale: "10.496:-", priceOrig: "14.995:-", discount: "-30%", placeholder: true, category: "skankar", material: "ek", color: "#C9A36A", cols: 3, heightUnits: 2 },
  // TV-bänk
  { id: "19", name: "Konfiguration 3", dims: "160x42x78 cm", type: "TV-bänk", priceSale: "8.396:-", priceOrig: "11.995:-", discount: "-30%", placeholder: true, category: "tvbank", material: "ek", color: "#C9A36A", cols: 3, heightUnits: 2 },
  { id: "20", name: "Konfiguration 4", dims: "200x42x78 cm", type: "TV-bänk", priceSale: "10.496:-", priceOrig: "14.995:-", discount: "-30%", placeholder: true, category: "tvbank", material: "laminat", color: "#5E7560", cols: 5, heightUnits: 2 },
  { id: "21", name: "Konfiguration 5", dims: "240x42x78 cm", type: "TV-bänk", priceSale: "12.596:-", priceOrig: "17.995:-", discount: "-30%", placeholder: true, category: "tvbank", material: "ek", color: "#6B4F3A", cols: 6, heightUnits: 2 },
  // Byrå
  { id: "22", name: "Konfiguration 3", dims: "80x45x120 cm", type: "Byrå", priceSale: "8.396:-", priceOrig: "11.995:-", discount: "-30%", placeholder: true, category: "byraar", material: "laminat", color: "#445362", cols: 2, heightUnits: 3 },
  { id: "23", name: "Konfiguration 4", dims: "120x45x86 cm", type: "Byrå", priceSale: "9.096:-", priceOrig: "12.995:-", discount: "-30%", placeholder: true, category: "byraar", material: "ek", color: "#6B4F3A", front: "slats", cols: 3, heightUnits: 2 },
  { id: "24", name: "Konfiguration 5", dims: "160x45x120 cm", type: "Byrå", priceSale: "7.696:-", priceOrig: "10.995:-", discount: "-30%", placeholder: true, category: "byraar", material: "ek", color: "#C9A36A", cols: 4, heightUnits: 3 },
  // Skåp & Vitringskåp
  { id: "25", name: "Konfiguration 3", dims: "120x40x86 cm", type: "Skåp & Vitringskåp", priceSale: "13.996:-", priceOrig: "19.995:-", discount: "-30%", placeholder: true, category: "vitrin", material: "ek", color: "#C9A36A", front: "glass", cols: 3, heightUnits: 2 },
  { id: "26", name: "Konfiguration 4", dims: "160x42x120 cm", type: "Skåp & Vitringskåp", priceSale: "18.196:-", priceOrig: "25.995:-", discount: "-30%", placeholder: true, category: "vitrin", material: "laminat", color: "#5E7560", front: "glass", cols: 4, heightUnits: 3 },
  { id: "27", name: "Konfiguration 5", dims: "90x40x160 cm", type: "Skåp & Vitringskåp", priceSale: "16.796:-", priceOrig: "23.995:-", discount: "-30%", placeholder: true, category: "vitrin", material: "ek", color: "#6B4F3A", front: "glass", cols: 2, heightUnits: 4 },
];

/* ---------- Färgprover (Färg-raden) ---------- */
// Illustrativa prover från Figma – hex tillåtet här (jfr. träfärgerna i SeriesPage/Configurator).
export const SWATCHES = [
  "#70858d", "#70858d", "#b7b6ae", "#9f917a", "#6d7774",
  "#445362", "#b5a79c", "#d69278", "#efbe74", "#b7b6ae",
];
export const SWATCH_SELECTED = 6; // #b5a79c

/* ---------- Inspirationsgalleri ---------- */
// Bento-rutnät (12 kol × 11 rader). span = [colStart, colSpan, rowStart, rowSpan].
export type GalleryTile = { src: string; alt: string; span: [number, number, number, number] };
export const GALLERY: GalleryTile[] = [
  { src: "/series/gallery-big.png", alt: "Anamosa bokhylla i vardagsrum", span: [1, 6, 1, 8] },
  { src: "/series/gallery-tr.png", alt: "Anamosa TV-lösning med vitrin och skänk", span: [7, 6, 1, 4] },
  { src: "/series/gallery-mr.png", alt: "Anamosa bokhylla med dekoration", span: [7, 6, 5, 4] },
  { src: "/series/gallery-b1.png", alt: "Anamosa detalj", span: [1, 3, 9, 3] },
  { src: "/series/gallery-b2.png", alt: "Anamosa skänk", span: [4, 3, 9, 3] },
  { src: "/series/gallery-b3.png", alt: "Anamosa i sovrum", span: [7, 3, 9, 3] },
  { src: "/series/gallery-b4.png", alt: "Anamosa grön förvaring", span: [10, 3, 9, 3] },
];

/* ---------- Nyckelspecifikationer (USP, Volvo-stil) ---------- */
// Lyfter produktens starkaste argument: etikett till vänster, stort värde till höger.
export type KeySpec = { label: string; value: string };
export const KEY_SPECS: KeySpec[] = [
  { label: "Möjliga kombinationer", value: "Oändligt" },
  { label: "Bärförmåga per hyllplan", value: "30 kg" },
  { label: "Garanti", value: "25 år" },
];

/* ---------- Valmöjligheter ---------- */
// Samma namn som i konfiguratorn (CELL_LABEL, FRONT_LABEL, HANDLES) så seriesidan och
// byggaren pratar om samma saker.
export const FUNKTION = ["Öppet", "Låda", "Lucka"] as const;
export const FRONT = ["Slät", "Ribbor", "Glas"] as const;
export const BESLAG = ["Träknopp", "Mässingsknopp", "Bygelhandtag", "Push-open"] as const;
export const PREVIEW_IMAGE = "/series/preview.png";

/* ---------- Recensioner ---------- */

export type Review = {
  name: string;
  date: string;
  stars: number;
  text: string;
  variant: string;
  reply?: { author: string; text: string };
};

export const RATING = { score: "4,6/5", value: 4.6, count: 170 };

// Fördelning 5→1 stjärnor (andel av totalen), för staplarna.
export const RATING_BARS: { stars: number; pct: number }[] = [
  { stars: 5, pct: 74 },
  { stars: 4, pct: 16 },
  { stars: 3, pct: 6 },
  { stars: 2, pct: 3 },
  { stars: 1, pct: 1 },
];

export const AI_SUMMARY =
  "Kunderna lyfter fram att måtten stämmer på millimetern och att kvaliteten känns gedigen – massiv ek, mjukstängande lådor och dolda beslag får extra beröm. Några tycker att monteringen tar en stund, och enstaka upplever att en kulör skiftar mot skärmen.";

export const REVIEWS: Review[] = [
  {
    name: "Gerti W",
    date: "6 dagar sedan",
    stars: 5,
    text: "Äntligen en hylla som passar exakt i nischen. Måtten stämde på millimetern och den känns riktigt gedigen. Kärlek vid första anblick 👍",
    variant: "Anamosa. Bokhylla 162 cm. Ek natur.",
  },
  {
    name: "Maria",
    date: "2 veckor sedan",
    stars: 3,
    text: "Fin möbel, men den gröna kulören på luckorna blev mörkare än vad jag förväntade mig utifrån bilderna på hemsidan. Hade önskat ett tygprov-liknande färgprov att beställa hem innan.",
    variant: "Anamosa. Vitrinskåp. Grön 39.",
    reply: {
      author: "Tony, Mio AB",
      text: "Hej Maria, tack för att du hör av dig. Kulörer kan uppfattas olika beroende på ljus och skärm. Hör gärna av dig till kundservice så skickar vi hem ett fysiskt färgprov – och hjälper dig om du vill byta.",
    },
  },
  {
    name: "Åge N",
    date: "3 veckor sedan",
    stars: 4,
    text: "Snygg och stabil, precis som i butiken. Enda minuset är att monteringen tog längre tid än jag trodde – men resultatet var värt det.",
    variant: "Anamosa. TV-bänk 180 cm. Ek natur.",
  },
  {
    name: "Laszlo S",
    date: "1 månad sedan",
    stars: 5,
    text: "Riktigt bra kvalitet. Lådorna glider mjukt och beslagen känns påkostade. Byggde min egen variant på några minuter i konfiguratorn.",
    variant: "Anamosa. Byrå. Ek natur.",
    reply: {
      author: "Sarah, Mio AB",
      text: "Tack Laszlo, vad roligt att höra! Det gläder oss att byrån blev precis som du ville ha den.",
    },
  },
];
