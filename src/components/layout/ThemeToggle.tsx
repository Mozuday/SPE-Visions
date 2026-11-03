import { useState } from "react";
import { Moon, Sun } from "lucide-react";

const ThemeToggle = () => {
  // The script in index.html has already set the class before React runs
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  const toggleTheme = () => {
    const next = !isDark;

    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);

    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // Private mode: the theme just won't persist
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
    >
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
};

export default ThemeToggle;