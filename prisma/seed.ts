import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seedar databasen...");

  await Promise.all([
    prisma.adminSetting.upsert({ where: { key: "site_name" },        update: {}, create: { key: "site_name",          value: "Minodling" } }),
    prisma.adminSetting.upsert({ where: { key: "site_description" }, update: {}, create: { key: "site_description",   value: "Sveriges odlingscommunity" } }),
    prisma.adminSetting.upsert({ where: { key: "points_per_post" },  update: {}, create: { key: "points_per_post",    value: "10" } }),
    prisma.adminSetting.upsert({ where: { key: "points_per_comment" }, update: {}, create: { key: "points_per_comment", value: "2" } }),
    prisma.adminSetting.upsert({ where: { key: "points_per_answer" }, update: {}, create: { key: "points_per_answer",  value: "5" } }),
  ]);

  console.log("✅ Admin-inställningar seedade");

  // ──────────────────────────────────────────────
  // GUIDER
  // ──────────────────────────────────────────────

  await prisma.guide.upsert({
    where: { slug: "odla-tomater" },
    update: {},
    create: {
      title: "Odla tomater – komplett guide",
      slug: "odla-tomater",
      excerpt:
        "Tomaten är den mest populära grönsaken att odla hemma i Sverige. Med rätt förberedelser, sort och skötsel kan du skörda kilo efter kilo av smakrika tomater – oavsett om du odlar i trädgård, växthus eller på balkongen.",
      content: `<h2>Introduktion</h2>
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
<p>Tomater smakar bäst när de mognar på plantan. Skörda när frukten har rätt färg och ger lite lätt efter vid ett varsamt grepp. Förvara aldrig tomater i kylskåp – kyla förstör smaken och strukturen. Lägg dem i rumstemperatur och förbruka inom några dagar. Överblivna tomater kan med fördel kokas till sås och frysas.</p>`,
      category: "Grönsaker",
      difficultyLevel: "Medel",
      published: true,
    },
  });

  await prisma.guide.upsert({
    where: { slug: "odla-gurka" },
    update: {},
    create: {
      title: "Odla gurka – från frö till skörd",
      slug: "odla-gurka",
      excerpt:
        "Gurka är en av de givmildaste grönsakerna du kan odla – med rätt förutsättningar kan en enda planta ge gurkor hela sommaren. Lär dig allt om sorter, sådd, plantering och skötsel av gurka i Sverige.",
      content: `<h2>Om gurkan</h2>
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
<p>Skörda gurkorna tidigt och ofta – det stimulerar plantan att bilda nya frukter. Salladsgurka skördas när den är 20–30 cm, frilandsgurka vid 10–15 cm. Lämna aldrig mogna gurkor på plantan – de signalerar att plantan är "klar" och minskar ny produktion. Gurkor håller sig bäst i kylskåp, inslagna i papper, i upp till en vecka.</p>`,
      category: "Grönsaker",
      difficultyLevel: "Lätt",
      published: true,
    },
  });

  await prisma.guide.upsert({
    where: { slug: "kompostering-for-nybörjare" },
    update: {},
    create: {
      title: "Kompostering för nybörjare",
      slug: "kompostering-for-nybörjare",
      excerpt:
        "Kompostering är ett av de enklaste och mest givande sätten att förbättra din jord och minska ditt matsvinn. Lär dig grunderna för att komma igång med kompost – oavsett om du bor i villa eller lägenhet.",
      content: `<h2>Vad är kompost?</h2>
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
<p>Färdig kompost är mörk, smulös och luktar som skogen efter regn – ingen obehaglig lukt. Ursprungsmaterialet ska inte längre vara igenkännbart. Sikta komposten genom ett grövt nät för att sortera bort ej nedbrutet material (lägg tillbaka det i komposten). Färdig kompost blandas in i odlingsjorden eller används som täckskikt runt växter.</p>`,
      category: "Jordförberedelse",
      difficultyLevel: "Nybörjare",
      published: true,
    },
  });

  await prisma.guide.upsert({
    where: { slug: "odla-jordgubbar" },
    update: {},
    create: {
      title: "Odla jordgubbar – tips och tricks",
      slug: "odla-jordgubbar",
      excerpt:
        "Hemmaodlade jordgubbar slår butikens på smak varje gång. Lär dig hur du väljer rätt sort, planterar, sköter och skördar dina jordgubbar för maximal smak och skörd.",
      content: `<h2>Varför odla egna jordgubbar?</h2>
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
</ul>`,
      category: "Bär",
      difficultyLevel: "Lätt",
      published: true,
    },
  });

  await prisma.guide.upsert({
    where: { slug: "kryddorter-pa-balkongen" },
    update: {},
    create: {
      title: "Kryddörter på balkongen",
      slug: "kryddorter-pa-balkongen",
      excerpt:
        "Du behöver ingen trädgård för att odla dina egna kryddörter. En solig balkong räcker för att ha färsk basilika, persilja, timjan och mynta till hands hela sommaren. Här är allt du behöver veta för att lyckas.",
      content: `<h2>Balkongodling av kryddörter – varför och hur</h2>
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
<p>Skörda lite och ofta – det stimulerar ny tillväxt. Klipp aldrig mer än en tredjedel av plantan åt gången. Skörda alltid ovanför ett bladpar eller en grendelning. Örter smakar bäst precis innan blomning. Överskott kan torkas (timjan, oregano, rosmarin) eller frysas (persilja, basilika, gräslök) för användning under höst och vinter.</p>`,
      category: "Örter",
      difficultyLevel: "Nybörjare",
      published: true,
    },
  });

  console.log("✅ Guider seedade");

  // ──────────────────────────────────────────────
  // KUNSKAPSBANK
  // ──────────────────────────────────────────────

  await prisma.knowledgeArticle.upsert({
    where: { slug: "jordforberedelse-pa-varen" },
    update: {},
    create: {
      title: "Jordförberedelse på våren",
      slug: "jordforberedelse-pa-varen",
      excerpt:
        "En välförberedd jord är grunden för en lyckad odlingssäsong. Lär dig hur du väcker odlingsbädden till liv på våren med rätt teknik och jordförbättringsmedel.",
      content: `<h2>Varför är jordförberedelse viktig?</h2>
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
<p>Grävfri odling vinner mark bland moderna odlare. Istället för djupgrävning tillsätts organiskt material ovanifrån och maskar och organismer arbetar ner det naturligt. Upphöjda odlingsbäddar ger bättre dränering, värms upp snabbare på våren och är bekvämare att arbeta i.</p>`,
      category: "Jord & kompost",
      published: true,
    },
  });

  await prisma.knowledgeArticle.upsert({
    where: { slug: "bevattning-hur-mycket-och-hur-ofta" },
    update: {},
    create: {
      title: "Bevattning – hur mycket och hur ofta?",
      slug: "bevattning-hur-mycket-och-hur-ofta",
      excerpt:
        "Rätt vattning är en av de viktigaste – och svåraste – delarna av trädgårdsodling. För lite eller för mycket vatten är de vanligaste orsakerna till misslyckad odling. Lär dig principerna för smart bevattning.",
      content: `<h2>Grundprincipen: djupt och sällan</h2>
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
<p>Känn på jorden – stick ner ett finger 5 cm. Är det fuktigt? Vänta. Torrt? Dags att vattna. Se också efter slaka blad tidigt på morgonen (inte mitt på dagen, när det är normalt) – det är ett tidigt tecken på vattenstress.</p>`,
      category: "Skötsel",
      published: true,
    },
  });

  await prisma.knowledgeArticle.upsert({
    where: { slug: "vanliga-skadedjur" },
    update: {},
    create: {
      title: "Vanliga skadedjur och hur du bekämpar dem",
      slug: "vanliga-skadedjur",
      excerpt:
        "Skadedjur är en del av trädgårdslivet. Lär dig känna igen de vanligaste skadeinsekterna i den svenska trädgården och de mest effektiva metoderna för att hålla dem i schack – med fokus på ekologiska lösningar.",
      content: `<h2>Att leva med skadedjur</h2>
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
</ul>`,
      category: "Skadedjur & sjukdomar",
      published: true,
    },
  });

  await prisma.knowledgeArticle.upsert({
    where: { slug: "naturlig-godning" },
    update: {},
    create: {
      title: "Naturlig gödning utan konstgödsel",
      slug: "naturlig-godning",
      excerpt:
        "Konstgödsel ger snabba resultat men på bekostnad av jordens långsiktiga hälsa. Med naturlig gödning bygger du upp jordens biologi och ger plantorna en balanserad och uthållig näring.",
      content: `<h2>Varför välja naturlig gödning?</h2>
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
<p>Gödsla aldrig mer än vad plantorna kan ta upp – överskott rinner ut i grundvatten och sjöar. Grundregel: gödsla lätt och ofta är bättre än tungt och sällan. Undvik gödsling sent på hösten – näringen tas inte upp av vilande växter och riskerar att urlakas.</p>`,
      category: "Gödning",
      published: true,
    },
  });

  await prisma.knowledgeArticle.upsert({
    where: { slug: "skorda-och-forvara" },
    update: {},
    create: {
      title: "Skörda och förvara dina grönsaker",
      slug: "skorda-och-forvara",
      excerpt:
        "Rätt skördetidpunkt och korrekt förvaring avgör om dina grönsaker smakar fantastiskt eller hamnar i komposten. Lär dig tricks för att maximera hållbarhet och smak på din skörd.",
      content: `<h2>Skörda vid rätt tidpunkt</h2>
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
</ul>`,
      category: "Skörd",
      published: true,
    },
  });

  console.log("✅ Kunskapsbanksartiklar seedade");

  // ──────────────────────────────────────────────
  // ORDLISTA
  // ──────────────────────────────────────────────

  const glossaryTerms = [
    {
      term: "Kompost",
      slug: "kompost",
      shortDescription: "Nedbrutet organiskt material som används som jordförbättringsmedel.",
      fullDescription: `<p>Kompost är det resultat som uppstår när organiskt material – köks- och trädgårdsavfall – bryts ner av mikroorganismer, maskar och svampar. Slutprodukten är ett mörkt, jordlikt material med lukt av skog som är rikt på näring och nyttiga mikrober.</p><p>Färdig kompost förbättrar jordens struktur, ökar vattenhållande förmåga och tillför en bred palett av näring på ett sätt som kemisk gödning inte kan matcha. Den kallas ofta för "svart guld" bland odlare.</p>`,
      category: "Jord",
    },
    {
      term: "Omskolning",
      slug: "omskolning",
      shortDescription: "Att flytta en planta från en liten till en större kruka för att ge rötterna mer utrymme.",
      fullDescription: `<p>Omskolning innebär att man lyfter upp en växt ur sin nuvarande kruka och planterar om den i en större behållare med ny jord. Det görs när plantan har blivit rotbunden – det vill säga när rötterna har fyllt hela krukan och börjar växa ut genom dräneringshålen.</p><p>Omskolning bör ske med försiktighet för att undvika rotskador. Vattna plantan väl dagen innan och välj en kruka som är 3–5 cm större i diameter än den befintliga.</p>`,
      category: "Odlingsteknik",
    },
    {
      term: "Täckodling",
      slug: "tackodling",
      shortDescription: "Att täcka markytan med organiskt material för att bevara fukt och hindra ogräs.",
      fullDescription: `<p>Täckodling (mulching) innebär att man lägger ett skyddande lager av organiskt material – halm, gräsklipp, träflis, löv eller kompost – på markytan runt plantorna. Lagret bör vara 5–10 cm tjockt.</p><p>Täckodling fyller flera funktioner: det minskar vattenavdunstning med upp till 70 %, håller nere ogräs, skyddar rötterna mot temperatursvängningar och tillför näring allteftersom materialet bryts ner. Det är ett av de mest effektiva och enkla verktygen för en bättre odling.</p>`,
      category: "Odlingsteknik",
    },
    {
      term: "Drivbänk",
      slug: "drivbank",
      shortDescription: "En låg, täckt bädd för att ge plantor ett varmare mikroklimat och förlänga odlingssäsongen.",
      fullDescription: `<p>En drivbänk är en liten, kallhus-liknande konstruktion av trä eller plast med glasad eller plastbelagd överdel. Den placeras utomhus och skapar ett varmare mikroklimat inuti, vilket möjliggör tidig sådd och utplantering – ofta 4–6 veckor tidigare än normalt.</p><p>Drivbänkar kan vara kalla (enbart solenergi), halvvarma (med färsk gödsel som värmekälla underifrån) eller varma (med elektrisk värmekabel). De är ett kostnadseffektivt alternativ till ett fullständigt växthus.</p>`,
      category: "Utrustning",
    },
    {
      term: "pH-värde",
      slug: "ph-varde",
      shortDescription: "Mått på jordens surhet eller alkalinitet, avgörande för plantornas förmåga att ta upp näring.",
      fullDescription: `<p>pH är en skala från 0–14 som mäter hur sur eller basisk en lösning är. pH 7 är neutralt, under 7 är surt och över 7 är basiskt (alkaliskt). De flesta odlingsväxter trivs i pH 6–7.</p><p>pH påverkar direkt tillgängligheten av näring i marken. Fel pH kan göra att näring finns i jorden men är otillgänglig för plantornas rötter. Sur jord kalkas med trädgårdskalk, alkalisk jord kan sänkas med svavel eller organiskt material. Testa regelbundet med pH-mätare eller testremsor.</p>`,
      category: "Jord",
    },
    {
      term: "Perenn",
      slug: "perenn",
      shortDescription: "Flerårig växt som återkommer år efter år utan ombrandning.",
      fullDescription: `<p>Perenner är fleråriga växter som lever i mer än två år. De vissnar ner under vintern men återkommer från rötter, rhizom eller knölar varje vår. Exempel är päon, dagliljor, rudbeckia och de flesta örter som mynta och timjan.</p><p>Perenner kräver ofta lägre skötsel än ettåriga växter (annueller) sedan de etablerat sig. De bygger successivt upp ett större rotsystem och blommar ofta allt rikligare med åren. Nackdelen är att de tar längre tid att etablera sig och inte alltid blommar det första året.</p>`,
      category: "Botanik",
    },
    {
      term: "Annuell",
      slug: "annuell",
      shortDescription: "Ettårig växt som gror, blommar, sätter frö och dör inom ett år.",
      fullDescription: `<p>Annueller är växter som genomgår hela sin livscykel – groning, tillväxt, blomning, fröbildning och döden – under ett enda år. De måste sås om varje säsong. Exempel på annueller i trädgården är tomater, gurka, basilika, ringblommor och tagetes.</p><p>Annueller blommar generellt sätt längre och mer kontinuerligt än perenner, och ger ofta rikliga skördar under säsongen. De passar utmärkt i köksland och sommarrabatter och möjliggör att man varierar planering och sorter varje år.</p>`,
      category: "Botanik",
    },
    {
      term: "Biennal",
      slug: "biennal",
      shortDescription: "Tvåårig växt som gror och bildar blad det första året, blommar och dör det andra.",
      fullDescription: `<p>Biennaler, eller tvååriga växter, lever i exakt två år. Det första året gror de, bildar blad och lagrar näring. Över vintern vilar de, och det andra året blommar de, sätter frö och dör. Exempel är morot, palsternacka, digitalis och vippkrassing.</p><p>Praktiskt innebär biennial odling att man sår nytt varje år för att ha en kontinuerlig produktion. Morötter och palsternacka skördas vanligtvis i slutet av det första året, before de blommar.</p>`,
      category: "Botanik",
    },
    {
      term: "Frösådd",
      slug: "frosadd",
      shortDescription: "Processen att så frön i jord för att odla upp plantor.",
      fullDescription: `<p>Frösådd är grundläggande för de flesta trädgårdsodlare. Frön kan sås direkt på friland (direktsådd) eller inomhus i krukor och brickor för att sedan planteras ut (förkultivering). Förkultivering inomhus används för värmekrävande eller långsamväxande växter som tomater och paprika.</p><p>Viktiga faktorer för lyckad frösådd: rätt sådjup (tumregel: dubbla fröets storlek), tillräcklig fukt utan att vara blöt, och rätt temperatur (de flesta frön gror bäst vid 18–22°C). Groningstidens varierar från 3 dagar (rädisa) till flera veckor (persillerot).</p>`,
      category: "Odlingsteknik",
    },
    {
      term: "Plantering",
      slug: "plantering",
      shortDescription: "Att placera en planta, lök eller stickling i jord för tillväxt.",
      fullDescription: `<p>Plantering innebär att en planta – antingen förkultivierad från frö eller köpt i kruka – placeras permanent i sin odlingsplats. Rätt planteringsteknik är avgörande för en bra start: plantera på rätt djup (som plantan stod i sin ursprungskruka, eller djupare för tomater), vattna väl och mulcha om möjligt.</p><p>Planteringstidpunkten är kritisk – plantera inte frostkänsliga växter förrän frostrisken är borta, och undvik plantering under extrem värme. Svalt och mulet väder är idealt för planteringsarbete.</p>`,
      category: "Odlingsteknik",
    },
    {
      term: "Gödning",
      slug: "godning",
      shortDescription: "Tillförsel av näring till växter för att stödja tillväxt och produktion.",
      fullDescription: `<p>Gödning innebär att man tillför näring till växter och jord. De tre viktigaste makronäringsämnena är kväve (N), fosfor (P) och kalium (K). Kväve främjar bladtillväxt, fosfor stödjer rot- och blombildning, och kalium stärker fruktproduktion och motståndskraft.</p><p>Gödsel kan vara organisk (kompost, hornmjöl, stallgödsel) eller kemisk/mineralisk. Organisk gödning frigör näring långsamt och förbättrar jordens biologi. Kemisk gödning verkar snabbt men förbättrar inte jordens struktur. Överkonsumtion av gödning kan skada plantorna och förorena vatten.</p>`,
      category: "Näring",
    },
    {
      term: "Mulch",
      slug: "mulch",
      shortDescription: "Täckmaterial som läggs på markytan för att bevara fukt och förhindra ogräs.",
      fullDescription: `<p>Mulch är ett samlingsnamn för material som läggs som ett skyddande lager på markytan runt växter. Organisk mulch (halm, träflis, löv, gräsklipp) bryts ner successivt och förbättrar jordens biologi. Oorganisk mulch (grus, stenull) bryts inte ner men hindrar effektivt ogräs.</p><p>Effekterna av mulching: minskar vattenavdunstning med upp till 70 %, håller nere ogräs, reglerar marktemperaturen, skyddar rötterna och tillför näring (organisk mulch). Lägg 5–10 cm mulch runt plantorna men håll det ett par centimeter från stammar och stammar för att förhindra röta.</p>`,
      category: "Odlingsteknik",
    },
    {
      term: "Mykorrhiza",
      slug: "mykorrhiza",
      shortDescription: "Symbiotiska svampar som lever i samklang med växtrötter och förbättrar näring- och vattenupptag.",
      fullDescription: `<p>Mykorrhiza är en symbios mellan svampar och växtrötter. Svampens mycel (ett nätverk av tunna trådar) utvidgar rotens absorbtionytan enormt – upp till 700 gånger – och hjälper plantan att ta upp vatten och mineraler, särskilt fosfor. I gengäld får svampen socker från plantan.</p><p>De flesta trädgårdsväxter bildar naturliga mykorrhiza-associationer i levande jord. Kemisk gödsling och jordbearbetning kan skada svampnätverket. Produkter med mykorrhizasporer kan tillsättas vid plantering för att ge plantorna en extra boost, särskilt i ny eller bearbetad jord.</p>`,
      category: "Biologi",
    },
    {
      term: "Pollination",
      slug: "pollination",
      shortDescription: "Överföringen av pollen från ståndare till pistill som leder till fruktbildning.",
      fullDescription: `<p>Pollination är processen där pollen förs från en blommas ståndare (handelar) till pistillens märke (hondelar), vilket leder till befruktning och fruktutveckling. Utan pollination bildas inga frukter eller frön.</p><p>I naturen sker pollination via vind, bin, humlor, fjärilar och andra insekter. I ett växthus kan manuell pollination behövas – använd en mjuk pensel eller knacka lätt på blomstjälkarna för att frigöra pollen. Att plantera nektarrika blommor nära köksland lockar pollinerare och ökar skörden markant.</p>`,
      category: "Botanik",
    },
    {
      term: "Växelbruk",
      slug: "vaxelbruk",
      shortDescription: "Att rotera vilka grönsaker som odlas på samma plats år för år för att undvika sjukdomar.",
      fullDescription: `<p>Växelbruk innebär att man systematiskt roterar var man odlar olika grödofamiljer för att bryta cykler av sjukdomar, skadedjur och näringsobalans. Grundregeln är att vänta minst 3–4 år innan samma grödofamilj återkommer på samma plats.</p><p>De viktigaste grödofamiljerna: korsblommiga (kål, broccoli), nattskuggeväxter (tomat, potatis, paprika), korgblommiga (sallad), gurkväxter (gurka, zucchini) och baljväxter (bönor, ärter). Baljväxter bör helst föregå kvävefordrande grödor då de berikar jorden med kväve.</p>`,
      category: "Odlingsteknik",
    },
    {
      term: "Sydvätterväxt",
      slug: "sydvattervaxt",
      shortDescription: "Växt som kräver mycket solljus och värme för att trivas och producera.",
      fullDescription: `<p>Sydvätterväxter (eller värmekrävande växter) är grödor som ursprungligen kommer från varmare klimat och som behöver hög temperatur och mycket sol för att växa bra och ge skörd. I Sverige innefattar detta tomater, paprika, aubergine, gurka och melon.</p><p>Dessa växter odlas bäst i växthus eller på en skyddad, södervänd plats. De kan inte planteras ut förrän all frostfara är borta och marken är ordentligt uppvärmd. I Sverige innebär det vanligtvis slutet av maj i söder och mitten av juni i Mellansverige.</p>`,
      category: "Botanik",
    },
    {
      term: "Sidoskott",
      slug: "sidoskott",
      shortDescription: "Skott som växer ut i vinkeln mellan huvudstam och blad, vanligtvis borttages på tomater.",
      fullDescription: `<p>Sidoskott (även kallade geiztriebe på tomater) är nya skott som växer fram i bladaxeln – vinkeln mellan huvudstammen och ett blad. På indeterminata tomater bör de regelbundet knipsas bort för att styra plantans energi mot fruktproduktion snarare än vegetativ tillväxt.</p><p>Ta bort sidoskotten när de är 2–5 cm långa – bryt dem av med fingrarna tidigt på morgonen så snittytan hinner torka under dagen. För determinata (buskiga) tomater är sidoskottsknipsning vanligtvis inte nödvändig. Andra växter, som chili och aubergine, behöver normalt inte sidoskottsknipsas.</p>`,
      category: "Odlingsteknik",
    },
    {
      term: "Skördetid",
      slug: "skordetid",
      shortDescription: "Den period då en gröda är redo att skördas och smakar som bäst.",
      fullDescription: `<p>Skördetid varierar beroende på gröda, sort och klimat. Att skörda vid rätt tidpunkt är avgörande för smak, näringsvärde och hållbarhet. De flesta grönsaker smakar bäst i rätt mognadsstadium – varken för tidigt eller för sent.</p><p>Generella tecken på skördemognad: rätt storlek och färg (tomater), fasthet (äpplen och rotsaker), lätthet att lösgöra (zucchini och gurka som lossnar lätt), och smak- och doftutveckling. Tidig och kontinuerlig skörd stimulerar ofta ny produktion och förlänger skördeperioden.</p>`,
      category: "Skörd",
    },
    {
      term: "Maskkompost",
      slug: "maskkompost",
      shortDescription: "Kompostering med hjälp av rödmask som äter organiskt material och producerar näringsrik jord.",
      fullDescription: `<p>Maskkompost (vermiculture) är en metod för att kompostera köksavfall med hjälp av rödmask (Eisenia fetida eller Lumbricus rubellus). Maskarna äter organiskt material och producerar maskjord (vermikompost) – ett extremt näringsdicht gödselmedel – samt maskurin (worm tea) som kan späds och användas som flytgödsel.</p><p>Maskkompostering passar utmärkt i lägenhet: en låda placeras under diskbänken eller i ett varmt förråd. Systemet är luktfritt om det sköts rätt och tar allt vegetabiliskt köksavfall. Undvik kött, fisk, citrusskal och lök. Maskjord är 5–10 gånger mer näringsrik än vanlig kompost.</p>`,
      category: "Kompostering",
    },
    {
      term: "Hydroponisk odling",
      slug: "hydroponisk-odling",
      shortDescription: "Odling utan jord där plantornas rötter är i näringslösning eller inert substrat.",
      fullDescription: `<p>Hydroponik är odling utan traditionell jord. Istället växer plantorna med rötterna i en näringslösning (vattenlösning med upplösta mineraler) eller i ett inert substrat som lecakulor, stenull eller kokosmull som bevattnas med näringslösning.</p><p>Fördelar med hydroponik: snabbare tillväxt (upp till 50 % snabbare), effektivare vattenanvändning, möjlighet att odla inomhus hela året och kontroll över exakt näringsnivå. Nackdelar: kräver teknisk utrustning och konstant övervakning, och saknar den biologiska rikedomen i levande jord. Populärt för sallad, spenat och örter i inomhusmiljöer.</p>`,
      category: "Odlingsteknik",
    },
  ];

  for (const term of glossaryTerms) {
    await prisma.glossaryTerm.upsert({
      where: { slug: term.slug },
      update: {},
      create: {
        term: term.term,
        slug: term.slug,
        shortDescription: term.shortDescription,
        fullDescription: term.fullDescription,
        category: term.category,
        published: true,
        relatedSlugs: [],
      },
    });
  }

  console.log("✅ Ordlista seedade");
  console.log("🌱 Seeding klar!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
