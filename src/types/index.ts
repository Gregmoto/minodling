export type UserRole = "admin" | "moderator" | "user";

export interface Profile {
  id:              string;
  userId:          string;
  username:        string;
  fullName:        string | null;
  bio:             string | null;
  avatarUrl:       string | null;
  location:        string | null;
  role:            UserRole;
  points:          number;
  createdAt:       Date;
}

export interface PostWithAuthor {
  id:           string;
  title:        string;
  content:      string;
  category:     string | null;
  postType:     string;
  status:       string;
  likesCount:   number;
  commentsCount: number;
  createdAt:    Date;
  author:       Pick<Profile, "id" | "username" | "fullName" | "avatarUrl">;
}

export interface CommentWithAuthor {
  id:        string;
  content:   string;
  likesCount: number;
  createdAt: Date;
  updatedAt: Date;
  parentId:  string | null;
  author:    Pick<Profile, "id" | "username" | "fullName" | "avatarUrl">;
  replies?:  CommentWithAuthor[];
}

export interface NavItem {
  label: string;
  href:  string;
  icon?: string;
  badge?: string | number;
}

export interface SiteConfig {
  name:        string;
  description: string;
  url:         string;
  ogImage:     string;
}
