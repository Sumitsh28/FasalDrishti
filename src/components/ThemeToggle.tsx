import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="bg-white dark:bg-slate-800 p-2 rounded-md shadow-[0_0_0_2px_rgba(0,0,0,0.1)] hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
      title="Toggle Theme"
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4 text-slate-700" />
      ) : (
        <Sun className="h-4 w-4 text-yellow-400" />
      )}
    </button>
  );
}
