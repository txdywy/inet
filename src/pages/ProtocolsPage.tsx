import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { ProtocolMeta } from "../../types/radar";
import { fetchProtocols } from "../lib/data";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  experimental: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  deprecated: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
};

const STATUS_LABELS: Record<string, string> = {
  active: "活跃",
  experimental: "实验性",
  deprecated: "已弃用",
};

export function ProtocolsPage() {
  const [protocols, setProtocols] = useState<ProtocolMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProtocols()
      .then(setProtocols)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-[var(--color-text-secondary)]">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--color-text)]">协议</h1>
      <p className="text-sm text-[var(--color-text-secondary)]">关注代理协议的技术演进和兼容性变化</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {protocols.map((protocol) => (
          <Link
            key={protocol.slug}
            to={`/protocols/${protocol.slug}`}
            className="block p-4 border border-[var(--color-border)] rounded-lg hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-secondary)] transition-colors no-underline"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[protocol.status]}`}>
                {STATUS_LABELS[protocol.status]}
              </span>
            </div>
            <h3 className="font-semibold text-[var(--color-text)] mb-1">{protocol.name}</h3>
            <p className="text-sm text-[var(--color-text-secondary)] mb-3">{protocol.description}</p>
            {protocol.relatedProjects.length > 0 && (
              <div className="text-xs text-[var(--color-text-tertiary)]">
                相关项目: {protocol.relatedProjects.join(", ")}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
