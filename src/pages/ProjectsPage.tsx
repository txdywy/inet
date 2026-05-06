import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { ProjectMeta } from "../../types/radar";
import { fetchProjects } from "../lib/data";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "../lib/format";
import { SearchBox } from "../components/SearchBox";

export function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchProjects()
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = query
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.repo.toLowerCase().includes(query.toLowerCase()) ||
          p.tags.some((t) => t.includes(query.toLowerCase()))
      )
    : projects;

  if (loading) {
    return <div className="text-center py-20 text-[var(--color-text-secondary)]">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--color-text)]">项目</h1>
      <SearchBox value={query} onChange={setQuery} placeholder="搜索项目名、repo、标签..." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((project) => (
          <Link
            key={project.slug}
            to={`/projects/${project.slug}`}
            className="block p-4 border border-[var(--color-border)] rounded-lg hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-secondary)] transition-colors no-underline"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_COLORS[project.category]}`}>
                {CATEGORY_LABELS[project.category]}
              </span>
            </div>
            <h3 className="font-semibold text-[var(--color-text)] mb-1">{project.name}</h3>
            <p className="text-xs text-[var(--color-text-tertiary)] mb-2">{project.repo}</p>
            <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2">{project.description}</p>
            {project.tags.length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {project.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="px-1.5 py-0.5 rounded text-xs bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)]">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
