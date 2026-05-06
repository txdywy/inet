import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { TagIndex } from "../../types/radar";
import { fetchTags } from "../lib/data";
import { SearchBox } from "../components/SearchBox";

export function TagsPage() {
  const [tags, setTags] = useState<TagIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchTags()
      .then(setTags)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = query
    ? tags.filter((t) => t.tag.toLowerCase().includes(query.toLowerCase()))
    : tags;

  if (loading) {
    return <div className="text-center py-20 text-[var(--color-text-secondary)]">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--color-text)]">标签</h1>
      <SearchBox value={query} onChange={setQuery} placeholder="搜索标签..." />
      <div className="flex flex-wrap gap-2">
        {filtered.map((tag) => (
          <button
            key={tag.tag}
            onClick={() => navigate(`/updates?tag=${encodeURIComponent(tag.tag)}`)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-secondary)] transition-colors text-[var(--color-text)]"
          >
            <span>{tag.tag}</span>
            <span className="text-xs text-[var(--color-text-tertiary)]">{tag.count}</span>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-8 w-full text-[var(--color-text-secondary)]">
            {query ? "没有匹配的标签" : "暂无标签数据"}
          </div>
        )}
      </div>
    </div>
  );
}
