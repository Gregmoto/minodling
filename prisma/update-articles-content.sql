-- ================================================================
-- Update knowledge_articles with Swedish content and SEO fields
-- ================================================================

UPDATE knowledge_articles
SET
  excerpt         = $BODY$Kväve, fosfor och kalium är de tre viktigaste närämnena för växters tillväxt. Lär dig hur de fungerar och hur du håller balansen i din jord.$BODY$,
  content         = $BODY$<h2>De tre makronäringsämnena</h2>
<p>Alla växter behöver ett brett spektrum av näring, men tre ämnen sticker ut som de allra viktigaste – kväve (N), fosfor (P) och kalium (K). Dessa tre kallas makronäringsämnen och utgör grunden i all växtgödning. Att förstå deras roller hjälper dig att gödsla rätt och undvika vanliga odlingsmisstag.</p>

<h2>Kväve (N) – tillväxtens motor</h2>
<p>Kväve är det ämne som driver bladtillväxt och ger plantor deras gröna färg. Det är en central beståndsdel i klorofyll och proteiner. Brist på kväve syns tydligt som gulnande blad, börjande med de äldre bladens nederdel. För mycket kväve ger frodig grönska men sämre frukt- och fröbildning.</p>
<ul>
  <li>Källa: kompost, nässelvatten, grön gödsel, baljväxter via symbios</li>
  <li>Behövs mest under vegetativ tillväxt tidigt på säsongen</li>
</ul>

<h2>Fosfor (P) – rötter och blomning</h2>
<p>Fosfor är avgörande för rotutveckling, blomning och frösättning. Det hjälper plantan att omvandla solenergi till socker och stärker cellväggar. Fosforbrist visar sig som purpurfärgade blad och skott samt dålig rotutveckling. Fosfor rör sig långsamt i marken – tillsätt det nära rötterna.</p>
<ul>
  <li>Källa: benmjöl, kompost, höstlöv (bryts ned långsamt)</li>
  <li>Behövs mest vid plantering, blomning och frösättning</li>
</ul>

<h2>Kalium (K) – styrka och motståndskraft</h2>
<p>Kalium reglerar vattenhushållningen i celler, stärker cellväggar och ökar växters motståndskraft mot sjukdomar och torka. Det förbättrar också smak och kvalitet hos frukter och rotfrukter. Brist ger bruna bladkanter och svaga stjälkar.</p>
<ul>
  <li>Källa: trädaska, kalliumsulfat, kompost</li>
  <li>Behövs mest under blomning och fruktsättning</li>
</ul>

<h2>Balansen i praktiken</h2>
<p>Balansen mellan N, P och K varierar med odlingens fas. Bladgrönsaker behöver mer N, frukt- och rotfruktsodlare bör betona P och K. Jordanalys vartannat år ger dig ett faktabaserat underlag för gödslingsplan och hjälper dig undvika onödig övergödsling.$BODY$,
  seo_title      = $BODY$Näringscykeln – kväve, fosfor och kalium | Minodling$BODY$,
  seo_description = $BODY$Förstå hur kväve, fosfor och kalium fungerar i trädgårdens jord. Lär dig gödsla rätt för bättre tillväxt, blomning och skörd.$BODY$
WHERE title = $BODY$Näringscykeln – kväve, fosfor och kalium$BODY$;

-- ------------------------------------------------------------

UPDATE knowledge_articles
SET
  excerpt         = $BODY$Fröets kvalitet avgör hur bra din skörd blir. Här lär du dig allt om grobarhet, hur du testar frön och vad du bör tänka på vid köp och förvaring.$BODY$,
  content         = $BODY$<h2>Vad menas med frökvalitet?</h2>
<p>Frökvalitet handlar om frönas förmåga att gro och ge friska plantor. Två faktorer styr detta: grobarhetsprocent (hur stor andel frön som gror) och groningskraft (hur snabbt och jämnt det sker). Höga värden på båda ger en stark och jämn uppkomst.</p>

