import type { Category, Platform } from "../types/radar.js";

export interface RepoSource {
  owner: string;
  repo: string;
  category: Category;
  platforms: Platform[];
  tags: string[];
  priority: number; // 1-5, higher = more important
}

export const GITHUB_REPOS: RepoSource[] = [
  // Core
  { owner: "XTLS", repo: "Xray-core", category: "core", platforms: ["linux", "windows", "macos", "android"], tags: ["xray-core", "vless", "xtls", "xhttp"], priority: 5 },
  { owner: "SagerNet", repo: "sing-box", category: "core", platforms: ["linux", "windows", "macos", "android", "ios"], tags: ["sing-box", "vless", "hysteria2", "tuic"], priority: 5 },
  { owner: "MetaCubeX", repo: "mihomo", category: "core", platforms: ["linux", "windows", "macos"], tags: ["mihomo", "clash", "meta"], priority: 5 },
  { owner: "Dreamacro", repo: "clash", category: "core", platforms: ["linux", "windows", "macos"], tags: ["clash"], priority: 3 },
  { owner: "v2fly", repo: "v2ray-core", category: "core", platforms: ["linux", "windows", "macos"], tags: ["v2ray-core", "vless"], priority: 4 },
  { owner: "apernet", repo: "hysteria", category: "core", platforms: ["linux", "windows", "macos"], tags: ["hysteria2", "quic"], priority: 4 },
  { owner: "shadowsocks", repo: "shadowsocks-rust", category: "core", platforms: ["linux", "windows", "macos"], tags: ["shadowsocks", "rust"], priority: 3 },
  { owner: "daeuniverse", repo: "dae", category: "core", platforms: ["linux"], tags: ["dae", "ebpf", "linux"], priority: 3 },
  { owner: "juicity", repo: "juicity", category: "core", platforms: ["linux", "windows", "macos"], tags: ["juicity", "quic"], priority: 2 },
  { owner: "SUDOKU-ASCII", repo: "sudoku", category: "core", platforms: ["linux", "windows", "macos", "android"], tags: ["sudoku", "obfuscation"], priority: 3 },
  { owner: "klzgrad", repo: "naiveproxy", category: "core", platforms: ["linux", "windows", "macos", "android"], tags: ["naiveproxy"], priority: 4 },
  { owner: "tuic-protocol", repo: "tuic", category: "core", platforms: ["linux", "windows", "macos"], tags: ["tuic", "quic"], priority: 4 },
  { owner: "ihciah", repo: "shadow-tls", category: "core", platforms: ["linux"], tags: ["shadow-tls", "tls"], priority: 3 },
  { owner: "amnezia-vpn", repo: "amneziawg-go", category: "core", platforms: ["linux", "windows", "macos"], tags: ["amneziawg", "wireguard", "obfuscation"], priority: 4 },
  { owner: "go-gost", repo: "gost", category: "core", platforms: ["linux", "windows", "macos"], tags: ["gost", "tunnel"], priority: 3 },

  // Client
  { owner: "2dust", repo: "v2rayNG", category: "client", platforms: ["android"], tags: ["v2rayng", "android", "xray-core"], priority: 4 },
  { owner: "2dust", repo: "v2rayN", category: "client", platforms: ["windows"], tags: ["v2rayn", "windows", "xray-core"], priority: 4 },
  { owner: "MatsuriDayo", repo: "NekoBoxForAndroid", category: "client", platforms: ["android"], tags: ["nekobox", "android", "sing-box"], priority: 3 },
  { owner: "MatsuriDayo", repo: "nekoray", category: "client", platforms: ["windows", "linux"], tags: ["nekoray", "sing-box"], priority: 3 },
  { owner: "MetaCubeX", repo: "ClashMetaForAndroid", category: "client", platforms: ["android"], tags: ["clash", "android", "mihomo"], priority: 3 },
  { owner: "clash-verge-rev", repo: "clash-verge-rev", category: "client", platforms: ["windows", "macos", "linux"], tags: ["clash-verge", "mihomo", "desktop"], priority: 4 },
  { owner: "hiddify", repo: "hiddify-next", category: "client", platforms: ["android", "ios", "windows", "macos", "linux"], tags: ["hiddify", "sing-box", "universal"], priority: 5 },
  { owner: "v2rayA", repo: "v2rayA", category: "client", platforms: ["linux", "windows", "macos"], tags: ["v2raya", "web", "transparent-proxy"], priority: 4 },

  // Router
  { owner: "xiaorouji", repo: "openwrt-passwall", category: "router", platforms: ["openwrt", "router"], tags: ["passwall", "openwrt", "luci"], priority: 4 },
  { owner: "xiaorouji", repo: "openwrt-passwall2", category: "router", platforms: ["openwrt", "router"], tags: ["passwall2", "openwrt", "luci"], priority: 4 },
  { owner: "vernesong", repo: "OpenClash", category: "router", platforms: ["openwrt", "router"], tags: ["openclash", "openwrt", "luci", "clash"], priority: 4 },
  { owner: "fw876", repo: "helloworld", category: "router", platforms: ["openwrt", "router"], tags: ["ssrplus", "openwrt", "luci"], priority: 2 },
  { owner: "sbwml", repo: "luci-app-mosdns", category: "router", platforms: ["openwrt", "router"], tags: ["mosdns", "openwrt", "dns"], priority: 3 },

  // Ecosystem
  { owner: "immortalwrt", repo: "immortalwrt", category: "ecosystem", platforms: ["openwrt", "router"], tags: ["immortalwrt", "openwrt"], priority: 3 },
  { owner: "openwrt", repo: "openwrt", category: "ecosystem", platforms: ["openwrt", "router"], tags: ["openwrt"], priority: 3 },
  { owner: "tailscale", repo: "tailscale", category: "ecosystem", platforms: ["linux", "windows", "macos", "android", "ios"], tags: ["tailscale", "wireguard", "mesh"], priority: 4 },
  { owner: "Shadowsocks-NET", repo: "shadowsocks-specs", category: "ecosystem", platforms: [], tags: ["shadowsocks", "shadowsocks-2022", "specs"], priority: 4 },
  { owner: "MHSanaei", repo: "3x-ui", category: "ecosystem", platforms: ["linux"], tags: ["x-ui", "panel", "xray-core"], priority: 4 },

  // DNS / Rules
  { owner: "Loyalsoldier", repo: "v2ray-rules-dat", category: "dns_rules", platforms: ["linux", "windows", "macos"], tags: ["ruleset", "geosite", "geoip"], priority: 3 },
  { owner: "MetaCubeX", repo: "meta-rules-dat", category: "dns_rules", platforms: ["linux", "windows", "macos"], tags: ["ruleset", "geosite", "geoip", "mihomo"], priority: 3 },
  { owner: "blackmatrix7", repo: "ios_rule_script", category: "dns_rules", platforms: ["ios", "macos"], tags: ["ruleset", "ios", "surge", "quantumult-x"], priority: 3 },
  { owner: "v2fly", repo: "domain-list-community", category: "dns_rules", platforms: ["linux", "windows", "macos"], tags: ["geosite", "domain-list"], priority: 2 },
];

