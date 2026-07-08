// Logik och data för hyllbyggaren – portad från prototypen, rena funktioner (inget DOM).

export type Front = "plain" | "slats" | "glass";
export type CellType = "o" | "l" | "d"; // öppen, lucka, låda
export type Amount = "none" | "some" | "max";
export type Mount = "vagg" | "staende";
export type Material = "ek" | "laminat";

export interface Cell {
  type: CellType;
  span: number;
  front: Front;
  shelves: number;
}
export interface Row {
  h: number; // 20 | 40 | 80
  doors: Amount;
  drawers: Amount;
  shelves: number;
  front: Front;
  locked?: boolean;
  cells?: Cell[];
}
export interface State {
  cols: number;
  rows: Row[];
  mount: Mount;
  leg: string;
  material: Material;
  color: string;
  front: Front;
  handle: string;
  style: string | null;
  // redigeringsaxel: "rad" (default) redigerar horisontella band, "kolumn" redigerar
  // vertikala sektioner. I kolumnläge styr colDefs mängden luckor/lådor per kolumn
  // (None/Some/Max), fördelat nedåt – samma mängd-modell som raderna.
  axis?: "rad" | "kolumn";
  colDefs?: ColDef[];
  // vald möbeltyp (kategori-id) – styr bl.a. rubriken i konfiguratorn
  category?: string;
}
export interface ColDef {
  doors: Amount;
  drawers: Amount;
  // per-kolumn höjd i 40 cm-celler; undefined = ärv global höjd (radantalet). Används
  // främst för TV-möbler där en sektion behöver vara lägre/högre än de andra.
  height?: number;
  // hyllplan per öppet fack i kolumnen (cellerna är 40 cm → 0 eller 1), som radernas
  // shelves fast för kolumnaxeln. undefined = 0.
  shelves?: number;
  // användarredigerad kolumn – behålls när en stil appliceras om (t.ex. vid breddändring),
  // samma modell som radernas locked.
  locked?: boolean;
}

export const U = 64;
export const STEP = 40;
export const COLMAX = 6;
export const ROWMAX = 6;
const AMT: Record<Amount, number> = { none: 0, some: 0.5, max: 1 };
const RMM: Record<number, number> = { 20: 219, 40: 400, 80: 782 };

// Produktfärger (värde, namn, beskrivning)
export const COLORS: Record<Material, [string, string, string][]> = {
  ek: [
    ["#C9A36A", "Naturlig ek", "Ljus och oljad – eken får synas precis som den är."],
    ["#DAC7B0", "Vitpigmenterad ek", "Ljusare, kalkad ton – eken får en mjukare, ljusare känsla."],
    ["#6B4F3A", "Mörkbetsad ek", "Mörkare och varmare, med lite mer dramatik."],
  ],
  laminat: [
    ["#ECE8DF", "Vit / beige", "Ljus och neutral – lätt att inreda runt."],
    ["#B3A998", "Taupe", "Varmgrå och mjuk, lugnar ner rummet."],
    ["#3C3C3A", "Mörkgrå", "Nästan kolsvart – stramt och tydligt."],
    ["#5E7560", "Grön", "Salviagrön – en lugn färgklick."],
  ],
};

export const LEGS: [string, string, string][] = [
  ["ek", "Ljus ek", "Konisk fot i ljus ek – varm, skandinavisk känsla."],
  ["valnot", "Valnöt", "Konisk fot i mörk valnöt – mer värme och dramatik."],
  ["svart", "Svart", "Matt svart konisk fot – stramt och modernt."],
  ["stal", "Stål", "Borstat stålben – lätt och industriellt."],
  ["massing", "Mässing", "Mässingsben – en varm guldkant till helheten."],
];

export const HANDLES: [string, string, string][] = [
  ["h1", "Träknopp", "Rund knopp i massiv ek – varm och taktil."],
  ["h2", "Mässingsknopp", "Liten rund knopp i mässing, klassisk och nätt."],
  ["h3", "Beslag", "Avlångt bygelhandtag – lätt att få tag i."],
  ["push", "Push-open", "Tryck till så öppnas den – helt utan handtag."],
];

export const FRONT_LABEL: Record<Front, string> = { plain: "Slät", slats: "Ribbor", glass: "Glas" };
export const AMOUNT_LABEL: Record<Amount, string> = { none: "Inga", some: "Några", max: "Alla" };

