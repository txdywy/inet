import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { RadarItem, Category, Platform } from "../../types/radar";
import { fetchItems } from "../lib/data";
import { initSearch, searchItems } from "../lib/search";
import { RadarCard } from "../components/RadarCard";
import { FilterPanel } from "../components/FilterPanel";
import { SearchBox } from "../components/SearchBox";

const PAGE_SIZE = 20;

export function UpdatesPage() {
  const [items, setItems] = useState<RadarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    (searchParams.get("category") as Category) || null
  );
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(
    (searchParams.get("platform") as Platform) || null
  );
  const [importanceFilter, setImportanceFilter] = useState<number | null>(null);
  const [showBreakingOnly, setShowBreakingOnly] = useState(false);
  const [showSecurityOnly, setShowSecurityOnly] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(searchParams.get("tag"));
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchItems()
      .then((data) => {
        setItems(data);
        initSearch(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Sync URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedPlatform) params.set("platform", selectedPlatform);
    if (selectedTag) params.set("tag", selectedTag);
    setSearchParams(params, { replace: true });
  }, [selectedCategory, selectedPlatform, selectedTag, setSearchParams]);

  const filtered = useMemo(() => {
    let result = searchQuery ? searchItems(searchQuery) : items;

    if (selectedCategory) {
      result = result.filter((i) => i.category === selectedCategory);
    }
    if (selectedPlatform) {
      result = result.filter((i) => i.platforms.includes(selectedPlatform));
    }
    if (importanceFilter) {
      result = result.filter((i) => i.importance >= importanceFilter);
    }
    if (showBreakingOnly) {
      result = result.filter((i) => i.isBreaking);
    }
    if (showSecurityOnly) {
      result = result.filter((i) => i.isSecurityRelated);
    }
    if (selectedTag) {
      result = result.filter((i) => i.tags.includes(selectedTag));
    }

    return result;
  }, [items, searchQuery, selectedCategory, selectedPlatform, importanceFilter, showBreakingOnly, showSecurityOnly, selectedTag]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [searchQuery, selectedCategory, selectedPlatform, importanceFilter, showBreakingOnly, showSecurityOnly, selectedTag]);

  if (loading) {
    return <div className="text-center py-20 text-[var(--color-text-secondary)]">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">最新更新</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">共 {filtered.length} 条更新</p>
      </div>

      <SearchBox value={searchQuery} onChange={setSearchQuery} />

      {selectedTag && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--color-text-secondary)]">标签:</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--color-accent)] text-white">
            {selectedTag}
            <button onClick={() => setSelectedTag(null)} className="hover:opacity-70">&times;</button>
          </span>
        </div>
      )}

      <FilterPanel
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedPlatform={selectedPlatform}
        onPlatformChange={setSelectedPlatform}
        importanceFilter={importanceFilter}
        onImportanceChange={setImportanceFilter}
        showBreakingOnly={showBreakingOnly}
        onBreakingToggle={() => setShowBreakingOnly(!showBreakingOnly)}
        showSecurityOnly={showSecurityOnly}
        onSecurityToggle={() => setShowSecurityOnly(!showSecurityOnly)}
      />

      {/* Results */}
      <div className="space-y-3">
        {pageItems.length > 0 ? (
          pageItems.map((item) => (
            <RadarCard
              key={item.id}
              item={item}
              onTagClick={(tag) => setSelectedTag(tag)}
            />
          ))
        ) : (
          <div className="text-center py-12 text-[var(--color-text-secondary)]">
            没有匹配的更新
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-md text-sm border border-[var(--color-border)] disabled:opacity-40 hover:bg-[var(--color-bg-secondary)]"
          >
            上一页
          </button>
          <span className="px-3 py-1.5 text-sm text-[var(--color-text-secondary)]">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-md text-sm border border-[var(--color-border)] disabled:opacity-40 hover:bg-[var(--color-bg-secondary)]"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
