-- ── QUESTIONS ─────────────────────────────────────────────
CREATE TABLE questions (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title          TEXT NOT NULL,
    content        TEXT NOT NULL,
    image_url      TEXT,
    category       TEXT,
    status         TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','answered','closed','removed')),
    views_count    INTEGER NOT NULL DEFAULT 0,
    answers_count  INTEGER NOT NULL DEFAULT 0,
    best_answer_id UUID,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_questions_user_id    ON questions(user_id);
CREATE INDEX idx_questions_status     ON questions(status);
CREATE INDEX idx_questions_created_at ON questions(created_at DESC);

-- ── ANSWERS ───────────────────────────────────────────────
CREATE TABLE answers (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id    UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    user_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content        TEXT NOT NULL,
    image_url      TEXT,
    likes_count    INTEGER NOT NULL DEFAULT 0,
    is_best_answer BOOLEAN NOT NULL DEFAULT false,
    status         TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published','removed')),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_answers_question_id ON answers(question_id);
ALTER TABLE questions ADD CONSTRAINT fk_best_answer FOREIGN KEY (best_answer_id) REFERENCES answers(id) ON DELETE SET NULL;

-- ── GROUPS ────────────────────────────────────────────────
CREATE TABLE groups (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    slug        TEXT NOT NULL UNIQUE,
    description TEXT,
    location    TEXT,
    group_type  TEXT NOT NULL DEFAULT 'public' CHECK (group_type IN ('public','private','local')),
    image_url   TEXT,
    created_by  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_groups_slug ON groups(slug);

-- ── GROUP_MEMBERS ─────────────────────────────────────────
CREATE TABLE group_members (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id   UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role       TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner','admin','member')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id  ON group_members(user_id);

-- ── SEED_EXCHANGES ────────────────────────────────────────
CREATE TABLE seed_exchanges (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title         TEXT NOT NULL,
    description   TEXT,
    exchange_type TEXT NOT NULL DEFAULT 'trade' CHECK (exchange_type IN ('trade','give','want')),
    category      TEXT,
    location      TEXT,
    image_url     TEXT,
    status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','cancelled')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_seed_exchanges_user_id    ON seed_exchanges(user_id);
CREATE INDEX idx_seed_exchanges_created_at ON seed_exchanges(created_at DESC);

-- ── CHALLENGES ────────────────────────────────────────────
CREATE TABLE challenges (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title       TEXT NOT NULL,
    slug        TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url   TEXT,
    start_date  TIMESTAMPTZ,
    end_date    TIMESTAMPTZ,
    status      TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming','active','ended')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_challenges_slug   ON challenges(slug);
CREATE INDEX idx_challenges_status ON challenges(status);

-- ── CHALLENGE_PARTICIPANTS ────────────────────────────────
CREATE TABLE challenge_participants (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(challenge_id, user_id)
);