// --- regler / villkor (representativa; bekräfta med ACTONA) ---
export const maxShelves = (h: number) => (h >= 80 ? 2 : h >= 40 ? 1 : 0);
export const drawersAllowed = (h: number) => h <= 40;

// Luckor och lådor delar på raden – en cell kan inte vara både och. När den ena
// sätts, sänk den andra så de tillsammans får plats (frac luckor + frac lådor ≤ 1).
export function fitAmount(amount: Amount, primary: Amount): Amount {
  const room = 1 - AMT[primary];
  if (AMT[amount] <= room) return amount;
  return room >= 0.5 ? "some" : "none";
}
const sh1 = (h: number) => Math.min(1, maxShelves(h));

export const newRow = (): Row => ({ h: 40, doors: "none", drawers: "none", shelves: 0, front: "plain" });
export const r = (o: Partial<Row>): Row => ({ ...newRow(), ...o });
export const cellObj = (type: CellType, span = 1, front: Front = "plain", shelves = 0): Cell => ({
  type,
  span,
  front,
  shelves,
});

export function spanRow(pattern: number[], cols: number): number[] {
  const out: number[] = [];
  let s = 0,
    i = 0;
  while (s < cols) {
    const sp = Math.min(pattern[i % pattern.length], cols - s);
    out.push(sp);
    s += sp;
    i++;
  }
  return out;
}

export function fillRow(row: Row, cols: number): CellType[] {
  const arr: CellType[] = new Array(cols).fill("o");
  const nd = Math.round(AMT[row.drawers] * cols);
  for (let c = 0; c < nd; c++) arr[c] = "d";
  let ndo = Math.round(AMT[row.doors] * cols),
    placed = 0;
  for (let c = 0; c < cols && placed < ndo; c++) {
    if (arr[c] === "o") {
      arr[c] = "l";
      placed++;
    }
  }
  return arr;
}

export function rowCells(row: Row, cols: number): Cell[] {
  if (row.cells) return row.cells;
  return fillRow(row, cols).map((t) => cellObj(t, 1, row.front, t === "o" ? row.shelves : 0));
}

// Fyll en kolumn nedåt utifrån mängd luckor/lådor (lådor underst, sen luckor, öppet överst).
export function fillColumn(def: ColDef, n: number): CellType[] {
  const arr: CellType[] = new Array(n).fill("o");
  const nd = Math.round(AMT[def.drawers] * n);
  for (let c = 0; c < nd; c++) arr[n - 1 - c] = "d";
  let ndo = Math.round(AMT[def.doors] * n),
    placed = 0;
  for (let c = n - 1; c >= 0 && placed < ndo; c--) {
    if (arr[c] === "o") {
      arr[c] = "l";
      placed++;
    }
  }
  return arr;
}

// Hela rutnätet (rader × celler). I kolumnläge fördelas luckor/lådor nedåt per kolumn
// (colDefs); annars per-rad-logiken ovan.
export function gridCells(S: State): Cell[][] {
  if (S.axis === "kolumn" && S.colDefs) {
    const n = S.rows.length;
    const colArrs = S.colDefs.map((def) => fillColumn(def, n));
    return S.rows.map((_, ri) =>
      colArrs.map((colArr, ci) =>
        cellObj(colArr[ri], 1, S.front, colArr[ri] === "o" ? S.colDefs![ci].shelves ?? 0 : 0),
      ),
    );
  }
  return S.rows.map((row) => rowCells(row, S.cols));
}

// Höjd (i 40 cm-celler) för en kolumn i kolumnläge: egen override om satt, annars den
// globala höjden = antal rader. Så orörda kolumner följer Form-defaulten (default+override).
export const colHeight = (S: State, ci: number): number => S.colDefs?.[ci]?.height ?? S.rows.length;

// cm-höjd för n staplade 40 cm-moduler (18 mm mellanrum), samma modell som realH.
export const cellsToCm = (n: number) => Math.round((n * 400 - Math.max(0, n - 1) * 18) / 10);

