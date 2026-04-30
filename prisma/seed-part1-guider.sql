-- Run in Supabase SQL Editor: https://supabase.com → SQL Editor

-- ──────────────────────────────────────────────
-- GUIDER
-- ──────────────────────────────────────────────

INSERT INTO guides (title, slug, excerpt, content, category, difficulty_level, published)
VALUES (
  'Odla tomater – komplett guide',
  'odla-tomater',
  'Tomaten är den mest populära grönsaken att odla hemma i Sverige. Med rätt förberedelser, sort och skötsel kan du skörda kilo efter kilo av smakrika tomater – oavsett om du odlar i trädgård, växthus eller på balkongen.',
  $content$<h2>Introduktion</h2>
<p>Tomaten (<em>Solanum lycopersicum</em>) är en värmekrävande grönsak som ursprungligen kommer från Sydamerika. I Sverige odlas tomater bäst i växthus eller tunnel, men klarar sig fint utomhus under varma somrar, gärna vid ett soligt sydvänd husvägg. Med rätt sort och lite omsorg kan du skörda generöst från midsommar fram till hösten.</p>

<h2>Välj rätt sort</h2>
<p>Sortval är avgörande för ett lyckat tomatodlande i Sveriges klimat. Välj sorter med kort mogningstid (under 70 dagar) om du odlar utomhus.</p>
<ul>
  <li><strong>Cocktailtomat 'Sungold'</strong> – Söt, orangegul och mycket produktiv. En av de populäraste sorterna i Sverige.</li>
  <li><strong>Körsbärstomat 'Sweet Million'</strong> – Robust och sjukdomsresistent, ger massor av liten smakrika tomater.</li>
  <li><strong>'Matina'</strong> – Klassisk röd tomat med utmärkt smak och tidig mognad, passar utomhusodling.</li>
  <li><strong>Beefsteak 'Brandywine'</strong> – Stor och smakrik arvssort, men kräver växthus i Sverige.</li>
  <li><strong>'Tigerella'</strong> – Randig tomat med fantastisk smak, halvtidig och relativt härdigt.</li>
</ul>

<h2>Frösådd – starta rätt</h2>
<p>Tomater behöver lång växttid och ska sås inomhus i Sverige. Räkna 6–8 veckor från sådd till utplantering.</p>
<ul>
  <li><strong>Såddtid:</strong> Februari–mars för växthus, mars–april för utomhusodling.</li>
  <li>Fyll småkrukor eller pluggbrickor med frösåddsjord.</li>
  <li>Lägg 1–2 frön per cell, ca 0,5 cm djupt, och täck med ett tunt lager jord.</li>
  <li>Håll temperaturen på 22–25°C för god groning – gärna med värmematta under brickan.</li>
  <li>Groning sker normalt inom 5–10 dagar.</li>
  <li>När plantorna har 2 riktiga blad, omskolning till 9 cm krukor med planteringsjord.</li>
</ul>

<h2>Plantering utomhus</h2>
<p>Tomater är frostkänsliga och ska inte planteras ut förrän natten temperaturer konstant håller sig över 10°C – i södra Sverige vanligen från slutet av maj, i Mellansverige från mitten av juni.</p>
<ul>
  <li>Välj en solig, vindskyddad plats.</li>
  <li>Förbered jorden med riklig kompost och gärna en handfull hornmjöl.</li>
  <li>Plantera djupt – ner till de understa bladen – så bildar stammen extrarötter.</li>
  <li>Sätt upp rejäla stöd eller tillväxtbur direkt vid plantering.</li>
  <li>Vattna ordentligt efter plantering och täckodla gärna marken med halm eller gräsklipp.</li>
</ul>

<h2>Skötsel och gödsling</h2>
<p>Tomater är näringskrävande och behöver regelbunden tillförsel av näring under säsongen.</p>
<ul>
  <li><strong>Vattning:</strong> Jämn och regelbunden vattning är viktig. Ojämn vattentillgång leder till blomändan- och sprickskador. Vattna hellre djupt ett par gånger i veckan än lite varje dag.</li>
  <li><strong>Gödsling:</strong> Börja gödsla med tomatgödsel varannan vecka när de första blomknopparna syns. Använd en gödsel med högt kalium-innehåll för bra fruktbildning.</li>
  <li><strong>Knipsa av sidoskott:</strong> För indeterminata (klättrade) sorter, ta bort sidoskott som växer i bladaxlarna för att styra växten. Låt gärna 1–2 huvudskott växa.</li>
  <li><strong>Toppning:</strong> I slutet av juli–början av augusti kan du toppa plantan (ta bort den nya växttoppet) så att kvarvarande tomater hinner mogna.</li>
</ul>

<h2>Vanliga problem och lösningar</h2>
<ul>
  <li><strong>Blomänderöta:</strong> Brist på kalcium, ofta orsakad av ojämn vattning. Vattna jämnare och kontrollera pH (bör vara 6–6,8).</li>
  <li><strong>Bladmögel (Phytophthora):</strong> Vanligt under kalla, fuktiga perioder. Undvik att vattna ovanifrån, ge god luftcirkulation.</li>
  <li><strong>Vita flugor och bladlöss:</strong> Bekämpa med gula klisterskivor och nyttoinsekter (gulögon, nyckelpigor) eller insektsmedel baserat på pyretrin.</li>
  <li><strong>Sprickor i frukten:</strong> Orsakas av plötslig riklig vattning. Håll jämn fukthalt.</li>
</ul>

<h2>Skörd och förvaring</h2>
<p>Tomater smakar bäst när de mognar på plantan. Skörda när frukten har rätt färg och ger lite lätt efter vid ett varsamt grepp. Förvara aldrig tomater i kylskåp – kyla förstör smaken och strukturen. Lägg dem i rumstemperatur och förbruka inom några dagar. Överblivna tomater kan med fördel kokas till sås och frysas.</p>$content$,
  'Grönsaker',
  'Medel',
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  published = EXCLUDED.published;

INSERT INTO guides (title, slug, excerpt, content, category, difficulty_level, published)
VALUES (
  'Odla gurka – från frö till skörd',
  'odla-gurka',
  'Gurka är en av de givmildaste grönsakerna du kan odla – med rätt förutsättningar kan en enda planta ge gurkor hela sommaren. Lär dig allt om sorter, sådd, plantering och skötsel av gurka i Sverige.',
  $content$<h2>Om gurkan</h2>
<p>Gurkan (<em>Cucumis sativus</em>) är en värmälskande, snabbväxande grönsak som ursprungligen kommer från tropiska Asien. Den ger bäst resultat i växthus i Sverige, men trivs fint utomhus i varma somrar om du väljer friluftssorter. En välskött gurkplanta kan producera 20–40 gurkor under säsongen.</p>

<h2>Sorter att välja bland</h2>
<p>Det finns i huvudsak tre typer av gurkor för hemmaodling:</p>
<ul>
  <li><strong>Salladsgurka:</strong> Lång och slät, klassisk matgurka. Kräver normalt växthus i Sverige. Sorter: 'Marketmore', 'Lungo di Tokyo'.</li>
  <li><strong>Frilandsgurksor:</strong> Kortare, robustare och tåligare mot kyla. Passar utomhusodling. Sorter: 'Delikateß', 'Vorgebirgstrauben', 'Adam F1'.</li>
  <li><strong>Minigurka/cocktailgurka:</strong> Liten och späd, kan ätas med skalet. Produktiv och tålig. Sorter: 'Mini Star', 'Picolino'.</li>
</ul>

<h2>Frösådd</h2>
<p>Gurka har snabb tillväxt och behöver inte sås lika tidigt som tomater. Fröna är känsliga för omplantning, så så direkt i enskilda krukor.</p>
<ul>
  <li><strong>Såddtid:</strong> April–maj inomhus (3–4 veckor före utplantering).</li>
  <li>Använd 9 cm krukor med frösåddsjord eller näringsfri kokosmull.</li>
  <li>Lägg ett frö per kruka, 2 cm djupt. Gurkor gror helst liggande på sidan.</li>
  <li>Groningstemperatur: 22–28°C. Grodd inom 3–7 dagar.</li>
  <li>Håll plantorna ljusa och varma – undvik dragiga fönsterbrädor.</li>
</ul>

<h2>Plantering</h2>
<p>Gurka är extremt frostkänslig och ska inte planteras ut förrän marken är varm och all frostfara är borta.</p>
<ul>
  <li><strong>I växthus:</strong> Från mitten av maj, när nätterna är >12°C.</li>
  <li><strong>Utomhus:</strong> Från slutet av maj–juni i södra Sverige.</li>
  <li>Plantavstånd: 50–60 cm mellan plantorna.</li>
  <li>Blanda rikligt med mogen kompost i planteringshålet.</li>
  <li>Sätt upp ledtrådar, spaljé eller nät – gurkor klättrar gärna och mår bättre av det.</li>
</ul>

<h2>Vattning och gödsling</h2>
<p>Gurka är en vattenälskande grönsak med stora blad som avdunstar mycket fukt. Jämn och riklig vattning är avgörande.</p>
<ul>
  <li>Vattna varje dag under varmt väder, gärna på morgonen.</li>
  <li>Mulcha marken med halm eller gräsklipp för att hålla kvar fukt.</li>
  <li>Börja gödsla varannan vecka med flytande grönsaksnaäring när blommorna dyker upp.</li>
  <li>Gurkan gynnas av kalium – använd tomatgödsel eller kompostvatten.</li>
</ul>

<h2>Beskärning och formning</h2>
<p>Rätt beskärning ökar skörden avsevärt.</p>
<ul>
  <li>Knipsa bort sidoskott längs de 3–4 understa noderna för att koncentrera tillväxten.</li>
  <li>Låt sidoskotten ovanför bilda frukt men toppa dem efter 1–2 blad bortom gurkan.</li>
  <li>Ta bort gulnande blad för att förbättra luftcirkulationen.</li>
</ul>

<h2>Skörd</h2>
<p>Skörda gurkorna tidigt och ofta – det stimulerar plantan att bilda nya frukter. Salladsgurka skördas när den är 20–30 cm, frilandsgurka vid 10–15 cm. Lämna aldrig mogna gurkor på plantan – de signalerar att plantan är "klar" och minskar ny produktion. Gurkor håller sig bäst i kylskåp, inslagna i papper, i upp till en vecka.</p>$content$,
  'Grönsaker',
  'Lätt',
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  published = EXCLUDED.published;

INSERT INTO guides (title, slug, excerpt, content, category, difficulty_level, published)
VALUES (
  'Kompostering för nybörjare',
  'kompostering-for-nybörjare',
  'Kompostering är ett av de enklaste och mest givande sätten att förbättra din jord och minska ditt matsvinn. Lär dig grunderna för att komma igång med kompost – oavsett om du bor i villa eller lägenhet.',
  $content$<h2>Vad är kompost?</h2>
<p>Kompost är nedbrutet organiskt material – köks- och trädgårdsavfall som mikroorganismer, maskar och svampar har omvandlat till ett mörkt, luktfritt jordförbättringsmedel. Färdig kompost kallas ibland för "svart guld" bland odlare, och med rätta – den förbättrar jordens struktur, näringshalt och vattenhållande förmåga på ett sätt som kemisk gödning inte kan matcha.</p>

<h2>Välj komposteringsmetod</h2>
<p>Det finns flera sätt att kompostera beroende på din situation:</p>
<ul>
  <li><strong>Kallkompost (vanligast):</strong> En behållare eller hög i trädgården där du kontinuerligt lägger till material. Komposten är färdig efter 6–18 månader. Kräver lite skötsel.</li>
  <li><strong>Varmkompost:</strong> Aktiv styrning av fukt, syretillgång och balansen mellan grönt och brunt material. Komposten kan bli klar på 6–8 veckor. Kräver mer arbete men ger snabbare resultat.</li>
  <li><strong>Maskkompost:</strong> Perfekt för lägenhetsodlare. En låda med rödmask (Eisenia fetida) som äter ditt köksavfall. Diskret och luktfri om den sköts rätt.</li>
  <li><strong>Bokashi:</strong> Fermentering av matavfall med hjälp av effektiva mikroorganismer. Fungerar inomhus, tar allt matavfall inklusive kött och fisk.</li>
</ul>

<h2>Vad kan du kompostera?</h2>
<p>Balansen mellan "grönt" (kväverikt) och "brunt" (kolrikt) material är nyckeln till en välfungerande kompost. Sikta på ungefär 1 del grönt och 3 delar brunt.</p>
<h3>Grönt material (kväverikt)</h3>
<ul>
  <li>Köksrester: frukt- och grönsaksskal, kaffefilter, tepåsar</li>
  <li>Gräsklipp och ogräs (utan frön)</li>
  <li>Färska växtdelar och blomblad</li>
</ul>
<h3>Brunt material (kolrikt)</h3>
<ul>
  <li>Löv (särskilt höstlöv)</li>
  <li>Halmströ och torrt gräs</li>
  <li>Kartong och papper (utan tryckfärg)</li>
  <li>Kvistar och grenar (flisade eller hackade)</li>
  <li>Torvströ och sågspån</li>
</ul>
<h3>Lägg INTE i komposten</h3>
<ul>
  <li>Kött, fisk och mejeriprodukter (lockar skadedjur)</li>
  <li>Sjuka växter (spridningsrisk)</li>
  <li>Fröbärande ogräs</li>
  <li>Kokt mat (kan lukta och locka råttor)</li>
</ul>

<h2>Skötsel av komposten</h2>
<p>En välfungerande kompost behöver tre saker: fukt, luft och rätt materialbalans.</p>
<ul>
  <li><strong>Fukt:</strong> Komposten ska vara fuktig som en urvriden trasa. För torr kompost – vattna lätt. För blöt – tillsätt brunt material.</li>
  <li><strong>Luft:</strong> Vända komposten med en grep eller kompostspade var 2–4 vecka för att syresätta och påskynda nedbrytningen.</li>
  <li><strong>Placering:</strong> Placera kompostbehållaren på bar jord (inte betong) så att maskar och nyttiga organismer kan röra sig fritt in och ut.</li>
</ul>

<h2>Färdig kompost – hur vet du det?</h2>
<p>Färdig kompost är mörk, smulös och luktar som skogen efter regn – ingen obehaglig lukt. Ursprungsmaterialet ska inte längre vara igenkännbart. Sikta komposten genom ett grövt nät för att sortera bort ej nedbrutet material (lägg tillbaka det i komposten). Färdig kompost blandas in i odlingsjorden eller används som täckskikt runt växter.</p>$content$,
  'Jordförberedelse',
  'Nybörjare',
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  published = EXCLUDED.published;

INSERT INTO guides (title, slug, excerpt, content, category, difficulty_level, published)
VALUES (
  'Odla jordgubbar – tips och tricks',
  'odla-jordgubbar',
  'Hemmaodlade jordgubbar slår butikens på smak varje gång. Lär dig hur du väljer rätt sort, planterar, sköter och skördar dina jordgubbar för maximal smak och skörd.',
  $content$<h2>Varför odla egna jordgubbar?</h2>
<p>Hemmaodlade jordgubbar är en annan upplevelse än det du köper i affären. De skördas i perfekt mognad, utan lång transport och köldbehandling, vilket ger en sötma och arom som butiksjordgubbar sällan kan matcha. Med rätt sort och placering är jordgubbar dessutom relativt lättodlade och ger skörd år efter år.</p>

<h2>Sorter</h2>
<p>Det finns tre huvudgrupper av jordgubbar:</p>
<ul>
  <li><strong>Junisorter (enbärande):</strong> Bär en stor skörd under 2–4 veckor i juni–juli. Sorter: 'Honeoye' (tidig, robust), 'Senga Sengana' (klassisk, för sylt), 'Florence' (sen, utmärkt smak).</li>
  <li><strong>Månadssorter (remontanta):</strong> Bär kontinuerligt från juni till frost, med en minskning under varma sommardagar. Sorter: 'Mara des Bois' (liten, smakrik), 'Evita F1' (robust och produktiv).</li>
  <li><strong>Skogssmultron:</strong> Liten men med intensiv smak. Inga utlöpare, lämpliga för kantplanteringar. Sorter: 'Alexandria', 'Mignonette'.</li>
</ul>

<h2>Plantering</h2>
<p>Jordgubbar planteras bäst på hösten (augusti–september) eller tidigt på våren. Höstplantering ger en fullt etablerad planta som bär rikligt redan kommande sommar.</p>
<ul>
  <li>Välj en solig, väldrainerad plats.</li>
  <li>Förbered marken med kompost och gärna lite hornmjöl.</li>
  <li>Plantera med hjärtat (tillväxtpunkten) i höjd med markytan – varken för djupt eller för högt.</li>
  <li>Planteringsavstånd: 30–40 cm i raden, 60–80 cm mellan raderna.</li>
  <li>Täckodla gärna med halm eller jordgubbsfolie för att hålla frukterna rena och hålla fukten.</li>
</ul>

<h2>Skötsel</h2>
<ul>
  <li><strong>Vattning:</strong> Regelbunden vattning är viktig, särskilt vid blomning och fruktbildning. Undvik att vattna ovanifrån när frukterna är mogna.</li>
  <li><strong>Gödsling:</strong> Gödsla på våren med ett balanserat växtnäringspreparat. Undvik för mycket kväve (ger stora plantor men färre bär).</li>
  <li><strong>Utlöpare:</strong> Klipp bort utlöpare (långa rankor) löpande – de tar energi från fruktbildningen. Spara ett fåtal för att förnya planteringsytan.</li>
  <li><strong>Förnyelse:</strong> Jordgubbar ger bäst skörd under år 2–3. Förnya planteringen vart tredje år med nya plantor.</li>
</ul>

<h2>Skörd och förvaring</h2>
<p>Skörda jordgubbar när de är helt röda och ge en lätt doft. Skörda på morgonen när de är svala. Plocka med skaft kvar för längre hållbarhet. Jordgubbar är känsliga – förvara i ett enda lager i kylskåp och förbruka inom 1–2 dagar. Överskott lämpar sig utmärkt för sylt, frysning eller smoothies.</p>

<h2>Vanliga problem</h2>
<ul>
  <li><strong>Gråmögel (Botrytis):</strong> Vanligt vid fuktigt väder. God luftcirkulation och täckmaterial under bären minskar risken.</li>
  <li><strong>Jordgubbsvivel:</strong> Liten insekt som biter av blomskaft. Bekämpa med kaolin eller tillåtna insektsmedel.</li>
  <li><strong>Fåglar och sniglar:</strong> Täck med nät mot fåglar. Mot sniglar: snigelmedel eller kaffesump runt plantorna.</li>
</ul>$content$,
  'Bär',
  'Lätt',
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  published = EXCLUDED.published;

INSERT INTO guides (title, slug, excerpt, content, category, difficulty_level, published)
VALUES (
  'Kryddörter på balkongen',
  'kryddorter-pa-balkongen',
  'Du behöver ingen trädgård för att odla dina egna kryddörter. En solig balkong räcker för att ha färsk basilika, persilja, timjan och mynta till hands hela sommaren. Här är allt du behöver veta för att lyckas.',
  $content$<h2>Balkongodling av kryddörter – varför och hur</h2>
<p>Egna kryddörter är en av de enklaste och mest belönande formerna av odling. Du kan börja smått med ett par krukor på fönsterkarmen och bygga ut allt eftersom. De flesta kryddörter kräver minimal skötsel, producerar kontinuerligt under säsongen och höjer matlagningen till en helt ny nivå.</p>

<h2>Rätt förutsättningar</h2>
<p>Kryddörter trivs bäst med:</p>
<ul>
  <li><strong>Sol:</strong> Minst 4–6 timmars direkt sol per dag. En sydvändvänd balkong är ideal. Basilika, rosmarin och timjan kräver mer sol; mynta och persilja klarar sig med mindre.</li>
  <li><strong>Dränering:</strong> Aldrig stående vatten. Välj krukor med hål i botten och använd en väldrainerad jord, gärna blandat med lite perlit.</li>
  <li><strong>Krukstorlek:</strong> Större krukor torkar ut långsammare och ger rötterna mer utrymme. En 20–25 cm kruka per ört är en bra riktlinje.</li>
</ul>

<h2>De bästa örterna för balkong</h2>
<ul>
  <li><strong>Basilika:</strong> Värmälskande och solberoende. Perfekt för ett varmt balkongsläge. Odla inomhus i april–maj och flytta ut när det är varmt. Skörda regelbundet och knipsa av blomknoppar för längre produktion.</li>
  <li><strong>Persilja:</strong> Tåligare och klarar lite mer skugga och kyla. Tvåårig. Kan sås direkt i kruka från april.</li>
  <li><strong>Timjan:</strong> Torktålig och härdig. Trivs i mager, väldränerad jord och massa sol. Kan övervintra inomhus.</li>
  <li><strong>Mynta:</strong> Spridningsbenägen – odla alltid i egen kruka. Klarar halvskugga och mer fukt än de flesta örter. Passar utmärkt för te och drycker.</li>
  <li><strong>Gräslök:</strong> Kryddlök för nordisk mat. Mycket tålig och kan övervintras. Skörda med sax och låt återväxa.</li>
  <li><strong>Oregano:</strong> Torkad eller färsk. Kräver sol men är i övrigt lättskött. Bra kompanjon till basilika.</li>
  <li><strong>Rosmarin:</strong> Medelhavsört som kräver sol och väldränerad jord. Robust och halvhärdig – kan klara milda vintrar inomhus.</li>
</ul>

<h2>Sådd eller planta?</h2>
<p>Du kan antingen köpa färdiga plantor i butik (enklast) eller så från frö (billigare och roligare).</p>
<ul>
  <li>Basilika, persilja och dill sår du inomhus från mars–april i frösåddsjord.</li>
  <li>Timjan, oregano och rosmarin kan vara långsamma att så – köp gärna plantor av dessa.</li>
  <li>Gräslök sår du i klump – så 5–10 frön per kruka.</li>
</ul>

<h2>Vattning och näring</h2>
<p>Krukor torkar ut snabbt, särskilt i sol och blåst. Känn på jorden dagligen under varma perioder – vattna när de övre 2 cm är torra. Örter i krukor behöver mer näring än jordodlade växter. Gödsla varannan vecka med flytande örtnäring eller diluta allroundgödning. Undvik övergödsling med kväve – det ger stora plantor men sämre smak.</p>

<h2>Skörd och användning</h2>
<p>Skörda lite och ofta – det stimulerar ny tillväxt. Klipp aldrig mer än en tredjedel av plantan åt gången. Skörda alltid ovanför ett bladpar eller en grendelning. Örter smakar bäst precis innan blomning. Överskott kan torkas (timjan, oregano, rosmarin) eller frysas (persilja, basilika, gräslök) för användning under höst och vinter.</p>$content$,
  'Örter',
  'Nybörjare',
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  published = EXCLUDED.published;

