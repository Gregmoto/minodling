-- ============================================================
-- STEG 1: Tabeller & index
-- ============================================================

-- Enums
CREATE TYPE "Role" AS ENUM ('USER', 'MODERATOR', 'ADMIN');
CREATE TYPE "MembershipTier" AS ENUM ('FREE', 'PREMIUM');
CREATE TYPE "PostType" AS ENUM ('DISCUSSION', 'TIP', 'QUESTION', 'HARVEST', 'SHOWCASE');
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'PINNED', 'LOCKED', 'REMOVED');
CREATE TYPE "NotificationType" AS ENUM ('COMMENT', 'LIKE', 'BADGE', 'SYSTEM', 'MENTION');
CREATE TYPE "AdPlacement" AS ENUM ('HEADER', 'SIDEBAR', 'FEED', 'FOOTER');

-- Profiler
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "location" TEXT,
    "website" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "membershipTier" "MembershipTier" NOT NULL DEFAULT 'FREE',
    "points" INTEGER NOT NULL DEFAULT 0,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "bannedAt" TIMESTAMP(3),
    "bannedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");
CREATE UNIQUE INDEX "profiles_username_key" ON "profiles"("username");
CREATE INDEX "profiles_userId_idx" ON "profiles"("userId");
CREATE INDEX "profiles_username_idx" ON "profiles"("username");

-- Kategorier
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#4A7C59',
    "iconName" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- Taggar
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- Inlägg
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "coverImage" TEXT,
    "type" "PostType" NOT NULL DEFAULT 'DISCUSSION',
    "status" "PostStatus" NOT NULL DEFAULT 'PUBLISHED',
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    "authorId" TEXT NOT NULL,
    "categoryId" TEXT,
    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "posts_slug_key" ON "posts"("slug");
CREATE INDEX "posts_authorId_idx" ON "posts"("authorId");
CREATE INDEX "posts_categoryId_idx" ON "posts"("categoryId");
CREATE INDEX "posts_slug_idx" ON "posts"("slug");
CREATE INDEX "posts_status_idx" ON "posts"("status");
CREATE INDEX "posts_createdAt_idx" ON "posts"("createdAt");

-- Inlägg-taggar
CREATE TABLE "post_tags" (
    "postId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    CONSTRAINT "post_tags_pkey" PRIMARY KEY ("postId","tagId")
);

-- Inläggsbilder
CREATE TABLE "post_images" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "post_images_pkey" PRIMARY KEY ("id")
);

-- Kommentarer
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isRemoved" BOOLEAN NOT NULL DEFAULT false,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "parentId" TEXT,
    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "comments_postId_idx" ON "comments"("postId");
CREATE INDEX "comments_authorId_idx" ON "comments"("authorId");

-- Gillanden
CREATE TABLE "likes" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "profileId" TEXT NOT NULL,
    "postId" TEXT,
    "commentId" TEXT,
    CONSTRAINT "likes_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "likes_profileId_postId_key" ON "likes"("profileId", "postId");
CREATE UNIQUE INDEX "likes_profileId_commentId_key" ON "likes"("profileId", "commentId");

-- Sparade inlägg
CREATE TABLE "saved_posts" (
    "profileId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "saved_posts_pkey" PRIMARY KEY ("profileId","postId")
);

-- Odlingar
CREATE TABLE "gardens" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "coverImage" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "profileId" TEXT NOT NULL,
    CONSTRAINT "gardens_pkey" PRIMARY KEY ("id")
);

-- Växter
CREATE TABLE "garden_plants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "variety" TEXT,
    "sowedAt" TIMESTAMP(3),
    "plantedAt" TIMESTAMP(3),
    "harvestedAt" TIMESTAMP(3),
    "notes" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gardenId" TEXT NOT NULL,
    CONSTRAINT "garden_plants_pkey" PRIMARY KEY ("id")
);

-- Odlingslogg
CREATE TABLE "garden_logs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "imageUrl" TEXT,
    "logDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gardenId" TEXT NOT NULL,
    CONSTRAINT "garden_logs_pkey" PRIMARY KEY ("id")
);

-- Badges
CREATE TABLE "badges" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconUrl" TEXT,
    "color" TEXT NOT NULL DEFAULT '#4A7C59',
    "pointsReward" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "badges_name_key" ON "badges"("name");

-- Användarbadges
CREATE TABLE "user_badges" (
    "profileId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("profileId","badgeId")
);

-- Kuponger
CREATE TABLE "coupons" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discountType" TEXT NOT NULL DEFAULT 'PERCENT',
    "discountValue" DOUBLE PRECISION NOT NULL,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");

-- Användarkuponger
CREATE TABLE "user_coupons" (
    "profileId" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_coupons_pkey" PRIMARY KEY ("profileId","couponId")
);

-- Notifikationer
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "profileId" TEXT NOT NULL,
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "notifications_profileId_isRead_idx" ON "notifications"("profileId", "isRead");

-- Annonser
CREATE TABLE "advertisements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT,
    "linkUrl" TEXT NOT NULL,
    "placement" "AdPlacement" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPremiumOnly" BOOLEAN NOT NULL DEFAULT false,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "advertisements_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "advertisements_placement_isActive_idx" ON "advertisements"("placement", "isActive");

