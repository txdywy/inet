import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import type { RadarItem, ProtocolMeta } from "../../types/radar";
import { fetchItems, fetchProtocols } from "../lib/data";
import { RadarCard } from "../components/RadarCard";
import { TagBadge } from "../components/TagBadge";

export function ProtocolDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [protocol, setProtocol] = useState<ProtocolMeta | null>(null);
  const [items, setItems] = useState<RadarItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchProtocols(), fetchItems()])
      .then(([protocols, allItems]) => {
        const prot = protocols.find((p) => p.slug === slug);
        setProtocol(prot || null);
        if (prot) {
          const protItems = allItems.filter(
            (i) => i.isProtocolRelated && i.tags.some((t) => prot.tags.includes(t))
          );
          setItems(protItems);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="text-center py-20 text-[var(--color-text-secondary)]">加载中...</div>;
  }

  if (!protocol) {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--color-text-secondary)]">协议未找到</p>
        <Link to="/protocols" className="text-sm text-[var(--color-accent)] hover:underline">
          返回协议列表
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/protocols" className="inline-flex items-center gap-1 text-sm text-[var(--color-accent)] hover:underline">
        <ArrowLeft className="w-4 h-4" /> 返回协议列表
      </Link>

      <div className="p-6 border border-[var(--color-border)] rounded-lg">
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">{protocol.name}</h1>
        <p className="text-[var(--color-text-secondary)] mb-4">{protocol.description}</p>
        <div className="flex gap-1.5 flex-wrap mb-3">
          {protocol.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
        {protocol.relatedProjects.length > 0 && (
          <div className="text-sm text-[var(--color-text-secondary)]">
            相关项目:{" "}
            {protocol.relatedProjects.map((rp, i) => (
              <span key={rp}>
                <a
                  href={`https://github.com/${rp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-accent)] hover:underline"
                >
                  {rp.split("/")[1]}
                </a>
                {i < protocol.relatedProjects.length - 1 ? ", " : ""}
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">相关更新 ({items.length})</h2>
        {items.length > 0 ? (
          <div className="space-y-3">
            {items.slice(0, 20).map((item) => (
              <RadarCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-[var(--color-text-secondary)] border border-dashed border-[var(--color-border)] rounded-lg">
            暂无相关更新
          </div>
        )}
      </div>
    </div>
  );
}
