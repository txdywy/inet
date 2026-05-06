import { IMPORTANCE_COLORS } from "../lib/format";
import type { Importance } from "../../types/radar";

export function ImportanceBadge({ value }: { value: Importance }) {
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${IMPORTANCE_COLORS[value]}`}>
      P{value}
    </span>
  );
}
