# Hyllbyggare – Next.js

Next.js (App Router) + TypeScript + Tailwind, portad från HTML-prototypen och stylad enligt `../design.md` (Mio möbler: monokromt, svart som accent, fyrkantiga hörn, Bulldog/Source Sans).

## Kör
```bash
npm install
npm run dev
```
Öppna http://localhost:3000

## Struktur
- `app/globals.css` – design-tokens (oklch) från design.md. **Enda stället utseendet ändras.**
- `tailwind.config.ts` – mappar tokens till Tailwind-färger (med opacitets-states), radie, fonter.
- `lib/config.ts` – all logik och data: moduler, regler/villkor, stilar (generativa mönster), mått.
- `components/Type.tsx` – `Heading` / `Text` / `Eyebrow` enligt design.md.
- `components/Configurator.tsx` – hela konfiguratorn (panel, sliders, stil-rad, skiss, rad-popover).

## Koppling till design.md
Byt token-värdena i `app/globals.css` så följer hela appen med. `tailwind.config.ts` läser samma variabler.

## Fonter
Båda fonterna är self-hostade i `public/fonts/` och `@font-face`:ade i `globals.css`:
- **Bulldog** (rubriker) – .otf, sju vikter/stilar.
- **Source Sans 3** (brödtext, = Source Sans Pro) – variabel font (alla vikter) + kursiv.

Inga externa font-anrop. Används via `--font-heading` / `--font-body`.

## Paritet med HTML-prototypen
Full paritet: stilar (generativa mönster + lås per rad), bredd/höjd-sliders (klick + dra), dragbar stil-rad, rad-popover med villkorslogik, handtag per variant (kantgrepp/knopp/bygel/push) och scale-to-fit av förhandsvisningen.

## Att veta
- Villkoren (höjd↔hyllplan, höjd↔lådor, glas↔kantgrepp) är antaganden – se `../valen/Villkor.md`.
- Priset är en dummyberäkning.
- Förhandsvisningen är en schematisk skiss – platshållare för riktiga bilder/3D.