// Alla celler i möbeln, höjd-medvetet i kolumnläge (ragged: kolumner kan vara olika höga).
// Används för pris och frontförekomst så de stämmer även med per-kolumn-höjd.
export function allCells(S: State): Cell[] {
  if (S.axis === "kolumn") {
    const out: Cell[] = [];
    for (let ci = 0; ci < S.cols; ci++) {
      const def = S.colDefs?.[ci] ?? { doors: "none" as Amount, drawers: "none" as Amount };
      fillColumn(def, colHeight(S, ci)).forEach((t) => out.push(cellObj(t, 1, S.front, t === "o" ? def.shelves ?? 0 : 0)));
    }
    return out;
  }
  return gridCells(S).flat();
}

export const realW = (cols: number) => Math.round((cols * 400 - (cols - 1) * 18) / 10);
export const realH = (rows: Row[]) => {
  const mm = rows.reduce((a, x) => a + (RMM[x.h] || x.h * 10), 0) - (rows.length - 1) * 18;
  return Math.round(mm / 10);
};

// --- höjdstege ---
// Höjd-reglaget växer i 20 cm-steg. Man bygger nerifrån och uppåt: basen (nedersta
// raden) ligger fast, tillväxten sker överst. Raderna föredrar 40 cm – översta raden
// fylls 20 → 40 innan en ny 20-rad läggs till på toppen. Så
// [40] → [20,40] → [40,40] → [20,40,40] → [40,40,40] …
// Ett steg motsvarar en "20-enhet"; en 40-rad = 2 enheter, en 20-rad = 1.
// L (antal enheter) går 2..12 → 11 stopp, från [40] (40 cm) upp till [40×6] (231 cm).
export const HEIGHT_STEPS = 2 * ROWMAX - 1;
export function heightStepToLayout(step: number): { count: number; half: boolean } {
  const L = Math.max(2, Math.min(HEIGHT_STEPS + 1, Math.round(step) + 1));
  const full = Math.floor(L / 2);
  const half = L % 2 === 1;
  return { count: full + (half ? 1 : 0), half };
}
export function layoutToHeightStep(rows: Row[]): number {
  const n = rows.length;
  const topIs20 = rows[0]?.h === 20; // partiell rad ligger överst
  const L = topIs20 ? 2 * n - 1 : 2 * n;
  return Math.max(1, Math.min(HEIGHT_STEPS, L - 1));
}

export function usesGlass(state: State): boolean {
  return state.rows.some((row) => rowCells(row, state.cols).some((c) => c.type === "l" && c.front === "glass"));
}

// Finns det några luckor eller lådor alls? Frontstil är bara relevant då. Kollar hela
// rutnätet så det stämmer i både rad- och kolumnläge.
export function hasFronts(state: State): boolean {
  return allCells(state).some((c) => c.type === "l" || c.type === "d");
}

export interface StyleDef {
  id: string;
  name: string;
  desc: string;
  gen: (cols: number, rows: Row[]) => Row[];
  // Samma stilidé uttryckt i kolumnläge (skänk, byrå, TV-bänk …): ett mönster av
  // luckor/lådor/hyllplan per kolumn. Höjd-overrides (silhuetten, t.ex. TV-bänkens
  // låga mitt) och låsta kolumner hanteras av applyColStyle – inte här.
  colGen: (cols: number) => ColDef[];
}

// kort ColDef-hjälpare för stilmönstren nedan
const cd = (over: Partial<ColDef> = {}): ColDef => ({ doors: "none", drawers: "none", ...over });