// Commercial clients - manual metadata only, no auto-fetch
export interface ManualSource {
  name: string;
  slug: string;
  category: Category;
  platforms: Platform[];
  tags: string[];
  homepage: string;
  description: string;
}

export const MANUAL_SOURCES: ManualSource[] = [
  { name: "Shadowrocket", slug: "shadowrocket", category: "client", platforms: ["ios"], tags: ["shadowrocket", "ios"], homepage: "https://shadowrocket.me", description: "iOS proxy client" },
  { name: "Surge", slug: "surge", category: "client", platforms: ["ios", "macos"], tags: ["surge", "ios", "macos"], homepage: "https://nssurge.com", description: "Network debugging and proxy tool for iOS/macOS" },
  { name: "Stash", slug: "stash", category: "client", platforms: ["ios", "macos"], tags: ["stash", "ios", "macos", "clash"], homepage: "https://stash.ws", description: "Clash-based proxy client for iOS/macOS" },
  { name: "Quantumult X", slug: "quantumult-x", category: "client", platforms: ["ios"], tags: ["quantumult-x", "ios"], homepage: "https://quantumult.app", description: "iOS proxy and network utility" },
  { name: "Loon", slug: "loon", category: "client", platforms: ["ios"], tags: ["loon", "ios"], homepage: "https://nsloon.com", description: "iOS proxy client" },
];

export const KEYWORDS = {
  protocol: ["anytls", "vless", "xhttp", "reality", "vision", "hysteria2", "tuic", "ech", "shadowtls", "shadow-tls", "naiveproxy", "quic", "http/3", "grpc", "wireguard", "shadowsocks", "shadowsocks-2022", "sudoku", "amneziawg", "gost", "hiddify", "v2raya", "x-ui", "panel"],
  security: ["cve", "security", "vulner", "exploit", "attack", "fingerprint", "tls", "certificate"],
  breaking: ["breaking", "incompatible", "remove", "deprecated", "migration", "migrate", "breaking change"],
  noise: ["typo", "docs", "readme", "ci", "workflow", "test", "chore", "bump version", "update readme"],
};
