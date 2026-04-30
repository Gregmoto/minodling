-- ──────────────────────────────────────────────
-- KUNSKAPSBANK
-- ──────────────────────────────────────────────

INSERT INTO knowledge_articles (title, slug, excerpt, content, category, published)
VALUES (
  'Jordförberedelse på våren',
  'jordforberedelse-pa-varen',
  'En välförberedd jord är grunden för en lyckad odlingssäsong. Lär dig hur du väcker odlingsbädden till liv på våren med rätt teknik och jordförbättringsmedel.',
  $content$<h2>Varför är jordförberedelse viktig?</h2>
<p>Jordens kvalitet är avgörande för dina växters välmående. En välstrukturerad jord med god näringshalt, bra dränering och levande biologi ger starka, motståndskraftiga plantor med riklig skörd. Våren är det viktigaste tillfället på året att investera i din jord.</p>

<h2>Vänta tills jorden är redo</h2>
<p>Det vanligaste misstaget på våren är att börja gräva för tidigt. Varm jord är fortfarande fuktig och kall – bearbetning förstör jordens struktur. Testet: ta en handfull jord och krama – öppnar den handen och smulas sönder är den redo. Fastnar den i en blöt klump – vänta ytterligare några veckor.</p>

<h2>Tillsats av organiskt material</h2>
<p>Det viktigaste du kan göra för din jord är att tillföra organiskt material varje år.</p>
<ul>
  <li><strong>Mogen kompost:</strong> Bästa valet. Blanda in 5–10 cm kompost i de övre 20 cm av odlingsbädden.</li>
  <li><strong>Stallgödsel:</strong> Vällagrad hästmöck eller kogödsel är utmärkt. Färsk gödsel bränner rötterna – använd aldrig färsk gödsel direkt på planteringsbäddar.</li>
  <li><strong>Bokashiblandning:</strong> Det fermenterade materialet blandas ner i jorden några veckor före plantering.</li>
</ul>

<h2>pH-justering</h2>
<p>De flesta grönsaker trivs i pH 6,0–7,0. Kontrollera jordens pH med ett enkelt testkit från trädgårdsbutiken. Sur jord (pH under 6) kalkas med trädgårdskalk eller dolomit. Alkalisk jord (pH över 7,5) sänks med svavel eller organiskt material.</p>

<h2>Grundgödsling</h2>
<p>Tillför ett balanserat organiskt gödselmedel som hornmjöl, benmjöl eller ett allroundgödsel vid vårförberedelsen. Detta ger en långsam och jämn näringsfrisättning under hela säsongen. Följ doseringen på förpackningen.</p>

<h2>Luckring och upphögda bäddar</h2>
<p>Grävfri odling vinner mark bland moderna odlare. Istället för djupgrävning tillsätts organiskt material ovanifrån och maskar och organismer arbetar ner det naturligt. Upphöjda odlingsbäddar ger bättre dränering, värms upp snabbare på våren och är bekvämare att arbeta i.</p>$content$,
  'Jord & kompost',
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  published = EXCLUDED.published;

INSERT INTO knowledge_articles (title, slug, excerpt, content, category, published)
VALUES (
  'Bevattning – hur mycket och hur ofta?',
  'bevattning-hur-mycket-och-hur-ofta',
  'Rätt vattning är en av de viktigaste – och svåraste – delarna av trädgårdsodling. För lite eller för mycket vatten är de vanligaste orsakerna till misslyckad odling. Lär dig principerna för smart bevattning.',
  $content$<h2>Grundprincipen: djupt och sällan</h2>
<p>Det vanligaste misstaget är att vattna lite och ofta. Det uppmuntrar rötterna att stanna nära ytan, vilket gör plantorna känsliga för torka. Vattna istället djupt och sällan – en eller två gånger i veckan under normalt väder, mer vid värmebölja. Målet är att fukta marken ner till 20–30 cm.</p>

<h2>Hur mycket behöver olika grödor?</h2>
<ul>
  <li><strong>Mycket vatten:</strong> Gurka, zucchini, sallad, spenat och jordgubbar. Kräver jämn fukt och minskar snabbt i kvalitet vid torka.</li>
  <li><strong>Medelbehov:</strong> Tomater, paprika, kål och morot. Vattna djupt men låt markytan torka ut något mellan vattningarna.</li>
  <li><strong>Torktåliga:</strong> Bönor, ärter, lök och de flesta örter. Klarar längre perioder utan vatten, särskilt när de är etablerade.</li>
</ul>

<h2>Bästa tidpunkten att vattna</h2>
<p>Vattna på morgonen – det ger plantorna vatten under den varmaste delen av dagen och bladen hinner torka till kvällen, vilket minskar risken för svamp- och mögelproblem. Undvik kvällsvattning om möjligt, och vattna aldrig mitt på den soligaste dagen.</p>

<h2>Metoder för bevattning</h2>
<ul>
  <li><strong>Droppbevattning:</strong> Det effektivaste systemet. Levererar vatten direkt vid roten, minimerar vattenavdunstning och håller bladen torra.</li>
  <li><strong>Rotzon-vattning:</strong> Rikta vattenstrålen mot jordbädden, inte bladen. Använd en vattenkanna med pip för precisionsarbete.</li>
  <li><strong>Sprinkler:</strong> Enkelt men ineffektivt – stor avdunstning och blöta blad. Fungerar på gräsmatta men undviks på köksland.</li>
</ul>

<h2>Mulching sparar vatten</h2>
<p>En 5–10 cm täckning av halm, gräsklipp eller träflis runt plantorna minskar vattenavdunstningen från markytan med upp till 70 %. Det är ett av de mest effektiva sätten att minska vattenbehovet och hålla marken jämt fuktig.</p>

<h2>Hur vet du om plantan behöver vatten?</h2>
<p>Känn på jorden – stick ner ett finger 5 cm. Är det fuktigt? Vänta. Torrt? Dags att vattna. Se också efter slaka blad tidigt på morgonen (inte mitt på dagen, när det är normalt) – det är ett tidigt tecken på vattenstress.</p>$content$,
  'Skötsel',
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  published = EXCLUDED.published;

INSERT INTO knowledge_articles (title, slug, excerpt, content, category, published)
VALUES (
  'Vanliga skadedjur och hur du bekämpar dem',
  'vanliga-skadedjur',
  'Skadedjur är en del av trädgårdslivet. Lär dig känna igen de vanligaste skadeinsekterna i den svenska trädgården och de mest effektiva metoderna för att hålla dem i schack – med fokus på ekologiska lösningar.',
  $content$<h2>Att leva med skadedjur</h2>
<p>Inga trädgårdar är helt fria från skadedjur, och det behöver de inte vara heller. Målet är inte utrotning utan balans – att hålla skadenivåerna under den gräns där de gör verklig skada. En biologiskt mångfaldig trädgård med många nyttoinsekter, fåglar och igelkottar reglerar sig i stor utsträckning själv.</p>

<h2>Bladlöss</h2>
<p><strong>Symtom:</strong> Klibbiga blad, ihopkrullade blad, försvagad tillväxt. Bladlöss sitter i kolonier på skottspetsar och bladundersidor.</p>
<p><strong>Bekämpning:</strong> Spola av med kraftig vattenstråle. Nyckelpigor, gulögon och parasitstekellarver är naturliga fiender – locka dem med blomrika växter. Vid kraftig angrepp: insektsåpa eller pyretrinbaserade medel.</p>

<h2>Sniglar och snäckor</h2>
<p><strong>Symtom:</strong> Runda hål i blad, avtuggade plantor vid marknivå. Aktiva nattetid och i fuktigt väder.</p>
<p><strong>Bekämpning:</strong> Snigelmedel baserat på järnfosfat (godkänt i ekologisk odling). Kaffesump, äggskalsring eller kopparbånd runt sårbara plantor. Igelkottar och fåglar äter sniglar – skapa boplatser för dem.</p>

<h2>Vita flugor</h2>
<p><strong>Symtom:</strong> Vita, fluglika insekter som flyger upp vid beröring. Angriper ofta tomater, gurka och kål i växthus.</p>
<p><strong>Bekämpning:</strong> Gula klisterskivor fångar adulter. Nyttoinsekten <em>Encarsia formosa</em> (parasitstekel) är mycket effektiv i växthus. Insektsåpa fungerar mot larver.</p>

<h2>Kålfjärilens larver</h2>
<p><strong>Symtom:</strong> Stora hål i kålblad. Gröna larver som camouflerar sig väl.</p>
<p><strong>Bekämpning:</strong> Täck kålplantor med fiberduk för att hindra fjärilarna att lägga ägg. Plocka larver för hand. Biologisk bekämpning med <em>Bacillus thuringiensis</em> (Bt) är effektivt och säkert.</p>

<h2>Trips</h2>
<p><strong>Symtom:</strong> Silverfärgade strimmor och prickar på blad och blomblad. Små, smala insekter (1–2 mm).</p>
<p><strong>Bekämpning:</strong> Blå klisterskivor. Nyttorovkvalster (<em>Amblyseius cucumeris</em>) effektivt i växthus.</p>

<h2>Förebyggande åtgärder</h2>
<ul>
  <li>Växelbruk – odla aldrig samma familj på samma plats flera år i rad.</li>
  <li>Kompanjonplantering – ringblommor, dill och basilika lockar nyttoinsekter och kan avskräcka skadedjur.</li>
  <li>God luftcirkulation – täta planteringar ökar risken för angrepp.</li>
  <li>Inspektion varje vecka – tidigt upptäckt är nyckeln till enkel bekämpning.</li>
</ul>$content$,
  'Skadedjur & sjukdomar',
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  published = EXCLUDED.published;

INSERT INTO knowledge_articles (title, slug, excerpt, content, category, published)
VALUES (
  'Naturlig gödning utan konstgödsel',
  'naturlig-godning',
  'Konstgödsel ger snabba resultat men på bekostnad av jordens långsiktiga hälsa. Med naturlig gödning bygger du upp jordens biologi och ger plantorna en balanserad och uthållig näring.',
  $content$<h2>Varför välja naturlig gödning?</h2>
<p>Kemisk konstgödsel löser sig snabbt och ger omedelbara resultat, men den förbättrar inte jordens struktur och kan försalta och försura jordbäddar över tid. Naturliga gödselmedel frigör näring långsamt och kontinuerligt, stimulerar jordlivet och förbättrar jordens fysikaliska egenskaper. Det är en investering i framtida bördig jord.</p>

<h2>Kompost – den allra bästa basgödslingen</h2>
<p>Välmogen kompost är inte ett gödselmedel i strikt mening men är det bästa du kan ge din jord. Den levererar en balanserad dos av makro- och mikronäringsämnen, förbättrar jordens vattenhållande förmåga och skapar en idealisk miljö för nyttiga mikroorganismer. Arbeta in 5–10 cm kompost i odlingsbädden varje höst eller vår.</p>

<h2>Organiska gödselmedel</h2>
<ul>
  <li><strong>Hornmjöl:</strong> Högt kväveinnehåll, långsam frisättning. Perfekt som basgödsling på våren. Blandas ner i jordbädden.</li>
  <li><strong>Benmjöl:</strong> Fosforrik, gynnar blomning och fruktsättning. Används sparsamt som tillägsgödsling.</li>
  <li><strong>Algomin (algstensmjöl):</strong> Rik på mineraler och spårämnen. Kalkande effekt, höjer pH.</li>
  <li><strong>Nässelgödning:</strong> Hemlagad – fyll en hink med nässlor och vatten. Låt jäsa 2–3 veckor. Späd 1:10 och vattna runt plantorna. Kväverik och snabbverkande.</li>
  <li><strong>Komfrejextrakt:</strong> Lika enkelt som nässelgödning men med högt kaliuminnehåll – bra för frukt- och bärproduktion.</li>
  <li><strong>Maskkompostextrakt (maskjord):</strong> Extremt näringsdicht. Späd 1:5 som flytgödsel eller blanda i jordblandningar.</li>
</ul>

<h2>Grön gödsling</h2>
<p>Gröngödsling innebär att du sår en grödmix – till exempel vitklöver, lupin eller rybs – som du sedan myllnar ner i marken. Baljväxterna binder kväve från luften och alla grödor tillför organiskt material när de bryts ner. Perfekt på tomytor under höst och vinter.</p>

<h2>Fågelgödsel och stallgödsel</h2>
<p>Höns- och hästgödsel är mycket näringrika men ska alltid vara vällagrade (minst 6 månader) innan användning. Färsk gödsel bränner rötterna och kan sprida ogräsfrön. Pelleterad hönsgödsel är luktfri och enkel att dosera.</p>

<h2>Timing och dosering</h2>
<p>Gödsla aldrig mer än vad plantorna kan ta upp – överskott rinner ut i grundvatten och sjöar. Grundregel: gödsla lätt och ofta är bättre än tungt och sällan. Undvik gödsling sent på hösten – näringen tas inte upp av vilande växter och riskerar att urlakas.</p>$content$,
  'Gödning',
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  published = EXCLUDED.published;

INSERT INTO knowledge_articles (title, slug, excerpt, content, category, published)
VALUES (
  'Skörda och förvara dina grönsaker',
  'skorda-och-forvara',
  'Rätt skördetidpunkt och korrekt förvaring avgör om dina grönsaker smakar fantastiskt eller hamnar i komposten. Lär dig tricks för att maximera hållbarhet och smak på din skörd.',
  $content$<h2>Skörda vid rätt tidpunkt</h2>
<p>Det viktigaste för god smak och hållbarhet är att skörda vid rätt mognadsstadium. För tidigt skördade grönsaker hinner inte utveckla full smak. För sent skördade grönsaker kan bli hårda, bittra eller mjöliga. Lär dig de visuella och texturella tecknen på rätt mognad för varje gröda.</p>

<h2>Tips per grönsaksgrupp</h2>
<ul>
  <li><strong>Tomater:</strong> Skörda när helt röda (eller gula/orangea beroende på sort) och ger lätt efter vid ett varsamt grepp. Mognar vidare i rumstemperatur om de plockas lätt omogna.</li>
  <li><strong>Gurka och zucchini:</strong> Skörda tidigt och ofta. Zucchini smakar bäst vid 15–20 cm; låt den inte bli marrow. Gurka vid 20–25 cm (salladsgurka) eller 10–12 cm (frilandsgurka).</li>
  <li><strong>Bönor och ärter:</strong> Skörda när baljorna är fyllda men fortfarande mjuka. Skörda ofta – varje dag vid högsäsong – för att stimulera fortsatt produktion.</li>
  <li><strong>Sallad och spenat:</strong> Skörda ytterbladen kontinuerligt ('cut and come again') eller hela huvud vid full storlek. Sallad går snabbt i frö vid värme.</li>
  <li><strong>Rotsaker (morot, rödbetor):</strong> Dra upp en provskott för att kontrollera storlek. Morot smakar bäst vid 1–2 cm diameter.</li>
</ul>

<h2>Förvaring i kylskåp</h2>
<p>De flesta grönsaker mår bäst i kylskåpets grönsakslåda vid 1–5°C. Undantag:</p>
<ul>
  <li>Tomater – kyl förstör smaken. Förvara i rumstemperatur.</li>
  <li>Gurka – trivs bäst vid 10–12°C (ofta för kallt i kylskåp). Insvept i papper håller de bättre.</li>
  <li>Basilika – frostigt känslig. Håll i ett glas vatten i rumstemperatur.</li>
  <li>Lök och vitlök – mörkt, torrt och svalt, inte i kylskåp.</li>
</ul>

<h2>Förvaring utan kylning</h2>
<p>Rotsaker som morötter, rödbetor och persiljerot kan förvaras i sand i en sval källare och håller hela vintern. Potatis och lök lagras bäst mörkt och svalt vid 5–8°C med god luftcirkulation.</p>

<h2>Konservering och frysning</h2>
<p>Överskott hanteras bäst genom:</p>
<ul>
  <li><strong>Frysning:</strong> Bönor, ärter, spenat och örter blancheras (30 sek i kokvatten) och fryses i portioner. Tomater och paprika kan frysas råa direkt.</li>
  <li><strong>Syltning och inläggning:</strong> Gurka, rödbetor och lök lämpar sig utmärkt.</li>
  <li><strong>Torkning:</strong> Chili, kryddörter (oregano, timjan) och bönor torkas lätt och håller länge.</li>
</ul>$content$,
  'Skörd',
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  published = EXCLUDED.published;

