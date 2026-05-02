-- ============================================================
-- Update guides with Swedish content, excerpts and SEO fields
-- ============================================================

UPDATE guides
SET
  excerpt         = $BODY$Växtföljd innebär att du odlar olika grödor på samma yta år för år. Det förbättrar jordhälsan, minskar sjukdomar och ger bättre skördar.$BODY$,
  content         = $BODY$<h2>Vad är växtföljd?</h2>
<p>Växtföljd, eller crop rotation, innebär att du systematiskt varierar vilka grödor du odlar på en viss odlingsyta från år till år. Principen är enkel men effekten är stor – jordens hälsa förbättras, skadedjur och sjukdomar minskar, och du får bättre skördar utan att behöva använda kemiska bekämpningsmedel.</p>

<h2>Varför är växtföljd viktigt?</h2>
<p>Varje gröda tar upp olika mängder näring och lämnar kvar olika ämnen i jorden. Tomater och potatis tillhör exempelvis samma familj och drabbas av liknande sjukdomar. Om du odlar dem på samma plats år efter år samlas smittämnen i marken och skörden försämras.</p>
<ul>
  <li>Förhindrar uppbyggnad av sjukdomar och skadedjur i jorden</li>
  <li>Balanserar näringsbehov – kvävefixerande baljväxter berikar marken</li>
  <li>Förbättrar jordstrukturen när grödor med djupa rötter omväxlar med grundare</li>
  <li>Minskar behovet av konstgödning och bekämpningsmedel</li>
</ul>

<h2>Hur planerar du en växtföljd?</h2>
<p>En klassisk fyredelad växtföljd delar upp odlingslandet i fyra sektioner som roterar med ett år i taget. Gruppera grödorna efter familjetillhörighet:</p>
<ul>
  <li><strong>Grupp 1 – Baljväxter:</strong> Ärtor, bönor, klöver (fixerar kväve)</li>
  <li><strong>Grupp 2 – Bladgrönsaker:</strong> Sallat, spenat, kål (kräver mycket kväve)</li>
  <li><strong>Grupp 3 – Rotfrukter:</strong> Morot, palsternacka, rödbeta</li>
  <li><strong>Grupp 4 – Nattskuggeväxter:</strong> Tomat, potatis, paprika</li>
</ul>
<p>Flytta varje grupp ett steg framåt varje säsong. På så sätt återkommer ingen gröda till samma plats förrän efter fyra år.</p>

<h2>Tips för nybörjare</h2>
<p>Börja enkelt. Håll en enkel anteckningsbok eller rita en karta över odlingslandet och notera vad som växer var varje år. Även en tvådelad rotation – baljväxter omvartannat med övriga grödor – ger stor skillnad jämfört med att aldrig rotera alls.</p>
<p>Kom ihåg att inte låta nattskuggeväxter följa efter varandra. Ge alltid marken minst tre år vila från tomat och potatis på samma plats.$BODY$,
  seo_title      = $BODY$Växtföljd – varför och hur | Minodling$BODY$,
  seo_description = $BODY$Lär dig planera växtföljd för ett friskare odlingsland. Vi förklarar principerna bakom rotation och ger dig en enkel fyredelad modell att följa.$BODY$
WHERE title = $BODY$Växtföljd – varför och hur$BODY$;

-- ------------------------------------------------------------

UPDATE guides
SET
  excerpt         = $BODY$Ett välplanerat bevattningssystem sparar tid och vatten. Här går vi igenom drippsystem, sprinklers och smarta lösningar för odlingslandet.$BODY$,
  content         = $BODY$<h2>Därför lönar sig ett bevattningssystem</h2>
<p>Att vattna för hand är tidskrävande och ojämnt. Ett enkelt bevattningssystem ser till att växterna får rätt mängd vatten vid rätt tidpunkt – utan att du behöver vara hemma. Det sparar dessutom upp till 50 % vatten jämfört med bevattning med slang eller vattenkanna.</p>

