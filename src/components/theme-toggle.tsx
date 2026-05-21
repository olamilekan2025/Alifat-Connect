"use client";

import { useEffect, useState } from "react";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "next-themes";

import { Switch } from "@/components/ui/switch";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } =
    useTheme();

  const [mounted, setMounted] =
    useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark =
    resolvedTheme === "dark";

  return (
    <div className="flex items-center justify-between rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900">
          {isDark ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </div>

        <div>
          <p className="font-medium">
            Dark Mode
          </p>

          <p className="text-sm text-zinc-500">
            Toggle application theme.
          </p>
        </div>
      </div>

      <Switch
        checked={isDark}
        onCheckedChange={(checked) =>
          setTheme(
            checked
              ? "dark"
              : "light"
          )
        }
      />
    </div>
  );
}