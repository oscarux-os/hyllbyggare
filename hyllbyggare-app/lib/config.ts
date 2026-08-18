// Logik och data för hyllbyggaren – portad från prototypen, rena funktioner (inget DOM).

export type Front = "plain" | "slats" | "glass";
// Trästilarna – de enda som är ett globalt val. Glas är en egenskap hos en enskild lucka
// (den är av glas, inte av trä med en yta), så det väljs per fack och kan inte sättas
// från helhetsvyn. Se setWoodFront.
export type WoodFront = "plain" | "slats";
export type CellType = "o" | "l" | "d"; // öppen, lucka, låda
export type Amount = "none" | "some" | "max";
export type Mount = "vagg" | "staende";
export type Material = "ek" | "laminat";

export interface Cell {
  type: CellType;
  span: number;
  front: Front;
  shelves: number;
  // Fackets egen höjd i cm (20 | 40 | 80). Bara meningsfull i kolumnläge med egna
  // kolumnstommar (TV-möbler) – där kan ett fack vara högre än de andra, t.ex. en hög öppning
  // för TV:n. I radläge bär raden höjden. undefined = 40 cm-modulen.
  h?: number;
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
  // Möbelns trästil på fronterna. Glasluckor bär "glass" på facket självt och ligger
  // utanför det här värdet – därför WoodFront och inte Front.
  front: WoodFront;
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
  // per-fack-innehåll uppifrån och ner (öppet/lucka/låda + hyllplan per fack). Sätts när
  // man redigerar ett enskilt fack i kolumnen och har då företräde över mängd-modellen
  // nedan – samma roll som radens cells. undefined = härled ur doors/drawers.
  cells?: Cell[];
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
  ["h3", "Bygelhandtag", "Avlångt bygelhandtag – lätt att få tag i."],
  ["push", "Push-open", "Tryck till så öppnas den – helt utan handtag."],
];

export const FRONT_LABEL: Record<Front, string> = { plain: "Slät", slats: "Ribbor", glass: "Glas" };
export const AMOUNT_LABEL: Record<Amount, string> = { none: "Inga", some: "Några", max: "Alla" };
export const CELL_LABEL: Record<CellType, string> = { o: "Öppet", d: "Låda", l: "Lucka" };

// Vertikala staplar räknas nerifrån och upp: det som står på golvet är nummer 1, så som man
// läser en hylla. Modellen lagrar dem uppifrån och ner (listorna ritas i samma ordning som de
// staplas), så numret är alltid en spegling av indexet – aldrig indexet självt. Vågräta band
// räknas från vänster och rör inte den här funktionen.
export const stackNo = (i: number, count: number) => count - i;

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
  // Radens front är mallen för dess fack. Glas är undantaget: det sitter bara på luckor,
  // så en låda i en glasrad faller tillbaka på den släta trästilen.
  return fillRow(row, cols).map((t) =>
    cellObj(t, 1, row.front === "glass" && t !== "l" ? "plain" : row.front, t === "o" ? row.shelves : 0),
  );
}

// --- per-fack-redigering ---
// Facken (cells) är den finkorniga modellen: mängd-modellen (Inga/Några/Alla) är bara ett
// sätt att GENERERA fack. Så fort man rör ett enskilt fack materialiseras listan och blir
// sanningen för bandet. Hjälparna nedan håller den listan giltig när bandet ändrar form.

// Klipp/fyll facken så att spannen summerar till exakt `cols` (bredden har ändrats).
// Nya fack läggs till som öppna – ett smalare band tappar de fack som inte får plats.
export function fitCells(cells: Cell[], cols: number): Cell[] {
  const out: Cell[] = [];
  let s = 0;
  for (const c of cells) {
    if (s >= cols) break;
    const span = Math.min(c.span, cols - s);
    out.push({ ...c, span });
    s += span;
  }
  while (s < cols) {
    out.push(cellObj("o", 1, cells[0]?.front ?? "plain", 0));
    s++;
  }
  return out;
}

