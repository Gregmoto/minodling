-- ── GUIDES ────────────────────────────────────────────────
CREATE TABLE guides (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           TEXT NOT NULL,
    slug            TEXT NOT NULL UNIQUE,
    excerpt         TEXT,
    content         TEXT,
    image_url       TEXT,
    category        TEXT,
    difficulty_level TEXT CHECK (difficulty_level IN ('easy','medium','hard')),
    seo_title       TEXT,
    seo_description TEXT,
    published       BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_guides_slug      ON guides(slug);
CREATE INDEX idx_guides_published ON guides(published);
CREATE INDEX idx_guides_category  ON guides(category);

-- ── KNOWLEDGE_ARTICLES ────────────────────────────────────
CREATE TABLE knowledge_articles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           TEXT NOT NULL,
    slug            TEXT NOT NULL UNIQUE,
    excerpt         TEXT,
    content         TEXT,
    category        TEXT,
    image_url       TEXT,
    seo_title       TEXT,
    seo_description TEXT,
    published       BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_knowledge_slug      ON knowledge_articles(slug);
CREATE INDEX idx_knowledge_published ON knowledge_articles(published);
CREATE INDEX idx_knowledge_category  ON knowledge_articles(category);

-- ── GLOSSARY_TERMS ────────────────────────────────────────
CREATE TABLE glossary_terms (
    id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    term              TEXT NOT NULL,
    slug              TEXT NOT NULL UNIQUE,
    short_description TEXT,
    full_description  TEXT,
    image_url         TEXT,
    category          TEXT,
    related_guide_ids UUID[],
    seo_title         TEXT,
    seo_description   TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_glossary_slug     ON glossary_terms(slug);
CREATE INDEX idx_glossary_category ON glossary_terms(category);
