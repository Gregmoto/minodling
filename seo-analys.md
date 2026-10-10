# SEO-analys – minodling.se

**Period:** 2026-04-29 – 2026-09-14 (139 dagar)
**Källa:** Google Search Console-export, 2026-09-16

> **Två avvikelser mot din beskrivning.** Exportens `Filter.csv` anger *"Senaste
> 12 månaderna"*, inte 3 månader — men datan innehåller bara 139 dagar, eftersom
> sajten fick sina första exponeringar 2026-04-30. Analysen använder hela det
> spannet. (Du skrev också `EXEMPEL.se`; jag har utgått från minodling.se.)

---

## Sammanfattning

| Mätvärde | Värde |
|---|---|
| Klick | 576 |
| Exponeringar | 81 260 |
| Snitt-CTR | **0,71 %** |
| Sökord på position 1–3 | **5 st** (35 exponeringar, 0 klick) |
| Sökord på position 20+ | **731 av 1000** |
| Varumärkta sökningar | **0** |

**Den enskilt viktigaste slutsatsen:** sajten har ett volymproblem i rankning, inte
i klickfrekvens — och nästan halva synligheten slösas bort på duplicerade
värdnamn. Det finns i praktiken ingenting på position 1–5 att optimera titlar för.

### Trend per månad

| Månad | Klick | Exponeringar | CTR | Snittposition |
|---|---|---|---|---|
| 2026-05 | 82 | 12 515 | 0,66 % | 32,0 |
| 2026-06 | 84 | 12 905 | 0,65 % | 33,3 |
| 2026-07 | 171 | 21 594 | 0,79 % | 21,1 |
| 2026-08 | 184 | 24 421 | 0,75 % | 20,2 |
| 2026-09 (t.o.m. 14:e) | 55 | 9 824 | 0,56 % | 24,1 |

**Senaste 28 dagarna: 122 klick mot 193 föregående period — en nedgång på 37 %**,
medan exponeringarna bara föll 12 % och snittpositionen försämrades från 20,2
till 24,1.

Två förklaringar är lika rimliga och datan skiljer dem inte åt:

1. **Säsong.** Odlingssäsongen i Sverige går mot sitt slut i september. För en
   odlingssajt är det den mest sannolika förklaringen.
2. **Serverflytten.** Sajten flyttades till Cloudflare omkring 18–19 augusti,
   vilket sammanfaller exakt med nedgångsfönstret. Bildoptimeringen är avstängd
   sedan dess (`unoptimized: true`), vilket ger tyngre sidor.

Jag påstår inte att flytten orsakade nedgången — men sammanfallet är värt att
bevaka. Jämför med samma period förra året när datan finns.

### Enheter

| Enhet | Klick | Exponeringar | CTR | Position |
|---|---|---|---|---|
| Mobilt | 465 | 50 648 | 0,92 % | **13,7** |
| Desktop | 83 | 29 120 | 0,29 % | **39,6** |
| Surfplatta | 28 | 1 492 | 1,88 % | 10,6 |

Desktop rankar 26 positioner sämre än mobil på samma sajt. Det är en anmärkningsvärt
stor skillnad och värd en egen utredning.

### Länder

| Land | Klick | Exponeringar | CTR | Position |
|---|---|---|---|---|
| Sverige | 538 | 74 476 | 0,72 % | 22,3 |
| Finland | 17 | 1 188 | 1,43 % | 9,8 |

93 % av klicken kommer från Sverige. Finland rankar bättre men är marginellt.

---

## Topp 10 prioriterade åtgärder

