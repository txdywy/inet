import type { RadarItem, Stats, ProjectMeta, ProtocolMeta, TagIndex } from "../../types/radar";

const BASE = import.meta.env.BASE_URL || "/";

async function fetchJSON<T>(file: string): Promise<T> {
  const res = await fetch(`${BASE}data/${file}`);
  if (!res.ok) throw new Error(`Failed to fetch ${file}: ${res.status}`);
  return res.json();
}

export function fetchItems(): Promise<RadarItem[]> {
  return fetchJSON<RadarItem[]>("items.json");
}

export function fetchStats(): Promise<Stats> {
  return fetchJSON<Stats>("stats.json");
}

export function fetchProjects(): Promise<ProjectMeta[]> {
  return fetchJSON<ProjectMeta[]>("projects.json");
}

export function fetchProtocols(): Promise<ProtocolMeta[]> {
  return fetchJSON<ProtocolMeta[]>("protocols.json");
}

export function fetchTags(): Promise<TagIndex[]> {
  return fetchJSON<TagIndex[]>("tags.json");
}