export const STYLES: StyleDef[] = [
  {
    id: "jamn", name: "Jämn", desc: "Ett lugnt, jämnt rutnät. Tidlöst och enkelt.",
    gen: (c, rows) => rows.map((row) => r({ h: row.h, shelves: sh1(row.h) })),
    // kolumn: alla sektioner lika – öppna med hyllplan
    colGen: (c) => Array.from({ length: c }, () => cd({ shelves: 1 })),
  },
  {
    id: "kollage",
    name: "Kollage",
    desc: "Öppna fack i olika storlekar och höjder – luftigt och balanserat.",
    gen: (c, rows) => {
      // Regelstyrd komposition med medveten balans. Det breda facket läggs på
      // strikt växlande sida (vänster på jämna rader, höger på udda) så tyngden
      // pendlar och ingen sida blir överlastad. Dess bredd växlar långsamt mellan
      // 2 och 3 kolumner för kollagekänsla. Höga (80) och låga (40) band varvas,
      // så två höga aldrig hamnar intill varandra. Hyllplanen sätts av en regel
      // (breda fack luftiga, smala fler plan) i stället för slump – stabilt och lugnt.
      return rows.map((_, i) => {
        const h = i % 2 === 1 ? 80 : 40; // varvat: låg, hög, låg, hög …
        const left = i % 2 === 0; // brett fack till vänster på jämna rader, annars höger
        const big = Math.min(i % 4 < 2 ? 2 : 3, Math.max(1, c - 1)); // 2- eller 3-spann
        const narrow = Array<number>(c - big).fill(1); // resterande kolumner som 1-spann
        const spans = left ? [big, ...narrow] : [...narrow, big];
        const maxSh = maxShelves(h);
        const cells = spans.map((s) =>
          cellObj("o", s, "plain", s >= 2 ? Math.floor(maxSh / 2) : maxSh),
        );
        return r({ h, cells });
      });
    },
    // kolumn: öppet men varierat – hyllplan i varannan sektion ger luftig rytm
    colGen: (c) => Array.from({ length: c }, (_, i) => cd({ shelves: i % 2 === 0 ? 1 : 0 })),
  },
  {
    id: "sockel",
    name: "Sockel",
    desc: "Öppet upptill, stängt nedtill – funkar nästan alltid.",
    gen: (c, rows) => {
      const n = rows.length;
      return rows.map((row, i) =>
        i >= n - 1
          ? r({ h: row.h, doors: "max", front: "slats" })
          : i === n - 2
          ? drawersAllowed(row.h)
            ? r({ h: row.h, drawers: "some" })
            : r({ h: row.h, doors: "some", front: "slats" })
          : r({ h: row.h, shelves: sh1(row.h) })
      );
    },
    // kolumn: stängt nedtill, öppet upptill i varje sektion – var tredje får lådor
    colGen: (c) => Array.from({ length: c }, (_, i) => (i % 3 === 0 ? cd({ drawers: "some", shelves: 1 }) : cd({ doors: "some", shelves: 1 }))),
  },
  {
    id: "rytm",
    name: "Rytm",
    desc: "Öppet och stängt om vartannat – lite mer liv.",
    gen: (c, rows) => rows.map((row, i) => (i % 2 === 0 ? r({ h: row.h, shelves: sh1(row.h) }) : r({ h: row.h, doors: "max", front: "slats" }))),
    // kolumn: öppen och stängd sektion om vartannat
    colGen: (c) => Array.from({ length: c }, (_, i) => (i % 2 === 0 ? cd({ shelves: 1 }) : cd({ doors: "max" }))),
  },
  {
    id: "mosaik",
    name: "Mosaik",
    desc: "Olika stora fack i en fri komposition.",
    gen: (c, rows) => {
      const pats = [[2, 1, 1], [1, 2, 1], [1, 1, 2], [1, 3]];
      return rows.map((row, i) => {
        const sp = spanRow(pats[i % pats.length], c);
        const cells = sp.map((s, j) => {
          const k = i * 3 + j;
          if (k % 7 === 0 && s >= 2) return cellObj("l", s, "glass");
          return cellObj("o", s, "plain", k % 3 === 0 && maxShelves(row.h) >= 1 ? 1 : 0);
        });
        return r({ h: row.h, cells });
      });
    },
    // kolumn: fri blandning i cykel – öppet med/utan hyllplan, halvstängt, lådor
    colGen: (c) => {
      const pat = [cd({ shelves: 1 }), cd({ doors: "some" }), cd({ shelves: 0 }), cd({ drawers: "max" })];
      return Array.from({ length: c }, (_, i) => ({ ...pat[i % pat.length] }));
    },
  },
];

// --- möbeltyper (Mio-kategorier) – startsteg före konfiguratorn ---
// Varje kategori ger ett utgångsläge (preset). axis = primär redigeringsaxel
// (rad för höga möbler, kolumn för låga/breda) enligt Interaktionsmodellen.
export interface Category {
  id: string;
  name: string;
  desc: string;
  axis: "rad" | "kolumn" | "beror";
  heading: string; // rubrik i konfiguratorn (svensk grammatik varierar: din egen / ditt eget)
  make: () => State;
}