// Håll facken inom vad höjden tillåter: hyllplan kapas till maxShelves, och lådor som inte
// längre får plats (höga fack) öppnas – samma regel som mängd-modellens `drawers = "none"`.
// Stängda fack har alltid 0 hyllplan.
export function normalizeCells(cells: Cell[], h: number): Cell[] {
  const ms = maxShelves(h);
  const dOk = drawersAllowed(h);
  return cells.map((c) => {
    const type: CellType = c.type === "d" && !dOk ? "o" : c.type;
    return { ...c, type, shelves: type === "o" ? Math.min(c.shelves, ms) : 0 };
  });
}

// Sätt ett värde på ETT fack i en rad. Raden materialiseras (och låses) så att
// per-fack-valen består – stilarnas mängd-modell tar inte över igen.
export function setRowCell(row: Row, cols: number, ci: number, patch: Partial<Cell>): Row {
  const cells = rowCells(row, cols).map((c, i) => (i === ci ? { ...c, ...patch } : { ...c }));
  return { ...row, cells: normalizeCells(cells, row.h), locked: true };
}

// Samma värde på ALLA fack i raden ("Alla"-fliken) – snabbvägen till en enhetlig rad.
export function setRowCells(row: Row, cols: number, patch: Partial<Cell>): Row {
  const cells = rowCells(row, cols).map((c) => ({ ...c, ...patch }));
  return { ...row, cells: normalizeCells(cells, row.h), locked: true };
}

// Fackens innehåll i en kolumn, uppifrån och ner. Per-fack-listan (cells) har företräde;
// saknas den härleds facken ur mängd-modellen. Listan trimmas/fylls till n så att en ändrad
// höjd varken tappar fack eller lämnar tomrum.
export function colCells(def: ColDef, n: number, front: Front = "plain"): Cell[] {
  const cells = def.cells;
  if (cells) return Array.from({ length: n }, (_, i) => cells[i] ?? cellObj("o", 1, front, 0));
  return fillColumn(def, n).map((t) => cellObj(t, 1, front, t === "o" ? def.shelves ?? 0 : 0));
}

// Sätt ett värde på ETT fack i en kolumn. `h` är just det fackets höjd i cm (normalt 40) –
// bara det patchade facket normaliseras, de andra kan ha andra höjder.
export function setColCell(def: ColDef, n: number, front: Front, ki: number, patch: Partial<Cell>, h = 40): ColDef {
  const cells = colCells(def, n, front).map((c, i) => (i === ki ? { ...c, ...patch } : { ...c }));
  // Sätter patchen en ny fackhöjd är det den som gäller för villkoren (hyllplan, lådor).
  if (cells[ki]) cells[ki] = normalizeCells([cells[ki]], cells[ki].h ?? h)[0];
  return { ...def, cells, locked: true };
}

// Samma värde på ALLA fack i kolumnen ("Alla"-fliken). Varje fack normaliseras mot sin egen
// höjd (`heights`), eftersom facken i en kolumn kan vara olika höga.
export function setColCells(def: ColDef, n: number, front: Front, patch: Partial<Cell>, heights: number[]): ColDef {
  const cells = colCells(def, n, front).map((c, i) => {
    const merged = { ...c, ...patch };
    return normalizeCells([merged], merged.h ?? heights[i] ?? 40)[0];
  });
  return { ...def, cells, locked: true };
}

// Lägg till respektive ta bort ett fack i en kolumn. Bara kolumner som bär sin egen höjd
// (TV-möbler) kan det – annars kommer fackantalet från ett globalt val.
//
// Båda skriver ut fackens höjder explicit innan listan ändras. Ett fack utan egen `h` ärver
// höjden från raden på SAMMA INDEX (se colCellHeights), så när listan förskjuts skulle de
// andra facken tyst byta höjd. Med höjderna utskrivna står de kvar.
export function addColCell(def: ColDef, n: number, front: Front, heights: number[]): ColDef {
  // Nytt fack överst: facken numreras nerifrån, så de befintliga behåller sina nummer.
  const kept = colCells(def, n, front).map((c, i) => ({ ...c, h: c.h ?? heights[i] ?? 40 }));
  return { ...def, cells: [{ ...cellObj("o", 1, front, 0), h: 40 }, ...kept], height: n + 1, locked: true };
}