<h2>Olika typer av system</h2>
<ul>
  <li><strong>Droppbevattning:</strong> Vatten leds direkt till rotzonen via slangar och droppare. Effektivt och skonsamt – fungerar utmärkt för grönsaksland och upphöjda bäddar.</li>
  <li><strong>Mikrosprinklers:</strong> Sprider vatten i ett litet mönster. Bra för tätare planteringar och krukor.</li>
  <li><strong>Perforerade slangar (soakerhose):</strong> Sipprar vatten längs hela slangen. Enkelt att lägga ut och täcka med mulch.</li>
  <li><strong>Automatiska sprinklers:</strong> Passar stora gräsytor men är onödiga för grönsaksodling.</li>
</ul>

<h2>Planera systemet steg för steg</h2>
<p>Börja med att skissa en karta över odlingslandet och markera var vattenkällan finns. Mät ut slanglängder och planera förgreningar. De flesta kit från trädgårdsbutiken inkluderar allt du behöver: huvudslang, grendelar, droppare och förbindningsstycken.</p>
<ul>
  <li>Anslut systemet till en tidsur för automatisk bevattning</li>
  <li>Placera dropparna nära plantskolans bas, inte mitt i bladverket</li>
  <li>Täck slangarna med mulch för att minska avdunstning</li>
  <li>Kontrollera systemet varje vecka under säsongen</li>
</ul>

<h2>Underhåll och vinterförvaring</h2>
<p>Innan frosten sätter in bör du tömma alla slangar på vatten och förvara dem inomhus. Droppare och filter rengörs med vatten och en mjuk borste. Ett välskött system håller i många år och betalar snabbt tillbaka sin kostnad i sparad tid och vatten.$BODY$,
  seo_title      = $BODY$Bevattningssystem för odlingslandet | Minodling$BODY$,
  seo_description = $BODY$Guide till bevattningssystem för grönsaksland – droppbevattning, soakerhose och automatisk tidsur. Spara tid och vatten med rätt lösning.$BODY$
WHERE title = $BODY$Bevattningssystem för odlingslandet$BODY$;

-- ------------------------------------------------------------

UPDATE guides
SET
  excerpt         = $BODY$Kompostering förvandlar köksavfall och trädgårdsrester till näring för dina växter. Lär dig grunderna för att komma igång direkt.$BODY$,
  content         = $BODY$<h2>Vad är kompost och varför kompostera?</h2>
<p>Kompost är nedbrutet organiskt material som bildar en mörk, mullrik massa full av näring. Genom att kompostera återför du näring till kretsloppet, minskar avfallet och ger dina växter det bästa möjliga jordförbättringsmedlet – helt gratis.</p>

<h2>Vad kan du lägga i komposten?</h2>
<ul>
  <li><strong>Grönt material (kvävekälla):</strong> Köksavfall, gräsklipp, kaffesump, ogräs utan frön</li>
  <li><strong>Brunt material (kolkälla):</strong> Torra löv, rivna kartonger, halm, sågspån</li>
</ul>
<p>Undvik kött, fisk, mjölkprodukter och sjuka växter – de luktar illa och kan sprida sjukdomar.</p>

<h2>Bra balans ger snabb kompost</h2>
<p>Hemligheten bakom en fungerande kompost är balansen mellan grönt och brunt material. En bra tumregel är en del grönt mot tre delar brunt. Om komposten luktar illa är den för blöt – tillsätt mer brunt. Om den inte bryts ned är den för torr – fukta och tillsätt mer grönt.</p>

<h2>Komma igång steg för steg</h2>
<ul>
  <li>Välj en plats i halvskugga, gärna direkt på mark så maskar kan ta sig in</li>
  <li>Börja med ett lager brunt material i botten</li>
  <li>Varva grönt och brunt i ungefär tre till ett-förhållande</li>
  <li>Håll komposten fuktig men inte blöt</li>
  <li>Vänta om varannan vecka för att syresätta</li>
</ul>

<h2>När är komposten klar?</h2>
<p>Färdig kompost är mörk, luktar jordigt och går inte att känna igen som det ursprungliga materialet. Det tar vanligtvis tre till sex månader under sommarhalvåret och längre under vintern. Blanda in den färdiga komposten i odlingsjorden eller lägg den som ett toppskikt runt dina växter.$BODY$,
  seo_title      = $BODY$Kompostering för nybörjare | Minodling$BODY$,
  seo_description = $BODY$Kom igång med kompostering hemma. Vi visar vad du lägger i komposten, hur du balanserar grönt och brunt och när komposten är klar att använda.$BODY$
