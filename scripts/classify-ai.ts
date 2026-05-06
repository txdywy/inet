import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import type { RadarItem } from "../types/radar.js";
import { normalizeItem, generateHash } from "./normalize.js";
import { ruleClassify } from "./rules.js";
import { KEYWORDS } from "./sources.js";

const DATA_DIR = path.resolve("public/data");
const RAW_FILE = path.join(DATA_DIR, "_raw.json");
const ITEMS_FILE = path.join(DATA_DIR, "items.json");
const MAX_AI_CALLS = 30;

const AIOutputSchema = z.object({
  summary_zh: z.string().max(500),
  category: z.enum(["core", "client", "router", "protocol", "dns_rules", "security", "ecosystem", "trend"]),
  tags: z.array(z.string()).max(10),
  platforms: z.array(z.enum(["ios", "android", "macos", "windows", "linux", "openwrt", "router", "web"])),
  importance: z.number().int().min(1).max(5),
  change_type: z.string(),
  is_breaking: z.boolean(),
  is_security_related: z.boolean(),
  is_protocol_related: z.boolean(),
  confidence: z.number().min(0).max(1),
});

type AIOutput = z.infer<typeof AIOutputSchema>;

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

const SYSTEM_PROMPT = `你是一个网络代理与开源网络工具生态的信息编辑。请基于输入的 release / issue / PR / changelog 内容，输出严格 JSON，不要输出 markdown。不要编造输入中没有的信息。如果无法确定，请降低 confidence。重点判断该更新是否与协议、客户端兼容性、安全、breaking change、用户可感知变化有关。`;

function shouldUseAI(item: RawItem): boolean {
  if (item.sourceType === "github_release") return true;

  const text = `${item.title} ${item.rawBody || ""}`.toLowerCase();

  if (KEYWORDS.protocol.some((kw) => text.includes(kw))) return true;
  if (KEYWORDS.security.some((kw) => text.includes(kw))) return true;
  if (KEYWORDS.breaking.some((kw) => text.includes(kw))) return true;

  return false;
}

async function callGitHubModels(item: RawItem): Promise<AIOutput | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.warn("[classify] No GITHUB_TOKEN, skipping AI");
    return null;
  }

  const userInput = JSON.stringify({
    source: item.sourceType,
    project: item.repo,
    title: item.rawTitle,
    body: (item.rawBody || "").slice(0, 3000),
    url: item.sourceUrl,
    publishedAt: item.publishedAt,
  });

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
          { role: "user", content: userInput },
        ],
        temperature: 0.1,
        max_tokens: 500,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      console.warn(`[classify] GitHub Models API error: ${res.status}`);
      return null;
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content);
    return AIOutputSchema.parse(parsed);
  } catch (err) {
    console.warn("[classify] AI call failed:", err);
    return null;
  }
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

  // Process AI candidates
  for (let i = 0; i < aiCandidates.length; i++) {
    const raw = aiCandidates[i];
    console.log(`[AI ${i + 1}/${aiCandidates.length}] ${raw.repo} - ${raw.rawTitle}`);

    const aiResult = await callGitHubModels(raw);

    if (aiResult) {
      const item = normalizeItem(raw, {
        title: raw.rawTitle,
        summary: aiResult.summary_zh,
        category: aiResult.category,
        tags: aiResult.tags,
        platforms: aiResult.platforms as RadarItem["platforms"],
        importance: aiResult.importance as RadarItem["importance"],
        confidence: aiResult.confidence,
        isBreaking: aiResult.is_breaking,
        isSecurityRelated: aiResult.is_security_related,
        isProtocolRelated: aiResult.is_protocol_related,
      });
      classified.push(item);
    } else {
      // Fallback to rules
      const ruleResult = ruleClassify({
        title: raw.rawTitle,
        body: raw.rawBody,
        repo: raw.repo,
        sourceType: raw.sourceType,
      });
      classified.push(normalizeItem(raw, ruleResult));
    }

    // Rate limiting: small delay between AI calls
    if (i < aiCandidates.length - 1) {
      await new Promise((r) => setTimeout(r, 500));
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

  // Clean up raw file
  fs.unlinkSync(RAW_FILE);
}

main().catch(console.error);
