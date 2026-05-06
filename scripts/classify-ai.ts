import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import type { RadarItem, Category, Importance, Platform } from "../types/radar.js";
import { normalizeItem, generateHash } from "./normalize.js";
import { ruleClassify } from "./rules.js";
import { KEYWORDS } from "./sources.js";

const DATA_DIR = path.resolve("public/data");
const RAW_FILE = path.join(DATA_DIR, "_raw.json");
const ITEMS_FILE = path.join(DATA_DIR, "items.json");
const MAX_AI_CALLS = 30;

// Lenient schema: all fields have defaults so partial responses don't crash
const AIOutputSchema = z.object({
  summary_zh: z.string().default(""),
  analysis_zh: z.string().default(""),
  category: z.string().default("ecosystem"),
  tags: z.array(z.string()).default([]),
  platforms: z.array(z.string()).default([]),
  importance: z.number().int().min(1).max(5).default(3),
  change_type: z.string().default("update"),
  is_breaking: z.boolean().default(false),
  is_security_related: z.boolean().default(false),
  is_protocol_related: z.boolean().default(false),
  confidence: z.number().min(0).max(1).default(0.5),
});

type AIOutput = z.infer<typeof AIOutputSchema>;

const VALID_CATEGORIES: Category[] = ["core", "client", "router", "protocol", "dns_rules", "security", "ecosystem", "trend"];
const VALID_PLATFORMS: Platform[] = ["ios", "android", "macos", "windows", "linux", "openwrt", "router", "web"];

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

const SYSTEM_PROMPT = `你是一个专注于代理工具、网络协议、开源网络生态的技术编辑。你的任务是基于输入的 GitHub release / issue / PR / changelog 内容，进行专业分析和评估。

要求：
1. 输出严格 JSON，不要输出 markdown 代码块或其他任何内容
2. 不要编造输入中没有的信息，如果无法确定请降低 confidence
3. 用中文撰写分析，语言要专业但易懂

JSON 字段说明：
- summary_zh: 一句话摘要，30-80字，概括本次更新的核心内容
- analysis_zh: 深度分析，100-300字，包含：这次更新做了什么、为什么重要、对用户/开发者的影响、与哪些协议或项目相关、是否有兼容性风险、是否建议立即更新
- category: 分类，必须是以下之一: core, client, router, protocol, dns_rules, security, ecosystem, trend
- tags: 标签数组，包含项目名、协议名、技术栈等关键词
- platforms: 受影响平台数组，可选值: ios, android, macos, windows, linux, openwrt, router, web
- importance: 重要性评分 1-5（1=琐碎，2=一般，3=值得关注，4=重要，5=紧急/影响广泛）
- change_type: 变更类型，如 release, bugfix, feature, refactor, security_fix, deprecation, breaking_change
- is_breaking: 是否有破坏性变更
- is_security_related: 是否涉及安全
- is_protocol_related: 是否涉及协议变化
- confidence: 你对分析准确性的信心 0-1`;

function buildUserPrompt(item: RawItem): string {
  return JSON.stringify({
    source: item.sourceType,
    project: item.repo,
    title: item.rawTitle,
    body: (item.rawBody || "").slice(0, 4000),
    url: item.sourceUrl,
    publishedAt: item.publishedAt,
    isPrerelease: item.isPrerelease || false,
  });
}

function shouldUseAI(item: RawItem): boolean {
  if (item.sourceType === "github_release") return true;

  const text = `${item.title} ${item.rawBody || ""}`.toLowerCase();

  if (KEYWORDS.protocol.some((kw) => text.includes(kw))) return true;
  if (KEYWORDS.security.some((kw) => text.includes(kw))) return true;
  if (KEYWORDS.breaking.some((kw) => text.includes(kw))) return true;

  return false;
}

