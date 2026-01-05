import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label="Toggle theme"
      className="
    relative group
    inline-flex items-center justify-center
    h-9 w-9
    rounded-md
    bg-white text-gray-700
    border border-gray-200
    shadow-sm
    hover:bg-gray-50 hover:border-gray-300
    dark:bg-slate-800 dark:text-gray-200 dark:border-slate-700
    dark:hover:bg-slate-700 dark:hover:border-slate-600
    transition-colors transition-shadow duration-200
  "
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4 text-slate-700 dark:text-gray-200" />
      ) : (
        <Sun className="h-4 w-4 text-yellow-400" />
      )}

      <span
        className="
      pointer-events-none
      absolute top-1/2 left-full ml-2 -translate-y-1/2
      whitespace-nowrap
      rounded-md px-2 py-1
      text-xs font-medium
      bg-gray-900 text-white
      opacity-0 scale-95
      group-hover:opacity-100 group-hover:scale-100
      transition-all duration-200
      dark:bg-gray-100 dark:text-gray-900
    "
      >
        {theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
      </span>
    </button>
  );
}
