import Fuse, { type IFuseOptions } from "fuse.js";
import type { RadarItem } from "../../types/radar";

const fuseOptions: IFuseOptions<RadarItem> = {
  keys: [
    { name: "title", weight: 0.3 },
    { name: "summary", weight: 0.2 },
    { name: "project", weight: 0.2 },
    { name: "repo", weight: 0.15 },
    { name: "version", weight: 0.05 },
    { name: "tags", weight: 0.1 },
  ],
  threshold: 0.4,
  includeScore: true,
  minMatchCharLength: 2,
};

let fuseInstance: Fuse<RadarItem> | null = null;

export function initSearch(items: RadarItem[]) {
  fuseInstance = new Fuse(items, fuseOptions);
}

export function searchItems(query: string): RadarItem[] {
  if (!fuseInstance || !query.trim()) return [];
  return fuseInstance.search(query).map((r) => r.item);
}