<h2>Grobarhetsprocent – vad säger siffran?</h2>
<p>Fröpackningar märks ofta med grobarhetsprocent, till exempel "85 %". Det betyder att 85 av 100 frön förväntas gro under optimala förhållanden. Siffran sjunker med åren, och äldre frön kan kräva att du sår tätare för att kompensera för sämre grobarhet.</p>

<h2>Testa gamla fröer hemma</h2>
<p>Gör ett enkelt groningstest: lägg 10 frön på ett fuktigt hushållspapper, rulla ihop det och lägg i en plastpåse i rumstemperatur. Räkna groddar efter lämplig groningsperiod för arten. Gror färre än 5 av 10 är fröet för gammalt.</p>

<h2>Hur länge håller fröer?</h2>
<ul>
  <li>Lök och purjolök: 1–2 år</li>
  <li>Morot och palsternacka: 2–3 år</li>
  <li>Tomat, paprika, gurka: 4–5 år</li>
  <li>Ärtor och bönor: 3–4 år</li>
  <li>Kål och rova: 4–5 år</li>
</ul>

<h2>Förvaring för maximal livslängd</h2>
<p>Frön ska förvaras mörkt, torrt och svalt. Idealtemperatur är 5–10°C med luftfuktighet under 50 %. En tättslutande burk med en påse silikagel i kylskåpet är en utmärkt förvaringslösning. Undvik fuktig källare – fukt är fröets värsta fiende.</p>

<h2>Certifierade vs. egensparade frön</h2>
<p>Köpta frön är testade och märkta med grobarhetsprocent. Egensparade frön från öppetpollinerade sorter kan vara lika bra om de sparats korrekt. Undvik att spara frön från F1-hybrider – deras avkomma är oförutsägbar.$BODY$,
  seo_title      = $BODY$Frökvalitet och grobarhet – vad du bör veta | Minodling$BODY$,
  seo_description = $BODY$Allt om frökvalitet och grobarhet. Lär dig testa gamla frön, förstå grobarhetsprocent och förvara fröer rätt för bästa resultat i odlingen.$BODY$
WHERE title = $BODY$Frökvalitet och grobarhet – vad du bör veta$BODY$;

-- ------------------------------------------------------------

UPDATE knowledge_articles
SET
  excerpt         = $BODY$Sticklingsförökning är ett enkelt och billigt sätt att föröka dina favoritväxter. Följ dessa steg och du lyckas med de flesta örter, buskar och perenner.$BODY$,
  content         = $BODY$<h2>Vad är sticklingsförökning?</h2>
<p>Sticklingsförökning innebär att du tar ett skott från en moderplanta och rotar det för att skapa en identisk ny planta. Metoden bevarar sortens egenskaper perfekt och är gratis jämfört med att köpa nya plantor. Det fungerar på de flesta örter, perenner, buskar och många inomhusväxter.</p>

<h2>Tre typer av sticklingar</h2>
<ul>
  <li><strong>Mjukdelsstickling:</strong> Tas från mjuka, gröna skott på våren och försommaren. Snabbast att rota – används för pelargon, fuchsia och kryddörter</li>
  <li><strong>Halvmogen stickling:</strong> Tas midsommar till sensommar när skottet börjat träiga sig. Fungerar för buskar och rosor</li>
  <li><strong>Vedartad stickling:</strong> Tas på hösten eller vintern av fullständigt träiga skott. Långsammare men tålig – för liguster, kornell och ribes</li>
</ul>

<h2>Steg för steg – mjukdelsstickling</h2>
<ul>
  <li><strong>1.</strong> Välj ett friskt, sjukdomsfritt skott med 2–4 bladpar. Längd 8–12 cm</li>
  <li><strong>2.</strong> Skär snett direkt under ett bladfäste med skarp kniv</li>
  <li><strong>3.</strong> Ta bort de nedre bladen så att bara 1–2 par återstår</li>
  <li><strong>4.</strong> Doppa snittytan i rotningspulver om sådant finns</li>
  <li><strong>5.</strong> Stick ned sticklingsbasen i fuktig perlite, såjord eller kokosfiber</li>
  <li><strong>6.</strong> Täck med plastpåse eller genomskinligt lock – håller fuktigheten</li>
  <li><strong>7.</strong> Ställ i ljust läge utan direkt sol, vid 18–22°C</li>
