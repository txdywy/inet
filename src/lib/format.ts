import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";
import { zhCN } from "date-fns/locale";
import type { Category } from "../../types/radar";

export function timeAgo(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: zhCN });
  } catch {
    return dateStr;
  }
}

export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isToday(d)) return `今天 ${format(d, "HH:mm")}`;
    if (isYesterday(d)) return `昨天 ${format(d, "HH:mm")}`;
    return format(d, "MM-dd HH:mm");
  } catch {
    return dateStr;
  }
}

export const CATEGORY_LABELS: Record<Category, string> = {
  core: "核心内核",
  client: "客户端",
  router: "路由器",
  protocol: "协议",
  dns_rules: "DNS/规则",
  security: "安全",
  ecosystem: "生态",
  trend: "趋势",
};

export const CATEGORY_COLORS: Record<Category, string> = {
  core: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  client: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  router: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  protocol: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  dns_rules: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  security: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  ecosystem: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  trend: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
};

export const IMPORTANCE_COLORS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
  2: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  3: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  4: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  5: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

export function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + "...";
}
