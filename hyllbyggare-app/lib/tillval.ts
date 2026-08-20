// Tillvalsprodukter (add-ons) som visas efter handtagssteget i konfiguratorn.
// Källa: tillval-anamosa.md (sammanställt från mio.se). Bilder i /public/tillval.
//
// Kampanjen "50% vid köp av Anamosa" ger halva priset på tillval när man köper
// hyllan – därför räknas erbjudandepriset ut som halva ordinarie priset.

export type TillvalCategory = "dekoration" | "ljus" | "vas" | "lampa" | "vard";

export type TillvalProduct = {
  id: string;
  name: string;
  /** Kort beskrivning/mått, visas under namnet. */
  details: string;
  category: TillvalCategory;
  /** Ordinarie pris i kronor. */
  price: number;
  image: string;
  /** Del av "Rekommenderade"-urvalet. */
  recommended?: boolean;
};

// Filterflikar i den ordning de visas. "rekommenderade" är default och "alla"
// nås via "Visa alla"-knappen.
export const TILLVAL_FILTERS: { id: string; label: string }[] = [
  { id: "rekommenderade", label: "Rekommenderade" },
  { id: "dekoration", label: "Dekoration" },
  { id: "ljus", label: "Ljusbehållare" },
  { id: "vas", label: "Vaser" },
  { id: "lampa", label: "Lampor" },
];

export const TILLVAL_PRODUCTS: TillvalProduct[] = [
  // Lampor
  { id: "lampa-kevin", name: "Kevin", details: "Solcellsbelysning H22 Ø13 cm", category: "lampa", price: 199, image: "/tillval/lampa_1_Kevin_199kr.jpg" },
  { id: "lampa-vinga", name: "Vinga", details: "Portabel bordslampa H35 Ø14,5 cm", category: "lampa", price: 249, image: "/tillval/lampa_2_Vinga_249kr.jpg", recommended: true },
  { id: "lampa-amos", name: "Amos", details: "Portabel bordslampa H25 Ø15 cm", category: "lampa", price: 199, image: "/tillval/lampa_3_Amos_199kr.jpg" },
  { id: "lampa-pella", name: "Pella", details: "Portabel bordslampa H22 Ø15 cm", category: "lampa", price: 249, image: "/tillval/lampa_4_Pella_249kr.jpg" },
  { id: "lampa-fancy", name: "Fancy", details: "Portabel bordslampa H32 Ø27 cm", category: "lampa", price: 299, image: "/tillval/lampa_5_Fancy_299kr.jpg", recommended: true },

  // Vaser
  { id: "vas-unni", name: "Unni", details: "Vas H7 Ø10 cm", category: "vas", price: 39, image: "/tillval/vas_1_Unni_39kr.jpg" },
  { id: "vas-java", name: "Java", details: "Vas H30 Ø21,5 cm", category: "vas", price: 199, image: "/tillval/vas_2_Java_199kr.jpg", recommended: true },
  { id: "vas-heros", name: "Heros", details: "Urna/vas H73 Ø35 cm", category: "vas", price: 1495, image: "/tillval/vas_3_Heros_1495kr.jpg" },
  { id: "vas-blaire", name: "Blaire", details: "Vas H22 Ø25,5 cm", category: "vas", price: 169, image: "/tillval/vas_4_Blaire_169kr.jpg" },
  { id: "vas-asana", name: "Asana", details: "Vas H28,5 Ø23 cm", category: "vas", price: 249, image: "/tillval/vas_5_Asana_249kr.jpg", recommended: true },

  // Dekoration
  { id: "dek-gomma", name: "Gömma", details: "Förvaringslåda 23x6x30 cm", category: "dekoration", price: 149, image: "/tillval/dekoration_1_Gomma_149kr.jpg" },
  { id: "dek-helia", name: "Helia", details: "Prydnadsföremål 39x7,5x40 cm", category: "dekoration", price: 169, image: "/tillval/dekoration_2_Helia_169kr.jpg", recommended: true },
  { id: "dek-squeeze", name: "Squeeze", details: "Klämma 10x17x20 cm", category: "dekoration", price: 29, image: "/tillval/dekoration_3_Squeeze_29kr.jpg" },
  { id: "dek-eda", name: "Eda", details: "Dekorationsfat H4,5 Ø39,5 cm", category: "dekoration", price: 299, image: "/tillval/dekoration_4_Eda_299kr.jpg", recommended: true },
  { id: "dek-snigel", name: "Snigel", details: "Prydnadsföremål B14,5 D6,5 H11,5 cm", category: "dekoration", price: 199, image: "/tillval/dekoration_5_Snigel_199kr.jpg" },

  // Ljusbehållare (ljus & ljusstakar)
  { id: "ljus-vanja", name: "Vanja", details: "Ljuslykta H10 Ø8 cm", category: "ljus", price: 49, image: "/tillval/ljus_1_Vanja_49kr.jpg" },
  { id: "ljus-cornelia", name: "Cornelia", details: "Ljusstake B15 D14,5 H18 cm", category: "ljus", price: 199, image: "/tillval/ljus_2_Cornelia_199kr.jpg", recommended: true },
  { id: "ljus-citronella", name: "Citronella", details: "Myggljus H5,5 Ø8 cm", category: "ljus", price: 49, image: "/tillval/ljus_3_Citronella_49kr.jpg" },
  { id: "ljus-sparkle", name: "Sparkle", details: "Doftljus Lime Leaves & Herb, 290 g", category: "ljus", price: 59, image: "/tillval/ljus_4_Sparkle_59kr.jpg" },
  { id: "ljus-orrefors", name: "Orrefors Carat", details: "Ljuslykta H8 Ø7,5 cm", category: "ljus", price: 199, image: "/tillval/ljus_5_OrreforsCarat_199kr.jpg", recommended: true },
];