// Rubrik för en vald kategori (fallback om category saknas).
export const categoryHeading = (id?: string) =>
  CATEGORIES.find((c) => c.id === id)?.heading ?? "Bygg din egen möbel";

const catState = (over: Partial<State> & { rows: Row[] }): State => ({
  cols: 4,
  mount: "staende",
  leg: "ek",
  material: "ek",
  color: "#C9A36A",
  front: "plain",
  handle: "h1",
  style: null,
  ...over,
});

export const CATEGORIES: Category[] = [
  {
    id: "hyllor",
    name: "Hylla",
    desc: "Öppet rutnät – bokhylla eller vägghylla.",
    axis: "rad",
    heading: "Bygg din egen hylla",
    make: () => catState({ cols: 4, style: "jamn", rows: applyStyle("jamn", 4, [newRow(), newRow(), newRow(), newRow()]) }),
  },
  {
    id: "byraar",
    name: "Byrå",
    desc: "Sektioner av lådor i bredd.",
    axis: "kolumn",
    heading: "Bygg din egen byrå",
    make: () =>
      catState({
        cols: 3,
        axis: "kolumn",
        colDefs: [{ doors: "none", drawers: "max" }, { doors: "none", drawers: "max" }, { doors: "none", drawers: "max" }],
        rows: [r({ h: 40 }), r({ h: 40 }), r({ h: 40 })],
      }),
  },
  {
    id: "vitrin",
    name: "Skåp & vitrinskåp",
    desc: "Highboard med glas upptill, stängt nedtill.",
    axis: "rad",
    heading: "Bygg ditt eget skåp",
    make: () =>
      catState({
        cols: 3,
        rows: [r({ h: 40, doors: "max", front: "glass" }), r({ h: 40, doors: "max", front: "glass" }), r({ h: 40, doors: "max" }), r({ h: 40, doors: "max" })],
      }),
  },
  {
    id: "skankar",
    name: "Skänk",
    desc: "Låg och bred med mix av luckor och lådor.",
    axis: "kolumn",
    heading: "Bygg din egen skänk",
    make: () =>
      catState({
        cols: 4,
        axis: "kolumn",
        colDefs: [{ doors: "none", drawers: "max" }, { doors: "max", drawers: "none" }, { doors: "max", drawers: "none" }, { doors: "none", drawers: "none" }],
        rows: [r({ h: 40 }), r({ h: 40 })],
      }),
  },
  {
    id: "tvbank",
    name: "TV-bänk",
    desc: "Låg, avlång enhet för media.",
    axis: "kolumn",
    heading: "Bygg din egen TV-bänk",
    // Ojämn topp: höga skåpsektioner i kanterna, låg öppen mitt för TV:n. Global höjd
    // = 2 celler (~78 cm); mittsektionerna får en egen, lägre höjd (1 cell). Se colHeight.
    make: () =>
      catState({
        cols: 5,
        axis: "kolumn",
        colDefs: [
          { doors: "max", drawers: "none" },
          { doors: "none", drawers: "none", height: 1 },
          { doors: "none", drawers: "none", height: 1 },
          { doors: "none", drawers: "none", height: 1 },
          { doors: "max", drawers: "none" },
        ],
        rows: [r({ h: 40 }), r({ h: 40 })],
      }),
  },
];

// Tillämpa stil men behåll låsta (finjusterade) rader.
export function applyStyle(styleId: string, cols: number, rows: Row[]): Row[] {
  const g = STYLES.find((s) => s.id === styleId);
  if (!g) return rows;
  const gen = g.gen(cols, rows);
  return rows.map((row, i) => (row.locked ? row : gen[i]));
}

// Tillämpa stil i kolumnläge. Stilen styr innehållet (luckor/lådor/hyllplan) per
// kolumn; silhuetten lämnas orörd – per-kolumn-höjder (t.ex. TV-bänkens låga mitt)
// och låsta (användarredigerade) kolumner behålls.
export function applyColStyle(styleId: string, cols: number, prev?: ColDef[]): ColDef[] {
  const base = Array.from({ length: cols }, (_, i) => prev?.[i] ?? cd());
  const g = STYLES.find((s) => s.id === styleId);
  if (!g) return base;
  const gen = g.colGen(cols);
  return base.map((d, i) => (d.locked ? d : { ...gen[i], height: d.height, locked: d.locked }));
}