</ul>

<h2>Rotning och ompottning</h2>
<p>Kontrollera rotning efter 2–4 veckor genom att försiktigt dra i sticklingsbasen. Sitter den fast sitter rötterna! Vänta tills rötterna sticker ut ur dräneringshålet innan du planterar om i vanlig planteringsjord.$BODY$,
  seo_title      = $BODY$Sticklingsförökning steg för steg | Minodling$BODY$,
  seo_description = $BODY$Lär dig föröka växter med sticklingar. Steg-för-steg guide för mjukdelssticklingar, halvmogna och vedartade sticklingar med tips om rotning.$BODY$
WHERE title = $BODY$Sticklingsförökning steg för steg$BODY$;

-- ------------------------------------------------------------

UPDATE knowledge_articles
SET
  excerpt         = $BODY$Jordens pH-värde avgör vilka ämnen växterna kan ta upp. Lär dig vad pH-skalan innebär och hur du justerar surheten för bättre odlingsresultat.$BODY$,
  content         = $BODY$<h2>Vad är pH-värde?</h2>
<p>pH-värdet mäter jordens surhet på en skala från 0 till 14, där 7 är neutralt. Värden under 7 är sura och värden över 7 är basiska (alkaliska). De flesta trädgårdsväxter trivs bäst i lätt sur till neutral jord, pH 6–7, men det varierar mellan arter.</p>

<h2>Varför spelar pH-värdet roll?</h2>
<p>pH-värdet styr vilka närsalter som är tillgängliga för växternas rötter. I sur jord (lågt pH) kan fosfor och kalcium bli svårtillgängliga, medan högt pH kan låsa in järn, mangan och zink. Fel pH innebär att växterna svälter trots att du gödslat – näringen finns i marken men kan inte tas upp.</p>

<h2>Vad kräver olika växter?</h2>
<ul>
  <li><strong>pH 4,5–5,5:</strong> Blåbär, lingon, rhododendron, azalea (sura jordar)</li>
  <li><strong>pH 5,5–6,5:</strong> Potatis, jordgubbar, de flesta bär</li>
  <li><strong>pH 6,0–7,0:</strong> Grönsaker, rosor, de flesta perenner</li>
  <li><strong>pH 7,0–7,5:</strong> Kål, klematis, lavendel (föredrar kalkrik jord)</li>
</ul>

<h2>Hur mäter du pH?</h2>
<p>Enkla pH-teststickor köps billigt i trädgårdsbutiken. Ta jordprover från flera platser, blanda ihop dem och testa. För mer exakta värden kan du skicka ett jordprov till ett laboratorium.</p>

<h2>Justera pH – så gör du</h2>
<ul>
  <li><strong>Höja pH (minska surheten):</strong> Tillsätt kalkstensmjöl, trädaska eller dolomit. Verkar långsamt – kalka gärna på hösten</li>
  <li><strong>Sänka pH (öka surheten):</strong> Tillsätt svavelpulver, rhododendronjord eller surt torv. Verkar snabbare än kalkning</li>
</ul>
<p>Undvik drastiska pH-förändringar – justera gradvis och testa om på nytt efter en säsong.$BODY$,
  seo_title      = $BODY$pH-värde i jord – vad du bör veta | Minodling$BODY$,
  seo_description = $BODY$Förstå pH-värdet i trädgårdsjorden. Lär dig varför det spelar roll, vad dina växter kräver och hur du enkelt justerar surheten.$BODY$
WHERE title = $BODY$Vad är pH-värde i jord och varför spelar det roll?$BODY$;

-- ------------------------------------------------------------