WHERE title = $BODY$Kompostering för nybörjare$BODY$;

-- ------------------------------------------------------------

UPDATE guides
SET
  excerpt         = $BODY$Rätt vinterskydd räddar dina perenner, buskar och träd från frostskador. Här är allt du behöver veta inför den kalla årstiden.$BODY$,
  content         = $BODY$<h2>Varför behöver trädgården vinterskydd?</h2>
<p>Svenska vintrar kan vara hårda, och många odlade växter klarar inte kyla, frost och tjälskjutning utan hjälp. Med enkla förberedelser på hösten kan du rädda perenner, buskar och känsliga trädgårdsväxter och ge dem en bra start nästa säsong.</p>

<h2>Börja med att skörda och städa</h2>
<p>Innan frosten slår till bör du skörda allt som kan skördas. Ta upp rotfrukter, plocka de sista tomaterna och rensa bort vissna blastar. En städad odlingsbädd minskar risken för att sjukdomar och skadedjur övervintrar i växtresterna.</p>

<h2>Mulcha för att skydda rötterna</h2>
<p>Ett tjockt lager mulch – löv, halm eller bark – isolerar marken och skyddar rotsystemet mot köldknäppar. Lägg 10–15 cm mulch kring perenner och buskar efter att marken börjat frysa till. Lägger du det för tidigt kan det locka till sig möss och råttor som söker vinterkvarter.</p>

<h2>Känsliga växter – åtgärder per kategori</h2>
<ul>
  <li><strong>Rosor:</strong> Kupa upp jord kring stambasen, täck med granris eller juteväv</li>
  <li><strong>Krukväxter:</strong> Flytta in frostömma växter, eller isolera krukorna med bubbelplast</li>
  <li><strong>Unga träd och buskar:</strong> Linda stammen med juteband för att förhindra sprickskador av sol och frost</li>
  <li><strong>Perenner:</strong> Låt vissna stjälkar stå kvar – de isolerar och ger mat åt fåglar</li>
</ul>

<h2>Verktyg och odlingsutrustning</h2>
<p>Glöm inte att ta hand om trädgårdsverktygen inför vintern. Rengör och olja in metalldelar, töm och förvara bevattningsslangar inomhus och stäng av utomhuskranar. Det förlänger livslängden på utrustningen och gör vårstarten smidigare.$BODY$,
  seo_title      = $BODY$Vinterskydd och förberedelse inför vintern | Minodling$BODY$,
  seo_description = $BODY$Förbered trädgården inför vintern med rätt mulchning och täckning av känsliga växter. Praktiska höstråd för odlingslandet.$BODY$
WHERE title = $BODY$Vinterskydd och förberedelse inför vintern$BODY$;

-- ------------------------------------------------------------

UPDATE guides
SET
  excerpt         = $BODY$Håll skadedjuren borta utan kemikalier. Den här guiden visar naturliga metoder för att skydda dina odlingar på ett hållbart sätt.$BODY$,
  content         = $BODY$<h2>Naturlig skadedjursbekämpning – grundprinciperna</h2>
<p>Kemiska bekämpningsmedel dödar inte bara skadedjuren – de slår också ut nyttoinsekter som bin, humlor och nyckelpigor. Naturlig bekämpning arbetar med trädgårdens egna processer och gynnar biologisk mångfald.</p>

<h2>Förebyggande åtgärder</h2>
<ul>
  <li><strong>Växtföljd:</strong> Odla inte samma grödor på samma plats år efter år – det bryter skadedjurens livscykel</li>
  <li><strong>Blandodling:</strong> Blanda grödor med växter som skrämmer bort skadedjur, till exempel dill och ringblomma</li>
  <li><strong>Hälsosam jord:</strong> Starka växter i välgödslad jord är mer motståndskraftiga</li>
  <li><strong>Skyddsnät:</strong> Täck kålväxter med finmaskigt nät mot kålfluga och fjärilar</li>
</ul>

