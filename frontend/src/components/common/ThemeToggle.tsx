import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "../../store/themeStore";

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-bg-tertiary hover:text-text"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