function sanitizeAIOutput(raw: Record<string, unknown>): AIOutput {
  // Normalize category
  let category = typeof raw.category === "string" ? raw.category.toLowerCase().trim() : "ecosystem";
  if (!VALID_CATEGORIES.includes(category as Category)) {
    // Common model mistakes
    const categoryMap: Record<string, Category> = {
      "proxy": "core", "proxy-core": "core", "vpn": "core", "core-proxy": "core",
      "android-client": "client", "ios-client": "client", "desktop-client": "client",
      "router-plugin": "router", "openwrt-plugin": "router",
      "protocol-update": "protocol", "transport": "protocol",
      "dns": "dns_rules", "rule": "dns_rules", "ruleset": "dns_rules",
      "vulnerability": "security", "cve": "security",
      "tool": "ecosystem", "infrastructure": "ecosystem",
      "monitoring": "trend", "analysis": "trend",
    };
    category = categoryMap[category] || "ecosystem";
  }

  // Normalize platforms
  const platforms = Array.isArray(raw.platforms)
    ? raw.platforms
        .map((p: unknown) => typeof p === "string" ? p.toLowerCase().trim() : "")
        .filter((p: string) => VALID_PLATFORMS.includes(p as Platform))
    : [];

  // Normalize tags
  const tags = Array.isArray(raw.tags)
    ? raw.tags
        .map((t: unknown) => typeof t === "string" ? t.toLowerCase().trim() : "")
        .filter((t: string) => t.length > 0 && t.length < 50)
        .slice(0, 10)
    : [];

  // Normalize importance
  let importance = typeof raw.importance === "number" ? raw.importance : 3;
  importance = Math.max(1, Math.min(5, Math.round(importance)));

  // Normalize confidence
  let confidence = typeof raw.confidence === "number" ? raw.confidence : 0.5;
  confidence = Math.max(0, Math.min(1, confidence));

  return {
    summary_zh: typeof raw.summary_zh === "string" ? raw.summary_zh.slice(0, 500) : "",
    analysis_zh: typeof raw.analysis_zh === "string" ? raw.analysis_zh.slice(0, 1000) : "",
    category: category as AIOutput["category"],
    tags,
    platforms: platforms as AIOutput["platforms"],
    importance: importance as Importance,
    change_type: typeof raw.change_type === "string" ? raw.change_type : "update",
    is_breaking: Boolean(raw.is_breaking),
    is_security_related: Boolean(raw.is_security_related),
    is_protocol_related: Boolean(raw.is_protocol_related),
    confidence,
  };
}

async function callGitHubModels(item: RawItem, retryCount = 0): Promise<AIOutput | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.warn("[classify] No GITHUB_TOKEN, skipping AI");
    return null;
  }

  try {
    const res = await fetch("https://models.inference.ai.azure.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(item) },
        ],
        temperature: 0.2,
        max_tokens: 800,
        response_format: { type: "json_object" },
      }),
    });

    if (res.status === 429) {
      // Rate limited - wait and retry once
      if (retryCount < 1) {
        const retryAfter = parseInt(res.headers.get("retry-after") || "10", 10);
        console.warn(`[classify] Rate limited, waiting ${retryAfter}s...`);
        await new Promise((r) => setTimeout(r, retryAfter * 1000));
        return callGitHubModels(item, retryCount + 1);
      }
      console.warn("[classify] Rate limited, giving up");
      return null;
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.warn(`[classify] API error ${res.status}: ${errText.slice(0, 200)}`);
      return null;
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    // Parse JSON - handle markdown code blocks that some models wrap output in
    let jsonStr = content.trim();
    const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    }

    const parsed = JSON.parse(jsonStr);

    // Try strict schema first, fall back to lenient sanitization
    const strictResult = AIOutputSchema.safeParse(parsed);
    if (strictResult.success) {
      return strictResult.data;
    }

    // Log validation issues and sanitize
    console.warn(`[classify] Schema validation issues for ${item.repo}, sanitizing...`);
    return sanitizeAIOutput(parsed);
  } catch (err) {
    if (retryCount < 1 && err instanceof SyntaxError) {
      // JSON parse error - might be truncated, retry once with fewer tokens prompt
      console.warn("[classify] JSON parse error, retrying...");
      await new Promise((r) => setTimeout(r, 1000));
      return callGitHubModels(item, retryCount + 1);
    }
    console.warn("[classify] AI call failed:", err instanceof Error ? err.message : err);
    return null;
  }
}

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

