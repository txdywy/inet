import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import type { RadarItem, ProjectMeta } from "../../types/radar";
import { fetchItems, fetchProjects } from "../lib/data";
import { RadarCard } from "../components/RadarCard";
import { TagBadge } from "../components/TagBadge";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "../lib/format";

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<ProjectMeta | null>(null);
  const [items, setItems] = useState<RadarItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchProjects(), fetchItems()])
      .then(([projects, allItems]) => {
        const proj = projects.find((p) => p.slug === slug);
        setProject(proj || null);
        if (proj) {
          const projItems = allItems.filter(
            (i) =>
              i.project?.toLowerCase() === proj.name.toLowerCase() ||
              i.repo?.toLowerCase() === proj.repo.toLowerCase()
          );
          setItems(projItems);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="text-center py-20 text-[var(--color-text-secondary)]">加载中...</div>;
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--color-text-secondary)]">项目未找到</p>
        <Link to="/projects" className="text-sm text-[var(--color-accent)] hover:underline">
          返回项目列表
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/projects" className="inline-flex items-center gap-1 text-sm text-[var(--color-accent)] hover:underline">
        <ArrowLeft className="w-4 h-4" /> 返回项目列表
      </Link>

      <div className="p-6 border border-[var(--color-border)] rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_COLORS[project.category]}`}>
            {CATEGORY_LABELS[project.category]}
          </span>
          {project.platforms.map((p) => (
            <span key={p} className="px-1.5 py-0.5 rounded text-xs bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]">
              {p}
            </span>
          ))}
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-1">{project.name}</h1>
        <p className="text-sm text-[var(--color-text-tertiary)] mb-3">
          <a
            href={`https://github.com/${project.repo}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--color-accent)]"
          >
            {project.repo} <ExternalLink className="inline w-3 h-3" />
          </a>
        </p>
        <p className="text-[var(--color-text-secondary)] mb-4">{project.description}</p>
        {project.tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {project.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">最近更新 ({items.length})</h2>
        {items.length > 0 ? (
          <div className="space-y-3">
            {items.slice(0, 20).map((item) => (
              <RadarCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-[var(--color-text-secondary)] border border-dashed border-[var(--color-border)] rounded-lg">
            暂无更新数据
          </div>
        )}
      </div>
    </div>
  );
}
