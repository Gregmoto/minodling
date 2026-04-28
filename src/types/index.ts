import type { Role, MembershipTier, PostType, PostStatus, NotificationType, AdPlacement } from "@prisma/client";

export type { Role, MembershipTier, PostType, PostStatus, NotificationType, AdPlacement };

export interface Profile {
  id: string;
  userId: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  location: string | null;
  website: string | null;
  role: Role;
  membershipTier: MembershipTier;
  points: number;
  isVerified: boolean;
  isBanned: boolean;
  createdAt: Date;
}

export interface PostWithAuthor {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  type: PostType;
  status: PostStatus;
  isPremium: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: Date;
  author: Pick<Profile, "id" | "username" | "displayName" | "avatarUrl" | "isVerified">;
  category: { id: string; name: string; slug: string; color: string } | null;
  tags: { tag: { id: string; name: string; slug: string } }[];
}

export interface CommentWithAuthor {
  id: string;
  content: string;
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
  isRemoved: boolean;
  parentId: string | null;
  author: Pick<Profile, "id" | "username" | "displayName" | "avatarUrl">;
  replies?: CommentWithAuthor[];
}

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  badge?: string | number;
}

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  ogImage: string;
}
