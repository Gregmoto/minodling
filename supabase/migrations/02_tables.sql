CREATE TABLE profiles (
    id TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    "displayName" TEXT,
    bio TEXT,
    "avatarUrl" TEXT,
    location TEXT,
    website TEXT,
    role "Role" NOT NULL DEFAULT 'USER',
    "membershipTier" "MembershipTier" NOT NULL DEFAULT 'FREE',
    points INTEGER NOT NULL DEFAULT 0,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "bannedAt" TIMESTAMP,
    "bannedReason" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX profiles_userId_idx ON profiles("userId");
CREATE INDEX profiles_username_idx ON profiles(username);

CREATE TABLE categories (
    id TEXT NOT NULL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT NOT NULL DEFAULT '#4A7C59',
    "iconName" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE tags (
    id TEXT NOT NULL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE
);

CREATE TABLE posts (
    id TEXT NOT NULL PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,
    "coverImage" TEXT,
    type "PostType" NOT NULL DEFAULT 'DISCUSSION',
    status "PostStatus" NOT NULL DEFAULT 'PUBLISHED',
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "publishedAt" TIMESTAMP,
    "authorId" TEXT NOT NULL,
    "categoryId" TEXT
);
CREATE INDEX posts_authorId_idx ON posts("authorId");
CREATE INDEX posts_categoryId_idx ON posts("categoryId");
CREATE INDEX posts_slug_idx ON posts(slug);
CREATE INDEX posts_status_idx ON posts(status);
CREATE INDEX posts_createdAt_idx ON posts("createdAt");

CREATE TABLE post_tags (
    "postId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    PRIMARY KEY ("postId", "tagId")
);

CREATE TABLE post_images (
    id TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    url TEXT NOT NULL,
    "altText" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE comments (
    id TEXT NOT NULL PRIMARY KEY,
    content TEXT NOT NULL,
    "isRemoved" BOOLEAN NOT NULL DEFAULT false,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "authorId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "parentId" TEXT
);
CREATE INDEX comments_postId_idx ON comments("postId");
CREATE INDEX comments_authorId_idx ON comments("authorId");

CREATE TABLE likes (
    id TEXT NOT NULL PRIMARY KEY,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "profileId" TEXT NOT NULL,
    "postId" TEXT,
    "commentId" TEXT,
    UNIQUE ("profileId", "postId"),
    UNIQUE ("profileId", "commentId")
);

CREATE TABLE saved_posts (
    "profileId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY ("profileId", "postId")
);

CREATE TABLE gardens (
    id TEXT NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    "coverImage" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "profileId" TEXT NOT NULL
);

CREATE TABLE garden_plants (
    id TEXT NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    variety TEXT,
    "sowedAt" TIMESTAMP,
    "plantedAt" TIMESTAMP,
    "harvestedAt" TIMESTAMP,
    notes TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "gardenId" TEXT NOT NULL
);

CREATE TABLE garden_logs (
    id TEXT NOT NULL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    "imageUrl" TEXT,
    "logDate" TIMESTAMP NOT NULL DEFAULT NOW(),
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "gardenId" TEXT NOT NULL
);

CREATE TABLE badges (
    id TEXT NOT NULL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    "iconUrl" TEXT,
    color TEXT NOT NULL DEFAULT '#4A7C59',
    "pointsReward" INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE user_badges (
    "profileId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY ("profileId", "badgeId")
);

CREATE TABLE coupons (
    id TEXT NOT NULL PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    "discountType" TEXT NOT NULL DEFAULT 'PERCENT',
    "discountValue" DOUBLE PRECISION NOT NULL,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE user_coupons (
    "profileId" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "usedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY ("profileId", "couponId")
);

CREATE TABLE notifications (
    id TEXT NOT NULL PRIMARY KEY,
    type "NotificationType" NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "profileId" TEXT NOT NULL
);
CREATE INDEX notifications_profileId_isRead_idx ON notifications("profileId", "isRead");

CREATE TABLE advertisements (
    id TEXT NOT NULL PRIMARY KEY,
    title TEXT NOT NULL,
    "imageUrl" TEXT,
    "linkUrl" TEXT NOT NULL,
    placement "AdPlacement" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPremiumOnly" BOOLEAN NOT NULL DEFAULT false,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP,
    "endsAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX advertisements_placement_isActive_idx ON advertisements(placement, "isActive");

ALTER TABLE posts ADD FOREIGN KEY ("authorId") REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE posts ADD FOREIGN KEY ("categoryId") REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE post_tags ADD FOREIGN KEY ("postId") REFERENCES posts(id) ON DELETE CASCADE;
ALTER TABLE post_tags ADD FOREIGN KEY ("tagId") REFERENCES tags(id) ON DELETE CASCADE;
ALTER TABLE post_images ADD FOREIGN KEY ("postId") REFERENCES posts(id) ON DELETE CASCADE;
ALTER TABLE comments ADD FOREIGN KEY ("authorId") REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE comments ADD FOREIGN KEY ("postId") REFERENCES posts(id) ON DELETE CASCADE;
ALTER TABLE comments ADD FOREIGN KEY ("parentId") REFERENCES comments(id) ON DELETE SET NULL;
ALTER TABLE likes ADD FOREIGN KEY ("profileId") REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE likes ADD FOREIGN KEY ("postId") REFERENCES posts(id) ON DELETE CASCADE;
ALTER TABLE likes ADD FOREIGN KEY ("commentId") REFERENCES comments(id) ON DELETE CASCADE;
ALTER TABLE saved_posts ADD FOREIGN KEY ("profileId") REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE saved_posts ADD FOREIGN KEY ("postId") REFERENCES posts(id) ON DELETE CASCADE;
ALTER TABLE gardens ADD FOREIGN KEY ("profileId") REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE garden_plants ADD FOREIGN KEY ("gardenId") REFERENCES gardens(id) ON DELETE CASCADE;
ALTER TABLE garden_logs ADD FOREIGN KEY ("gardenId") REFERENCES gardens(id) ON DELETE CASCADE;
ALTER TABLE user_badges ADD FOREIGN KEY ("profileId") REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE user_badges ADD FOREIGN KEY ("badgeId") REFERENCES badges(id) ON DELETE CASCADE;
ALTER TABLE user_coupons ADD FOREIGN KEY ("profileId") REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE user_coupons ADD FOREIGN KEY ("couponId") REFERENCES coupons(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD FOREIGN KEY ("profileId") REFERENCES profiles(id) ON DELETE CASCADE;