UPDATE knowledge_articles
SET
  excerpt         = $BODY$Regnvatten är gratis, mjukt och perfekt för trädgården. Lär dig samla och använda det smart, och hur du hanterar vattenöverskott vid kraftig nederbörd.$BODY$,
  content         = $BODY$<h2>Fördelarna med regnvatten</h2>
<p>Regnvatten är naturligt mjukt och kalkfattigt – perfekt för surhetsälskande växter som rhododendron och blåbär som ogillar hårt kranvatten. Det är dessutom gratis och minskar vattenräkningarna. En regnvattenbrunn på 500–1000 liter kan täcka en stor del av bevattningsbehovet under sommaren.</p>

<h2>Samla regnvatten</h2>
<ul>
  <li>Anslut en regnvattenbrunn till stuprörssystemet på huset</li>
  <li>Välj en brunn med lock och ett överflodsrör som leder bort överskottsvatten</li>
  <li>Placera brunnen i skugga för att minska algbildning</li>
  <li>Töm och rengör brunnen varje höst – organiskt material göder bakterier</li>
</ul>

<h2>Smarta bevattningslösningar</h2>
<p>Kombinera regnvattenbrunnen med en droppbevattningspump och timer så bevattnas trädgården automatiskt. Placera fuktsensorer i marken och koppla dem till timern – bevattning sker bara när marken verkligen är torr.</p>

<h2>Vattenhantering vid kraftig nederbörd</h2>
<p>Kraftig regn kan skapa översvämning och urlakning av näring. Förebyggande åtgärder minskar skadorna:</p>
<ul>
  <li>Mulcha odlingsbäddarna för att minska erosion och förhindra att regndropparna packar ytan</li>
  <li>Anlägga upphöjda bäddar i känsliga områden</li>
  <li>Skapa dräneringskanaler eller täckdikning i sanka delar av trädgården</li>
  <li>Plantera täckväxter på bar jord under säsonger då odlingsbäddar är tomma</li>
</ul>

<h2>Torrtider – spara vatten</h2>
<p>Under torka är det viktigare hur du vattnar än hur mycket. Vattna djupt men sällan – uppmuntrar djupa rötter. Vattna morgontid för att minska avdunstning. Mulch minskar avdunstning med upp till 70 %.$BODY$,
  seo_title      = $BODY$Regnvatten och vattenhantering i trädgården | Minodling$BODY$,
  seo_description = $BODY$Samla regnvatten, bevattna smart och hantera kraftig nederbörd. Praktiska tips för hållbar vattenhantering i trädgård och odlingsland.$BODY$
WHERE title = $BODY$Regnvatten och vattenhantering i trädgården$BODY$;

-- ------------------------------------------------------------

UPDATE knowledge_articles
SET
  excerpt         = $BODY$Med växthus och köldbäddar kan du förlänga odlingssäsongen med månader. Lär dig tekniken bakom helårsodling i det svenska klimatet.$BODY$,
  content         = $BODY$<h2>Förläng säsongen – varför och hur</h2>
<p>Det svenska klimatet ger oss en kort odlingssäsong, men med rätt hjälpmedel kan du odla färska grönsaker från februari till december. Växthus och köldbäddar är de viktigaste verktygen för odlare som vill maximera utbytet av sin mark.</p>

<h2>Köldbädden – enkel och effektiv</h2>
<p>En köldbädd är en enkel låda med genomskinligt tak – glas, polykarbonat eller plastfilm – som fångar solvärme och skyddar mot frost. Den kan förvärma jord på våren och förlänga säsongen på hösten.</p>
<ul>
  <li>Bygg av gamla fönster och träramar – billigt och effektivt</li>
  <li>Rikta söderut för maximalt ljusintag</li>
  <li>Vädra dagligen under soliga dagar för att undvika överhettning</li>
  <li>Fungerar perfekt för sallat, spenat, rädisa och vinterhardy örter</li>
</ul>