| # | Åtgärd | Gäller | Nuläge | Uppskattad effekt |
|---|---|---|---|---|
| 1 | **301-omdirigera www → apex** | 80 sökvägar | 87 % av exponeringarna dubblerade | Störst enskild åtgärd |
| 2 | Bygg ut sidan om **oleander** | `/vaxtdatabas/oleander` | 8 621 exp, pos 9,0, CTR 0,66 % | +40–90 klick/mån |
| 3 | Bygg ut **palmlilja** | `/vaxtdatabas/palmlilja` | 4 246 exp, pos 9,0 | +25–36 klick/mån |
| 4 | Utred desktop-rankningen | Hela sajten | Pos 39,6 mot mobilens 13,7 | Okänd, potentiellt stor |
| 5 | Bygg ut **sidoskott** | `/ordlista/sidoskott` | 1 281 exp, pos 6,2, CTR 0,62 % | +24 klick/mån |
| 6 | Titlar på sidor med CTR under 1 % | 7 sidor, pos 9–10 | Se tabell nedan | +15–30 klick/mån |
| 7 | Förbättra **kaffeplanta** | `/vaxtdatabas/kaffeplanta` | 4 418 exp, pos 9,0/9,8 | +17 klick/mån |
| 8 | Åtgärda **hortensia** och **vattenmelon** | 2 sidor | 7 088 exp, pos 29–33, CTR 0,3 % | +20–40 klick/mån |
| 9 | Slå på bildoptimering igen | Hela sajten | `unoptimized: true` sedan flytten | Sidhastighet |
| 10 | Skapa innehåll för 9 identifierade luckor | Se lista | 2 149 exp, 0 klick | +10–25 klick/mån |

Potentialsiffrorna är **teoretiska tak**, räknade på att nå position 3 med
branschgenomsnittlig CTR (~10 %). Verkligt utfall blir lägre. Period­potentialen
är omräknad till månad genom att dela med 4,57.

---

## 1. Duplicerade värdnamn — det överlägset största problemet

Sajten är indexerad under **två värdnamn samtidigt**:

| Värd | Sidor | Klick | Exponeringar |
|---|---|---|---|
| `minodling.se` | 96 | 309 | 43 800 |
| `www.minodling.se` | 105 | 268 | 38 072 |

**80 av 120 unika sökvägar finns under båda** — det motsvarar 71 319 exponeringar
(87 %) och 492 klick (85 %).

Detta är kannibalisering i renodlad form. Samma sida konkurrerar med sig själv,
och Google fördelar länkvärde och rankningssignaler mellan två adresser i stället
för att samla dem på en.

Konkreta exempel ur datan:

| Sökväg | apex | www | Vad som händer |
|---|---|---|---|
| `/vaxtdatabas/oleander` | 7 606 exp, pos 9,0 | 1 015 exp, pos 8,1 | Båda rankar, www har bättre position men lägre volym |
| `/vaxtdatabas/lavendel` | 2 488 exp, pos 18,1 | 2 010 exp, pos 15,7 | Nära jämn split — värsta fallet |
| `/vaxtdatabas/vattenmelon` | 2 003 exp, pos 32,7 | 2 465 exp, pos 28,8 | Båda rankar dåligt, signalerna delade |
| `/vaxtdatabas/palmlilja` | 8 exp | 4 238 exp, pos 9,0 | Google har valt www här |

**Att canonical-taggen redan är korrekt räcker uppenbarligen inte.** Sidorna pekar
mot `https://minodling.se/...`, men båda värdnamnen svarar `200 OK` och Google
indexerar dem ändå som separata sidor.

**Åtgärd:** lägg en permanent 301-omdirigering från `www.minodling.se/*` till
`minodling.se/*`. Sajten ligger på Cloudflare, så det görs antingen som en
Redirect Rule i dashboarden eller i `next.config.ts` med en `redirects()`-regel
som matchar på `host`.

**Effekt:** går inte att beräkna exakt, men när två poster på position 8 och 9
slås ihop landar den samlade sidan rimligen högre än båda. Att det rör 87 % av
all synlighet gör detta till den mest lönsamma åtgärden i hela listan.

---

## 2. Striking distance — position 5–20 med volym

17 sökord ligger inom räckhåll. De tolv största:

| Sökord | Exponeringar | Position | Klick idag | Tak vid pos 3 |
|---|---|---|---|---|
| oleander | 4 249 | 10,1 | 3 | +422 (+92/mån) |
| palmlilja | 1 734 | 9,3 | 8 | +165 (+36/mån) |
| sidoskott | 1 141 | 6,1 | 5 | +109 (+24/mån) |
| kaffeplanta | 791 | 9,9 | 0 | +79 (+17/mån) |
| annuell | 525 | 7,8 | 0 | +52 (+11/mån) |
| drakträd | 482 | 7,4 | 8 | +40 (+9/mån) |
| palmlilja skötsel | 386 | 10,8 | 0 | +39 (+8/mån) |
| ampellilja | 346 | 14,9 | 0 | +35 (+8/mån) |
| petunia frost | 308 | 12,1 | 1 | +30 (+7/mån) |
| borstnejlika | 321 | 13,8 | 4 | +28 (+6/mån) |
| oleander i kruka | 273 | 7,9 | 0 | +27 (+6/mån) |
| tål petunia frost | 197 | 11,0 | 0 | +20 (+4/mån) |

