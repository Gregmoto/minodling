-- ── BANNERS ───────────────────────────────────────────────
CREATE TABLE banners (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title            TEXT NOT NULL,
    image_url        TEXT,
    link_url         TEXT NOT NULL,
    placement        TEXT NOT NULL CHECK (placement IN ('header','sidebar','feed','footer')),
    is_active        BOOLEAN NOT NULL DEFAULT true,
    clicks_count     INTEGER NOT NULL DEFAULT 0,
    impressions_count INTEGER NOT NULL DEFAULT 0,
    start_date       TIMESTAMPTZ,
    end_date         TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_banners_placement ON banners(placement, is_active);

-- ── BANNER_CLICKS ─────────────────────────────────────────
CREATE TABLE banner_clicks (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    banner_id  UUID NOT NULL REFERENCES banners(id) ON DELETE CASCADE,
    user_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_banner_clicks_banner_id ON banner_clicks(banner_id);

-- ── POINT_TRANSACTIONS ────────────────────────────────────
CREATE TABLE point_transactions (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    points         INTEGER NOT NULL,
    reason         TEXT NOT NULL,
    reference_type TEXT,
    reference_id   UUID,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_point_tx_user_id    ON point_transactions(user_id);
CREATE INDEX idx_point_tx_created_at ON point_transactions(created_at DESC);

-- ── REPORTS ───────────────────────────────────────────────
CREATE TABLE reports (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('post','comment','user','answer')),
    target_id   UUID NOT NULL,
    reason      TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','reviewed','dismissed')),
    handled_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_reports_status     ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

-- ── ADMIN_SETTINGS ────────────────────────────────────────
CREATE TABLE admin_settings (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key        TEXT NOT NULL UNIQUE,
    value      TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── SEO_SETTINGS ──────────────────────────────────────────
CREATE TABLE seo_settings (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_type        TEXT NOT NULL,
    page_id          UUID,
    meta_title       TEXT,
    meta_description TEXT,
    og_image         TEXT,
    canonical_url    TEXT,
    noindex          BOOLEAN NOT NULL DEFAULT false,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(page_type, page_id)
);

-- ── PREMIUM_FEATURES ──────────────────────────────────────
CREATE TABLE premium_features (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    slug        TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Startdata för admin_settings
INSERT INTO admin_settings (key, value) VALUES
    ('site_name',          'Minodling'),
    ('site_description',   'Sveriges odlingscommunity'),
    ('points_per_post',    '10'),
    ('points_per_comment', '2'),
    ('points_per_answer',  '5'),
    ('points_per_like',    '1');