<h2>Nyttodjur – din naturliga armé</h2>
<p>Uppmuntra nyttodjur att trivas i trädgården. Nyckelpigor och näslor äter bladlöss, jordlöpare äter sniglar och getingar parasiterar på larver. Plantera blommor som lockar nyttoinsekter – tagetes, lavendel och anis är utmärkta val.</p>

<h2>Naturliga bekämpningsmedel</h2>
<ul>
  <li><strong>Nässelvatten:</strong> Brygg på nässlor i 1–2 veckor och späd 1:10 – bra mot bladlöss och som gödsling</li>
  <li><strong>Såpvatten:</strong> 1 msk diskmedel per liter vatten – spreja på bladlöss och spinnkvalster</li>
  <li><strong>Diatomacéjord:</strong> Strö kring plantor – skadar sniglar och krypande insekter mekaniskt</li>
  <li><strong>Kupferbrühe (kopparmedel):</strong> Mot svampsjukdomar som mjöldagg och potatisbladmögel</li>
</ul>

<h2>Sniglar – ett eget kapitel</h2>
<p>Sniglar är ett av de vanligaste problemen i svenska trädgårdar. Sätt ut snigelskydd av kopparband, samla ihop sniglar på kvällen och lägg dem i saltvatten, eller använd järnfosfatgranulat som är ofarligt för fåglar och husdjur.$BODY$,
  seo_title      = $BODY$Naturlig skadedjursbekämpning | Minodling$BODY$,
  seo_description = $BODY$Bekämpa skadedjur utan kemikalier. Guide till naturliga metoder – nyttodjur, nässelvatten, skyddsnät och blandodling för en hållbar trädgård.$BODY$
WHERE title = $BODY$Naturlig skadedjursbekämpning$BODY$;

-- ------------------------------------------------------------

UPDATE guides
SET
  excerpt         = $BODY$Tomater behöver en lång säsong och sås bäst inomhus i februari–mars. Här är steg för steg hur du lyckas med sådden från start.$BODY$,
  content         = $BODY$<h2>Varför så tomater inomhus?</h2>
<p>Tomater behöver 15–20 veckor från sådd till skörd. I Sverige börjar säsongen för sent för att så direkt utomhus, därför behöver du förodla inomhus under januari till mars beroende på din odlingszon.</p>

<h2>Vad du behöver</h2>
<ul>
  <li>Tomatfrön av valfri sort</li>
  <li>Pluggbrätte eller småkrukor</li>
  <li>Såjord eller frösåjord</li>
  <li>Plastfolie eller transparent lock</li>
  <li>Växtbelysning eller en ljus fönsterbräda</li>
</ul>

<h2>Steg för steg – sådden</h2>
<ul>
  <li><strong>Steg 1:</strong> Fukta såjorden ordentligt innan du fyller pluggbrättet</li>
  <li><strong>Steg 2:</strong> Lägg ett till två frön per cell, täck med 0,5 cm jord</li>
  <li><strong>Steg 3:</strong> Täck med plastfolie och ställ på ett varmt ställe – tomater gror bäst vid 22–25°C</li>
  <li><strong>Steg 4:</strong> Ta bort plastfolien så snart groddar syns, vanligtvis efter 5–10 dagar</li>
  <li><strong>Steg 5:</strong> Ställ i maximalt ljus – minst 12–16 timmar per dygn med växtbelysning</li>
</ul>

<h2>Skola om och härdning</h2>
<p>När plantorna har fått sitt andra bladpar är det dags att skola om till individuella krukor med vanlig planteringsjord. Håll plantorna i ljust och varmt läge. Två veckor innan utplantering härdar du dem genom att ställa ut dem i skugga dagtid och ta in dem på natten.</p>

<h2>Vanliga misstag att undvika</h2>
<ul>
  <li>För lite ljus ger långa, svaga plantor – använd växtbelysning</li>
  <li>För tidig sådd ger stora plantor som inte hinner planteras ut</li>
  <li>Vattna med ljummet vatten, aldrig kallt kranvatten direkt på plantorna</li>
</ul>$BODY$,
  seo_title      = $BODY$Så här sår du tomater inomhus | Minodling$BODY$,
  seo_description = $BODY$Steg-för-steg guide för att så tomater inomhus. Lär dig rätt tidpunkt, såteknik, belysning och hur du härdar plantorna inför utplantering.$BODY$
