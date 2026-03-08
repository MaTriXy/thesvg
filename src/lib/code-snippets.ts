export type SnippetFormat = "react" | "vue" | "html" | "nextjs" | "css";

const CDN_BASE =
  "https://cdn.jsdelivr.net/gh/GLINCKER/thesvg@main/public/icons";
const SITE_BASE = "https://thesvg.org/icons";

/**
 * Convert a kebab-case icon slug to PascalCase for use as a component name.
 * Handles edge cases: dots, numbers at start of a word, etc.
 *
 * Examples:
 *   "github"              -> "Github"
 *   "visual-studio-code"  -> "VisualStudioCode"
 *   "42crunch"            -> "Icon42crunch"
 *   "c++"                 -> "CPlusPlus" (sanitized)
 *   "node.js"             -> "NodeJs"
 */
export function slugToPascalCase(slug: string): string {
  // Replace dots with hyphens so "node.js" becomes "node-js"
  let normalized = slug.replace(/\./g, "-");

  // Replace "+" with "Plus" and "&" with "And" for common symbols
  normalized = normalized.replace(/\+/g, "plus-").replace(/&/g, "and-");

  // Strip any remaining non-alphanumeric, non-hyphen characters
  normalized = normalized.replace(/[^a-z0-9-]/gi, "-");

  // Collapse multiple hyphens
  normalized = normalized.replace(/-+/g, "-").replace(/^-|-$/g, "");

  const parts = normalized.split("-");
  const pascalParts = parts.map(
    (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
  );
  const pascal = pascalParts.join("");

  // If result starts with a digit, prefix with "Icon"
  if (/^\d/.test(pascal)) {
    return `Icon${pascal}`;
  }

  return pascal;
}

/**
 * Convert a camelCase variant key to kebab-case filename segment.
 * "wordmarkLight" -> "wordmark-light"
 */
function variantToFilename(variant: string): string {
  return variant.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

function getCdnUrl(slug: string, variant: string): string {
  const filename = variantToFilename(variant);
  return `${CDN_BASE}/${slug}/${filename}.svg`;
}

function getSiteUrl(slug: string, variant: string): string {
  const filename = variantToFilename(variant);
  return `${SITE_BASE}/${slug}/${filename}.svg`;
}

/**
 * CSS class name derived from slug, e.g. "visual-studio-code" stays as-is.
 */
function slugToClassName(slug: string): string {
  return slug.replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
}

export function generateSnippet(
  slug: string,
  title: string,
  format: SnippetFormat,
  variant: string = "default"
): string {
  const componentName = slugToPascalCase(slug);
  const cdnUrl = getCdnUrl(slug, variant);
  const siteUrl = getSiteUrl(slug, variant);
  const cssClass = `icon-${slugToClassName(slug)}`;

  switch (format) {
    case "react":
      return `import { ${componentName} } from '@thesvg/react';

export default function App() {
  return <${componentName} className="h-6 w-6" />;
}`;

    case "vue":
      return `<template>
  <img
    src="${cdnUrl}"
    alt="${title}"
    class="h-6 w-6"
  />
</template>`;

    case "html":
      return `<img
  src="${cdnUrl}"
  alt="${title}"
  width="24"
  height="24"
/>`;

    case "nextjs":
      return `import Image from 'next/image';

export default function App() {
  return (
    <Image
      src="${siteUrl}"
      alt="${title}"
      width={24}
      height={24}
    />
  );
}`;

    case "css":
      return `.${cssClass} {
  background-image: url('${cdnUrl}');
  background-size: contain;
  background-repeat: no-repeat;
  width: 24px;
  height: 24px;
}`;

    default:
      return "";
  }
}
