import { Link, useLocation } from "react-router-dom";
import { Radar, Sun, Moon, Menu, X } from "lucide-react";
import { useState } from "react";
import { useTheme } from "../lib/theme";

const NAV_ITEMS = [
  { path: "/", label: "Dashboard" },
  { path: "/updates", label: "最新更新" },
  { path: "/projects", label: "项目" },
  { path: "/protocols", label: "协议" },
  { path: "/tags", label: "标签" },
];

export function Header() {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-[var(--color-text)] no-underline">
            <Radar className="w-6 h-6 text-[var(--color-accent)]" />
            <span className="font-bold text-lg hidden sm:block">ProxyPulse</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors no-underline ${
                  location.pathname === item.path
                    ? "bg-[var(--color-accent-light)] text-[var(--color-accent)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-md hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-md hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav className="md:hidden py-3 border-t border-[var(--color-border)]">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium no-underline ${
                  location.pathname === item.path
                    ? "bg-[var(--color-accent-light)] text-[var(--color-accent)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
