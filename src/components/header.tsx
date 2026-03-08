"use client";

import Link from "next/link";
import { Github, Menu, Moon, Plus, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/lib/stores/sidebar-store";

export function Header() {
  const { theme, setTheme } = useTheme();
  const toggleSidebar = useSidebarStore((s) => s.toggle);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleSidebar}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-transparent.svg"
              alt="theSVG"
              width={36}
              height={36}
              className="h-9 w-9 rounded-lg dark:rounded-md"
            />
            <span className="text-base font-semibold tracking-tight">theSVG</span>
          </Link>
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            href="/extensions"
            className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:inline-flex"
          >
            Extensions
          </Link>
          <Link href="/submit">
            <Button
              size="sm"
              className="gap-1.5 bg-orange-500 text-sm font-medium text-white hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Submit</span>
            </Button>
          </Link>
          <a
            href="https://www.npmjs.com/package/thesvg"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="npm"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <svg viewBox="0 0 780 250" className="h-5 w-5" aria-hidden="true">
              <path fill="#CB3837" d="M240 250h100V0H240v250zm-30 0H0V0h210v220H90V30H30v220h150V0h30v250zm390 0H390V0h210v250zM450 30v190h60V30h-60z" />
            </svg>
          </a>
          <a
            href="https://github.com/GLINCKER/thesvg"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Github className="h-4 w-4" />
          </a>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            <Sun className="h-4 w-4 scale-100 rotate-0 transition-transform dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-transform dark:scale-100 dark:rotate-0" />
          </Button>
        </div>
      </div>
    </header>
  );
}
