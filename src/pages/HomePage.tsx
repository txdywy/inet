import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Activity, AlertTriangle, Shield, Clock, ExternalLink } from "lucide-react";
import type { RadarItem, Stats } from "../../types/radar";
import { fetchItems, fetchStats } from "../lib/data";
import { RadarCard } from "../components/RadarCard";
import { CATEGORY_LABELS, CATEGORY_COLORS, timeAgo } from "../lib/format";

export function HomePage() {
  const [items, setItems] = useState<RadarItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchItems(), fetchStats()])
      .then(([i, s]) => { setItems(i); setStats(s); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-[var(--color-text-secondary)]">加载中...</div>;
  }

  const recentItems = items.slice(0, 10);
  const importantItems = items.filter((i) => i.importance >= 4).slice(0, 5);
  const breakingItems = items.filter((i) => i.isBreaking).slice(0, 5);
  const securityItems = items.filter((i) => i.isSecurityRelated).slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center py-6">
        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">ProxyPulse</h1>
        <p className="text-[var(--color-text-secondary)] text-sm">开源代理生态技术情报雷达</p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard icon={<Clock className="w-5 h-5" />} label="24h 新增" value={stats.last24h} color="blue" />
          <StatCard icon={<Activity className="w-5 h-5" />} label="7 天更新" value={stats.last7d} color="green" />
          <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Breaking" value={stats.breakingCount} color="red" />
          <StatCard icon={<Shield className="w-5 h-5" />} label="安全相关" value={stats.securityCount} color="orange" />
        </div>
      )}

      {/* Category breakdown */}
      {stats && (
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {(Object.entries(stats.byCategory) as Array<[string, number]>).map(([cat, count]) => (
            <Link
              key={cat}
              to={`/updates?category=${cat}`}
              className={`text-center p-2 rounded-lg text-xs font-medium no-underline ${CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS]} hover:opacity-80 transition-opacity`}
            >
              <div className="text-lg font-bold">{count}</div>
              <div>{CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]}</div>
            </Link>
          ))}
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-4">
          <SectionHeader title="最新更新" link="/updates" />
          <div className="space-y-3">
            {recentItems.length > 0 ? (
              recentItems.map((item) => <RadarCard key={item.id} item={item} />)
            ) : (
              <EmptyState />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Important */}
          {importantItems.length > 0 && (
            <div>
              <SectionHeader title="重要更新" />
              <div className="space-y-2 mt-3">
                {importantItems.map((item) => (
                  <CompactCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Breaking */}
          {breakingItems.length > 0 && (
            <div>
              <SectionHeader title="Breaking Changes" />
              <div className="space-y-2 mt-3">
                {breakingItems.map((item) => (
                  <CompactCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Security */}
          {securityItems.length > 0 && (
            <div>
              <SectionHeader title="安全动态" />
              <div className="space-y-2 mt-3">
                {securityItems.map((item) => (
                  <CompactCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Top Projects */}
          {stats && stats.topProjects.length > 0 && (
            <div>
              <SectionHeader title="最活跃项目" link="/projects" />
              <div className="space-y-2 mt-3">
                {stats.topProjects.slice(0, 5).map((p) => (
                  <Link
                    key={p.project}
                    to={`/projects/${p.project.toLowerCase()}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors no-underline"
                  >
                    <span className="text-sm text-[var(--color-text)]">{p.project}</span>
                    <span className="text-xs text-[var(--color-text-tertiary)]">{p.count} 条</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: "text-blue-600 dark:text-blue-400",
    green: "text-green-600 dark:text-green-400",
    red: "text-red-600 dark:text-red-400",
    orange: "text-orange-600 dark:text-orange-400",
  };
  return (
    <div className="p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-secondary)]">
      <div className={`flex items-center gap-2 mb-1 ${colors[color]}`}>
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold text-[var(--color-text)]">{value}</div>
    </div>
  );
}

function SectionHeader({ title, link }: { title: string; link?: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-[var(--color-text)]">{title}</h2>
      {link && (
        <Link to={link} className="text-xs text-[var(--color-accent)] hover:underline">
          查看全部
        </Link>
      )}
    </div>
  );
}

function CompactCard({ item }: { item: RadarItem }) {
  return (
    <a
      href={item.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-2 p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors no-underline"
    >
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium shrink-0 ${CATEGORY_COLORS[item.category]}`}>
        {item.importance >= 4 ? `P${item.importance}` : CATEGORY_LABELS[item.category]}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-[var(--color-text)] truncate">{item.title}</div>
        <div className="text-xs text-[var(--color-text-tertiary)]">{timeAgo(item.publishedAt)}</div>
      </div>
      <ExternalLink className="w-3 h-3 shrink-0 text-[var(--color-text-tertiary)] mt-1" />
    </a>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12 border border-dashed border-[var(--color-border)] rounded-lg">
      <Activity className="w-12 h-12 mx-auto mb-3 text-[var(--color-text-tertiary)]" />
      <p className="text-[var(--color-text-secondary)]">暂无数据</p>
      <p className="text-xs text-[var(--color-text-tertiary)] mt-1">数据将通过 GitHub Actions 定时抓取更新</p>
    </div>
  );
}
