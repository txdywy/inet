import fs from "node:fs";
import path from "node:path";
import { GITHUB_REPOS, type RepoSource } from "./sources.js";

const DATA_DIR = path.resolve("public/data");
const ITEMS_FILE = path.join(DATA_DIR, "items.json");
const MAX_PER_REPO = 5;

interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string | null;
  body: string | null;
  draft: boolean;
  prerelease: boolean;
  published_at: string;
  html_url: string;
  assets: Array<{ name: string; browser_download_url: string }>;
}

interface RawItem {
  sourceType: "github_release";
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
  isPrerelease: boolean;
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";

if (!GITHUB_TOKEN) {
  console.warn("[warn] GITHUB_TOKEN not set. Using unauthenticated requests (60 req/hr limit).");
}

async function fetchReleases(src: RepoSource): Promise<RawItem[]> {
  const url = `https://api.github.com/repos/${src.owner}/${src.repo}/releases?per_page=${MAX_PER_REPO}`;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "ProxyPulse/1.0",
  };
  if (GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  }

  try {
    const res = await fetch(url, { headers });

    if (res.status === 403) {
      const rateReset = res.headers.get("x-ratelimit-reset");
      console.warn(
        `[rate-limit] ${src.owner}/${src.repo}: 403. Reset at ${rateReset ? new Date(Number(rateReset) * 1000).toISOString() : "unknown"}`
      );
      return [];
    }

    if (!res.ok) {
      console.warn(`[fetch] ${src.owner}/${src.repo}: HTTP ${res.status}`);
      return [];
    }

    const releases = (await res.json()) as GitHubRelease[];
    const now = new Date().toISOString();

    return releases
      .filter((r) => !r.draft)
      .slice(0, MAX_PER_REPO)
      .map((r) => ({
        sourceType: "github_release" as const,
        sourceName: `${src.owner}/${src.repo}`,
        sourceUrl: r.html_url,
        project: src.repo,
        repo: `${src.owner}/${src.repo}`,
        title: `${src.owner}/${src.repo} ${r.name || r.tag_name}`,
        rawTitle: r.name || r.tag_name,
        rawBody: r.body || "",
        version: r.tag_name.replace(/^v/, ""),
        publishedAt: r.published_at,
        fetchedAt: now,
        isPrerelease: r.prerelease,
      }));
  } catch (err) {
    console.error(`[fetch-error] ${src.owner}/${src.repo}:`, err);
    return [];
  }
}

async function main() {
  fs.mkdirSync(DATA_DIR, { recursive: true });

  // Load existing items for dedup
  let existingItems: Array<{ hash: string; [k: string]: unknown }> = [];
  if (fs.existsSync(ITEMS_FILE)) {
    try {
      existingItems = JSON.parse(fs.readFileSync(ITEMS_FILE, "utf-8"));
    } catch {
      existingItems = [];
    }
  }
  const existingHashes = new Set(existingItems.map((i) => i.hash));

  console.log(`Fetching from ${GITHUB_REPOS.length} repos...`);
  const allRaw: RawItem[] = [];
  const concurrency = 5;

  for (let i = 0; i < GITHUB_REPOS.length; i += concurrency) {
    const batch = GITHUB_REPOS.slice(i, i + concurrency);
    const results = await Promise.all(batch.map(fetchReleases));
    allRaw.push(...results.flat());

    // Small delay between batches to respect rate limits
    if (i + concurrency < GITHUB_REPOS.length) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  console.log(`Fetched ${allRaw.length} raw items total`);

  // Save raw items for normalize/classify step
  const rawFile = path.join(DATA_DIR, "_raw.json");
  fs.writeFileSync(rawFile, JSON.stringify(allRaw, null, 2));

  // Write rate limit info
  if (GITHUB_TOKEN) {
    try {
      const rateRes = await fetch("https://api.github.com/rate_limit", {
        headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, "User-Agent": "ProxyPulse/1.0" },
      });
      const rateData = (await rateRes.json()) as { rate: { remaining: number; limit: number; reset: number } };
      console.log(`GitHub API rate limit: ${rateData.rate.remaining}/${rateData.rate.limit}, resets ${new Date(rateData.rate.reset * 1000).toISOString()}`);
    } catch {
      // ignore
    }
  }

  console.log("Done fetching. Raw data saved to public/data/_raw.json");
}

main().catch(console.error);