-- ============================================================
-- STEG 2: Foreign keys
-- ============================================================

ALTER TABLE "posts" ADD CONSTRAINT "posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "posts" ADD CONSTRAINT "posts_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "post_images" ADD CONSTRAINT "post_images_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "comments" ADD CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "comments" ADD CONSTRAINT "comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "comments" ADD CONSTRAINT "comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "likes" ADD CONSTRAINT "likes_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "likes" ADD CONSTRAINT "likes_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "likes" ADD CONSTRAINT "likes_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "saved_posts" ADD CONSTRAINT "saved_posts_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "saved_posts" ADD CONSTRAINT "saved_posts_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "gardens" ADD CONSTRAINT "gardens_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "garden_plants" ADD CONSTRAINT "garden_plants_gardenId_fkey" FOREIGN KEY ("gardenId") REFERENCES "gardens"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "garden_logs" ADD CONSTRAINT "garden_logs_gardenId_fkey" FOREIGN KEY ("gardenId") REFERENCES "gardens"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_coupons" ADD CONSTRAINT "user_coupons_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_coupons" ADD CONSTRAINT "user_coupons_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "coupons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================
-- STEG 3: Profil-trigger (auto-skapar profil vid registrering)
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 0;
BEGIN
  base_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );
  base_username := lower(regexp_replace(base_username, '[^a-zA-Z0-9_-]', '', 'g'));
  base_username := left(base_username, 28);
  IF length(base_username) < 3 THEN
    base_username := 'odlare' || floor(random() * 9000 + 1000)::text;
  END IF;
  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter::text;
  END LOOP;
  INSERT INTO public.profiles ("id", "userId", "username", "displayName", "updatedAt")
  VALUES (
    gen_random_uuid()::text,
    NEW.id::text,
    final_username,
    COALESCE(NEW.raw_user_meta_data->>'display_name', final_username),
    NOW()
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- STEG 4: RLS-policies
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gardens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garden_plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garden_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiler är publikt läsbara" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Användare uppdaterar sin egen profil" ON public.profiles FOR UPDATE USING (auth.uid()::text = "userId");
CREATE POLICY "Publicerade inlägg är synliga" ON public.posts FOR SELECT USING (status IN ('PUBLISHED', 'PINNED'));
CREATE POLICY "Inloggade kan skapa inlägg" ON public.posts FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE "userId" = auth.uid()::text AND "isBanned" = false));
CREATE POLICY "Författare kan uppdatera sina inlägg" ON public.posts FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE "userId" = auth.uid()::text AND id = "authorId"));
CREATE POLICY "Kommentarer är publikt synliga" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Inloggade kan kommentera" ON public.comments FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE "userId" = auth.uid()::text AND "isBanned" = false));
CREATE POLICY "Alla kan se gillanden" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Inloggade kan gilla" ON public.likes FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE "userId" = auth.uid()::text));
CREATE POLICY "Publika odlingar syns för alla" ON public.gardens FOR SELECT USING ("isPublic" = true OR EXISTS (SELECT 1 FROM public.profiles WHERE "userId" = auth.uid()::text AND id = "profileId"));
CREATE POLICY "Användare hanterar sina odlingar" ON public.gardens FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE "userId" = auth.uid()::text AND id = "profileId"));
CREATE POLICY "Egna notifikationer" ON public.notifications FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE "userId" = auth.uid()::text AND id = "profileId"));

-- ============================================================
-- STEG 5: Seed-data (kategorier & badges)
-- ============================================================

INSERT INTO "categories" ("id", "name", "slug", "description", "color", "sortOrder") VALUES
  (gen_random_uuid()::text, 'Grönsaker',    'gronsaker',  'Tomater, gurkor, paprika, morötter och mer', '#4A7C59', 1),
  (gen_random_uuid()::text, 'Frukt & bär',  'frukt-bar',  'Jordgubbar, hallon, äpplen och bär',         '#E85D75', 2),
  (gen_random_uuid()::text, 'Örter',        'orter',      'Basilika, persilja, mynta och kryddörter',   '#7FB069', 3),
  (gen_random_uuid()::text, 'Blommor',      'blommor',    'Sommarblommor, perenner och prydnadsväxter', '#C77DFF', 4),
  (gen_random_uuid()::text, 'Kompost & jord','kompost',   'Jordens kemi, kompostering och gödning',     '#8B6F47', 5),
  (gen_random_uuid()::text, 'Växthuset',    'vaxthuSet',  'Odling i växthus och tunnlar',               '#2D9CDB', 6),
  (gen_random_uuid()::text, 'Nybörjare',    'nybörjare',  'Kom igång med odling – tips för nybörjare',  '#F7B731', 7);

INSERT INTO "badges" ("id", "name", "description", "color", "pointsReward") VALUES
  (gen_random_uuid()::text, 'Välkommen',       'Skapade ett konto på Minodling',   '#2D9CDB', 10),
  (gen_random_uuid()::text, 'Första grödan',   'Delade sin första skörd',           '#4A7C59', 50),
  (gen_random_uuid()::text, 'Odlingsveteran',  '100 inlägg i forumet',              '#F7B731', 200),
  (gen_random_uuid()::text, 'Kompostmästare',  'Expert på kompostering',            '#8B6F47', 100);
