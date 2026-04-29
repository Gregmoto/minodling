/**
 * Säsongstemplates för Din odlingsvecka.
 * Varje månad har 6–8 uppgifter. Generatorn väljer 2–3 baserat
 * på användarens data (växter, dagbok, odlingszon).
 */

export interface TaskTemplate {
  title:       string;
  description: string;
  icon:        string;
  /** Hur relevant uppgiften är (1 = alltid, 2 = ofta, 3 = sällan) */
  priority:    1 | 2 | 3;
  /** Typ av odling som gynnas: alla | balkong | trädgård | växthus */
  growingType?: "alla" | "balkong" | "trädgård" | "växthus";
}

/** Indexed 1–12 (januari–december) */
export const SEASONAL_TASKS: Record<number, TaskTemplate[]> = {
  1: [
    { title: "Planera säsongen",          description: "Bestäm vad du ska odla i år. Rita upp dina odlingsbäddar och gör en lista.",                          icon: "📋", priority: 1 },
    { title: "Beställ frökataloger",       description: "Bläddra igenom kataloger och beställ de frön du vill prova.",                                          icon: "📚", priority: 1 },
    { title: "Rensa och se över verktyg",  description: "Rengör, olja och skärp dina trädgårdsverktyg inför säsongen.",                                          icon: "🔧", priority: 2 },
    { title: "Kontrollera fröförrådet",    description: "Gå igenom gamla frön – testa grobarhet om de är mer än 2–3 år gamla.",                                  icon: "🫘", priority: 2 },
    { title: "Läs på om odling",           description: "Passa på att läsa odlingsböcker, guider och forum när det är lugnt ute.",                              icon: "📖", priority: 3 },
    { title: "Se över komposten",          description: "Rör om komposten och kontrollera att den fungerar rätt.",                                               icon: "♻️", priority: 3 },
  ],
  2: [
    { title: "Så lök och purjolök",        description: "Februari är perfekt för att starta lök och purjolök inomhus i såblock.",                                icon: "🧅", priority: 1 },
    { title: "Beställ årets frön",         description: "Lägg din beställning – de bästa varianterna tar slut tidigt.",                                          icon: "🛒", priority: 1 },
    { title: "Förbereda såjord",           description: "Blanda eller köp in såjord. Fylla upp krukor och såbrickor.",                                           icon: "🪴", priority: 2 },
    { title: "Starta chili och paprika",   description: "Chili och paprika behöver lång tid – februari–mars är rätt tidpunkt för förkultivering.",               icon: "🌶️", priority: 2 },
    { title: "Kontrollera övervintrade växter", description: "Gå igenom geranior, dahliaknölar och andra övervintrade växter.",                                   icon: "🌿", priority: 3 },
    { title: "Städa trädgårdshusen",       description: "Rensa krukor, tvätta fönster i drivbänk/växthus och förbered för tidig sådd.",                         icon: "🏡", priority: 3, growingType: "växthus" },
  ],
  3: [
    { title: "Starta tomater inomhus",     description: "Så tomater i såblock eller krukor under extra belysning inomhus.",                                      icon: "🍅", priority: 1 },
    { title: "Förkultivera selleri",       description: "Selleri och rotselleri har lång odlingstid – dags att börja nu.",                                        icon: "🌿", priority: 1 },
    { title: "Förbereda odlingsbäddar",    description: "Täck bäddarna med fleece eller plast för att värma upp jord inför plantering.",                          icon: "🛏️", priority: 2, growingType: "trädgård" },
    { title: "Driva på morötter tidigt",   description: "Så morötter i krukor inomhus eller i drivbänk för tidig skörd.",                                        icon: "🥕", priority: 2 },
    { title: "Kontrollera jordkvaliteten", description: "Testa jordens pH och struktur. Kalka vid behov om pH är under 6.",                                      icon: "🧪", priority: 3, growingType: "trädgård" },
    { title: "Köp kompostjord",            description: "Fyll på med ny kompostjord i bäddar och krukor.",                                                       icon: "💩", priority: 3 },
  ],
  4: [
    { title: "Plantera potatis",           description: "Lägg chittad potatis i jord när marken är uppvärmd till minst 8 °C.",                                   icon: "🥔", priority: 1, growingType: "trädgård" },
    { title: "Härdas av tomater och chili","description": "Ställ ut plantorna 1–2 timmar per dag för att vänja dem vid utemiljön.",                               icon: "🌡️", priority: 1 },
    { title: "Direktså spenat och rädisor","description": "Härdiga grödor klarar lätt frost – dags att så direkt ute.",                                          icon: "🥬", priority: 1 },
    { title: "Så blomkål och broccoli",    description: "Starta blomkål, broccoli och kålrabi inomhus för utplantering i maj.",                                   icon: "🥦", priority: 2 },
    { title: "Bekämpa sniglar tidigt",     description: "Sätt ut snigelmedel eller ull-pellets innan snigelpopulationen exploderar.",                             icon: "🐌", priority: 2, growingType: "trädgård" },
    { title: "Plantera örter i kruka",     description: "Persilja, gräslök och timjan trivs i kruka på balkongen eller fönsterbrädan.",                           icon: "🌿", priority: 3, growingType: "balkong" },
  ],
  5: [
    { title: "Plantera ut tomater",        description: "När nätterna är frostfria (≥ +5 °C) är det dags att plantera ut tomater.",                              icon: "🍅", priority: 1 },
    { title: "Plantera ut chili och paprika","description":"Chili och paprika vill ha en solig, varm plats – vänta tills risken för frost är borta.",             icon: "🌶️", priority: 1 },
    { title: "Vattna regelbundet",         description: "Nyplanterade plantor torkar snabbt – kontrollera dagligen de första veckorna.",                          icon: "💧", priority: 1 },
    { title: "Gallra morötter och betor",  description: "Tunnla ut till 5–8 cm avstånd för att ge rotsaker plats att växa.",                                     icon: "🥕", priority: 2 },
    { title: "Bekämpa ohyra",             description: "Kontrollera undersidan av bladen på rosor och kål efter bladlöss.",                                     icon: "🐛", priority: 2 },
    { title: "Mull och täckmaterial",      description: "Täck jorden runt plantorna med halm eller trädgårdskompost för att hålla fukten.",                       icon: "🌾", priority: 3, growingType: "trädgård" },
  ],
  6: [
    { title: "Vattna djupt och sällan",    description: "Häll ordentligt vatten 2–3 ggr/vecka istället för lite varje dag – sporrar djupare rötter.",            icon: "💧", priority: 1 },
    { title: "Kontrollera blad efter ohyra","description":"Titta noga på bladsidan och toppskotten – bladlöss och vita flygare syns tidigt.",                    icon: "🔍", priority: 1 },
    { title: "Knipsa bort sidoskott på tomater","description":"Ta bort alla sidoskott (gynar) för att fokusera energin till frukterna.",                          icon: "✂️", priority: 1 },
    { title: "Gödsla tomaterna",           description: "Börja gödsla med kaliumrikt gödsel när de första blommorna öppnar sig.",                               icon: "🌿", priority: 2 },
    { title: "Skörda sallat och spenat",   description: "Plocka ytterblad löpande för att förlänga skördeperioden.",                                             icon: "🥬", priority: 2 },
    { title: "Directså dill och koriander","description":"Så en ny omgång var 3:e vecka för löpande skörd under sommaren.",                                      icon: "🌱", priority: 3 },
  ],
  7: [
    { title: "Vattna dagligen vid värme",  description: "I värmeperioder kan krukor behöva vattnas 1–2 ggr om dagen.",                                           icon: "☀️", priority: 1 },
    { title: "Skörda löpande",            description: "Plocka gurka, bönor och zucchini varje dag – de tar slut i produktion om de övermogas.",                 icon: "🥒", priority: 1 },
    { title: "Så höstodling",            description: "Sätt igång med höstens grödor: kål, spenat, rödbetor och pak choi kan sås nu.",                          icon: "🌱", priority: 1 },
    { title: "Stötta tomater och bönor",  description: "Bind upp rankor och se till att stöd håller inför tyngre skörd.",                                        icon: "🪢", priority: 2 },
    { title: "Toppa tomaterna",           description: "Klipp av toppskottet ovanför 4–5 klasar så energin går till att mogna frukterna.",                       icon: "✂️", priority: 2 },
    { title: "Gödsla krukor extra",       description: "Krukodlade växter behöver mer näring – gödsla var 1–2 vecka i högsäsong.",                               icon: "🌿", priority: 3, growingType: "balkong" },
  ],
  8: [
    { title: "Skörda och bevara",         description: "Tomater, gurkor och bönor är nu i full produktion – frysa, sylta eller torka det du inte äter direkt.", icon: "🍅", priority: 1 },
    { title: "Kontrollera blight på tomater","description":"Titta efter bruna fläckar på blad och stjälkar – plantskadegöraren Phytophthora sprids snabbt i fuktigt väder.", icon: "🦠", priority: 1 },
    { title: "Plantera höstlök",          description: "Plantera sättlök och vitlök för övervintring nu i augusti–september.",                                   icon: "🧅", priority: 2, growingType: "trädgård" },
    { title: "Rensa ut tömda bäddar",     description: "Ta bort avblomstrade plantor och förbered bäddarna för höstgrödor.",                                     icon: "🧹", priority: 2 },
    { title: "Direktså spenat och höstruccola","description":"Snabbväxande höstgrödor kan ge skörd ända in i november om du sår nu.",                            icon: "🥬", priority: 2 },
    { title: "Vattna kvällstid",          description: "Vattna på morgon eller kväll för att minska avdunstning och risken för svampsjukdomar.",                 icon: "🌙", priority: 3 },
  ],
  9: [
    { title: "Skörda rotfrukter",         description: "Morötter, rödbetor och jordärtskockor kan stå kvar tills det blir frost – men skörd nu ger längre hållbarhet.", icon: "🥕", priority: 1 },
    { title: "Plantera vitlök",           description: "Plantera vitlöksklyftor nu för skörd nästa sommar. Tryck ned 5 cm djupt.",                              icon: "🧄", priority: 1, growingType: "trädgård" },
    { title: "Rensa odlingsbäddar",       description: "Avlägsna döda plantor, ta bort ogräs och tillsätt kompost.",                                             icon: "🧹", priority: 1 },
    { title: "Ta in krukväxter",          description: "Flytta in pelargoner, citrus och andra frostkänsliga krukväxter när nätterna faller under +5 °C.",       icon: "🪴", priority: 2 },
    { title: "Lägg kompost på bäddarna",  description: "Täck bäddarna med ett lager kompost som skydd och näring över vintern.",                                 icon: "♻️", priority: 2 },
    { title: "Frösamla från årets grödor","description":"Låt dina bästa exemplar gå i frö och samla till nästa år.",                                             icon: "🫘", priority: 3 },
  ],
  10: [
    { title: "Gräv upp knölar",           description: "Ta upp dahlia-, canna- och jordärtskocksknölar och förvara frostfritt.",                                 icon: "🌰", priority: 1 },
    { title: "Plantera lökblommor",       description: "Tulpaner, narcisser och krokus planteras nu på hösten för vårblomning.",                                  icon: "🌷", priority: 1, growingType: "trädgård" },
    { title: "Rensa och spola redskap",   description: "Rengör verktyg, olja metalldelar och häng upp för förvaring.",                                            icon: "🔧", priority: 2 },
    { title: "Mulcha känsliga växter",    description: "Täck med halm, löv eller fiberduk för att skydda rötter och lök.",                                       icon: "🍂", priority: 2 },
    { title: "Töm och rengör krukor",     description: "Töm krukor, tvätta dem och förvara torrt för att undvika frost- och algskador.",                         icon: "🪣", priority: 3, growingType: "balkong" },
    { title: "Lägg kompost",              description: "Tillsätt ett lager kompost eller stallgödsel på vilande bäddar.",                                        icon: "♻️", priority: 3 },
  ],
  11: [
    { title: "Planera nästa säsong",      description: "Skriv ned vad som fungerade i år och vad du vill prova nästa säsong.",                                   icon: "📋", priority: 1 },
    { title: "Se över orderdokumentet",   description: "Gör en preliminär fröbeställning och kontrollera vad du redan har hemma.",                               icon: "📝", priority: 1 },
    { title: "Underhåll trädgårdshusen",  description: "Täta sprickor, kontrollera tätlister i drivbänk och växthus.",                                          icon: "🏡", priority: 2, growingType: "växthus" },
    { title: "Rensa löv från gångar",     description: "Håll stigar och avvattningsrännor fria från löv som kan bli hala.",                                      icon: "🍂", priority: 2 },
    { title: "Kontrollera övervintrade växter","description":"Pelargoner, rosmarin och citrusväxter inomhus behöver lite vatten och ljus.",                       icon: "🪴", priority: 3 },
    { title: "Bygg kompostinhägnad",      description: "November är ett bra tillfälle att bygga eller förbättra din kompostlösning.",                            icon: "♻️", priority: 3 },
  ],
  12: [
    { title: "Reflektera över säsongen",  description: "Vad gick bra? Vad vill du göra annorlunda? Skriv ned i din odlingsdagbok.",                             icon: "📔", priority: 1 },
    { title: "Beställ frökataloger",      description: "Begär hem frökataloger nu för att ha dem redo för årets planering.",                                     icon: "📚", priority: 1 },
    { title: "Skydda träd och buskar",    description: "Linda in frostömtåliga buskar och kontrollera trädens stöd.",                                            icon: "🌳", priority: 2 },
    { title: "Ge fåglarna mat",           description: "Fyll på fågelmatare – fåglarna hjälper dig med skadedjur nästa sommar.",                                 icon: "🐦", priority: 2 },
    { title: "Vila och planera",          description: "Ladda batterierna – odlingssäsongen börjar snart igen!",                                                  icon: "😴", priority: 3 },
    { title: "Ge bort odlingspresenter",  description: "Fröpaket, snygga krukor eller en odlingskurs – perfekta julklappar.",                                    icon: "🎁", priority: 3 },
  ],
};

/** Källtyper för uppgifter */
export const TASK_SOURCES = {
  system:   { label: "Säsongstips",   icon: "🌿" },
  reminder: { label: "Påminnelse",     icon: "🔔" },
  diary:    { label: "Odlingsdagbok",  icon: "📔" },
  calendar: { label: "Odlingskalender", icon: "📅" },
} as const;

export type TaskSource = keyof typeof TASK_SOURCES;
