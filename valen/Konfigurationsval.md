# Anamosa hyllbyggare – Konfigurationsval

Levande dokument. Fylls på allt eftersom. Baserat på underlaget från ACTONA (presentation, tekniska ritningar, kube-spec).

## Princip
- Det vi inte kan göra tar vi inte ens med (t.ex. fritt djup, valbara baksidor).
- Stegade val snäpper till modulerna – omöjliga mått kan inte byggas.
- Globala val (frontstil, finish, handtag, montering) + lokala val per ruta (innehåll).

---

## Enskild kub (atomär enhet)
Kuben är grundbyggstenen. Per kub kan väljas:

- **Bredd:** 20 / 40 / 80 cm
- **Höjd:** 20 / 40 / 80 cm
- **Djup:** 40 cm (fast – inget val)
- **Fyllnad:** öppet / lucka / låda
- **Frontstil** (om lucka/låda): Plain / Slats / Glass (glas bara lucka)
- **Handtag** (om lucka/låda): variant 1 / 2 / 3 / push-open
- **Hyllplan** (om öppet): 0 / 1 / 2 i 3 lägen
- **Finish/färg:** enligt paletten

> Bekräfta med ACTONA: alla bredd×höjd-kombinationer finns nog inte som lagermodul (specen listar t.ex. 40×40, 40×80, 80×40, 80×80, men inte säkert 80×20). Bredd = 20/40/80, men möjliga höjder per bredd kan vara begränsade.

### Per kub vs styrt av bandet/rutnätet
- **Per kub (oberoende):** fyllnad, frontstil, handtag, hyllplan
- **Styrt av bandet:** höjd (delas av raden), bredd (delas av kolumnen), finish/stomme-färg (global; front-färg ev. per band)

Konsekvens: en rad-kontroll kan bara manipulera de oberoende per-kub-valen (mängd luckor/lådor). När en kubs bredd sätts låses kolumnbredden – alla kuber i kolumnen följer med. Se [[Interaktionsmodell]].

## Rad och kolumn
Nivåerna man bygger på: **kub → rad/kolumn → möbel.**

**Rad** (vågrätt band):
- Alla kuber i raden delar **höjd** (20 / 40 / 80 cm)
- Kan sätta fyllnad/frontstil för hela raden på en gång
- Enklast att tänka i för höga möbler (hyllor, vitrin) – man jobbar hyllplan för hyllplan

**Kolumn** (lodrätt band):
- Alla kuber i kolumnen delar **bredd** (20 / 40 / 80 cm)
- Kan sätta fyllnad/frontstil för hela kolumnen på en gång
- Enklast för låga/breda möbler (skänk, byrå, TV) – man jobbar sektion för sektion

Redigeringsmodell (mängd vs variant) och axel per möbelkategori: se [[Interaktionsmodell]].

---

## Form / Funktion – panelens uppdelning
Konfigurationen delas i två lägen (likt Tylko), vilket gör den lättare att hantera: först helheten, sen finjustering.

- **Form (globalt):** påverkar hela möbeln. Antal kolumner, total bredd, höjd (default), djup, material/finish, ben/montering, ev. ridge/sockel.
- **Funktion (per rad/kolumn):** välj en rad/kolumn och gå på djupet. Innehåll (variant), frontstil, hyllplan, ev. kabelhål, samt höjd/djup som **override**.

### Default + override
Höjd och djup finns på **båda** nivåerna och hänger ihop som default + override:
- Form sätter ett globalt default (alla kolumner ärver det).
- Funktion kan ge en enskild rad/kolumn ett eget värde ("anpassad").
- En orörd rad/kolumn ärver Form-värdet; ändrar man Form följer bara de orörda med. De anpassade behåller sitt (med "återställ till global").

> Detta är samma mönster som `locked` + `applyStyle` redan använder i prototypen – en finjusterad rad behålls när en global stil appliceras. Bara flyttat till kolumn-/radnivå och uppdelat i två tydliga lägen.

### Var hör valen hemma

| Form (globalt) | Funktion (per rad/kolumn) |
|---|---|
| Antal kolumner / total bredd | Innehåll (öppet/lucka/låda, variant) |
| Höjd (default) | Frontstil |
| Djup (default) | Hyllplan |
| Material / finish / färg | Höjd (override) |
| Ben / montering | Djup (override) |
| Ridge / sockel | (ev. kabelhål) |

