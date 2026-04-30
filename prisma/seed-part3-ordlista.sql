-- ──────────────────────────────────────────────
-- ORDLISTA
-- ──────────────────────────────────────────────

INSERT INTO glossary_terms (term, slug, short_description, full_description, category, related_slugs, published)
VALUES (
  'Kompost',
  'kompost',
  'Nedbrutet organiskt material som används som jordförbättringsmedel.',
  $content$<p>Kompost är det resultat som uppstår när organiskt material – köks- och trädgårdsavfall – bryts ner av mikroorganismer, maskar och svampar. Slutprodukten är ett mörkt, jordlikt material med lukt av skog som är rikt på näring och nyttiga mikrober.</p><p>Färdig kompost förbättrar jordens struktur, ökar vattenhållande förmåga och tillför en bred palett av näring på ett sätt som kemisk gödning inte kan matcha. Den kallas ofta för "svart guld" bland odlare.</p>$content$,
  'Jord',
  '{}'::text[],
  true
)
ON CONFLICT (slug) DO UPDATE SET
  term = EXCLUDED.term,
  short_description = EXCLUDED.short_description,
  full_description = EXCLUDED.full_description,
  category = EXCLUDED.category,
  published = EXCLUDED.published;

INSERT INTO glossary_terms (term, slug, short_description, full_description, category, related_slugs, published)
VALUES (
  'Omskolning',
  'omskolning',
  'Att flytta en planta från en liten till en större kruka för att ge rötterna mer utrymme.',
  $content$<p>Omskolning innebär att man lyfter upp en växt ur sin nuvarande kruka och planterar om den i en större behållare med ny jord. Det görs när plantan har blivit rotbunden – det vill säga när rötterna har fyllt hela krukan och börjar växa ut genom dräneringshålen.</p><p>Omskolning bör ske med försiktighet för att undvika rotskador. Vattna plantan väl dagen innan och välj en kruka som är 3–5 cm större i diameter än den befintliga.</p>$content$,
  'Odlingsteknik',
  '{}'::text[],
  true
)
ON CONFLICT (slug) DO UPDATE SET
  term = EXCLUDED.term,
  short_description = EXCLUDED.short_description,
  full_description = EXCLUDED.full_description,
  category = EXCLUDED.category,
  published = EXCLUDED.published;

INSERT INTO glossary_terms (term, slug, short_description, full_description, category, related_slugs, published)
VALUES (
  'Täckodling',
  'tackodling',
  'Att täcka markytan med organiskt material för att bevara fukt och hindra ogräs.',
  $content$<p>Täckodling (mulching) innebär att man lägger ett skyddande lager av organiskt material – halm, gräsklipp, träflis, löv eller kompost – på markytan runt plantorna. Lagret bör vara 5–10 cm tjockt.</p><p>Täckodling fyller flera funktioner: det minskar vattenavdunstning med upp till 70 %, håller nere ogräs, skyddar rötterna mot temperatursvängningar och tillför näring allteftersom materialet bryts ner. Det är ett av de mest effektiva och enkla verktygen för en bättre odling.</p>$content$,
  'Odlingsteknik',
  '{}'::text[],
  true
)
ON CONFLICT (slug) DO UPDATE SET
  term = EXCLUDED.term,
  short_description = EXCLUDED.short_description,
  full_description = EXCLUDED.full_description,
  category = EXCLUDED.category,
  published = EXCLUDED.published;