<h2>Tunnelväxthus – mer plats, mer möjligheter</h2>
<p>Ett tunnelväxthus av plastfilm är billigare än ett glasväxthus och ger ändå stor skyddseffekt. Temperaturen är ofta 5–8°C högre än utomhus, vilket ger avsevärt längre säsong och möjliggör odling av värmekrävande grödor som tomat, gurka och melon.</p>

<h2>Uppvärmt växthus – helårsodling</h2>
<p>Med ett uppvärmt växthus kan du odla året runt. Kombinera en enkel el- eller pelletspanna med isolering för att hålla nere energikostnaderna. Odla vintergrönsaker som grönkål, pak choi och spenat till låg temperatur (5–10°C) och reservera den varmare delen för kryddörter och blomkrukor.</p>

<h2>Vad du kan odla när</h2>
<ul>
  <li><strong>Februari–mars:</strong> Förodling av tomater, chili, paprika, lök</li>
  <li><strong>April–maj:</strong> Sallat, spenat, rädisa, dill i köldbädd</li>
  <li><strong>Juni–september:</strong> Gurka, tomat, melon i växthus</li>
  <li><strong>Oktober–december:</strong> Vintergrönsaker och sparris i köldbädd</li>
</ul>$BODY$,
  seo_title      = $BODY$Odla året runt med växthus och köldbäddar | Minodling$BODY$,
  seo_description = $BODY$Förläng odlingssäsongen med köldbädd och växthus. Lär dig vad du kan odla, när och hur du bygger enkla skyddade odlingar i Sverige.$BODY$
WHERE title = $BODY$Odla året runt med växthus och köldbäddar$BODY$;

-- ------------------------------------------------------------

UPDATE knowledge_articles
SET
  excerpt         = $BODY$Integrerat växtskydd (IPM) kombinerar förebyggande åtgärder, biologiska metoder och kemiska medel som sista utväg. Lär dig principerna för hemträdgården.$BODY$,
  content         = $BODY$<h2>Vad är IPM – integrerat växtskydd?</h2>
<p>Integrerat växtskydd, Integrated Pest Management (IPM), är ett systematiskt synsätt på skadedjurs- och sjukdomskontroll. Istället för att reflexmässigt använda bekämpningsmedel kombinerar IPM förebyggande åtgärder, biologisk bekämpning och, bara vid behov, kemiska medel. Målet är friska växter med minimal miljöpåverkan.</p>

<h2>De fyra grundprinciperna</h2>
<ul>
  <li><strong>Förebygg:</strong> Välj motståndskraftiga sorter, upprätthåll god jordhälsa och använd växtföljd</li>
  <li><strong>Övervaka:</strong> Kontrollera regelbundet för tidiga tecken på skade djur och sjukdomar</li>
  <li><strong>Behandla biologiskt:</strong> Använd nyttodjur, nässelvatten, bakteriebaserade preparat</li>
  <li><strong>Kemisk behandling som sista utväg:</strong> Välj selektiva, lättnedbrytbara medel med liten biverkan</li>
</ul>

<h2>Förebyggande i praktiken</h2>
<p>Starka, välnärda växter är mer motståndskraftiga mot angrepp. Börja med:</p>
<ul>
  <li>Blandodling med blommar som lockar nyttoinsekter – ringblomma, dill, fänkål</li>
  <li>Skyddsnät mot kålfluga och fjärilar på korsblommiga växter</li>
  <li>God luftcirkulation – tätt planterade växter drabbas lättare av svampsjukdomar</li>
  <li>Återkommande jordanalys för att säkra näringsbehov</li>
</ul>

<h2>Biologisk bekämpning hemma</h2>
<ul>
  <li>Nässelvatten och tagetesbrygg mot bladlöss</li>
  <li>Biokontrollmiddel med Bacillus thuringiensis mot larver</li>
  <li>Rovkvalster mot spinnkvalster i växthus</li>
  <li>Järnfosfatgranulat mot sniglar</li>
</ul>

