-- ── PROFILES ──────────────────────────────────────────────
CREATE TABLE profiles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email           TEXT,
    username        TEXT NOT NULL UNIQUE,
    full_name       TEXT,
    avatar_url      TEXT,
    bio             TEXT,
    location        TEXT,
    growing_zone    TEXT,
    growing_type    TEXT,
    experience_level TEXT CHECK (experience_level IN ('beginner','intermediate','advanced')),
    role            TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin','moderator','user')),
    points          INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_profiles_user_id   ON profiles(user_id);
CREATE INDEX idx_profiles_username  ON profiles(username);
CREATE INDEX idx_profiles_role      ON profiles(role);

-- ── MODERATOR_PERMISSIONS ─────────────────────────────────
CREATE TABLE moderator_permissions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    can_moderate_posts    BOOLEAN NOT NULL DEFAULT false,
    can_moderate_comments BOOLEAN NOT NULL DEFAULT false,
    can_ban_users         BOOLEAN NOT NULL DEFAULT false,
    can_manage_reports    BOOLEAN NOT NULL DEFAULT false,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── POSTS ─────────────────────────────────────────────────
CREATE TABLE posts (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title          TEXT NOT NULL,
    content        TEXT NOT NULL,
    image_url      TEXT,
    category       TEXT,
    post_type      TEXT NOT NULL DEFAULT 'discussion' CHECK (post_type IN ('discussion','tip','question','harvest','showcase')),
    likes_count    INTEGER NOT NULL DEFAULT 0,
    comments_count INTEGER NOT NULL DEFAULT 0,
    is_featured    BOOLEAN NOT NULL DEFAULT false,
    status         TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft','published','pinned','locked','removed')),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_posts_user_id    ON posts(user_id);
CREATE INDEX idx_posts_category   ON posts(category);
CREATE INDEX idx_posts_status     ON posts(status);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);

-- ── POST_COMMENTS ─────────────────────────────────────────
CREATE TABLE post_comments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id     UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content     TEXT NOT NULL,
    parent_id   UUID REFERENCES post_comments(id) ON DELETE CASCADE,
    likes_count INTEGER NOT NULL DEFAULT 0,
    status      TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published','removed')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX idx_post_comments_user_id ON post_comments(user_id);

-- ── POST_LIKES ────────────────────────────────────────────
CREATE TABLE post_likes (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- ── SAVED_POSTS ───────────────────────────────────────────
CREATE TABLE saved_posts (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- ── FOLLOWS ───────────────────────────────────────────────
CREATE TABLE follows (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);
CREATE INDEX idx_follows_follower  ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
