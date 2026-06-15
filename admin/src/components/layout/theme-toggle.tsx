"use client";

import {Moon, Sun} from "lucide-react";
import {useTheme} from "next-themes";
import {Button} from "@/components/ui/button";

export function ThemeToggle() {
  const {theme, setTheme} = useTheme();
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <Button
      type="button"
      variant="secondary"
      className="w-10 px-0"
      onClick={() => setTheme(nextTheme)}
      title="Toggle theme"
    >
      <Sun className="hidden h-4 w-4 dark:block" />
      <Moon className="h-4 w-4 dark:hidden" />
    </Button>
  );
}
