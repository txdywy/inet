export type Category =
  | "core"
  | "client"
  | "router"
  | "protocol"
  | "dns_rules"
  | "security"
  | "ecosystem"
  | "trend";

export type Platform =
  | "ios"
  | "android"
  | "macos"
  | "windows"
  | "linux"
  | "openwrt"
  | "router"
  | "web";

export type SourceType =
  | "github_release"
  | "github_commit"
  | "github_issue"
  | "github_pr"
  | "rss"
  | "web"
  | "manual";

export type Importance = 1 | 2 | 3 | 4 | 5;

export interface RadarItem {
  id: string;
  title: string;
  summary: string;
  rawTitle: string;
  rawBody?: string;
  sourceType: SourceType;
  sourceName: string;
  sourceUrl: string;
  project?: string;
  repo?: string;
  slug?: string;
  version?: string;
  category: Category;
  tags: string[];
  platforms: Platform[];
  importance: Importance;
  confidence: number;
  isBreaking: boolean;
  isSecurityRelated: boolean;
  isProtocolRelated: boolean;
  publishedAt: string;
  fetchedAt: string;
  firstSeenAt: string;
  updatedAt: string;
  hash: string;
}

export interface ProjectMeta {
  slug: string;
  name: string;
  repo: string;
  description: string;
  homepage?: string;
  category: Category;
  platforms: Platform[];
  tags: string[];
}

export interface ProtocolMeta {
  slug: string;
  name: string;
  description: string;
  relatedProjects: string[];
  tags: string[];
  status: "active" | "experimental" | "deprecated";
}

export interface TagIndex {
  tag: string;
  count: number;
  category?: Category;
}

export interface Stats {
  totalItems: number;
  last24h: number;
  last7d: number;
  byCategory: Record<Category, number>;
  topProjects: Array<{ project: string; count: number }>;
  hotTags: Array<{ tag: string; count: number }>;
  importantCount: number;
  breakingCount: number;
  securityCount: number;
  updatedAt: string;
}