// Bygg ett utgångsläge från en kategori + valfria överskrivningar (stil, material,
// färg, front). Används för djuplänkar in i byggaren, t.ex. "Välj" på en färdig
// konfiguration på seriesidan. Returnerar null om kategorin inte finns.
export function buildState(
  categoryId: string,
  opts: { style?: string | null; material?: Material; color?: string; front?: Front } = {},
): State | null {
  const cat = CATEGORIES.find((c) => c.id === categoryId);
  if (!cat) return null;
  let s: State = { ...cat.make(), category: categoryId };
  if (opts.style) s = { ...s, style: opts.style, rows: applyStyle(opts.style, s.cols, s.rows) };
  if (opts.material) s.material = opts.material;
  if (opts.color) s.color = opts.color;
  if (opts.front) s.front = opts.front;
  return s;
}

// colDefs för en kolumnläges-kategori vid ett givet antal kolumner. Behåller
// kategorins "DNA" (byrå = bara lådor, skänk = låda/luckor/öppet, TV-bänk = skåp i
// kanterna och låg öppen mitt) men skalar till valfri bredd.
function colDefsFor(categoryId: string, cols: number, units: number): ColDef[] {
  if (categoryId === "byraar") {
    return Array.from({ length: cols }, () => ({ doors: "none" as Amount, drawers: "max" as Amount }));
  }
  if (categoryId === "tvbank") {
    const low = Math.max(1, units - 1);
    return Array.from({ length: cols }, (_, i) =>
      i === 0 || i === cols - 1
        ? { doors: "max" as Amount, drawers: "none" as Amount }
        : { doors: "none" as Amount, drawers: "none" as Amount, height: low },
    );
  }
  // skänk: låda, lucka, lucka, öppet – cyklat till bredden
  const pat: ColDef[] = [
    { doors: "none", drawers: "max" },
    { doors: "max", drawers: "none" },
    { doors: "max", drawers: "none" },
    { doors: "none", drawers: "none" },
  ];
  return Array.from({ length: cols }, (_, i) => ({ ...pat[i % pat.length] }));
}

// Rader för en radläges-kategori vid en given bredd/höjd. Hyllor följer vald stil,
// vitrin får glas upptill och stängt nedtill, övriga blir jämna öppna fack.
function rowsFor(categoryId: string, cols: number, units: number, styleId?: string | null): Row[] {
  if (categoryId === "vitrin") {
    const glassTop = Math.ceil(units / 2);
    return Array.from({ length: units }, (_, i) =>
      i < glassTop ? r({ h: 40, doors: "max", front: "glass" }) : r({ h: 40, doors: "max" }),
    );
  }
  const rows = Array.from({ length: units }, () => newRow());
  return styleId ? applyStyle(styleId, cols, rows) : rows;
}

// Fullständigt state för en färdig konfiguration i karusellen. Bygger vidare på
// buildState men lägger till mått-variation: bredd (cols) och höjd (heightUnits, i
// 40 cm-moduler). Används av både kort-förhandsvisningen och "Välj"-djuplänken, så
// bilden på seriesidan matchar det byggaren öppnar.
export function buildConfigState(
  categoryId: string,
  opts: {
    style?: string | null;
    material?: Material;
    color?: string;
    front?: Front;
    cols?: number;
    heightUnits?: number;
  } = {},
): State | null {
  const base = buildState(categoryId, { style: opts.style, material: opts.material, color: opts.color, front: opts.front });
  if (!base) return null;
  // Ingen mått-variation begärd → behåll kategorins default (bakåtkompatibelt).
  if (opts.cols == null && opts.heightUnits == null) return base;

  const colMin = categoryId === "tvbank" ? 3 : 2;
  const cols = Math.max(colMin, Math.min(COLMAX, Math.round(opts.cols ?? base.cols)));
  const units = Math.max(1, Math.min(ROWMAX, Math.round(opts.heightUnits ?? base.rows.length)));
  const s: State = { ...base, cols };
  if (base.axis === "kolumn") {
    s.rows = Array.from({ length: units }, () => r({ h: 40 }));
    s.colDefs = colDefsFor(categoryId, cols, units);
  } else {
    s.rows = rowsFor(categoryId, cols, units, base.style);
  }
  return s;
}
