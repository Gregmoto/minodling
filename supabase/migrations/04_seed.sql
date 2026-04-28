INSERT INTO categories (id, name, slug, description, color, "sortOrder") VALUES
  (gen_random_uuid()::text, 'Gronsaker',   'gronsaker',  'Tomater, gurkor, paprika, morotter och mer', '#4A7C59', 1),
  (gen_random_uuid()::text, 'Frukt & bar', 'frukt-bar',  'Jordgubbar, hallon, applen och bar',         '#E85D75', 2),
  (gen_random_uuid()::text, 'Orter',       'orter',      'Basilika, persilja, mynta och kryddorter',   '#7FB069', 3),
  (gen_random_uuid()::text, 'Blommor',     'blommor',    'Sommarblommor, perenner och prydnadsvaxter', '#C77DFF', 4),
  (gen_random_uuid()::text, 'Kompost',     'kompost',    'Jordens kemi, kompostering och godning',     '#8B6F47', 5),
  (gen_random_uuid()::text, 'Vaxthusets',  'vaxthuSet',  'Odling i vaxthuS och tunnlar',              '#2D9CDB', 6),
  (gen_random_uuid()::text, 'Nybörjare',   'nybojare',   'Kom igang med odling, tips for nybojare',   '#F7B731', 7);

INSERT INTO badges (id, name, description, color, "pointsReward") VALUES
  (gen_random_uuid()::text, 'Valkommen',      'Skapade ett konto pa Minodling', '#2D9CDB', 10),
  (gen_random_uuid()::text, 'Forsta grodan',  'Delade sin forsta skoerd',       '#4A7C59', 50),
  (gen_random_uuid()::text, 'Odlingsveteran', '100 inlagg i forumet',           '#F7B731', 200),
  (gen_random_uuid()::text, 'Kompostmastare', 'Expert pa kompostering',         '#8B6F47', 100);
