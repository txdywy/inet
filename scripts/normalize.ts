import { createHash } from "node:crypto";
import type { RadarItem } from "../types/radar.js";

interface RawItem {
  sourceType: string;
  sourceName: string;
  sourceUrl: string;
  project: string;
  repo: string;
  title: string;
  rawTitle: string;
  rawBody: string;
  version: string;
  publishedAt: string;
  fetchedAt: string;
  isPrerelease?: boolean;
}

export function generateHash(item: RawItem): string {
  const content = `${item.sourceUrl}|${item.rawTitle}|${item.publishedAt}|${(item.rawBody || "").slice(0, 200)}`;
  return createHash("sha256").update(content).digest("hex").slice(0, 16);
}

export function normalizeItem(raw: RawItem, overrides: Partial<RadarItem> = {}): RadarItem {
  const hash = generateHash(raw);
  const now = new Date().toISOString();

  return {
    id: hash,
    title: overrides.title || raw.title,
    summary: overrides.summary || raw.rawTitle,
    analysis: overrides.analysis,
    rawTitle: raw.rawTitle,
    rawBody: raw.rawBody,
    sourceType: raw.sourceType as RadarItem["sourceType"],
    sourceName: raw.sourceName,
    sourceUrl: raw.sourceUrl,
    project: raw.project,
    repo: raw.repo,
    slug: raw.project.toLowerCase(),
    version: raw.version,
    category: overrides.category || "ecosystem",
    tags: overrides.tags || [],
    platforms: overrides.platforms || [],
    importance: overrides.importance || 3,
    confidence: overrides.confidence || 0.5,
    isBreaking: overrides.isBreaking ?? false,
    isSecurityRelated: overrides.isSecurityRelated ?? false,
    isProtocolRelated: overrides.isProtocolRelated ?? false,
    publishedAt: raw.publishedAt,
    fetchedAt: raw.fetchedAt,
    firstSeenAt: overrides.firstSeenAt || now,
    updatedAt: now,
    hash,
  };
}
