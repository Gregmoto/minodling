-- Publicera alla guider som är avpublicerade
UPDATE guides SET published = true WHERE published = false;

-- Publicera alla kunskapsbank-artiklar som är avpublicerade
UPDATE knowledge_articles SET published = true WHERE published = false;

-- Publicera alla ordlistetermer som är avpublicerade
UPDATE glossary_terms SET published = true WHERE published = false;

-- Kontrollera resultatet
SELECT 'guides' AS tabell, COUNT(*) AS totalt, SUM(CASE WHEN published THEN 1 ELSE 0 END) AS publicerade FROM guides
UNION ALL
SELECT 'knowledge_articles', COUNT(*), SUM(CASE WHEN published THEN 1 ELSE 0 END) FROM knowledge_articles
UNION ALL
SELECT 'glossary_terms', COUNT(*), SUM(CASE WHEN published THEN 1 ELSE 0 END) FROM glossary_terms;