INSERT INTO glossary_terms (term, slug, short_description, full_description, category, related_slugs, published)
VALUES (
  'Drivbänk',
  'drivbank',
  'En låg, täckt bädd för att ge plantor ett varmare mikroklimat och förlänga odlingssäsongen.',
  $content$<p>En drivbänk är en liten, kallhus-liknande konstruktion av trä eller plast med glasad eller plastbelagd överdel. Den placeras utomhus och skapar ett varmare mikroklimat inuti, vilket möjliggör tidig sådd och utplantering – ofta 4–6 veckor tidigare än normalt.</p><p>Drivbänkar kan vara kalla (enbart solenergi), halvvarma (med färsk gödsel som värmekälla underifrån) eller varma (med elektrisk värmekabel). De är ett kostnadseffektivt alternativ till ett fullständigt växthus.</p>$content$,
  'Utrustning',
  '{}'::text[],
  true
)
ON CONFLICT (slug) DO UPDATE SET
  term = EXCLUDED.term,
  short_description = EXCLUDED.short_description,
  full_description = EXCLUDED.full_description,
  category = EXCLUDED.category,
  published = EXCLUDED.published;

INSERT INTO glossary_terms (term, slug, short_description, full_description, category, related_slugs, published)
VALUES (
  'pH-värde',
  'ph-varde',
  'Mått på jordens surhet eller alkalinitet, avgörande för plantornas förmåga att ta upp näring.',
  $content$<p>pH är en skala från 0–14 som mäter hur sur eller basisk en lösning är. pH 7 är neutralt, under 7 är surt och över 7 är basiskt (alkaliskt). De flesta odlingsväxter trivs i pH 6–7.</p><p>pH påverkar direkt tillgängligheten av näring i marken. Fel pH kan göra att näring finns i jorden men är otillgänglig för plantornas rötter. Sur jord kalkas med trädgårdskalk, alkalisk jord kan sänkas med svavel eller organiskt material. Testa regelbundet med pH-mätare eller testremsor.</p>$content$,
  'Jord',
  '{}'::text[],
  true
)
ON CONFLICT (slug) DO UPDATE SET
  term = EXCLUDED.term,
  short_description = EXCLUDED.short_description,
  full_description = EXCLUDED.full_description,
  category = EXCLUDED.category,
  published = EXCLUDED.published;

INSERT INTO glossary_terms (term, slug, short_description, full_description, category, related_slugs, published)
VALUES (
  'Perenn',
  'perenn',
  'Flerårig växt som återkommer år efter år utan ombrandning.',
  $content$<p>Perenner är fleråriga växter som lever i mer än två år. De vissnar ner under vintern men återkommer från rötter, rhizom eller knölar varje vår. Exempel är päon, dagliljor, rudbeckia och de flesta örter som mynta och timjan.</p><p>Perenner kräver ofta lägre skötsel än ettåriga växter (annueller) sedan de etablerat sig. De bygger successivt upp ett större rotsystem och blommar ofta allt rikligare med åren. Nackdelen är att de tar längre tid att etablera sig och inte alltid blommar det första året.</p>$content$,
  'Botanik',
  '{}'::text[],
  true
)
ON CONFLICT (slug) DO UPDATE SET
  term = EXCLUDED.term,
  short_description = EXCLUDED.short_description,
  full_description = EXCLUDED.full_description,
  category = EXCLUDED.category,
  published = EXCLUDED.published;

INSERT INTO glossary_terms (term, slug, short_description, full_description, category, related_slugs, published)
VALUES (
  'Annuell',
  'annuell',
  'Ettårig växt som gror, blommar, sätter frö och dör inom ett år.',
  $content$<p>Annueller är växter som genomgår hela sin livscykel – groning, tillväxt, blomning, fröbildning och döden – under ett enda år. De måste sås om varje säsong. Exempel på annueller i trädgården är tomater, gurka, basilika, ringblommor och tagetes.</p><p>Annueller blommar generellt sätt längre och mer kontinuerligt än perenner, och ger ofta rikliga skördar under säsongen. De passar utmärkt i köksland och sommarrabatter och möjliggör att man varierar planering och sorter varje år.</p>$content$,
  'Botanik',
  '{}'::text[],
  true
)
ON CONFLICT (slug) DO UPDATE SET
  term = EXCLUDED.term,
  short_description = EXCLUDED.short_description,
  full_description = EXCLUDED.full_description,
  category = EXCLUDED.category,
  published = EXCLUDED.published;