async function main() {
  if (!fs.existsSync(RAW_FILE)) {
    console.error("No raw data found. Run `npm run fetch` first.");
    process.exit(1);
  }

  const rawItems: RawItem[] = JSON.parse(fs.readFileSync(RAW_FILE, "utf-8"));

  // Load existing items to avoid re-processing
  let existingItems: RadarItem[] = [];
  if (fs.existsSync(ITEMS_FILE)) {
    try {
      existingItems = JSON.parse(fs.readFileSync(ITEMS_FILE, "utf-8"));
    } catch {
      existingItems = [];
    }
  }
  const existingHashes = new Set(existingItems.map((i) => i.hash));

  // Filter to new items only
  const newItems = rawItems.filter((r) => !existingHashes.has(generateHash(r)));
  console.log(`${newItems.length} new items to classify (${existingItems.length} existing)`);

  // Pre-filter for AI: releases + important items
  const aiCandidates = newItems.filter(shouldUseAI).slice(0, MAX_AI_CALLS);
  const ruleOnlyItems = newItems.filter((r) => !shouldUseAI(r));

  console.log(`${aiCandidates.length} items for AI, ${ruleOnlyItems.length} for rule-only`);

  const classified: RadarItem[] = [];
  let aiSuccess = 0;
  let aiFallback = 0;

  // Process AI candidates
  for (let i = 0; i < aiCandidates.length; i++) {
    const raw = aiCandidates[i];
    console.log(`[AI ${i + 1}/${aiCandidates.length}] ${raw.repo} - ${raw.rawTitle}`);

    const aiResult = await callGitHubModels(raw);

    if (aiResult && aiResult.summary_zh) {
      aiSuccess++;
      const item = normalizeItem(raw, {
        title: raw.rawTitle,
        summary: aiResult.summary_zh,
        analysis: aiResult.analysis_zh || undefined,
        category: aiResult.category as Category,
        tags: aiResult.tags,
        platforms: aiResult.platforms as Platform[],
        importance: aiResult.importance as Importance,
        confidence: aiResult.confidence,
        isBreaking: aiResult.is_breaking,
        isSecurityRelated: aiResult.is_security_related,
        isProtocolRelated: aiResult.is_protocol_related,
      });
      classified.push(item);
    } else {
      // Fallback to rules
      aiFallback++;
      const ruleResult = ruleClassify({
        title: raw.rawTitle,
        body: raw.rawBody,
        repo: raw.repo,
        sourceType: raw.sourceType,
      });
      classified.push(normalizeItem(raw, ruleResult));
    }

    // Rate limiting: delay between AI calls
    if (i < aiCandidates.length - 1) {
      await new Promise((r) => setTimeout(r, 800));
    }
  }

  // Process rule-only items
  for (const raw of ruleOnlyItems) {
    const ruleResult = ruleClassify({
      title: raw.rawTitle,
      body: raw.rawBody,
      repo: raw.repo,
      sourceType: raw.sourceType,
    });
    classified.push(normalizeItem(raw, ruleResult));
  }

  // Merge: new classified items + existing items
  const merged = [...classified, ...existingItems];
  merged.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  // Deduplicate by hash
  const seen = new Set<string>();
  const deduped = merged.filter((item) => {
    if (seen.has(item.hash)) return false;
    seen.add(item.hash);
    return true;
  });

  fs.writeFileSync(ITEMS_FILE, JSON.stringify(deduped, null, 2));
  console.log(`Wrote ${deduped.length} items to ${ITEMS_FILE} (${classified.length} new)`);
  console.log(`AI: ${aiSuccess} success, ${aiFallback} fallback to rules`);

  // Clean up raw file
  fs.unlinkSync(RAW_FILE);
}

main().catch(console.error);