// Vård och underhåll. Egen lista och inte en kategori i TILLVAL_PRODUCTS: de här hör till ett
// VAL (möbeltassar under Ben, waxolja under Material) och inte till Tillbehör-listan, som
// handlar om att inreda hyllan. Skissen visar möbeltassarna som upsell i Ben-panelen.
export type CareProduct = Omit<TillvalProduct, "image"> & {
  /** Produktbild. Saknas den ritar kortet en tom yta i stället för en trasig bild. */
  image?: string;
};

export const CARE_PRODUCTS: CareProduct[] = [
  { id: "vard-tassar", name: "Värna", details: "Möbeltassar, 24-pack", category: "vard", price: 10, image: "/tillval/mobeltassar.webp" },
  // Waxoljan saknar produktbild – lägg en fil på /public/tillval/waxolja.webp och sätt
  // `image` här, så visas den. Utan bild ritar kortet en tom yta i stället för en trasig bild.
  { id: "vard-waxolja", name: "Vårda", details: "Waxolja för massiv ek, 500 ml", category: "vard", price: 199 },
];

/** Slå upp en produkt oavsett vilken lista den bor i. */
export const productById = (id: string): CareProduct | undefined =>
  TILLVAL_PRODUCTS.find((p) => p.id === id) ?? CARE_PRODUCTS.find((p) => p.id === id);

/** Formatera ett kronbelopp, t.ex. 1234 → "1.234:-". */
export const formatKr = (n: number) => `${n.toLocaleString("sv-SE")}:-`;

/** Erbjudandebelopp (50 % vid köp av Anamosa), avrundat till hel krona. */
export const offerAmount = (p: Pick<TillvalProduct, "price">) => Math.round(p.price / 2);

/** Ordinarie pris formaterat, t.ex. "199:-". */
export const ordinaryPrice = (p: Pick<TillvalProduct, "price">) => formatKr(p.price);
/** Erbjudandepris (50 % vid köp av Anamosa), avrundat till hel krona. */
export const offerPrice = (p: Pick<TillvalProduct, "price">) => formatKr(offerAmount(p));

/** Produkter som matchar ett filter-id. */
export function filterProducts(filter: string): TillvalProduct[] {
  if (filter === "alla") return TILLVAL_PRODUCTS;
  if (filter === "rekommenderade") return TILLVAL_PRODUCTS.filter((p) => p.recommended);
  return TILLVAL_PRODUCTS.filter((p) => p.category === filter);
}
