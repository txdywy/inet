import fs from "node:fs";
import path from "node:path";
import type { Category, RadarItem, Stats, TagIndex, ProjectMeta, ProtocolMeta } from "../types/radar.js";
import { GITHUB_REPOS, MANUAL_SOURCES } from "./sources.js";

const DATA_DIR = path.resolve("public/data");
const ITEMS_FILE = path.join(DATA_DIR, "items.json");

function hoursAgo(h: number): Date {
  return new Date(Date.now() - h * 3600 * 1000);
}

function daysAgo(d: number): Date {
  return new Date(Date.now() - d * 86400 * 1000);
}

const CATEGORY_META: Record<Category, { label: string; description: string }> = {
  core: { label: "核心内核", description: "代理核心引擎，如 Xray-core、sing-box、mihomo" },
  client: { label: "客户端", description: "各平台代理客户端应用" },
  router: { label: "路由器插件", description: "OpenWrt / 路由器固件及插件" },
  protocol: { label: "协议演进", description: "代理协议的技术演进和兼容性变化" },
  dns_rules: { label: "DNS 与规则", description: "DNS 解析、规则集、分流策略" },
  security: { label: "安全", description: "安全漏洞、CVE、TLS、兼容性风险" },
  ecosystem: { label: "生态工具", description: "Tailscale、WireGuard、OpenWrt 等生态项目" },
  trend: { label: "趋势", description: "高频更新、突然活跃、长期未更新的项目" },
};

function buildProjects(items: RadarItem[]): ProjectMeta[] {
  const projectMap = new Map<string, ProjectMeta>();

  // From GITHUB_REPOS
  for (const src of GITHUB_REPOS) {
    const key = `${src.owner}/${src.repo}`;
    projectMap.set(key, {
      slug: src.repo.toLowerCase(),
      name: src.repo,
      repo: key,
      description: CATEGORY_META[src.category].description,
      category: src.category,
      platforms: src.platforms,
      tags: src.tags,
    });
  }

  // From MANUAL_SOURCES
  for (const src of MANUAL_SOURCES) {
    projectMap.set(src.slug, {
      slug: src.slug,
      name: src.name,
      repo: src.slug,
      description: src.description,
      homepage: src.homepage,
      category: src.category,
      platforms: src.platforms,
      tags: src.tags,
    });
  }

  // Enrich with item counts
  const projectCounts = new Map<string, number>();
  for (const item of items) {
    const key = item.repo || item.project || "";
    projectCounts.set(key, (projectCounts.get(key) || 0) + 1);
  }

  return Array.from(projectMap.values())
    .map((p) => ({
      ...p,
      _count: projectCounts.get(p.repo) || 0,
    }))
    .sort((a, b) => (b as unknown as { _count: number })._count - (a as unknown as { _count: number })._count)
    .map(({ _count: _, ...rest }) => rest);
}

function buildTags(items: RadarItem[]): TagIndex[] {
  const tagCounts = new Map<string, { count: number; category?: Category }>();
  for (const item of items) {
    for (const tag of item.tags) {
      const existing = tagCounts.get(tag);
      if (existing) {
        existing.count++;
      } else {
        tagCounts.set(tag, { count: 1, category: item.category });
      }
    }
  }
  return Array.from(tagCounts.entries())
    .map(([tag, { count, category }]) => ({ tag, count, category }))
    .sort((a, b) => b.count - a.count);
}