INSERT INTO glossary_terms (term, slug, short_description, full_description, category, related_slugs, published)
VALUES (
  'Biennal',
  'biennal',
  'Tvåårig växt som gror och bildar blad det första året, blommar och dör det andra.',
  $content$<p>Biennaler, eller tvååriga växter, lever i exakt två år. Det första året gror de, bildar blad och lagrar näring. Över vintern vilar de, och det andra året blommar de, sätter frö och dör. Exempel är morot, palsternacka, digitalis och vippkrassing.</p><p>Praktiskt innebär biennial odling att man sår nytt varje år för att ha en kontinuerlig produktion. Morötter och palsternacka skördas vanligtvis i slutet av det första året, before de blommar.</p>$content$,
  'Botanik',
  '{}'::text[],
  true
)
ON CONFLICT (slug) DO UPDATE SET
  term = EXCLUDED.term,
  short_description = EXCLUDED.short_description,
  full_description = EXCLUDED.full_description,
  category = EXCLUDED.category,
  published = EXCLUDED.published;

INSERT INTO glossary_terms (term, slug, short_description, full_description, category, related_slugs, published)
VALUES (
  'Frösådd',
  'frosadd',
  'Processen att så frön i jord för att odla upp plantor.',
  $content$<p>Frösådd är grundläggande för de flesta trädgårdsodlare. Frön kan sås direkt på friland (direktsådd) eller inomhus i krukor och brickor för att sedan planteras ut (förkultivering). Förkultivering inomhus används för värmekrävande eller långsamväxande växter som tomater och paprika.</p><p>Viktiga faktorer för lyckad frösådd: rätt sådjup (tumregel: dubbla fröets storlek), tillräcklig fukt utan att vara blöt, och rätt temperatur (de flesta frön gror bäst vid 18–22°C). Groningstidens varierar från 3 dagar (rädisa) till flera veckor (persillerot).</p>$content$,
  'Odlingsteknik',
  '{}'::text[],
  true
)
ON CONFLICT (slug) DO UPDATE SET
  term = EXCLUDED.term,
  short_description = EXCLUDED.short_description,
  full_description = EXCLUDED.full_description,
  category = EXCLUDED.category,
  published = EXCLUDED.published;

INSERT INTO glossary_terms (term, slug, short_description, full_description, category, related_slugs, published)
VALUES (
  'Plantering',
  'plantering',
  'Att placera en planta, lök eller stickling i jord för tillväxt.',
  $content$<p>Plantering innebär att en planta – antingen förkultivierad från frö eller köpt i kruka – placeras permanent i sin odlingsplats. Rätt planteringsteknik är avgörande för en bra start: plantera på rätt djup (som plantan stod i sin ursprungskruka, eller djupare för tomater), vattna väl och mulcha om möjligt.</p><p>Planteringstidpunkten är kritisk – plantera inte frostkänsliga växter förrän frostrisken är borta, och undvik plantering under extrem värme. Svalt och mulet väder är idealt för planteringsarbete.</p>$content$,
  'Odlingsteknik',
  '{}'::text[],
  true
)
ON CONFLICT (slug) DO UPDATE SET
  term = EXCLUDED.term,
  short_description = EXCLUDED.short_description,
  full_description = EXCLUDED.full_description,
  category = EXCLUDED.category,
  published = EXCLUDED.published;

