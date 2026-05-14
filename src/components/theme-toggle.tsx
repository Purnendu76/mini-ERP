import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={toggleTheme}
      className="rounded-xl h-9 w-9 border-slate-200 dark:border-slate-800 bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-slate-800 transition-all relative overflow-hidden group shadow-sm flex items-center justify-center p-0"
    >
      <div 
        className="flex flex-col transition-transform duration-500 ease-in-out h-full w-full" 
        style={{
          transform: theme === "dark" ? "translateY(-100%)" : "translateY(0%)"
        }}
      >
        <div className="h-9 w-9 flex items-center justify-center shrink-0">
          <Sun className="h-[1.2rem] w-[1.2rem] text-amber-500" />
        </div>
        <div className="h-9 w-9 flex items-center justify-center shrink-0">
          <Moon className="h-[1.2rem] w-[1.2rem] text-blue-400" />
        </div>
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