function buildStats(items: RadarItem[]): Stats {
  const now = new Date();
  const h24 = hoursAgo(24);
  const d7 = daysAgo(7);

  const last24h = items.filter((i) => new Date(i.publishedAt) >= h24).length;
  const last7d = items.filter((i) => new Date(i.publishedAt) >= d7).length;

  const byCategory: Record<Category, number> = {
    core: 0, client: 0, router: 0, protocol: 0, dns_rules: 0, security: 0, ecosystem: 0, trend: 0,
  };
  for (const item of items) {
    byCategory[item.category]++;
  }

  // Top projects
  const projectCounts = new Map<string, number>();
  for (const item of items) {
    if (item.project) {
      projectCounts.set(item.project, (projectCounts.get(item.project) || 0) + 1);
    }
  }
  const topProjects = Array.from(projectCounts.entries())
    .map(([project, count]) => ({ project, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Hot tags
  const tagCounts = new Map<string, number>();
  for (const item of items) {
    for (const tag of item.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }
  }
  const hotTags = Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const importantCount = items.filter((i) => i.importance >= 4).length;
  const breakingCount = items.filter((i) => i.isBreaking).length;
  const securityCount = items.filter((i) => i.isSecurityRelated).length;

  return {
    totalItems: items.length,
    last24h,
    last7d,
    byCategory,
    topProjects,
    hotTags,
    importantCount,
    breakingCount,
    securityCount,
    updatedAt: now.toISOString(),
  };
}

const PROTOCOLS: ProtocolMeta[] = [
  { slug: "xhttp", name: "XHTTP", description: "Xray-core 引入的 HTTP 传输协议", relatedProjects: ["XTLS/Xray-core"], tags: ["xhttp", "xray-core"], status: "active" },
  { slug: "anytls", name: "AnyTLS", description: "通用 TLS 伪装方案", relatedProjects: ["XTLS/Xray-core"], tags: ["anytls", "tls"], status: "experimental" },
  { slug: "vless", name: "VLESS", description: "轻量级代理协议，Xray-core 和 v2ray-core 支持", relatedProjects: ["XTLS/Xray-core", "v2fly/v2ray-core", "SagerNet/sing-box"], tags: ["vless"], status: "active" },
  { slug: "reality", name: "REALITY", description: "TLS 握手伪装方案，无需自签证书", relatedProjects: ["XTLS/Xray-core", "SagerNet/sing-box"], tags: ["reality", "tls"], status: "active" },
  { slug: "hysteria2", name: "Hysteria 2", description: "基于 QUIC 的高速代理协议", relatedProjects: ["apernet/hysteria", "SagerNet/sing-box"], tags: ["hysteria2", "quic"], status: "active" },
  { slug: "tuic", name: "TUIC", description: "基于 QUIC 的代理协议", relatedProjects: ["SagerNet/sing-box", "juicity/juicity"], tags: ["tuic", "quic"], status: "active" },
  { slug: "ech", name: "ECH", description: "Encrypted Client Hello，TLS 隐私增强", relatedProjects: ["SagerNet/sing-box", "XTLS/Xray-core"], tags: ["ech", "tls"], status: "experimental" },
  { slug: "shadowtls", name: "ShadowTLS", description: "TLS 伪装方案，让代理流量看起来像正常 TLS", relatedProjects: ["SagerNet/sing-box"], tags: ["shadowtls", "tls"], status: "active" },
  { slug: "naiveproxy", name: "NaiveProxy", description: "基于 Chromium 网络栈的代理", relatedProjects: ["SagerNet/sing-box"], tags: ["naiveproxy", "chromium"], status: "active" },
  { slug: "quic", name: "QUIC / HTTP/3", description: "下一代传输协议，被 Hysteria2、TUIC 等使用", relatedProjects: ["apernet/hysteria", "SagerNet/sing-box"], tags: ["quic", "http/3"], status: "active" },
];

function main() {
  if (!fs.existsSync(ITEMS_FILE)) {
    console.error("No items.json found. Run classify first.");
    process.exit(1);
  }

  const items: RadarItem[] = JSON.parse(fs.readFileSync(ITEMS_FILE, "utf-8"));

  fs.writeFileSync(path.join(DATA_DIR, "projects.json"), JSON.stringify(buildProjects(items), null, 2));
  fs.writeFileSync(path.join(DATA_DIR, "tags.json"), JSON.stringify(buildTags(items), null, 2));
  fs.writeFileSync(path.join(DATA_DIR, "stats.json"), JSON.stringify(buildStats(items), null, 2));
  fs.writeFileSync(path.join(DATA_DIR, "protocols.json"), JSON.stringify(PROTOCOLS, null, 2));

  console.log(`Built indexes: ${items.length} items`);
  console.log(`  projects.json, tags.json, stats.json, protocols.json`);
}

main();