### Per-kolumn-höjd styrs hårdare mot TV-möbler
Att dela upp i Funktion och ge kolumner **olika höjd** (ojämn/trappstegs-topp) ska främst styras mot **TV-möbler** – där behövs en låg sektion för att få in TV:n (och ev. en glugg/öppen sektion runt den). I andra typer (hylla, byrå, skänk, vitrin) ska ojämna kolumnhöjder **helst undvikas**: det är svårt att bygga snyggt och ger lätt ett rörigt intryck. Där styr vi mot **enhetlig höjd** (Form-defaulten) och låter per-kolumn-höjd vara ett undantag, inte normen.

> Praktiskt: för TV-möbel uppmuntra/föreslå höjdvariation; för övriga kategorier nedtona det (t.ex. höjd-override bakom en mer medveten handling, eller dolt tills man aktivt vill avvika).

Av samma skäl behövs **inte själva Form/Funktion-uppdelningen** i de enklare typerna – de har inte samma komplexitet. Form/Funktion (med per-kolumn-djupredigering och höjdvariation) motiveras främst av **TV-möbeln/mediaväggen**. För hylla, byrå, skänk och vitrin räcker ett **enklare, enkelt konfigurationsflöde** (globala val + lätt per-rad/kolumn-finjustering inline, som idag) utan två separata lägen. Tumregel: lägg bara på två-lägesuppdelningen där komplexiteten faktiskt finns.

### Preliminära beslut (bekräftas)
- **Kolumnbredd:** lika breda kolumner – bredd styrs globalt (total bredd ÷ antal), ingen per-kolumn-bredd i v1. (Tylko gör så; varierande bredd = "mosaik/spann", se [[Interaktionsmodell]], ev. senare.)
- **Override-semantik:** ändrad global höjd/djup påverkar bara orörda rader/kolumner, inte de anpassade.
- **Per-kolumn-höjd:** styrs mot TV-möbler, undviks/nedtonas i övriga typer (se ovan).
- **Kabelhål och ridge/sockel:** senare, inte v1.

> Prototyp/spike av Form/Funktion-uppdelningen med default+override finns på route `/lab` (kolumn-primär, golv-justerad, återanvänder konfiguratorns komponenter). Ej kopplad till huvudflödet än.

---

## Val och möjligheter

### Storlek – bredd (stegad)
- Modulbredder per fack: **20 / 40 / 80 cm**
- Förbyggda breda enheter: **120 / 160 cm**
- Total bredd = summan av moduler

### Storlek – höjd (stegad)
- Modulhöjder: **20 / 40 / 80 cm**, staplingsbara
- Låg rad (20 cm) finns i bredderna 40 / 80 / 120 cm
  - 20×120 kommer med **3-facksindelning** (tre fack på rad)

> Obs: måttordningen i kube-specen verkar inte vara helt konsekvent (för 20-serien ser "20" ut att vara höjden). Dubbelkolla med ACTONA.

### Djup
- **Fast 40 cm** – inget val (tas med endast som låst info)

### Frontstil
Indexerat underval på lucka/låda (inte en egen fyllnadstyp). Se [[Indexerade val]] nedan.
Beskrivande texter (kundvänliga):
- **Slät** – En lugn, slät front utan struktur. Tidlös och lätt att matcha med annat. (luckor + lådor)
- **Ribbor** – Vertikala ribbor som ger relief och en varm, taktil yta. (luckor + lådor)
- **Glas** – Klarglas som visar upp innehållet – för det du vill lyfta fram. (endast luckor)

### Innehåll per ruta
Tänk i tre nivåer:

1. **Kuben (facket)** – själva boxen / grundmodulen (t.ex. 40×40, 80×40).
2. **Vad facket är** – öppet, eller stängt med lucka / låda / glaslucka.
3. **Indelning inuti facket** – ett öppet fack kan delas med ett eller flera hyllplan i höjdled, så en box blir flera mindre fack ovanpå varandra.

Det är alltså inte "öppen *eller* hyllplan" – facket är boxen, hyllplanet delar boxen.

Typ av fack (kundvänliga texter):
- **Öppen** – Öppet fack för böcker, prydnader och sådant du vill nå snabbt. *(indexerat underval: hyllplan)*
- **Lucka** – Döljer innehållet bakom en dörr och håller det dammfritt. *(indexerat underval: frontstil + handtag)*
- **Låda** – Utdragbar låda för det som ska vara nära till hands men undanstoppat. *(indexerat underval: frontstil utom glas + handtag)*

> "Glaslucka" är ingen egen typ – det är en Lucka med frontstilen Glas.

Hyllplan (delar ett öppet fack i höjdled):
*Kundtext: "Dela facket med ett extra hyllplan för fler, lägre fack."*
- Bredd **40** och **80**, flyttbara i **3 lägen**
- Ett hyllplan = 2 fack, två hyllplan = 3 fack, osv.
- Den smala höga modulen 20×120 kommer färdig med 3-rumsindelning

