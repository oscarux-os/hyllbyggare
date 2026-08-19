import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Star, ShoppingCart, Truck } from "lucide-react";

// Hero för seriesidan enligt Figma: två kolumner. Vänster har brödsmulor,
// centrerad titel/underrubrik/knapp samt ett 2×2-rutnät med nyckelvärden.
// Höger är en stor produktbild som fyller kolumnen.

function FeatureCard({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col justify-end gap-2 bg-background p-4">{children}</div>
  );
}

export default function Hero() {
  return (
    <section aria-label="Anamosa" className="flex flex-col gap-6 p-2 md:flex-row md:items-stretch md:p-6">
      {/* Vänster kolumn – brödsmulor i toppen, övrigt innehåll centrerat i resten */}
      <div className="flex flex-1 flex-col gap-6">
        {/* Brödsmulor – längst upp till vänster, i linje med bildens topp */}
        <nav aria-label="Brödsmulor" className="flex items-center gap-0.5 font-body text-base tracking-tight">
          <Link href="/" className="text-muted-foreground transition-opacity duration-fast hover:opacity-70">
            Serier
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground" aria-current="page">
            Anamosa
          </span>
        </nav>

        {/* Titel, underrubrik, knapp och USP:ar – centrerade i ytan under brödsmulan */}
        <div className="flex flex-1 items-center justify-center">
          <div className="flex w-full max-w-[696px] flex-col gap-10">
          {/* Titel, underrubrik och knapp – centrerade */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-center font-heading text-6xl font-medium leading-[0.9] tracking-tight md:text-8xl lg:text-[100px] lg:leading-none lg:tracking-[-2px]">
                Anamosa
              </h1>
              <p className="max-w-[800px] text-center font-body text-xl leading-7 tracking-tight text-muted-foreground">
                En hylla. Oändligt många möjligheter.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link
                href="/bygg"
                className="inline-flex h-12 shrink-0 items-center justify-center gap-3 bg-primary px-6 font-body text-xl font-semibold leading-6 tracking-[-0.3px] text-primary-foreground rounded-button transition-opacity duration-fast hover:opacity-90 active:opacity-80"
              >
                <Image src="/brand/orb.png" alt="" width={24} height={24} className="shrink-0" aria-hidden />
                Bygg din egen
              </Link>
              {/* Det andra spåret: produktsidan som råkar vara konfigurerbar. Den ligger
                  bredvid byggaren och inte i stället för den – de är två olika produkter, och
                  vilken väg vi går är fortfarande ett öppet beslut. Lab-märket är därför inte
                  kosmetika: ytan är ett spår som utvärderas, inte något som är bestämt. */}
              <Link
                href="/lab/anpassa"
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 border border-foreground px-6 font-body text-xl font-semibold leading-6 tracking-[-0.3px] text-foreground rounded-button transition-colors duration-fast hover:bg-secondary active:opacity-80"
              >
                Anpassa
                <span className="bg-secondary px-2 py-0.5 font-body text-xs font-normal uppercase leading-4 tracking-[0.12em] text-muted-foreground">
                  Lab
                </span>
              </Link>
            </div>
          </div>

          {/* Nyckelvärden – 2×2 med tunna delningslinjer */}
          <div className="grid grid-cols-2 gap-px border border-border bg-border md:mx-6">
            <FeatureCard>
              <div className="flex items-center gap-2">
                <span className="font-heading text-2xl font-medium leading-6 tracking-tight">4,0</span>
                <div className="flex items-center gap-0.5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star
                      key={i}
                      size={20}
                      aria-hidden
                      className={i < 4 ? "fill-foreground text-foreground" : "fill-border text-border"}
                    />
                  ))}
                </div>
              </div>
              <a href="#reviews" className="font-body text-base tracking-tight underline">
                Baserat på 42 betyg
              </a>
            </FeatureCard>

            <FeatureCard>
              <ShoppingCart size={24} aria-hidden />
              <p className="font-body text-base tracking-tight">30 dagars öppet köp</p>
            </FeatureCard>

            <FeatureCard>
              <Image src="/brand/orb.png" alt="" width={24} height={24} aria-hidden />
              <p className="font-body text-base tracking-tight">Designa den precis som du vill</p>
            </FeatureCard>

            <FeatureCard>
              <Truck size={24} aria-hidden />
              <p className="font-body text-base tracking-tight">Hemleverans från 595:-</p>
            </FeatureCard>
          </div>
          </div>
        </div>
      </div>

      {/* Höger kolumn – produktbild i fast 1:1-format */}
      <div className="relative aspect-square w-full flex-1 overflow-hidden">
        <Image
          src="/hero/anamosa-shelf.png"
          alt="Anamosa bokhylla i ek mot en beige vägg"
          fill
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
    </section>
  );
}