export function removeColCell(def: ColDef, n: number, front: Front, ki: number, heights: number[]): ColDef {
  const cells = colCells(def, n, front)
    .map((c, i) => ({ ...c, h: c.h ?? heights[i] ?? 40 }))
    .filter((_, i) => i !== ki);
  return { ...def, cells, height: cells.length, locked: true };
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
    const colArrs = S.colDefs.map((def) => colCells(def, n, S.front));
    return S.rows.map((_, ri) => colArrs.map((colArr) => colArr[ri]));
  }
  return S.rows.map((row) => rowCells(row, S.cols));
}

// Antal fack i en kolumn: egen override om satt, annars den globala höjden = antal rader.
// Så orörda kolumner följer Form-defaulten (default+override).
export const colHeight = (S: State, ci: number): number => S.colDefs?.[ci]?.height ?? S.rows.length;

// Fackens höjder i cm i en kolumn, uppifrån och ner. Ett fack med egen höjd (TV-möbler)
// vinner; annars gäller radens höjd på den nivån (den delade stommen).
export function colCellHeights(S: State, ci: number): number[] {
  const def = S.colDefs?.[ci] ?? { doors: "none" as Amount, drawers: "none" as Amount };
  return colCells(def, colHeight(S, ci), S.front).map((c, k) => c.h ?? S.rows[k]?.h ?? 40);
}

// Kolumnens verkliga höjd i cm – summan av dess fack. Med enbart 40 cm-fack är den samma
// som cellsToCm(antal fack); har ett fack egen höjd följer måttet med.
export const colCm = (S: State, ci: number): number => stackCm(colCellHeights(S, ci));

// cm-höjd för n staplade 40 cm-moduler (18 mm mellanrum), samma modell som realH.
export const cellsToCm = (n: number) => Math.round((n * 400 - Math.max(0, n - 1) * 18) / 10);

// Alla celler i möbeln, höjd-medvetet i kolumnläge (ragged: kolumner kan vara olika höga).
// Används för pris och frontförekomst så de stämmer även med per-kolumn-höjd.
export function allCells(S: State): Cell[] {
  if (S.axis === "kolumn") {
    const out: Cell[] = [];
    for (let ci = 0; ci < S.cols; ci++) {
      const def = S.colDefs?.[ci] ?? { doors: "none" as Amount, drawers: "none" as Amount };
      colCells(def, colHeight(S, ci), S.front).forEach((c) => out.push(c));
    }
    return out;
  }
  return gridCells(S).flat();
}

export const realW = (cols: number) => Math.round((cols * 400 - (cols - 1) * 18) / 10);
// Staplade modulhöjder → verklig höjd i cm (18 mm mellan modulerna). Gäller både radernas
// höjder och fackens i en kolumn.
export const stackCm = (heights: number[]) => {
  const mm = heights.reduce((a, h) => a + (RMM[h] || h * 10), 0) - Math.max(0, heights.length - 1) * 18;
  return Math.round(mm / 10);
};
export const realH = (rows: Row[]) => stackCm(rows.map((x) => x.h));

// Möbelns höjd i cm. Kolumner med egen höjd (TV-möbler) gör toppen ojämn – då är möbeln så
// hög som dess högsta sektion, inte som radstapeln.
export function furnitureHeightCm(S: State): number {
  if (S.axis === "kolumn" && S.category === "tvbank")
    return Math.max(1, ...Array.from({ length: S.cols }, (_, ci) => colCm(S, ci)));
  return realH(S.rows);
}

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
  return allCells(state).some((c) => c.type === "l" && c.front === "glass");
}

