interface TagBadgeProps {
  tag: string;
  active?: boolean;
  onClick?: () => void;
}

export function TagBadge({ tag, active, onClick }: TagBadgeProps) {
  const base = "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium transition-colors";
  const style = active
    ? "bg-[var(--color-accent)] text-white"
    : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]";

  return onClick ? (
    <button onClick={onClick} className={`${base} ${style} cursor-pointer`}>
      {tag}
    </button>
  ) : (
    <span className={`${base} ${style}`}>{tag}</span>
  );
}
