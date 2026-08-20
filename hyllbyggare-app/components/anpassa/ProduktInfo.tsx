"use client";

// Produktinformationen (Figma 264:21018). Ersätter accordion-varianten i den här ytan: en
// sidomeny till vänster, en sektion i taget till höger.
//
// Formen ur designen: 12-kolumnersnät med 24 px sidluft, menyn på kolumn 1–2 (239 px breda
// rader à 50 px, den valda i en ljusare ton), innehållet på 3–10, och ✕ längst ut på 12.
// Menyraderna sätts i Heading/xs – rubriktypsnittet i brödtextstorlek, som i designen.
//
// Menyn ÄR navigationen: sektionerna ligger inte staplade under varandra utan byts ut, så en
// lång specifikation aldrig gömmer det som står under den.

import { useState } from "react";
import { X } from "lucide-react";
import { Heading, Text } from "@/components/Type";

export interface InfoSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

export default function ProduktInfo({
  sections,
  onClose,
}: {
  sections: InfoSection[];
  onClose: () => void;
}) {
  const [active, setActive] = useState(sections[0]?.id);
  const current = sections.find((s) => s.id === active) ?? sections[0];

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 bg-card lg:grid-cols-12 lg:gap-px">
      {/* menyn */}
      <nav className="lg:col-span-2 lg:overflow-y-auto">
        <ul className="flex flex-col gap-px">
          {sections.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => setActive(s.id)}
                aria-current={s.id === current?.id}
                // Ramen ligger alltid ute (transparent) så texten står på exakt samma ställe i
                // båda lägena – annars hoppar menyn en pixel när man byter sektion. Den valda
                // bär tre signaler: ton, svart kantmarkör och full svärta i texten. De andra är
                // nedtonade, för det är valet som ska läsa först.
                className={`flex h-[50px] w-full items-center border-l-2 px-6 py-3 text-left font-heading text-base font-medium leading-4 tracking-tight transition-colors duration-fast ${
                  s.id === current?.id
                    ? "border-foreground bg-secondary text-foreground"
                    : "border-transparent text-muted-foreground hover:bg-surface hover:text-foreground"
                }`}
              >
                {s.title}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* innehållet */}
      <div key={current?.id} className="panel-enter-right min-h-0 lg:col-span-8 lg:overflow-y-auto lg:px-6">
        <Heading level="h2" className="text-[32px] leading-8">{current?.title}</Heading>
        <div className="mt-2 flex flex-col gap-6">{current?.content}</div>
      </div>

      <div className="hidden items-start justify-end lg:col-span-2 lg:flex">
        <button
          type="button"
          aria-label="Stäng"
          onClick={onClose}
          className="flex h-6 w-6 shrink-0 items-center justify-center text-foreground transition-opacity duration-fast hover:opacity-60"
        >
          <X size={24} />
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Byggstenar för innehållet – samma typografi som designen                    */
/* -------------------------------------------------------------------------- */

/** Mellanrubrik i brödtexten ("Bra att veta"). */
export function InfoLead({ children }: { children: React.ReactNode }) {
  return <Text as="p" className="font-semibold text-foreground">{children}</Text>;
}

export function InfoText({ children }: { children: React.ReactNode }) {
  return <Text as="p" className="text-foreground">{children}</Text>;
}

/** Punktlista, indragen 24 px som i designen. */
export function InfoList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc">
      {items.map((t) => (
        <li key={t} className="ms-6">
          <Text as="span" className="text-foreground">{t}</Text>
        </li>
      ))}
    </ul>
  );
}

/**
 * Etikett + värde på samma rad, 14/20 med värdet i sekundär ton. Designen använder samma form
 * för både artikelnummer och specifikation, så det är en komponent och inte två.
 */
export function InfoRows({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="flex flex-col gap-1">
      {rows.map(([label, value]) => (
        <div key={label} className="flex gap-1">
          <dt><Text as="span" variant="small" className="text-foreground">{label}</Text></dt>
          <dd><Text as="span" variant="small" className="text-muted-foreground">{value}</Text></dd>
        </div>
      ))}
    </dl>
  );
}

/* -------------------------------------------------------------------------- */
/* Innehållet för Anamosa                                                     */
/* -------------------------------------------------------------------------- */

// Designen har också Garanti, Dokument och Designer. De ligger inte här: en meny som leder till
// en tom sida är sämre än en meny med fyra poster. Lägg till dem när det finns innehåll.
export function anamosaSections(spec: [string, string][]): InfoSection[] {
  return [
    {
      id: "beskrivning",
      title: "Produktbeskrivning",
      content: (
        <>
          <InfoText>
            Anamosa är ett modulärt hyllsystem som du bygger helt efter dina behov. Välj storlek,
            öppna fack, luckor och lådor – och komplettera med ben eller väggmontering. Stommen
            finns i massiv ek och i slitstarkt laminat.
          </InfoText>
          <div className="flex flex-col gap-2">
            <InfoLead>Bra att veta</InfoLead>
            <InfoText>
              Systemet är uppbyggt av moduler på 40 cm. Möbeln levereras omonterad, och går att
              bygga vidare på i efterhand med fler sektioner.
            </InfoText>
          </div>
          <InfoList
            items={[
              "Bredd och höjd väljs i hela moduler – upp till sex i varje riktning",
              "Fack kan vara öppna, ha lucka eller låda, och luckan finns i trä eller glas",
              "Stommen finns i tre ekytor och fyra laminatfärger",
              "Möbeln kan stå på ben eller monteras på vägg för fri golvyta under",
              "Handtag väljs till hela möbeln, eller väljs bort helt med push-to-open",
            ]}
          />
          <InfoRows rows={[["Serie", "Anamosa"], ["Artikelnummer", "Sätts när konfigurationen sparas"]]} />
        </>
      ),
    },
    {
      id: "recensioner",
      title: "Recensioner",
      content: (
        <>
          <InfoText>4,0 av 5 i snittbetyg, baserat på 30 recensioner.</InfoText>
          <InfoText>
            Omdömena gäller serien Anamosa som helhet – inte den konfiguration du just nu har
            byggt.
          </InfoText>
        </>
      ),
    },
    {
      id: "specifikationer",
      title: "Specifikationer",
      content: (
        <>
          <InfoText>Måtten gäller möbeln som du har byggt den just nu.</InfoText>
          <InfoRows rows={spec} />
        </>
      ),
    },
    {
      id: "miljo",
      title: "Miljömärkningar",
      content: (
        <>
          <InfoRows rows={[["Träråvara", "FSC-certifierad"]]} />
          <InfoText>
            Träet i stommen kommer från ansvarsfullt brukade skogar. Ytbehandlingen är fri från
            lösningsmedel.
          </InfoText>
        </>
      ),
    },
  ];
}
