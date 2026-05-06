import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold text-[var(--color-text)] mb-4">404</h1>
      <p className="text-[var(--color-text-secondary)] mb-6">页面未找到</p>
      <Link to="/" className="text-[var(--color-accent)] hover:underline">返回首页</Link>
    </div>
  );
}