INSERT INTO glossary_terms (term, slug, short_description, full_description, category, related_slugs, published)
VALUES (
  'Gödning',
  'godning',
  'Tillförsel av näring till växter för att stödja tillväxt och produktion.',
  $content$<p>Gödning innebär att man tillför näring till växter och jord. De tre viktigaste makronäringsämnena är kväve (N), fosfor (P) och kalium (K). Kväve främjar bladtillväxt, fosfor stödjer rot- och blombildning, och kalium stärker fruktproduktion och motståndskraft.</p><p>Gödsel kan vara organisk (kompost, hornmjöl, stallgödsel) eller kemisk/mineralisk. Organisk gödning frigör näring långsamt och förbättrar jordens biologi. Kemisk gödning verkar snabbt men förbättrar inte jordens struktur. Överkonsumtion av gödning kan skada plantorna och förorena vatten.</p>$content$,
  'Näring',
  '{}'::text[],
  true
)
ON CONFLICT (slug) DO UPDATE SET
  term = EXCLUDED.term,
  short_description = EXCLUDED.short_description,
  full_description = EXCLUDED.full_description,
  category = EXCLUDED.category,
  published = EXCLUDED.published;

INSERT INTO glossary_terms (term, slug, short_description, full_description, category, related_slugs, published)
VALUES (
  'Mulch',
  'mulch',
  'Täckmaterial som läggs på markytan för att bevara fukt och förhindra ogräs.',
  $content$<p>Mulch är ett samlingsnamn för material som läggs som ett skyddande lager på markytan runt växter. Organisk mulch (halm, träflis, löv, gräsklipp) bryts ner successivt och förbättrar jordens biologi. Oorganisk mulch (grus, stenull) bryts inte ner men hindrar effektivt ogräs.</p><p>Effekterna av mulching: minskar vattenavdunstning med upp till 70 %, håller nere ogräs, reglerar marktemperaturen, skyddar rötterna och tillför näring (organisk mulch). Lägg 5–10 cm mulch runt plantorna men håll det ett par centimeter från stammar och stammar för att förhindra röta.</p>$content$,
  'Odlingsteknik',
  '{}'::text[],
  true
)
ON CONFLICT (slug) DO UPDATE SET
  term = EXCLUDED.term,
  short_description = EXCLUDED.short_description,
  full_description = EXCLUDED.full_description,
  category = EXCLUDED.category,
  published = EXCLUDED.published;

INSERT INTO glossary_terms (term, slug, short_description, full_description, category, related_slugs, published)
VALUES (
  'Mykorrhiza',
  'mykorrhiza',
  'Symbiotiska svampar som lever i samklang med växtrötter och förbättrar näring- och vattenupptag.',
  $content$<p>Mykorrhiza är en symbios mellan svampar och växtrötter. Svampens mycel (ett nätverk av tunna trådar) utvidgar rotens absorbtionytan enormt – upp till 700 gånger – och hjälper plantan att ta upp vatten och mineraler, särskilt fosfor. I gengäld får svampen socker från plantan.</p><p>De flesta trädgårdsväxter bildar naturliga mykorrhiza-associationer i levande jord. Kemisk gödsling och jordbearbetning kan skada svampnätverket. Produkter med mykorrhizasporer kan tillsättas vid plantering för att ge plantorna en extra boost, särskilt i ny eller bearbetad jord.</p>$content$,
  'Biologi',
  '{}'::text[],
  true
)
ON CONFLICT (slug) DO UPDATE SET
  term = EXCLUDED.term,
  short_description = EXCLUDED.short_description,
  full_description = EXCLUDED.full_description,
  category = EXCLUDED.category,
  published = EXCLUDED.published;

INSERT INTO glossary_terms (term, slug, short_description, full_description, category, related_slugs, published)
VALUES (
  'Pollination',
  'pollination',
  'Överföringen av pollen från ståndare till pistill som leder till fruktbildning.',
  $content$<p>Pollination är processen där pollen förs från en blommas ståndare (handelar) till pistillens märke (hondelar), vilket leder till befruktning och fruktutveckling. Utan pollination bildas inga frukter eller frön.</p><p>I naturen sker pollination via vind, bin, humlor, fjärilar och andra insekter. I ett växthus kan manuell pollination behövas – använd en mjuk pensel eller knacka lätt på blomstjälkarna för att frigöra pollen. Att plantera nektarrika blommor nära köksland lockar pollinerare och ökar skörden markant.</p>$content$,
  'Botanik',
  '{}'::text[],
  true
)
ON CONFLICT (slug) DO UPDATE SET
  term = EXCLUDED.term,
  short_description = EXCLUDED.short_description,
  full_description = EXCLUDED.full_description,
  category = EXCLUDED.category,
  published = EXCLUDED.published;

