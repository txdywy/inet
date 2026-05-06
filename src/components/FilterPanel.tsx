import type { Category, Platform } from "../../types/radar";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "../lib/format";

interface FilterPanelProps {
  selectedCategory: Category | null;
  onCategoryChange: (cat: Category | null) => void;
  selectedPlatform: Platform | null;
  onPlatformChange: (plat: Platform | null) => void;
  importanceFilter: number | null;
  onImportanceChange: (imp: number | null) => void;
  showBreakingOnly: boolean;
  onBreakingToggle: () => void;
  showSecurityOnly: boolean;
  onSecurityToggle: () => void;
}

const ALL_CATEGORIES: Category[] = ["core", "client", "router", "protocol", "dns_rules", "security", "ecosystem", "trend"];
const ALL_PLATFORMS: Platform[] = ["ios", "android", "macos", "windows", "linux", "openwrt", "router", "web"];

export function FilterPanel({
  selectedCategory, onCategoryChange,
  selectedPlatform, onPlatformChange,
  importanceFilter, onImportanceChange,
  showBreakingOnly, onBreakingToggle,
  showSecurityOnly, onSecurityToggle,
}: FilterPanelProps) {
  return (
    <div className="space-y-4">
      {/* Category filters */}
      <div>
        <h4 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
          分类
        </h4>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onCategoryChange(null)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              !selectedCategory
                ? "bg-[var(--color-accent)] text-white"
                : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]"
            }`}
          >
            全部
          </button>
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(selectedCategory === cat ? null : cat)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-[var(--color-accent)] text-white"
                  : `${CATEGORY_COLORS[cat]} hover:opacity-80`
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Platform filters */}
      <div>
        <h4 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
          平台
        </h4>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onPlatformChange(null)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              !selectedPlatform
                ? "bg-[var(--color-accent)] text-white"
                : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]"
            }`}
          >
            全部
          </button>
          {ALL_PLATFORMS.map((plat) => (
            <button
              key={plat}
              onClick={() => onPlatformChange(selectedPlatform === plat ? null : plat)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedPlatform === plat
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]"
              }`}
            >
              {plat}
            </button>
          ))}
        </div>
      </div>

      {/* Importance */}
      <div>
        <h4 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
          重要性
        </h4>
        <div className="flex gap-1.5">
          {[3, 4, 5].map((imp) => (
            <button
              key={imp}
              onClick={() => onImportanceChange(importanceFilter === imp ? null : imp)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                importanceFilter === imp
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]"
              }`}
            >
              P{imp}+
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showBreakingOnly}
            onChange={onBreakingToggle}
            className="rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
          />
          <span className="text-xs text-[var(--color-text-secondary)]">仅 Breaking Changes</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showSecurityOnly}
            onChange={onSecurityToggle}
            className="rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
          />
          <span className="text-xs text-[var(--color-text-secondary)]">仅安全相关</span>
        </label>
      </div>
    </div>
  );
}