<h2>När kemisk behandling är aktuell</h2>
<p>Om biologiska metoder inte räcker kan en selektiv kemisk behandling vara motiverad. Välj alltid godkända preparat, följ doseringen, behandla tidigt på morgonen och undvik blomning för att skydda pollinerare.$BODY$,
  seo_title      = $BODY$Integrerat växtskydd (IPM) i hemträdgården | Minodling$BODY$,
  seo_description = $BODY$Lär dig principerna bakom integrerat växtskydd (IPM). Förebygg, övervaka och bekämpa skadedjur och sjukdomar hållbart i din hemträdgård.$BODY$
WHERE title = $BODY$Integrerat växtskydd (IPM) i hemträdgården$BODY$;

-- ------------------------------------------------------------

UPDATE knowledge_articles
SET
  excerpt         = $BODY$Mykorrhizasvampar lever i symbios med växternas rötter och förbättrar näring- och vattenupptag dramatiskt. Lär dig utnyttja denna naturliga resurs.$BODY$,
  content         = $BODY$<h2>Vad är mykorrhiza?</h2>
<p>Mykorrhiza (från grekiska: mykes = svamp, rhiza = rot) är en symbios mellan svampar och växtrötter. Svampens tunna trådar, hyfer, tränger in i eller omger rötterna och skapar ett nätverk som utökar rotens upptagningsyta enormt – upp till 1000 gånger. I utbyte mot socker från växten levererar svampen vatten och närsalter.</p>

<h2>Olika typer av mykorrhiza</h2>
<ul>
  <li><strong>Ektomykorrhiza:</strong> Omger rötterna utifrån. Vanlig hos träd som ek, björk och tall</li>
  <li><strong>Endomykorrhiza (arbuskulär):</strong> Tränger in i rotcellerna. Finns hos de flesta grönsaker, örter och prydnadsväxter</li>
</ul>

<h2>Fördelar för odlaren</h2>
<ul>
  <li>Bättre fosfor- och vattenupptag – reducerar gödslingsbehov</li>
  <li>Ökad torktolerans – svamptrådarna når vatten djupare i marken</li>
  <li>Bättre motståndskraft mot sjukdomsframkallande svampar</li>
  <li>Snabbare etablering vid om- och utplantering</li>
</ul>

<h2>Hur gynnar du mykorrhiza?</h2>
<p>Mykorrhizasvampar är känsliga för störningar. Undvik:</p>
<ul>
  <li>Djup grävning och bearbetning som bryter sönder svamptrådarna</li>
  <li>Höga fosforgiva – när fosfor är rikligt bildar rötterna inte symbios</li>
  <li>Kemiska fungicider och starka konstgödselmedel som skadar svampfloran</li>
</ul>

<h2>Mykorrhizapreparat</h2>
<p>Du kan tillsätta mykorrhizasvampar vid plantering via granulat eller gel som appliceras direkt på rötterna. Effekten är störst i utarmad eller ny jord. I välmående trädgårdsjord med hög biologisk aktivitet finns svamparna ofta redan naturligt.$BODY$,
  seo_title      = $BODY$Mykorrhiza – svampars roll i trädgården | Minodling$BODY$,
  seo_description = $BODY$Lär dig hur mykorrhizasvampar hjälper dina växter att ta upp mer näring och vatten. Tips för att gynna den naturliga svampfloran i odlingsjorden.$BODY$
WHERE title = $BODY$Mykorrhiza – svampars roll i trädgården$BODY$;

-- ------------------------------------------------------------

UPDATE knowledge_articles
SET
  excerpt         = $BODY$Fotosyntes är den process som driver allt växtliv. Lär dig hur den fungerar och hur du som odlare kan optimera ljus, vatten och CO₂ för maximal tillväxt.$BODY$,
  content         = $BODY$<h2>Vad är fotosyntes?</h2>
<p>Fotosyntes är den kemiska process där växter omvandlar solljus, koldioxid (CO₂) och vatten (H₂O) till socker och syre. Sockret används som energi och byggmaterial för att växa, och syret frigörs som biprodukt. Utan fotosyntes skulle inget liv på land existera.</p>