**Mönstret:** de tyngsta möjligheterna är alla växtdatabassidor, och flera av dem
(`oleander`, `palmlilja`, `kaffeplanta`, `borstnejlika`) är samtidigt drabbade av
www-dubbletten. Åtgärd 1 och den här hänger ihop — fixa omdirigeringen först,
mät om, och bygg sedan ut innehållet.

**Åtgärd per sida:** `oleander` och `palmlilja` har flest exponeringar men magrast
utfall. Sökorden `oleander i kruka` och `palmlilja skötsel` visar vad folk faktiskt
undrar — krukodling respektive skötsel. Täck de vinklarna explicit på sidorna med
egna rubriker, i stället för generisk växtfakta.

---

## 3. Låg CTR trots bra position — finns knappt

**Analysen hittade noll sidor** på position ≤5 med minst 50 exponeringar. Det är
i sig ett resultat: sajten har ingenting i topp 5 att optimera titlar för.

Däremot finns ett CTR-problem strax under. Jämför två sidor på nästan samma position:

| Sida | Position | Exponeringar | Klick | CTR |
|---|---|---|---|---|
| `/vaxtdatabas/borstnejlika` (apex) | 7,5 | 1 696 | 49 | **2,89 %** |
| `/vaxtdatabas/oleander` (apex) | 9,0 | 7 606 | 50 | **0,66 %** |

Borstnejlika får lika många klick på en femtedel så många exponeringar.
Förväntad CTR runt position 8–9 är cirka 2,4–2,8 %. Oleander ligger på en fjärdedel
av det.

Sidor med samma mönster — hög volym, rimlig position, CTR under 1 %:

| Sida | Position | Exponeringar | CTR |
|---|---|---|---|
| `/vaxtdatabas/oleander` (apex) | 9,0 | 7 606 | 0,66 % |
| `/vaxtdatabas/palmlilja` (www) | 9,0 | 4 238 | 0,83 % |
| `/ordlista/sidoskott` (apex) | 6,2 | 1 281 | 0,62 % |
| `/vaxtdatabas/lavendel` (apex) | 18,1 | 2 488 | 0,44 % |
| `/vaxtdatabas/klematis` (apex) | 33,4 | 1 746 | 0,46 % |

**Viktig reservation:** jag kontrollerade oleandersidans faktiska metadata innan
jag rekommenderade något. Titeln är *"Odla oleander – Komplett guide för svensk
altan och balkong | Minodling"* och beskrivningen nämner redan plantering, skötsel,
beskärning och övervintring. Den är alltså **inte uppenbart dålig** — min första
hypotes höll inte.

Två mer sannolika förklaringar återstår:

1. **Dubbletten delar klicken.** Två varianter av samma sida visas i resultatet
   och konkurrerar. Det är samma problem som åtgärd 1.
2. **Titeln kapas.** 70 tecken inklusive `| Minodling` ligger över Googles
   visningsgräns på cirka 60. Det som syns i resultatet blir *"Odla oleander –
   Komplett guide för svensk altan och…"* — nyttoloftet försvinner.

**Åtgärd:** korta titlarna så de ryms under 60 tecken och lägg det som skiljer
sidan åt först. Mät sedan om **efter** att omdirigeringen är på plats — annars går
det inte att veta vilken av de två orsakerna som gav effekt.

---

## 4. Många exponeringar, nästan inga klick

30 sidor har minst 300 exponeringar och under 0,5 % CTR. De värsta:

| Sida | Exponeringar | Klick | CTR | Position |
|---|---|---|---|---|
| `/vaxtdatabas/hortensia` (www) | 2 620 | 12 | 0,46 % | 29,8 |
| `/vaxtdatabas/vattenmelon` (www) | 2 465 | 4 | 0,16 % | 28,8 |
| `/vaxtdatabas/vattenmelon` (apex) | 2 003 | 3 | 0,15 % | 32,7 |
| `/vaxtdatabas/klematis` (apex) | 1 746 | 8 | 0,46 % | 33,4 |
| `/vaxtdatabas/lavendel` (apex) | 2 488 | 11 | 0,44 % | 18,1 |