INSERT INTO glossary_terms (term, slug, short_description, full_description, category, related_slugs, published)
VALUES (
  'Växelbruk',
  'vaxelbruk',
  'Att rotera vilka grönsaker som odlas på samma plats år för år för att undvika sjukdomar.',
  $content$<p>Växelbruk innebär att man systematiskt roterar var man odlar olika grödofamiljer för att bryta cykler av sjukdomar, skadedjur och näringsobalans. Grundregeln är att vänta minst 3–4 år innan samma grödofamilj återkommer på samma plats.</p><p>De viktigaste grödofamiljerna: korsblommiga (kål, broccoli), nattskuggeväxter (tomat, potatis, paprika), korgblommiga (sallad), gurkväxter (gurka, zucchini) och baljväxter (bönor, ärter). Baljväxter bör helst föregå kvävefordrande grödor då de berikar jorden med kväve.</p>$content$,
  'Odlingsteknik',
  '{}'::text[],
  true
)
ON CONFLICT (slug) DO UPDATE SET
  term = EXCLUDED.term,
  short_description = EXCLUDED.short_description,
  full_description = EXCLUDED.full_description,
  category = EXCLUDED.category,
  published = EXCLUDED.published;

INSERT INTO glossary_terms (term, slug, short_description, full_description, category, related_slugs, published)
VALUES (
  'Sydvätterväxt',
  'sydvattervaxt',
  'Växt som kräver mycket solljus och värme för att trivas och producera.',
  $content$<p>Sydvätterväxter (eller värmekrävande växter) är grödor som ursprungligen kommer från varmare klimat och som behöver hög temperatur och mycket sol för att växa bra och ge skörd. I Sverige innefattar detta tomater, paprika, aubergine, gurka och melon.</p><p>Dessa växter odlas bäst i växthus eller på en skyddad, södervänd plats. De kan inte planteras ut förrän all frostfara är borta och marken är ordentligt uppvärmd. I Sverige innebär det vanligtvis slutet av maj i söder och mitten av juni i Mellansverige.</p>$content$,
  'Botanik',
  '{}'::text[],
  true
)
ON CONFLICT (slug) DO UPDATE SET
  term = EXCLUDED.term,
  short_description = EXCLUDED.short_description,
  full_description = EXCLUDED.full_description,
  category = EXCLUDED.category,
  published = EXCLUDED.published;

INSERT INTO glossary_terms (term, slug, short_description, full_description, category, related_slugs, published)
VALUES (
  'Sidoskott',
  'sidoskott',
  'Skott som växer ut i vinkeln mellan huvudstam och blad, vanligtvis borttages på tomater.',
  $content$<p>Sidoskott (även kallade geiztriebe på tomater) är nya skott som växer fram i bladaxeln – vinkeln mellan huvudstammen och ett blad. På indeterminata tomater bör de regelbundet knipsas bort för att styra plantans energi mot fruktproduktion snarare än vegetativ tillväxt.</p><p>Ta bort sidoskotten när de är 2–5 cm långa – bryt dem av med fingrarna tidigt på morgonen så snittytan hinner torka under dagen. För determinata (buskiga) tomater är sidoskottsknipsning vanligtvis inte nödvändig. Andra växter, som chili och aubergine, behöver normalt inte sidoskottsknipsas.</p>$content$,
  'Odlingsteknik',
  '{}'::text[],
  true
)
ON CONFLICT (slug) DO UPDATE SET
  term = EXCLUDED.term,
  short_description = EXCLUDED.short_description,
  full_description = EXCLUDED.full_description,
  category = EXCLUDED.category,
  published = EXCLUDED.published;

