import { Outlet } from "react-router-dom";
import { Header } from "./Header";

export function Layout() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-[var(--color-border)] py-6 text-center text-xs text-[var(--color-text-tertiary)]">
        ProxyPulse - 开源代理生态技术情报雷达
      </footer>
    </div>
  );
}
