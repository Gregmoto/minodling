-- Lägg till "Beskärning" i ordlistan
-- Kör i Supabase SQL Editor

INSERT INTO glossary_terms (term, slug, short_description, full_description, category, related_slugs, published)
VALUES (
  'Beskärning',
  'beskarning',
  'Att ta bort grenar, skott eller blad för att forma växten, förbättra luftcirkulationen och öka skörden.',
  $content$<p>Beskärning är en av de viktigaste skötselåtgärderna i trädgården och i odlingen. Genom att medvetet ta bort delar av en växt – grenar, skott, blad eller rötter – styr man hur växten växer, ser ut och producerar.</p>

<h2>Varför beskär man?</h2>
<ul>
  <li><strong>Ökad skörd:</strong> Hos tomatplantor tas sidoskott (snyltar) bort så att plantan fokuserar sin energi på att bilda frukt istället för bladverk.</li>
  <li><strong>Bättre luftcirkulation:</strong> God luftgenomströmning minskar risken för svampsjukdomar som mjöldagg och gråmögel.</li>
  <li><strong>Formning:</strong> Fruktträd och buskar formas för att bli lättskördade och estetiskt tilltalande.</li>
  <li><strong>Föryngring:</strong> Gamla buskar (t.ex. vinbär, krusbär) revitaliseras genom kraftig beskärning.</li>
  <li><strong>Sjukdomsbekämpning:</strong> Angripna grenar klipps bort för att hindra spridning.</li>
</ul>

<h2>Olika typer av beskärning</h2>
<p><strong>Pincering</strong> – Att klippa eller nypa bort skottspetsen för att stoppa tillväxten på höjden och stimulera förgrening. Vanligt på paprika och basilika.</p>
<p><strong>Gallring</strong> – Att ta bort överskottsfrukter tidigt så att kvarvarande frukter kan växa sig stora och smakrika. Används framför allt på äpple och päron.</p>
<p><strong>Snyltersborttagning</strong> – Hos indeterminata (klättrande) tomater tas sidoskotten i bladverkets vinklar bort regelbundet för att hålla en eller två stammar.</p>
<p><strong>Vinteravkastning</strong> – Fruktträd beskärs vanligen i slutet av vintern eller tidigt på våren när trädet fortfarande är i dvala.</p>

<h2>Rätt verktyg</h2>
<ul>
  <li><strong>Sekatör</strong> – För grenar upp till ca 2 cm i diameter.</li>
  <li><strong>Grensåg</strong> – För tjockare grenar.</li>
  <li><strong>Häcksax</strong> – För formklippning av buskar och häckar.</li>
</ul>
<p>Se alltid till att verktygen är vassa och rena. Desinficera gärna med sprit mellan olika plantor för att inte sprida sjukdomar.</p>

<h2>När ska man beskära?</h2>
<p>Tidpunkten varierar beroende på växt. Som tumregel: <strong>sommarblommande buskar</strong> beskärs direkt efter blomning. <strong>Vårblommande buskar</strong> beskärs direkt efter blomning på våren. <strong>Fruktträd</strong> beskärs i slutet av februari–mars. <strong>Rosor</strong> beskärs tidigt på våren när knopparna börjar svälla.$content$,
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