INSERT INTO glossary_terms (term, slug, short_description, full_description, category, related_slugs, published)
VALUES (
  'Skördetid',
  'skordetid',
  'Den period då en gröda är redo att skördas och smakar som bäst.',
  $content$<p>Skördetid varierar beroende på gröda, sort och klimat. Att skörda vid rätt tidpunkt är avgörande för smak, näringsvärde och hållbarhet. De flesta grönsaker smakar bäst i rätt mognadsstadium – varken för tidigt eller för sent.</p><p>Generella tecken på skördemognad: rätt storlek och färg (tomater), fasthet (äpplen och rotsaker), lätthet att lösgöra (zucchini och gurka som lossnar lätt), och smak- och doftutveckling. Tidig och kontinuerlig skörd stimulerar ofta ny produktion och förlänger skördeperioden.</p>$content$,
  'Skörd',
  '{}'::text[],
  true
)
ON CONFLICT (slug) DO UPDATE SET
  term = EXCLUDED.term,
  short_description = EXCLUDED.short_description,
  full_description = EXCLUDED.full_description,
  category = EXCLUDED.category,
  published = EXCLUDED.published;

INSERT INTO glossary_terms (term, slug, short_description, full_description, category, related_slugs, published)
VALUES (
  'Maskkompost',
  'maskkompost',
  'Kompostering med hjälp av rödmask som äter organiskt material och producerar näringsrik jord.',
  $content$<p>Maskkompost (vermiculture) är en metod för att kompostera köksavfall med hjälp av rödmask (Eisenia fetida eller Lumbricus rubellus). Maskarna äter organiskt material och producerar maskjord (vermikompost) – ett extremt näringsdicht gödselmedel – samt maskurin (worm tea) som kan späds och användas som flytgödsel.</p><p>Maskkompostering passar utmärkt i lägenhet: en låda placeras under diskbänken eller i ett varmt förråd. Systemet är luktfritt om det sköts rätt och tar allt vegetabiliskt köksavfall. Undvik kött, fisk, citrusskal och lök. Maskjord är 5–10 gånger mer näringsrik än vanlig kompost.</p>$content$,
  'Kompostering',
  '{}'::text[],
  true
)
ON CONFLICT (slug) DO UPDATE SET
  term = EXCLUDED.term,
  short_description = EXCLUDED.short_description,
  full_description = EXCLUDED.full_description,
  category = EXCLUDED.category,
  published = EXCLUDED.published;

INSERT INTO glossary_terms (term, slug, short_description, full_description, category, related_slugs, published)
VALUES (
  'Hydroponisk odling',
  'hydroponisk-odling',
  'Odling utan jord där plantornas rötter är i näringslösning eller inert substrat.',
  $content$<p>Hydroponik är odling utan traditionell jord. Istället växer plantorna med rötterna i en näringslösning (vattenlösning med upplösta mineraler) eller i ett inert substrat som lecakulor, stenull eller kokosmull som bevattnas med näringslösning.</p><p>Fördelar med hydroponik: snabbare tillväxt (upp till 50 % snabbare), effektivare vattenanvändning, möjlighet att odla inomhus hela året och kontroll över exakt näringsnivå. Nackdelar: kräver teknisk utrustning och konstant övervakning, och saknar den biologiska rikedomen i levande jord. Populärt för sallad, spenat och örter i inomhusmiljöer.</p>$content$,
  'Odlingsteknik',
  '{}'::text[],
  true
)
ON CONFLICT (slug) DO UPDATE SET
  term = EXCLUDED.term,
  short_description = EXCLUDED.short_description,
  full_description = EXCLUDED.full_description,
  category = EXCLUDED.category,
  published = EXCLUDED.published;