Lucka/låda-fronter finns i: 20×40, 40×40, 40×80, 80×40

### Handtag
Kundvänliga texter:
- **Grepp** (kantgrepp) – Diskret integrerat grepp i kanten, helt utan synligt beslag.
- **Knopp** – Liten rund knopp, klassisk och nätt.
- **Handtag** (bygel) – Avlångt bygelhandtag, tydligt och bekvämt att greppa.
- **Push-open** – Tryck för att öppna, helt handtagsfritt och rent (default).

### Montering
Kundvänliga texter:
- **Väggmonterad** – Svävar på väggen med fri golvyta under – lättare intryck och enkelt att städa under.
- **Stående** – Står på golvet på ben eller sockel, stabilt och lätt att flytta.

### Ben / sockel (endast vid stående)
Ben-sidan (presentation s.4) listar fyra (kundvänliga texter):
- **Rund träfot** Ø5 cm – Mjuk, rund träfot för en varm, skandinavisk känsla.
- **Sockel** (7,5 cm) – Indragen sockel; möbeln ser ut att vila direkt på golvet.
- **Mässingsben** Ø2 cm – Tunt ben i mässing, en elegant liten detalj.
- **Svart stålben** – Tunt svart stålben, stramt och modernt.

Miljöbilderna visar dessutom:
- Tunna svarta stålben (s.7)
- Vinklade träben på TV-bänk (s.21)

> Ser ut som minst **två stålvarianter (svart + mässing)** plus flera trävarianter. Exakt antal/utförande bör bekräftas med ACTONA.

### Finish / färg
Tvånivå-val: **först material, sen färg** (färgen beror på materialet). Det smalnar av och gör valet konkret.

**Material: Ek** (trä/fanér) – *Kundtext: "Äkta ek med synlig ådring – varmt och levande."*
- **Naturlig ek** – Ljus, oljad ek i sin naturliga ton. (s.7, 11, 14)
- **Mörkbetsad ek** – Mörkare betsad ek, varmare och mer dramatisk. (s.8, 15, 20–24)

**Material: Laminat** (gissning – bekräftas) – *Kundtext: "Slät, tålig yta i enhetlig kulör."*
- **Vit / beige** – Ljus, neutral och lätt att inreda runt. (s.9, 17)
- **Taupe** – Varmgrå, mjuk och dämpad. (s.18)
- **Mörkgrå** – Djup, nästan kolsvart för en strikt look. (s.16)
- **Grön** – Salvia-/skogsgrön, en lugn färgaccent. (s.19)

> **Tvåton:** flera bilder visar mörk/svart stomme med fronter i trä eller grön (s.16, s.19), medan andra är enfärgade. Stomme och front kan alltså troligen väljas var för sig.
> Bekräfta med ACTONA: att materialet för de målade färgerna verkligen är laminat, hela paletten per material, och om stomme/front-färg är separata val.

---

## Indexerade val (underval)
Val som först blir aktuella när ett annat val är gjort – och vad som ingår i dem:

| Utlöses av | Indexerat underval | Ingående alternativ |
|---|---|---|
| Fack = **Lucka** | Frontstil | Plain / Slats / Glass |
| Fack = **Lucka** | Handtag | Variant 1 / 2 / 3 / push-open |
| Fack = **Låda** | Frontstil | Plain / Slats (**ej Glass**) |
| Fack = **Låda** | Handtag | Variant 1 / 2 / 3 / push-open |
| Fack = **Öppen** | Indelning (hyllplan) | 0 / 1 / 2+ hyllplan i 3 lägen |
| Montering = **Stående** | Ben / sockel | Rund träfot / sockel / mässingsben / svart stålben (+ ev. fler) |
| Material = **Ek** | Färg | Naturlig ek / Mörkbetsad ek |
| Material = **Laminat** | Färg | Vit/beige / Taupe / Mörkgrå / Grön |
| Finish (om tvåton) | Front-färg separat från stomme | Hela paletten (bekräftas) |

> Icke-indexerade (globala/fristående) val: bredd, höjd, montering, material.

---

## Öppna frågor
- **Färger:** Specen anger bara två ek-toner. Grå/taupe-versionen i renderingarna finns inte i specen. Stäm av med ACTONA: hålla oss till ek, eller finns en lackfärg-palett?
- **Frontstil per ruta:** Hur mycket guidar vi? Förslag: smart default på hela möbeln + override per ruta + ev. färdiga mix-mönster.
