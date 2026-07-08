import Link from "next/link";
import Image from "next/image";
import { Info } from "lucide-react";
import { Heading, Text } from "../Type";
import ConfigPreview from "./ConfigPreview";
import type { Config } from "./data";

// Ett konfigurationskort i karusellen (PromotionListCard i Figma).
// Bild i mitten, titel + kampanjetikett överst, pris + Välj-knapp nederst.
export default function ConfigCard({ config }: { config: Config }) {
  return (
    <article className="relative flex aspect-[439/500] w-[85vw] shrink-0 flex-col bg-secondary [scroll-snap-align:start] sm:w-[360px] lg:w-[440px]">
      {/* Produktbild – foto om det finns, annars en renderad förhandsvisning av bygget */}
      <div className="absolute inset-0 px-5 py-20">
        <div className="relative h-full w-full">
          {config.image ? (
            <Image
              src={config.image}
              alt={`${config.name} – ${config.dims}`}
              fill
              sizes="(min-width: 1024px) 29vw, (min-width: 768px) 40vw, 85vw"
              className="object-contain"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center overflow-hidden">
              <ConfigPreview config={config} />
            </div>
          )}
        </div>
      </div>

      {/* Överlägg: titel + kampanjetikett */}
      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-6">
        <div className="min-w-0">
          <Heading level="h4" as="h3" className="text-2xl leading-6">
            {config.name}
          </Heading>
          <Text variant="small" className="mt-1">{config.dims}</Text>
        </div>
        <span className="shrink-0 bg-sale px-2 py-1 font-body text-sm font-semibold leading-4 text-sale-foreground">
          {config.discount}
        </span>
      </div>

      {/* Överlägg: pris + Välj */}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-6">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-heading text-2xl font-medium leading-6 tracking-tight text-sale">{config.priceSale}</span>
            <span className="font-heading text-2xl font-medium leading-6 tracking-tight text-muted-foreground line-through">{config.priceOrig}</span>
            <Info size={16} className="shrink-0 text-muted-foreground" aria-hidden />
          </div>
          <Text variant="small" className="mt-1 text-muted-foreground">Överstruket pris avser tidigare lägsta pris</Text>
        </div>
        <Link
          href={`/bygg?config=${config.id}`}
          className="inline-flex h-11 shrink-0 items-center bg-primary px-6 font-body font-semibold text-primary-foreground rounded-button transition-opacity duration-fast hover:opacity-90 active:opacity-80"
        >
          Välj
        </Link>
      </div>
    </article>
  );
}
