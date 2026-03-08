"use client";

import { memo, useCallback, useState } from "react";
import { Check, Copy, Download, ExternalLink, Heart } from "lucide-react";
import type { IconEntry } from "@/lib/icons";
import { useFavoritesStore } from "@/lib/stores/favorites-store";
import { cn } from "@/lib/utils";

interface IconCardProps {
  icon: IconEntry;
  onSelect: (icon: IconEntry) => void;
  compact?: boolean;
}

export const IconCard = memo(function IconCard({
  icon,
  onSelect,
  compact = false,
}: IconCardProps) {
  const [copied, setCopied] = useState(false);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFavorite = useFavoritesStore((s) => s.favorites.includes(icon.slug));

  const handleCopy = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        const res = await fetch(icon.variants.default);
        const svg = await res.text();
        await navigator.clipboard.writeText(svg);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch {
        await navigator.clipboard.writeText(
          `https://thesvg.org${icon.variants.default}`
        );
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    },
    [icon.variants.default]
  );

  const handleDownload = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        const res = await fetch(icon.variants.default);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${icon.slug}.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch {
        window.open(icon.variants.default, "_blank");
      }
    },
    [icon.variants.default, icon.slug]
  );

  const handleFavorite = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleFavorite(icon.slug);
    },
    [icon.slug, toggleFavorite]
  );

  const handleLink = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (icon.url) {
        window.open(icon.url, "_blank", "noopener,noreferrer");
      }
    },
    [icon.url]
  );

  const primaryCategory = icon.categories[0];

  /* ── Compact: icon-only grid ── */
  if (compact) {
    return (
      <button
        type="button"
        onClick={() => onSelect(icon)}
        className="group relative flex w-full min-w-0 flex-col items-center gap-1.5 overflow-hidden rounded-xl border border-border/40 bg-card/80 p-3 transition-all duration-200 hover:border-border hover:bg-card hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div
          onClick={handleFavorite}
          role="button"
          tabIndex={-1}
          aria-label={isFavorite ? "Unfavorite" : "Favorite"}
          className={cn(
            "absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full transition-all",
            isFavorite
              ? "text-red-500 opacity-100"
              : "text-muted-foreground opacity-0 hover:text-red-500 group-hover:opacity-100"
          )}
        >
          <Heart className={cn("h-2.5 w-2.5", isFavorite && "fill-current")} />
        </div>
        <div className="icon-preview-bg flex h-10 w-10 items-center justify-center rounded-lg p-1.5">
          <img src={icon.variants.default} alt={icon.title} className="h-full w-full object-contain" loading="lazy" decoding="async" />
        </div>
        <span className="w-full truncate text-center text-[10px] font-medium text-foreground">{icon.title}</span>
      </button>
    );
  }

  /* ── Default: modern spacious card ── */
  return (
    <button
      type="button"
      onClick={() => onSelect(icon)}
      className="group relative flex min-w-0 flex-col items-center rounded-xl border border-border/40 bg-card/80 transition-all duration-200 hover:border-border hover:bg-card hover:shadow-lg hover:shadow-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:shadow-black/20"
    >
      {/* Favorite toggle */}
      <div
        onClick={handleFavorite}
        role="button"
        tabIndex={-1}
        aria-label={isFavorite ? `Remove ${icon.title} from favorites` : `Add ${icon.title} to favorites`}
        className={cn(
          "absolute top-2.5 right-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full transition-all",
          isFavorite
            ? "text-red-500 opacity-100"
            : "text-muted-foreground opacity-0 hover:text-red-500 group-hover:opacity-100"
        )}
      >
        <Heart className={cn("h-3.5 w-3.5", isFavorite && "fill-current")} />
      </div>

      {/* Icon preview area */}
      <div className="icon-preview-bg flex w-full items-center justify-center rounded-t-xl px-4 py-5 sm:px-6 sm:py-8">
        <img
          src={icon.variants.default}
          alt={icon.title}
          className="h-10 w-10 object-contain transition-transform duration-200 group-hover:scale-110 sm:h-12 sm:w-12"
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* Info section */}
      <div className="flex w-full flex-col items-center gap-0.5 px-2 pt-2 pb-1.5 sm:px-3 sm:pt-2.5 sm:pb-2">
        <span className="w-full truncate text-center text-xs font-medium text-foreground sm:text-[13px]">
          {icon.title}
        </span>
        <span className="text-[9px] text-muted-foreground sm:text-[10px]">
          {primaryCategory || icon.slug}
        </span>
      </div>

      {/* Action bar */}
      <div className="flex w-full items-center justify-center gap-0.5 border-t border-border/30 px-1.5 py-1.5 sm:gap-1 sm:px-2 sm:py-2">
        <div
          onClick={handleCopy}
          role="button"
          tabIndex={-1}
          aria-label="Copy SVG"
          className="flex h-7 flex-1 items-center justify-center gap-1 rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          <span className="hidden text-[10px] font-medium sm:inline">Copy</span>
        </div>
        <div
          onClick={handleDownload}
          role="button"
          tabIndex={-1}
          aria-label="Download SVG"
          className="flex h-7 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <Download className="h-3.5 w-3.5" />
        </div>
        {icon.url && (
          <div
            onClick={handleLink}
            role="button"
            tabIndex={-1}
            aria-label="Open website"
            className="flex h-7 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </div>
        )}
      </div>
    </button>
  );
});
