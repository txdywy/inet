import type { Category, Importance, Platform } from "../types/radar.js";
import { GITHUB_REPOS, KEYWORDS } from "./sources.js";

interface RuleClassifyInput {
  title: string;
  body?: string;
  repo?: string;
  sourceType: string;
}

interface RuleClassifyOutput {
  category: Category;
  tags: string[];
  platforms: Platform[];
  importance: Importance;
  isBreaking: boolean;
  isSecurityRelated: boolean;
  isProtocolRelated: boolean;
  confidence: number;
}

const CATEGORY_BY_REPO = new Map<string, Category>();
for (const src of GITHUB_REPOS) {
  CATEGORY_BY_REPO.set(`${src.owner}/${src.repo}`, src.category);
}

const PLATFORMS_BY_REPO = new Map<string, Platform[]>();
for (const src of GITHUB_REPOS) {
  PLATFORMS_BY_REPO.set(`${src.owner}/${src.repo}`, src.platforms);
}

const TAGS_BY_REPO = new Map<string, string[]>();
for (const src of GITHUB_REPOS) {
  TAGS_BY_REPO.set(`${src.owner}/${src.repo}`, src.tags);
}

function matchKeywords(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw.toLowerCase()));
}

function extractMatchedKeywords(text: string, keywords: string[]): string[] {
  const lower = text.toLowerCase();
  return keywords.filter((kw) => lower.includes(kw.toLowerCase()));
}

export function ruleClassify(input: RuleClassifyInput): RuleClassifyOutput {
  const text = `${input.title} ${input.body || ""}`;
  const repoKey = input.repo || "";

  // Category from repo mapping
  let category: Category = CATEGORY_BY_REPO.get(repoKey) || "ecosystem";
  const platforms = PLATFORMS_BY_REPO.get(repoKey) || [];
  const repoTags = TAGS_BY_REPO.get(repoKey) || [];

  // Protocol detection
  const isProtocolRelated = matchKeywords(text, KEYWORDS.protocol);
  const protocolTags = extractMatchedKeywords(text, KEYWORDS.protocol);
  if (isProtocolRelated && category !== "protocol") {
    // Promote to protocol if title is primarily about a protocol
    const titleLower = input.title.toLowerCase();
    const isTitleProtocol = KEYWORDS.protocol.some(
      (kw) => titleLower.includes(kw.toLowerCase()) && !titleLower.includes("release")
    );
    if (isTitleProtocol) {
      category = "protocol";
    }
  }

  // Security detection
  const isSecurityRelated = matchKeywords(text, KEYWORDS.security);
  if (isSecurityRelated) {
    category = "security";
  }

  // Breaking change detection
  const isBreaking = matchKeywords(text, KEYWORDS.breaking);

  // Noise detection
  const isNoise = matchKeywords(text, KEYWORDS.noise);

  // Tags
  const tags = [...new Set([...repoTags, ...protocolTags, input.sourceType.replace("github_", "")])];

  // Importance scoring
  let importance: Importance = 3;
  if (input.sourceType === "github_release") importance = 4;
  if (isBreaking) importance = Math.min(5, importance + 1) as Importance;
  if (isSecurityRelated) importance = Math.min(5, importance + 1) as Importance;
  if (isNoise) importance = Math.max(1, importance - 2) as Importance;

  // Confidence
  let confidence = 0.6;
  if (CATEGORY_BY_REPO.has(repoKey)) confidence += 0.1;
  if (input.sourceType === "github_release") confidence += 0.1;
  if (isProtocolRelated || isSecurityRelated) confidence += 0.05;

  return {
    category,
    tags,
    platforms,
    importance,
    isBreaking,
    isSecurityRelated,
    isProtocolRelated,
    confidence: Math.min(confidence, 0.95),
  };
}