Här är **positionen** problemet, inte titeln. På position 29–33 syns man i praktiken
inte, och CTR under 0,5 % är då normalt snarare än avvikande. Åtgärden är innehåll
och auktoritet, inte metadata.

Värt att notera: `vattenmelon` finns dubblerat och båda varianterna rankar runt
position 30. Det är 4 468 exponeringar som ger sammanlagt 7 klick.

---

## 5. Innehållsluckor — hög volym, ingen rankning

9 sökord har över 200 exponeringar men position 20+ och **noll klick**:

| Sökord | Exponeringar | Position | Har sajten en sida? |
|---|---|---|---|
| monstera | 287 | 39,0 | Nej |
| hortensia | 266 | 51,2 | Ja, men rankar på 29,8 |
| odling | 261 | 64,5 | Nej (generiskt huvudord) |
| kaktus | 249 | 57,1 | Nej |
| regnvattenåtervinning | 232 | 71,3 | Nej |
| odla chili | 231 | 66,7 | Nej |
| kompost | 228 | 78,5 | Nej |
| odla vattenmelon | 208 | 30,2 | Ja, rankar på 28,8 |
| odla aubergine | 207 | 33,9 | Ja |

Två olika problem döljer sig här:

**Saknade sidor:** `monstera`, `kaktus`, `odla chili`, `kompost` och
`regnvattenåtervinning` har ingen dedikerad sida. De första fyra är stora,
etablerade ämnen med hård konkurrens — `regnvattenåtervinning` är betydligt
smalare och därmed lättare att ranka på.

**Befintliga sidor som inte räcker till:** `hortensia`, `odla vattenmelon` och
`odla aubergine` har sidor som rankar på position 28–34. Där hjälper ingen ny sida
— innehållet behöver fördjupas.

Sökordet `odling` på position 64,5 är inte realistiskt att jaga. Det är ett av
svenska sökmarknadens bredaste huvudord.

---

## 6. Varumärkt kontra generisk trafik

**Noll varumärkta sökningar.** Inte en enda av de 1 000 exporterade frågorna
innehåller "minodling" eller "min odling".

All trafik — 100 % — kommer från generiska, informationssökande frågor om enskilda
växter.

Det betyder två saker:

**Risken:** sajten har inget varumärkesskydd mot algoritmuppdateringar. Faller
rankningen på växtsidorna finns ingen direkttrafik som fångar upp.

**Möjligheten:** den trafik som finns är helt förtjänad, inte ärvd. Det är ett
sundare utgångsläge än det omvända för en sajt som fick sina första exponeringar
i slutet av april.

Att jaga varumärkessökningar nu vore fel prioritering. Det kommer av sig självt om
innehållet fungerar.

---

## Datatäckning och förbehåll

- **Frågedatan täcker bara 13 % av klicken** (77 av 576) och 48 % av
  exponeringarna. Exporten är kapad till 1 000 rader, och bara 45 sökord har
  minst ett klick. Slutsatser på sökordsnivå bygger alltså på en tunn skiva.
  Sidnivådatan täcker i princip all trafik (577 klick mot dagsrapportens 576 —
  en rads avrundningsdifferens) och är därför betydligt mer tillförlitlig.
- **Exporten saknar koppling mellan sökord och sida.** Äkta kannibalisering på
  sökordsnivå går inte att mäta härifrån; det kräver GSC:s API eller Looker
  Studio. Dubbletterna på värdnamnsnivå är däremot tydligt synliga och analyserade
  ovan.
- **CTR-benchmarks är ungefärliga** branschsiffror, inte uppmätta för den här
  nischen. De används för att peka ut avvikelser, inte som mål.
- **Potentialsiffrorna är tak, inte prognoser.** De förutsätter position 3, vilket
  få sidor når.
- Sajten är ung — första exponeringen 2026-04-30. Rankningar är fortfarande
  instabila och månadsjämförelser bör tolkas försiktigt.

---

## Kör analysen igen

```bash
python3 analyze_gsc.py --dir search-console --site https://minodling.se \
  --brand "minodling,min odling" --out seo-analys.md
```

Skriptet hanterar både svenska och engelska kolumn- och filnamn, procenttecken och
decimalkomma. Kräver `pandas`.