// Finns det några luckor eller lådor alls? Frontstil är bara relevant då. Kollar hela
// rutnätet så det stämmer i både rad- och kolumnläge.
export function hasFronts(state: State): boolean {
  return allCells(state).some((c) => c.type === "l" || c.type === "d");
}

// Finns det någon front i trä? Det globala trästil-valet har inget att göra i en möbel
// där varenda front är av glas – då är stilen ett val utan verkan.
export function hasWoodFronts(state: State): boolean {
  return allCells(state).some((c) => (c.type === "l" || c.type === "d") && c.front !== "glass");
}

// Byt trästil på hela möbeln. Glas rörs ALDRIG: en glaslucka är av glas, inte av trä med
// en yta, så den kan inte "bli ribbad". Trästilen skriver därför bara om de fronter som
// faktiskt är i trä – i raderna (och deras ev. utskrivna fack) och i kolumnernas fack.
// Vill man ta bort glaset gör man det på luckan, i bandredigeringen.
export function setWoodFront(s: State, front: WoodFront): State {
  const keep = (f: Front): Front => (f === "glass" ? "glass" : front);
  const mapCells = (cells: Cell[]) => cells.map((c) => ({ ...c, front: keep(c.front) }));
  return {
    ...s,
    front,
    rows: s.rows.map((row) => ({
      ...row,
      front: keep(row.front),
      cells: row.cells && mapCells(row.cells),
    })),
    colDefs: s.colDefs?.map((d) => (d.cells ? { ...d, cells: mapCells(d.cells) } : d)),
  };
}

