import Link from "next/link";
import { KEY_SPECS } from "./data";

// USP-block i Volvo-stil: etikett till vänster, stort värde till höger, tunna
// avdelare mellan raderna och en outline-knapp under. Ligger högt upp på sidan.
export default function KeySpecs() {
  return (
    <section aria-label="Nyckelspecifikationer" className="mx-auto max-w-[1200px] px-2 py-12 md:px-6 md:py-16">
      <dl className="flex flex-col">
        {KEY_SPECS.map((spec) => (
          <div
            key={spec.label}
            className="grid grid-cols-2 items-center gap-6 border-t border-border py-6 last:border-b md:gap-10 md:py-8"
          >
            <dt className="font-body text-sm leading-5 tracking-tight text-muted-foreground md:text-base">
              {spec.label}
            </dt>
            <dd className="font-heading text-5xl font-medium leading-[0.9] tracking-tight md:text-7xl">
              {spec.value}
            </dd>
          </div>
        ))}
      </dl>

      <Link
        href="#valmojligheter"
        className="mt-8 inline-flex h-11 items-center rounded-full border border-foreground px-6 font-body font-semibold tracking-tight transition-opacity duration-fast hover:opacity-70"
      >
        Specifikationer
      </Link>
    </section>
  );
}
