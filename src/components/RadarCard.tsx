import { ExternalLink, AlertTriangle, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import type { RadarItem } from "../../types/radar";
import { ImportanceBadge } from "./ImportanceBadge";
import { TagBadge } from "./TagBadge";
import { CATEGORY_LABELS, CATEGORY_COLORS, timeAgo, truncate } from "../lib/format";

interface RadarCardProps {
  item: RadarItem;
  onTagClick?: (tag: string) => void;
}

export function RadarCard({ item, onTagClick }: RadarCardProps) {
  const hasAnalysis = Boolean(item.analysis);

  return (
    <div
      className={`p-4 border rounded-lg transition-colors hover:bg-[var(--color-bg-secondary)] ${
        item.importance >= 4
          ? "border-amber-300 dark:border-amber-700"
          : "border-[var(--color-border)]"
      } ${item.isBreaking ? "border-l-4 border-l-red-500" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_COLORS[item.category]}`}>
              {CATEGORY_LABELS[item.category]}
            </span>
            <ImportanceBadge value={item.importance} />
            {item.isBreaking && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                <AlertTriangle className="w-3 h-3" /> Breaking
              </span>
            )}
            {item.isSecurityRelated && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                <Shield className="w-3 h-3" /> Security
              </span>
            )}
            {item.version && (
              <span className="text-xs font-mono text-[var(--color-text-tertiary)]">{item.version}</span>
            )}
          </div>

          <h3 className="text-sm font-semibold text-[var(--color-text)] mb-1 leading-snug">
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--color-accent)] transition-colors"
            >
              {truncate(item.title, 120)}
              <ExternalLink className="inline w-3 h-3 ml-1 opacity-40" />
            </a>
          </h3>

          <p className="text-xs text-[var(--color-text-secondary)] mb-2 leading-relaxed">
            {item.summary}
          </p>

          {/* Analysis section */}
          {hasAnalysis && (
            <div className="p-3 mb-2 rounded-md bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">
                {item.analysis}
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {item.project && (
              <Link
                to={`/projects/${item.slug || item.project.toLowerCase()}`}
                className="text-xs font-medium text-[var(--color-accent)] hover:underline"
              >
                {item.project}
              </Link>
            )}
            <span className="text-xs text-[var(--color-text-tertiary)]">{timeAgo(item.publishedAt)}</span>
          </div>

          {item.tags.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {item.tags.slice(0, 5).map((tag) => (
                <TagBadge key={tag} tag={tag} onClick={onTagClick ? () => onTagClick(tag) : undefined} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
