# Anamosa hyllbyggare – Interaktionsmodell

Levande dokument. Hur man redigerar konfigurationen i planeraren. Bygger på valen i [[Konfigurationsval]] och stilarna i [[Fördefinierade stilar]].

## Grundprincip: rad/kolumn primärt, kub som override
- Redigering sker i första hand per **rad** eller **kolumn** (snabbt, ger avsiktligt resultat, låg tröskel – inget behov av säljare).
- En enskild **kub** kan överridas för accenter (t.ex. en glaslucka i en trärad).
- Motiv: rutnätet måste hålla sig linjerat – rad delar höjd, kolumn delar bredd – så rad/kolumn är den naturliga nivån. Samma logik som de fördefinierade stilarna.

## Lager (håll isär)
1. **Fyllnad** – vad facket är: Öppet / Lucka / Låda
2. **Frontstil** – ytan på fronten: Plain / Slats / Glass (indexerat underval)
3. **Indelning** – hyllplan som delar ett öppet fack

Glas är alltså inte en egen fyllnadstyp – en "glaslucka" = en Lucka med frontstilen Glass.

Frontstil gäller både luckor och lådor – men inte helt lika:
- **Plain** – luckor + lådfronter
- **Slats** – luckor + lådfronter
- **Glass** – endast luckor (det finns ingen glaslådfront)

En rad kan alltså ha t.ex. lamell på både luckor och lådor och hänga ihop visuellt. Glas är undantaget.

## Två redigeringsmodeller
Det finns två sätt att redigera ett band, och vilket som passar beror på möbeln.

### A. Mängd-modell (för stora, öppna hyllor)
Bandet börjar **helt tomt (öppet)**. Man sätter *hur mycket* av varje fyllnadstyp, så fördelar systemet ut dem:
- **Radhöjd:** 20 / 40 / 80 cm
- **Luckor:** None / Some / Max
- **Lådor:** None / Some / Max
- *(Öppet = det som blir kvar)*
- **Frontstil för bandet:** Plain / Slats / Glass (Glass → luckorna blir glasluckor)

Snabbt och lågtröskel när exakt placering inte spelar roll. Föredragen för stora vägghyllor.

### B. Variant-modell (för smala/låga möbler)
Man väljer ett **exakt mönster** ur en kurerad remsa. Bättre när varje sektion räknas (var lådan sitter osv.).

- Ett **band** = raden/kolumnen som redigeras, med N celler.
- En **variant** = ett mönster av fyllnad per cell: öppet / lucka / låda.
- **Frontstil** läggs ovanpå hela bandet som indexerat underval. Glas gäller bara luckorna.
- Vi **kurerar** ~6–8 varianter per bandlängd – inte hela mängden. Resten via per-kub-override.

#### Exempel: 3 celler (visar komplexiteten)
Med 3 celler och 3 fyllnadstyper (öppet / lucka / låda) finns redan **27 grundkombinationer** – och med frontstil ovanpå växer det ytterligare. Därför måste vi kurera.

Kurerat urval (topp / mitt / botten):
- öppet / öppet / öppet
- öppet / öppet / lucka
- öppet / öppet / låda
- öppet / lucka / lucka
- öppet / låda / låda
- lucka / lucka / lucka
- låda / låda / låda
- öppet / lucka / låda

> Antal varianter behöver definieras per bandlängd (2, 3, 4 celler).

### Vilken modell per kategori

| Mio-kategori | Modell |
|---|---|
| Hyllor | A – Mängd |
| Skåp & vitrinskåp | A eller B (beror på storlek) |
| Byråar | B – Variant |
| Skänkar | B – Variant |
| TV-bänkar | B – Variant |
| Hallmöbler | B – Variant |

## Redigeringsaxel per möbelkategori (Mio)
Axeln följer möbelns dominerande riktning: låga/breda → **kolumn** (sektioner i sidled), höga → **rad** (hyllplan staplade på höjden).

| Mio-kategori | Relevant? | Primär axel | Kommentar |
|---|---|---|---|
| Byråar | Ja | Kolumn | Sektioner av lådor i bredd, låg/mellanhög |
| Hyllor | Ja | Rad | Kärn-caset, hög/bred |
| Skåp & vitrinskåp | Ja | Rad | Highboard, glas upptill |
| Skänkar | Ja | Kolumn | Låg, bred |
| TV-bänkar | Ja | Kolumn | Låg, avlång; även mediavägg |
| Hallmöbler | Delvis | Beror | Hallförvaring/skåp ja; krok-del ingår inte |
| Garderober | Nej | – | Kräver full höjd, hängstång, större djup |
| Krokar & hängare | Nej | – | Ingen korpus |
| Förvaringslådor & korgar | Nej | – | Tillbehör |
| Sittbänkar | Nej | – | Ej konstruerad att sitta på |

> Kopplar till produktgrupperna i [[Färdiga moduler]] och stilarna i [[Fördefinierade stilar]].

## Att lösa
- **Mosaik/spann:** när rader har blandade höjder (en 80-kub spänner över två 40-rader) blir raderna ojämna. Behöver en regel för hur en rad-redigering hanterar moduler som spänner flera band. Regelbundna rutnät = glasklart; mosaik = behöver tänkas igenom.
- Konflikt om Luckor + Lådor "Max" samtidigt → definiera prioritering / hur de delar raden.
