# Beslut – konfigurationsmodell (v1)

Ett medvetet vägval, skrivet för att vara **billigt att ändra** när tester ger mer data. Kopplar till [[Interaktionsmodell]], [[Fördefinierade stilar]] och [[Villkor]].

## Beslut: tvånivå-modell (helhet → band)
Rader kan ha olika höjd, så **bandet (raden, eller kolumnen för låga/breda möbler) är den naturliga redigeringsenheten**. Vi gör det till en riktig nivå – inte ett gömt "avancerat läge".

**Nivå 1 – helheten**
- **Stil** – ett generativt *startmönster* (struktur/rytm). Bara en startpunkt.
- **Storlek** – bredd/höjd (stegat)
- **Montering & ben**, **material & färg**, **front** (Slät/Ribbad/Glas/Blandat), **handtag** – allt globalt.

**Nivå 2 – bandet**
- Hovrar man ett band tänds en **"Redigera"-knapp** på bandet. Klick på den (eller bandet) → panelen byter innehåll till det bandets redigering.
- Där sätts: **höjd** (20/40/80), **luckor**, **lådor**, **hyllplan** för bandet – plus ta bort bandet.
- Tillbaka-knapp återgår till nivå 1.

## Interaktion: hover visar redigera-knapp, klick öppnar nivå 2 i panelen
- **Hover** på ett band = upptäckbarhet: en liten "Redigera"-knapp tänds på bandet (och bandet markeras lätt).
- **Klick** på knappen/bandet byter panelens innehåll till nivå 2 för just det bandet.
- Redigeringen sker i **panelen**, inte i en flytande popover – ersätter den gamla rad-popovern.
- Det aktiva bandet markeras tydligt medan man redigerar. Ett "tillbaka" tar en till nivå 1.
- På touch (ingen hover): knappen kan visas permanent på banden, eller så räcker klick direkt på bandet.

## Varför
- Löser höjdproblemet: olika höga rader kräver per-band-kontroll ändå – då sätter man höjd + funktion på samma ställe.
- Stil = start, inte fyllnadsnivå → ingen explosion av stilar ("tomt/några/fullt" är en stil × band-redigering, inte tre stilar).
- Global fyllnad/defaults kan finnas som snabbstart; bandet är där man förfinar.
- Enkel mental modell: helhet först, detalj vid behov.

## Det avgörande
- Kvaliteten på **startmönstren (stilarna)** och de **generativa reglerna** – de ska ge en snygg utgångspunkt så att de flesta knappt behöver nivå 2.
- **Front är globalt** (inkl. generativ "Blandad") – går inte ner på band-/kolumnnivå.
- Axel per möbelkategori: rad för höga, kolumn för låga/breda (se [[Interaktionsmodell]]).

## Kända gränser / att validera
- Testa med 5–10 personer: hittar de nivå 2, och räcker det? 
- Antaganden om regler/villkor bekräftas med ACTONA (se [[Villkor]]).