<h2>Förenklad formel</h2>
<p>Koldioxid + vatten + ljusenergi → druvsocker + syre<br>
6 CO₂ + 6 H₂O + ljus → C₆H₁₂O₆ + 6 O₂</p>

<h2>Klorofyll – fotosyntes motor</h2>
<p>Klorofyll är det gröna pigmentet i bladen som absorberar ljus. Det fångar framför allt rött och blått ljus och reflekterar grönt – därför ser bladen gröna ut. Klorofyll finns i kloroplasterna, cellernas energifabriker.</p>

<h2>Vad begränsar fotosyntesen?</h2>
<ul>
  <li><strong>Ljus:</strong> Otillräckligt ljus är den vanligaste begränsningsfaktorn inomhus och i skugga</li>
  <li><strong>Koldioxid:</strong> I täta, ventilationslösa växthus kan CO₂-nivåerna sjunka och begränsa tillväxten</li>
  <li><strong>Vatten:</strong> Torka stänger bladets klyvöppningar och stoppar CO₂-intaget</li>
  <li><strong>Temperatur:</strong> Fotosyntesen optimeras vid 20–30°C och minskar vid extremer</li>
</ul>

<h2>Praktiska tips för odlaren</h2>
<ul>
  <li>Maximera ljusexponering – plantera söderut och glesa ut täta bestånd</li>
  <li>Säkra jämn vattentillgång – torrstress minskar fotosyntesen dramatiskt</li>
  <li>Vädra växthuset regelbundet för att hålla CO₂-nivåerna uppe</li>
  <li>Håll bladen rena – dammiga blad absorberar mindre ljus</li>
</ul>
<p>Ju bättre du förstår fotosyntesen, desto bättre förstår du varför växter reagerar som de gör på odlingsförhållandena.$BODY$,
  seo_title      = $BODY$Fotosyntes förklarad för odlare | Minodling$BODY$,
  seo_description = $BODY$Förstå fotosyntesen och vad den betyder för din odling. Lär dig optimera ljus, vatten och CO₂ för att maximera växttillväxten.$BODY$
WHERE title = $BODY$Fotosyntes förklarad för odlare$BODY$;

-- ------------------------------------------------------------

UPDATE knowledge_articles
SET
  excerpt         = $BODY$Bin och fjärilar är avgörande för pollineringen av dina grödor. Lär dig hur du lockar fler pollinerare till trädgården med rätt växter och miljöer.$BODY$,
  content         = $BODY$<h2>Varför behöver vi pollinerare?</h2>
<p>Ungefär en tredjedel av all mat vi äter är beroende av pollinerare. Tomater, gurka, squash, äpplen och bär kräver alla insektspollinering för att sätta frukt. Utan bin och fjärilar krymper skördarna kraftigt. Att gynna pollinerare är inte bara miljövänligt – det är en direkt investering i din skörd.</p>

<h2>Vanliga pollinerare i trädgården</h2>
<ul>
  <li><strong>Honungsbi:</strong> Effektiv pollinatör – sälls kring blommor i massor</li>
  <li><strong>Humlor:</strong> Aktiva tidigare på våren och i svalare väder – viktiga för tomater (buzz-pollination)</li>
  <li><strong>Solitärbin:</strong> Mångfald av arter – mycket effektiva pollinatörer per individ</li>
  <li><strong>Fjärilar:</strong> Pollinerar gärna flata blommor – vitplister, vallmo, lavendel</li>
  <li><strong>Blomflugor:</strong> Efterliknar bin – pollinerar diskret men effektivt</li>
</ul>

<h2>Växter som lockar pollinerare</h2>
<ul>
  <li>Lavendel, timjan, oregano och salvia – medelhavsörter älskade av bin</li>
  <li>Ringblomma, tagetes och solros – lätta att odla och mycket attraktiva</li>
  <li>Humle, blåklint och oxtunga – inhemska vildblommor med hög pollinatörsvärde</li>
  <li>Fruktträd och bärbuskar – värdefullt för tidiga bin på våren</li>
