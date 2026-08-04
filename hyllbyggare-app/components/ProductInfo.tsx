"use client";

import { useState } from "react";
import { ChevronRight, Star } from "lucide-react";
import { Heading, Text } from "./Type";

// Mer information om produkten som visas i ytan under bilden i summeringen
// (Figma: ProductPageBottomsection). Expanderbara detaljsektioner för Anamosa.

export default function ProductInfo({
  spec,
  bands = [],
  bandsTitle = "Rader",
}: {
  spec: [string, string][];
  bands?: { title: string; desc: string }[];
  bandsTitle?: string;
}) {
  const sections: { title: string; extra?: React.ReactNode; content: React.ReactNode }[] = [
    {
      title: "Produktbeskrivning",
      content: (
        <Text className="text-muted-foreground">
          Anamosa är ett modulärt hyllsystem som du bygger helt efter dina behov. Välj storlek,
          öppna fack, luckor och lådor – och komplettera med ben eller väggmontering. Stommen finns
          i massiv ek och i slitstarkt laminat.
        </Text>
      ),
    },
    {
      title: "Recensioner",
      extra: (
        <span className="flex items-center gap-1">
          <Star size={16} className="fill-foreground text-foreground" />
          <Text variant="body">4,0</Text>
          <Text variant="body" className="text-muted-foreground underline">(30)</Text>
        </span>
      ),
      content: <Text className="text-muted-foreground">30 recensioner med ett snittbetyg på 4,0 av 5.</Text>,
    },
    {
      title: "Specifikation",
      content: (
        <dl className="flex flex-col">
          {spec.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-4 border-b border-border py-2 last:border-0">
              <dt><Text variant="small" className="text-muted-foreground">{k}</Text></dt>
              <dd><Text variant="small" className="font-medium">{v}</Text></dd>
            </div>
          ))}
        </dl>
      ),
    },
    ...(bands.length
      ? [{
          title: `${bandsTitle} & innehåll`,
          content: (
            <dl className="flex flex-col">
              {bands.map((b) => (
                <div key={b.title} className="flex items-baseline justify-between gap-4 border-b border-border py-2 last:border-0">
                  <dt className="shrink-0"><Text variant="small" className="font-medium">{b.title}</Text></dt>
                  <dd className="text-right"><Text variant="small" className="text-muted-foreground">{b.desc}</Text></dd>
                </div>
              ))}
            </dl>
          ),
        }]
      : []),
  ];

  return (
    <div className="flex flex-col">
      {sections.map((s) => (
        <Accordion key={s.title} title={s.title} extra={s.extra}>
          {s.content}
        </Accordion>
      ))}
    </div>
  );
}

function Accordion({ title, extra, children }: { title: string; extra?: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex h-[72px] w-full items-center gap-4 text-left"
      >
        <Heading level="h3" as="span" className="flex-1 text-2xl leading-6">{title}</Heading>
        {extra}
        <ChevronRight size={16} className={`shrink-0 transition-transform duration-fast ${open ? "rotate-90" : ""}`} />
      </button>
      {open && <div className="pb-6">{children}</div>}
    </div>
  );
}
