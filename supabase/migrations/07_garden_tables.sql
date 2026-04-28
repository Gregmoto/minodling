-- ── PLANTS ────────────────────────────────────────────────
CREATE TABLE plants (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name             TEXT NOT NULL,
    slug             TEXT NOT NULL UNIQUE,
    latin_name       TEXT,
    image_url        TEXT,
    difficulty_level TEXT CHECK (difficulty_level IN ('easy','medium','hard')),
    sowing_period    TEXT,
    planting_period  TEXT,
    harvest_period   TEXT,
    sun_requirement  TEXT CHECK (sun_requirement IN ('full_sun','partial_shade','shade')),
    watering_needs   TEXT CHECK (watering_needs IN ('low','medium','high')),
    soil_type        TEXT,
    fertilizer_needs TEXT,
    common_problems  TEXT,
    description      TEXT,
    seo_title        TEXT,
    seo_description  TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_plants_slug ON plants(slug);

-- ── PLANT_TIPS ────────────────────────────────────────────
CREATE TABLE plant_tips (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plant_id   UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
    user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content    TEXT NOT NULL,
    status     TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published','pending','removed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_plant_tips_plant_id ON plant_tips(plant_id);

-- ── GARDEN_CALENDAR ───────────────────────────────────────
CREATE TABLE garden_calendar (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title             TEXT NOT NULL,
    slug              TEXT NOT NULL UNIQUE,
    month             INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    category          TEXT,
    description       TEXT,
    task_type         TEXT,
    growing_zone      TEXT,
    is_user_suggested BOOLEAN NOT NULL DEFAULT false,
    suggested_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status            TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published','draft','pending')),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_garden_calendar_month ON garden_calendar(month);
CREATE INDEX idx_garden_calendar_slug  ON garden_calendar(slug);

-- ── GARDEN_DIARY ──────────────────────────────────────────
CREATE TABLE garden_diary (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    plant_id          UUID REFERENCES plants(id) ON DELETE SET NULL,
    custom_plant_name TEXT,
    title             TEXT NOT NULL,
    notes             TEXT,
    image_url         TEXT,
    sowing_date       DATE,
    planting_date     DATE,
    harvest_date      DATE,
    status            TEXT NOT NULL DEFAULT 'growing' CHECK (status IN ('growing','harvested','failed','dormant')),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_garden_diary_user_id    ON garden_diary(user_id);
CREATE INDEX idx_garden_diary_plant_id   ON garden_diary(plant_id);
CREATE INDEX idx_garden_diary_created_at ON garden_diary(created_at DESC);

-- ── REMINDERS ─────────────────────────────────────────────
CREATE TABLE reminders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    diary_id        UUID REFERENCES garden_diary(id) ON DELETE CASCADE,
    plant_id        UUID REFERENCES plants(id) ON DELETE SET NULL,
    reminder_type   TEXT NOT NULL CHECK (reminder_type IN ('watering','fertilizing','harvesting','sowing','other')),
    title           TEXT NOT NULL,
    description     TEXT,
    due_date        TIMESTAMPTZ NOT NULL,
    repeat_interval TEXT CHECK (repeat_interval IN ('daily','weekly','monthly','none')),
    is_completed    BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_reminders_user_id  ON reminders(user_id);
CREATE INDEX idx_reminders_due_date ON reminders(due_date);