WHERE title = $BODY$Så här sår du tomater inomhus$BODY$;

-- ------------------------------------------------------------

UPDATE guides
SET
  excerpt         = $BODY$Chili odlas framgångsrikt i Sverige med lite tålamod. Guiden tar dig från frösådd till riklig skörd och hjälper dig välja rätt sorter.$BODY$,
  content         = $BODY$<h2>Chiliodling i Sverige – är det möjligt?</h2>
<p>Absolut! Chili är visserligen en tropisk växt men klarar sig utmärkt som ettårig i Sverige om du ger den tillräcklig värme och ljus. Med rätt planering kan du skörda kilon av chili under sensommaren och hösten.</p>

<h2>Välj rätt sort</h2>
<ul>
  <li><strong>Jalapeño:</strong> Lättodlad, mild hetta, bra för nybörjare</li>
  <li><strong>Cayenne:</strong> Hög avkastning, medelstark – passar för torkning</li>
  <li><strong>Habanero:</strong> Stark sort, behöver lång och varm säsong</li>
  <li><strong>Hungarian Wax:</strong> Mild och produktiv, fin för pickling</li>
</ul>

<h2>Sådd och förodling</h2>
<p>Chili har en lång växttid och bör sås redan i januari–februari. Lägg fröna i fuktig såjord och håll dem vid 25–28°C för god groning – en värmematta under pluggbrättet hjälper. Groddarna behöver mycket ljus direkt från start.</p>

<h2>Skötsel under säsongen</h2>
<ul>
  <li>Plantera ut i kruka eller odlingsbädd efter sista natten är frostfri, vanligtvis i juni</li>
  <li>Chili älskar värme – ställ dem mot en sydvägg eller i växthus</li>
  <li>Vattna jämnt men låt jord torka något mellan bevattningarna</li>
  <li>Gödsla varannan vecka med kaliumrik gödning när blommorna sätts</li>
  <li>Nyp av de första blommorna på unga plantor för att uppmuntra buskighet</li>
</ul>

<h2>Skörd och förvaring</h2>
<p>Chili kan skördas grön eller mogen. Mogna frukter har djupare smak och färg. Skörda regelbundet för att stimulera ny blomning. Chilin förvaras bäst torkat, infryst eller syltat. Du kan också föröka plantan genom sticklingar och övervintras inomhus.$BODY$,
  seo_title      = $BODY$Odla chili – från frö till skörd | Minodling$BODY$,
  seo_description = $BODY$Komplett guide för chiliodling i Sverige. Välj rätt sort, lär dig förodla, sköta och skörda chili – i kruka, odlingsbädd eller växthus.$BODY$
WHERE title = $BODY$Odla chili – från frö till skörd$BODY$;

-- ------------------------------------------------------------

UPDATE guides
SET
  excerpt         = $BODY$En balkongkryddträdgård ger färska örter nära till hands hela sommaren. Lär dig vilka kryddor trivs bäst i kruka och hur du sköter dem.$BODY$,
  content         = $BODY$<h2>Kryddor på balkongen – en perfekt lösning</h2>
<p>Även den minsta balkong rymmer en riktig kryddträdgård. Kryddor kräver lite utrymme, är tacksamma att odla och ger stor smakupplevelse till matlagningen. Med rätt krukval och placering kan du skörda färska örter hela sommaren.</p>

<h2>Bästa kryddorna för balkongen</h2>
<ul>
  <li><strong>Basilika:</strong> Älskar värme och sol – ställ den skyddat mot vind</li>
  <li><strong>Persilja:</strong> Tålig och produktiv – klarar halvskugga</li>
  <li><strong>Gräslök:</strong> Mycket lättodlad, kommer tillbaka varje år</li>
  <li><strong>Timjan och oregano:</strong> Torktåliga medelhavskryddor – sköt om minst</li>
  <li><strong>Mynta:</strong> Odla alltid ensam i kruka – breder ut sig aggressivt</li>
  <li><strong>Dill:</strong> Snabbväxande – så nytt var tredje vecka för kontinuerlig skörd</li>
</ul>