// Lägg glas på samtliga luckor. Finns inte som globalt val i byggaren (glas väljs per
// lucka) – det här är vägen in för presets och djuplänkar, t.ex. en vitrin-konfiguration
// på seriesidan. Lådor kan inte vara i glas och behåller sin trästil.
export function glazeDoors(s: State): State {
  const glaze = (c: Cell): Cell => (c.type === "l" ? { ...c, front: "glass" } : c);
  return {
    ...s,
    rows: s.rows.map((row) => ({ ...row, cells: rowCells(row, s.cols).map(glaze) })),
    colDefs: s.colDefs?.map((d, ci) => ({ ...d, cells: colCells(d, colHeight(s, ci), s.front).map(glaze) })),
  };
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
    desc: "Öppna fack i olika storlekar – luftigt och balanserat.",
    gen: (c, rows) => {
      // Regelstyrd komposition med medveten balans. Det breda facket läggs på
      // strikt växlande sida (vänster på jämna rader, höger på udda) så tyngden
      // pendlar och ingen sida blir överlastad. Dess bredd växlar långsamt mellan
      // 2 och 3 kolumner för kollagekänsla. Radhöjderna lämnas orörda (som alla
      // stilar) – variationen sitter i fackens bredd och hyllplan, inte i höjden.
      // Hyllplanen sätts av en regel (breda fack luftiga, smala fler plan) i
      // stället för slump – stabilt och lugnt.
      return rows.map((row, i) => {
        const left = i % 2 === 0; // brett fack till vänster på jämna rader, annars höger
        const big = Math.min(i % 4 < 2 ? 2 : 3, Math.max(1, c - 1)); // 2- eller 3-spann
        const narrow = Array<number>(c - big).fill(1); // resterande kolumner som 1-spann
        const spans = left ? [big, ...narrow] : [...narrow, big];
        const maxSh = maxShelves(row.h);
        const cells = spans.map((s) =>
          cellObj("o", s, "plain", s >= 2 ? Math.floor(maxSh / 2) : maxSh),
        );
        return r({ h: row.h, cells });
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
    desc: "Lådor sida vid sida – klassisk förvaring.",
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
    desc: "Högt skåp med glas upptill och stängt nedtill.",
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
    desc: "Låg och bred, med en mix av luckor och lådor.",
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
    desc: "Låg och avlång, med plats för tv:n och tekniken.",
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

// Tillämpa stil men behåll låsta (finjusterade) rader. Ingen stil ändrar radhöjderna –
// storleken (bredd × höjd) styrs enbart av storleks-reglagen, stilen möblerar bara om
// facken inom den. Så ett stilbyte är alltid storleksstabilt.
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
  // "glass" är ingen trästil utan en egenskap hos luckorna – en glaskonfiguration blir
  // därför glas i alla luckor, inte ett globalt stilvärde (se setWoodFront/glazeDoors).
  if (opts.front === "glass") s = glazeDoors(s);
  else if (opts.front) s = setWoodFront(s, opts.front);
  return s;
}

// colDefs för en kolumnläges-kategori vid ett givet antal kolumner. Behåller
// kategorins "DNA" (byrå = bara lådor, skänk = låda/luckor/öppet, TV-bänk = skåp i
// kanterna och låg öppen mitt) men skalar till valfri bredd.
export function colDefsFor(categoryId: string, cols: number, units: number): ColDef[] {
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
  // Fronten läggs på sist (nedan), inte här: måtten bygger om rader och kolumner och
  // skulle annars slå ut glaset som just satts.
  const base = buildState(categoryId, { style: opts.style, material: opts.material, color: opts.color });
  if (!base) return null;
  // Ingen mått-variation begärd → behåll kategorins default (bakåtkompatibelt).
  let s = base;
  if (opts.cols != null || opts.heightUnits != null) {
    const colMin = categoryId === "tvbank" ? 3 : 2;
    const cols = Math.max(colMin, Math.min(COLMAX, Math.round(opts.cols ?? base.cols)));
    const units = Math.max(1, Math.min(ROWMAX, Math.round(opts.heightUnits ?? base.rows.length)));
    s = { ...base, cols };
    if (base.axis === "kolumn") {
      s.rows = Array.from({ length: units }, () => r({ h: 40 }));
      s.colDefs = colDefsFor(categoryId, cols, units);
    } else {
      s.rows = rowsFor(categoryId, cols, units, base.style);
    }
  }
  if (opts.front === "glass") return glazeDoors(s);
  if (opts.front) return setWoodFront(s, opts.front);
  return s;
}

// --- pris ---
//
// Prisuttrycket bodde inline i Configurator. Det ligger här nu för att två ytor ska kunna
// visa samma summa utan att duplicera reglerna: byggaren och produktsidan (/lab/anpassa).
// Faktorerna är representativa, inte hämtade från ACTONA.

/** Stängd yta i möbeln, span-vägd: ett fack som spänner två kolumner räknas som två. */
export function closedSpan(S: State): number {
  let closed = 0;
  allCells(S).forEach((c) => c.type !== "o" && (closed += c.span));
  return closed;
}

/**
 * Kampanjpris i kronor. `handleId` finns som parameter eftersom anroparen validerar
 * handtaget mot HANDLES innan det används – ett okänt id ska prissättas som default,
 * inte som gratis.
 */
export function priceOf(S: State, handleId: string = S.handle): number {
  return (
    S.cols * S.rows.length * 650 +
    closedSpan(S) * 420 +
    (S.mount === "staende" ? 500 : 0) +
    (S.material === "ek" ? 1200 : 0) +
    // Glaset prissätts på förekomst, inte på ett globalt stilvärde – det sitter numera på
    // luckan. Trästilen ligger kvar som ett tillägg på hela möbeln.
    (usesGlass(S) ? 900 : 0) +
    (S.front === "slats" ? 500 : 0) +
    (handleId === "push" ? 400 : handleId === "h3" ? 250 : handleId === "h2" ? 150 : 0)
  );
}

/**
 * Ordinarie pris så att kampanjpriset är exakt 30 % rabatt (pris = 0,7 × ordinarie),
 * avrundat till jämna 5 kr – matchar "−30%"-badgen.
 */
export function listPriceOf(S: State, handleId: string = S.handle): number {
  return Math.round(priceOf(S, handleId) / 0.7 / 5) * 5;
}
