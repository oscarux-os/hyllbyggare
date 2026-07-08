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
      <div className="absolute inset-0 px-4 py-16 sm:px-5 sm:py-20">
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
      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4 sm:p-6">
        <div className="min-w-0">
          <Heading level="h4" as="h3" className="text-lg leading-5 sm:text-2xl sm:leading-6">
            {config.name}
          </Heading>
          <Text variant="small" className="mt-0 text-xs leading-4 sm:mt-0.5 sm:text-sm">{config.dims}</Text>
        </div>
        <span className="shrink-0 bg-sale px-1.5 py-0.5 font-body text-xs font-semibold leading-4 text-sale-foreground sm:px-2 sm:py-1 sm:text-sm">
          {config.discount}
        </span>
      </div>

      {/* Överlägg: pris + Välj */}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4 sm:p-6">
        <div className="min-w-0">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <span className="font-heading text-lg font-medium leading-5 tracking-tight text-sale sm:text-2xl sm:leading-6">{config.priceSale}</span>
            <span className="font-heading text-lg font-medium leading-5 tracking-tight text-muted-foreground line-through sm:text-2xl sm:leading-6">{config.priceOrig}</span>
            <Info size={14} className="shrink-0 text-muted-foreground sm:h-4 sm:w-4" aria-hidden />
          </div>
        </div>
        <Link
          href={`/bygg?config=${config.id}`}
          className="inline-flex h-10 shrink-0 items-center bg-primary px-5 font-body text-sm font-semibold text-primary-foreground rounded-button transition-opacity duration-fast hover:opacity-90 active:opacity-80 sm:h-11 sm:px-6 sm:text-base"
        >
          Välj
        </Link>
      </div>
    </article>
  );
}