<h2>Val av krukor och jord</h2>
<p>Använd krukor med dränageshål – stående vatten dödar de flesta örter. Terrakotta andas bra men torkar snabbt. Plastkrukor håller fukten längre. Använd en genomsläpplig örtkryddejord eller blanda planteringsjord med perlite i förhållandet tre till ett.</p>

<h2>Placering och skötsel</h2>
<ul>
  <li>Medelhavsörter (timjan, rosmarin, oregano) vill ha max sol och torr jord</li>
  <li>Persilja och gräslök klarar halvskugga men trivs bäst i sol</li>
  <li>Basilika är känslig för kyla – vänta till juni innan du ställer ut den</li>
  <li>Vattna på morgonen, låt ytan torka mellan bevattningarna</li>
</ul>

<h2>Skörd för bättre tillväxt</h2>
<p>Skörda regelbundet och frikostigt – det stimulerar plantorna att bilda nya skott. Klipp alltid ovanför ett bladpar, inte ned till basen. Plocka bort blomknoppar på basilika och mynta för att förlänga skördesäsongen.$BODY$,
  seo_title      = $BODY$Kryddträdgård på balkong | Minodling$BODY$,
  seo_description = $BODY$Odla kryddor på balkongen – bästa örter för kruka, rätt jord och placering samt skötselråd för en produktiv balkong.$BODY$
WHERE title = $BODY$Kryddträdgård på balkong$BODY$;

-- ------------------------------------------------------------

UPDATE guides
SET
  excerpt         = $BODY$Sveriges odlingszoner avgör vad du kan odla och när. Lär dig förstå zonkartan och hur du använder den för smartare odlingsplanering.$BODY$,
  content         = $BODY$<h2>Vad är odlingszoner?</h2>
<p>Sverige är indelat i åtta odlingszoner (zon 1–8) baserade på medeltemperatur under vegetationsperioden och lägsta vintertemperaturer. Zonerna hjälper dig att förstå vilka perenner, buskar och träd som klarar vintern på din plats och när det är lämpligt att sätta igång med odlingen.</p>

<h2>Zonkartan i korthet</h2>
<ul>
  <li><strong>Zon 1–2:</strong> Södra Sverige – Skåne, Blekinge, Halland. Milt klimat, lång säsong</li>
  <li><strong>Zon 3–4:</strong> Mellansverige – Svealand och södra Norrland. Medellång säsong</li>
  <li><strong>Zon 5–6:</strong> Norra Sverige, fjällnära områden. Kort och intensiv säsong</li>
  <li><strong>Zon 7–8:</strong> Fjällen och de allra nordligaste delarna. Mycket kort odlingssäsong</li>
</ul>

<h2>Hur påverkar zonen din odling?</h2>
<p>Zonmarkeringen på perenner och buskar i plantskolan visar i vilka zoner växten klarar att övervintras. En växt markerad "zon 1–4" övervintrar i södra och mellersta Sverige men kan frysa bort i norr. För ettåriga grönsaker spelar zonen roll för när du kan så och plantera ut.</p>

<h2>Lokala variationer – mikroklimat</h2>
<p>Zonkartan är ett riktmärke, inte en absolut sanning. Mikroklimat spelar stor roll. En sydvänd husvägg kan vara en hel zon varmare än den officiella kartan antyder, medan ett sankt område kan vara kallare. Läs av din trädgård under flera säsonger för att lära känna dess mikroklimat.</p>

<h2>Praktiska tips per zon</h2>
<ul>
  <li>I zon 1–2 kan du odla mer ömtåliga sorter som fikon och vindruvor med lite skydd</li>
  <li>I zon 3–4 väljer du härdiga tomats- och gurksorter med kort mogningstid</li>
  <li>I zon 5–6 satsar du på snabbmogna sorter och använder köldbäddar och tunnelväxthus</li>
  <li>I zon 7–8 är ettårigt grönsaksodling begränsad – satsa på härdiga bär och rotfrukter</li>
</ul>$BODY$,
  seo_title      = $BODY$Förstå odlingszoner i Sverige | Minodling$BODY$,
  seo_description = $BODY$Lär dig hur Sveriges odlingszoner fungerar och hur du använder zonkartan för att välja rätt växter och planera din odlingssäsong smart.$BODY$
WHERE title = $BODY$Förstå odlingszoner i Sverige$BODY$;
