# Prompt till Claude Code – tvånivå-panel (helhet → band)

Bygg om konfiguratorn i `hyllbyggare-app` från en flytande hover-popover till en **tvånivå-panel**. Behåll designsystemet (tokens i `globals.css`, Bulldog/Source Sans, fyrkantiga hörn, svart som vald-state) och all befintlig logik i `lib/config.ts` (Row med `h/doors/drawers/shelves`, `editRow`, `gridCells`, höjdstegen, villkoren `maxShelves`/`drawersAllowed`/`fitAmount`).

## Mål
Höger-panelen ska ha två lägen:

**Nivå 1 – helheten (default).** Visar de globala valen: Stil, Storlek (bredd/höjd), Montering + Ben, Material + Färg, Front (Slät/Ribbad/Glas/Blandad), Handtag. Ungefär som idag.

**Nivå 2 – bandet.** När man **hovrar ett band** (en rad; en kolumn i kolumnläge) i förhandsvisningen tänds en liten **"Redigera"-knapp** på bandet. Klick på knappen (eller på bandet) byter ut **hela panelinnehållet** till det bandets redigering:
- Rubrik "Rad N" (eller "Kolumn N") + en tydlig **tillbaka-knapp** som går till nivå 1.
- **Radhöjd**: 20 / 40 / 80 cm (endast för rad-axeln; dölj för kolumn).
- **Luckor**: Inga / Några / Alla.
- **Lådor**: Inga / Några / Alla (visa förklarande meddelande istället för disablat när `drawersAllowed(h)` är false).
- **Hyllplan**: 0..`maxShelves(h)` (meddelande om 0 eller inget öppet fack, som i nuvarande popover-logik).
- **Ta bort bandet**.
Använd exakt samma villkorslogik och meddelanden som dagens `RowPopover`.

## Krav
- **Ta bort den flytande popovern** (`RowPopover`, `popTop`, hover-positioneringen). Redigeringen sker i panelen, inte i en popover.
- **Hover visar en "Redigera"-knapp** på bandet (ikon + ev. text, t.ex. Lucide `Pencil`). Behåll en lätt markering av bandet vid hover.
- **Klick** på knappen (eller på bandet) sätter `active` = bandets index → panelen renderar nivå 2. "Tillbaka" sätter `active = null` → nivå 1.
- Det aktiva bandet ska vara **tydligt markerat** i förhandsvisningen medan man redigerar det.
- **Touch/utan hover:** visa Redigera-knappen permanent på banden, eller låt klick direkt på bandet öppna nivå 2.
- **Front förblir globalt** på nivå 1 – lägg inte front på bandnivå.
- Fungerar likadant på mobil och desktop (panelen ligger redan under/vid sidan av förhandsvisningen).
- Byte mellan nivå 1 och 2 får gärna ha en snabb transition (tokens `duration-fast/base`), men animera bara `opacity/transform`.
- TypeScript ska vara rent (`npx tsc --noEmit`).

## Filer
Sannolikt `components/Configurator.tsx` (panel + förhandsvisning + nuvarande `RowPopover`). Bryt gärna ut nivå 2 till en egen komponent, t.ex. `BandPanel`, som får `row`/`colDef`, index och callbacks (`editRow`/`editCol`, `removeRow`/`removeCol`, `onBack`). Logiken finns redan i `lib/config.ts` och i `editRow`/`editCol` – återanvänd, skriv inte om.

## Klart när
Man kan: välja stil + storlek på nivå 1, klicka ett band → panelen visar det bandets höjd/luckor/lådor/hyllplan, ändra dem, gå tillbaka, och allt uppdateras live i förhandsvisningen – helt utan hover.
