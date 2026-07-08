# Anamosa hyllbyggare – Villkor & regler

Levande dokument. Samlar de beroenden/regler som styr vilka val som är möjliga. Hålls skilt från prototypen så logiken kan byggas som en valideringsmotor. Markerat om regeln kommer från **underlaget** eller är ett **antagande** (att bekräfta med ACTONA).

Kopplar till [[Konfigurationsval]] och [[Interaktionsmodell]].

## Inbyggda villkor (finns i prototypen)

| Villkor | Regel | Källa |
|---|---|---|
| Höjd → hyllplan | 20 cm = 0, 40 cm = 1, 80 cm = max 2 | Antagande |
| Höjd → lådor | Lådor endast på låga rader (≤40 cm) | Antagande |
| Öppet fack → hyllplan | Hyllplan delar bara ett **öppet** fack; ej inuti låda | Logik (rimlig) |
| Glas → lucka | Glasfront endast på luckor, ingen glaslådfront | Underlag ("Klar glas låge") |
| Frontstil per rad | Visas bara när raden har luckor/lådor | Logik |
| Glasfront → handtag | Kantgrepp (Grepp) ej valbart när glasfront används – greppet fräses i trä | Antagande |
| Djup | Fast 40 cm, inget val | Underlag |

## Material (vad underlaget faktiskt säger)
Kube-specen anger endast trä: **Lakeret eg** (lackad ek) och **Smoke eg** (rökt/mörkbetsad ek). Inget om laminat eller målade kulörer. De målade färgerna (vit/beige, taupe, mörkgrå, grön) syns bara i renderingarna och **saknar materialangivelse**. Vårt laminat-antagande är alltså inte belagt – måste bekräftas.

## Från tekniska ritningar (TD-filen)
Exakta mm-mått från produktionsunderlaget:

- **Material:** 18 mm panel överallt. Glaslucka = 6 mm glas.
- **Modulmått:** 400 mm utvändigt / 364 mm invändigt per fack. Höjder: 219 mm (låg), 400 mm (mellan), 782 mm (hög = 364+18+364).
- **Skarvning delar panel:** totalmått ≠ n×400. Formel: **n×400 − (n−1)×18 mm**. Ex: 2 fack = 782, 3 fack = 1164. Gäller både bredd och höjd.
  - Konsekvens: sliderns "40/80/120 cm" är **nominellt**. Mått/pris och "får plats"-koll bör räkna på riktiga mm.
- **Hyllplan:** "3 positioner" med 127 mm mellanrum, **endast i 400 mm-höga fack** (låga 219 mm-facket har inga). Bekräftar regeln 20 cm → 0 hyllplan.
  - Att kolla: "3 positioner" = troligen **en flyttbar hylla i tre höjdlägen**, inte upp till två hyllor. Prototypen tillåter två – stäm av.
- **Fronter:** mått per fackstorlek – låg 176 mm, mellan 358 mm, hög 740 mm; 358 mm bred för en 40-modul. Front 358 mot 364 invändigt = push-open-glipa.

## Villkor att utforska / bekräfta med ACTONA

- **Max total bredd/höjd** – var går taket? Olika för väggmonterad (lastgräns) vs stående (stabilitet/vikt)? Behövs för slidrarnas max.
- **Vikt & infästning** – krav för väggmontering; max vikt per upphäng.
- **Tillåtna bredd×höjd-kombinationer** – finns alla som lagermodul (t.ex. 80×20), eller bara de i specen (40×40, 40×80, 80×40, 80×80, 20×40, 20×80, 20×120, 120×80, 160×80)?
- **Material för målade kulörer** – laminat, lackad MDF, eller annat? Hela paletten per material.
- **Tvåton** – kan stomme och front ha olika färg? Vilka kombinationer? Beror det på material?
- **Ben per storlek/vikt** – specen visar "ben i trä 40×?, 80×?" → ben tycks dimensioneras efter bredd. Vilka ben funkar för vilka storlekar? Min/max?
- **Sockel** – gäller hela bredden? Kombinerbar med alla storlekar?
- **Väggmontering + storlek** – max bredd/höjd som får väggmonteras (vs kräver ben/golv)?
- **Handtag** – finns alla tre varianterna på både luckor och lådor? Placering (lucka = sida, låda = topp/mitt)? Push-open på allt?
- **Frontstil-mix** – får man blanda Plain/Slats/Glass i samma möbel, eller måste hela möbeln ha en frontstil?
- **20×120 (3-facksmodul)** – är indelningen fast, eller kan den konfigureras?
- **Glaslucka – minsta fackstorlek?** – kräver glas en viss kubstorlek?
- **Min storlek** – minsta säljbara möbel (1 kub?).
- **Inre hylla bakom lucka** – finns det som tillval (skilt från synligt hyllplan i öppet fack)?
- **Hyllplan – flyttbart vs fast** – specen säger 3 hål så hyllor kan flyttas; gäller det alla fackhöjder?