</ul>

<h2>Skapa pollinerarvänlig miljö</h2>
<ul>
  <li>Plantera blommor i grupper – lättare att hitta för pollinerare</li>
  <li>Ha blomning från tidig vår till sen höst – planera för kontinuitet</li>
  <li>Anlägga ett insektshotell med rör och håligheter för solitärbin</li>
  <li>Undvik kemiska bekämpningsmedel under blomning</li>
  <li>Lämna lite bar jord – markboende solitärbin behöver öppen jord att bygga bon i</li>
</ul>$BODY$,
  seo_title      = $BODY$Pollinerare i trädgården – bin och fjärilar | Minodling$BODY$,
  seo_description = $BODY$Locka bin och fjärilar till trädgården. Lär dig vilka växter gynnar pollinerare och hur du skapar en pollinerarvänlig trädgård för bättre skörd.$BODY$
WHERE title = $BODY$Pollinerare i trädgården – bin och fjärilar$BODY$;

-- ------------------------------------------------------------

UPDATE knowledge_articles
SET
  excerpt         = $BODY$Klimatförändringarna påverkar odlingssäsongen, nederbördsmönster och skadedjurstryck. Här är vad svenska odlare behöver veta och göra.$BODY$,
  content         = $BODY$<h2>Klimatförändringar och odlingen – en ny verklighet</h2>
<p>Klimatförändringarna är redan märkbara i svenska trädgårdar. Mildare vintrar, tidigare vår, ökad risk för sommartorka och mer extrema regnevent förändrar förutsättningarna för odling. Som odlare behöver du anpassa dig till den nya verkligheten.</p>

<h2>Vad förändras i Sverige?</h2>
<ul>
  <li>Medeltemperaturen stiger – odlingssäsongen förlängs med 2–4 veckor i söder</li>
  <li>Mildare vintrar ökar övervintringen av skadedjur och sjukdomar</li>
  <li>Sommartorka blir vanligare – bevattning blir allt viktigare</li>
  <li>Kraftigare regn ökar erosionsrisk och urlakning av näring</li>
  <li>Nya skadedjur och sjukdomar sprids norrut med det varmare klimatet</li>
</ul>

<h2>Möjligheter för odlaren</h2>
<p>Den längre säsongen öppnar också för nya möjligheter. I södra Sverige kan du nu odla sorter som tidigare krävde skyddat klimat. Druvor, fikon och persikor trivs allt bättre i zon 1–2. Prova att experimentera med lite sydligare sorter i skyddat läge.</p>

<h2>Anpassa din odling</h2>
<ul>
  <li><strong>Vattenhantering:</strong> Installera regnvattensystem, mulcha ordentligt och välj torktåliga sorter</li>
  <li><strong>Jordförbättring:</strong> Öka markens organiska halt med kompost – binder mer vatten och näring</li>
  <li><strong>Biologisk mångfald:</strong> En artrik trädgård är mer robust mot klimatstress</li>
  <li><strong>Skadedjursberedskap:</strong> Håll koll på nya arter och ha naturliga bekämpningsmetoder redo</li>
  <li><strong>Dokumentera:</strong> Notera fenologiska händelser (blomning, skörd) – dina anteckningar blir värdefulla data</li>
</ul>

<h2>Bidra till lösningen</h2>
<p>Trädgårdar och odlingsland är viktiga kolsänkor. Perenna planteringar, täckgrödor och undvikande av onödig jordbearbetning binder kol i marken och bidrar positivt till klimatbalansen.$BODY$,
  seo_title      = $BODY$Klimatförändringar och odlingen i Sverige | Minodling$BODY$,
  seo_description = $BODY$Hur påverkar klimatförändringarna din trädgård? Svenska odlares guide till längre säsonger, ökad torka, nya skadedjur och hur du anpassar odlingen.$BODY$
WHERE title = $BODY$Klimatförändringar och vad de betyder för odlingen$BODY$;
