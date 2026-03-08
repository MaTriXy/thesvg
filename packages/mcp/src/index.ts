#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE_URL = "https://thesvg.org/api";
const CDN_BASE = "https://cdn.thesvg.org";

// --- Types ---

interface RegistryIcon {
  slug: string;
  title: string;
  categories: string[];
  variants?: string[];
}

interface IconDetail extends RegistryIcon {
  svg: string;
  source?: string;
  license?: string;
}

interface Category {
  slug: string;
  name: string;
  count: number;
}

// --- Helpers ---

async function fetchRegistry(): Promise<RegistryIcon[]> {
  const res = await fetch(`${BASE_URL}/registry`);
  if (!res.ok) {
    throw new Error(`Registry fetch failed: ${res.status} ${res.statusText}`);
  }
  const data: unknown = await res.json();
  if (!Array.isArray(data)) {
    throw new Error("Unexpected registry response format");
  }
  return data as RegistryIcon[];
}

async function fetchIconDetail(slug: string): Promise<IconDetail> {
  const res = await fetch(`${BASE_URL}/registry/${encodeURIComponent(slug)}`);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Icon not found: "${slug}"`);
    }
    throw new Error(`Icon fetch failed: ${res.status} ${res.statusText}`);
  }
  const data: unknown = await res.json();
  return data as IconDetail;
}

async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${BASE_URL}/categories`);
  if (!res.ok) {
    throw new Error(`Categories fetch failed: ${res.status} ${res.statusText}`);
  }
  const data: unknown = await res.json();
  if (!Array.isArray(data)) {
    throw new Error("Unexpected categories response format");
  }
  return data as Category[];
}

function buildIconUrl(slug: string, variant: string, useCdn: boolean): string {
  const variantSuffix = variant === "default" ? "" : `-${variant}`;
  const filename = `${slug}${variantSuffix}.svg`;
  if (useCdn) {
    return `${CDN_BASE}/icons/${filename}`;
  }
  return `${BASE_URL}/icons/${filename}`;
}

function matchesQuery(icon: RegistryIcon, query: string): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return true;
  const titleMatch = icon.title.toLowerCase().includes(q);
  const slugMatch = icon.slug.toLowerCase().includes(q);
  const categoryMatch = icon.categories.some((c) =>
    c.toLowerCase().includes(q)
  );
  return titleMatch || slugMatch || categoryMatch;
}

// --- MCP Server ---

const server = new McpServer({
  name: "thesvg",
  version: "0.1.0",
});

server.tool(
  "search_icons",
  "Search for brand SVG icons from thesvg.org by name, slug, or category. Returns a list of matching icons with their slugs, titles, and categories.",
  {
    query: z.string().describe("Search term to filter icons by name or slug"),
    category: z
      .string()
      .optional()
      .describe("Filter by category slug (e.g. 'social', 'tech')"),
    limit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .default(20)
      .describe("Maximum number of results to return (1-100, default 20)"),
  },
  async ({ query, category, limit }) => {
    try {
      const icons = await fetchRegistry();

      let filtered = icons.filter((icon) => matchesQuery(icon, query));

      if (category) {
        const cat = category.toLowerCase().trim();
        filtered = filtered.filter((icon) =>
          icon.categories.some((c) => c.toLowerCase() === cat)
        );
      }

      const results = filtered.slice(0, limit ?? 20);

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No icons found matching "${query}"${category ? ` in category "${category}"` : ""}.`,
            },
          ],
        };
      }

      const lines = [
        `Found ${results.length} icon${results.length === 1 ? "" : "s"}${results.length < filtered.length ? ` (showing ${results.length} of ${filtered.length})` : ""}:`,
        "",
        ...results.map(
          (icon) =>
            `- **${icon.title}** (slug: \`${icon.slug}\`)` +
            (icon.categories.length > 0
              ? ` — categories: ${icon.categories.join(", ")}`
              : "")
        ),
      ];

      return {
        content: [{ type: "text", text: lines.join("\n") }],
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: "text", text: `Error searching icons: ${message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "get_icon",
  "Fetch a specific brand SVG icon from thesvg.org by slug. Returns the raw SVG markup inline along with metadata.",
  {
    slug: z
      .string()
      .describe("Icon slug identifier (e.g. 'github', 'stripe', 'openai')"),
    variant: z
      .string()
      .optional()
      .default("default")
      .describe(
        "Icon variant to fetch (e.g. 'default', 'dark', 'light'). Defaults to 'default'."
      ),
  },
  async ({ slug, variant }) => {
    try {
      const icon = await fetchIconDetail(slug);

      const resolvedVariant = variant ?? "default";
      const lines = [
        `# ${icon.title}`,
        "",
        `**Slug**: \`${icon.slug}\``,
        `**Categories**: ${icon.categories.length > 0 ? icon.categories.join(", ") : "none"}`,
        icon.variants && icon.variants.length > 0
          ? `**Available variants**: ${icon.variants.join(", ")}`
          : "",
        icon.source ? `**Source**: ${icon.source}` : "",
        icon.license ? `**License**: ${icon.license}` : "",
        "",
        `**Variant**: ${resolvedVariant}`,
        "",
        "```svg",
        icon.svg,
        "```",
      ].filter((line) => line !== undefined);

      return {
        content: [{ type: "text", text: lines.join("\n") }],
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: "text", text: `Error fetching icon: ${message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "get_icon_url",
  "Get a direct URL for a brand SVG icon from thesvg.org. Useful when you need a URL to embed in HTML or Markdown rather than the raw SVG content.",
  {
    slug: z
      .string()
      .describe("Icon slug identifier (e.g. 'github', 'stripe', 'openai')"),
    variant: z
      .string()
      .optional()
      .default("default")
      .describe("Icon variant (e.g. 'default', 'dark', 'light')"),
    cdn: z
      .boolean()
      .optional()
      .default(true)
      .describe(
        "Use the CDN URL for better performance (default: true). Set to false for the direct API URL."
      ),
  },
  async ({ slug, variant, cdn }) => {
    try {
      const resolvedVariant = variant ?? "default";
      const useCdn = cdn !== false;
      const url = buildIconUrl(slug, resolvedVariant, useCdn);

      return {
        content: [
          {
            type: "text",
            text: [
              `**Icon URL** for \`${slug}\` (variant: ${resolvedVariant}):`,
              "",
              url,
              "",
              `Source: ${useCdn ? "CDN" : "API"}`,
              "",
              "Example usage:",
              `\`\`\`html`,
              `<img src="${url}" alt="${slug}" width="32" height="32" />`,
              "```",
            ].join("\n"),
          },
        ],
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [
          { type: "text", text: `Error building icon URL: ${message}` },
        ],
        isError: true,
      };
    }
  }
);

server.tool(
  "list_categories",
  "List all available icon categories from thesvg.org with their icon counts. Use this to discover what categories exist before searching.",
  {},
  async () => {
    try {
      const categories = await fetchCategories();

      if (categories.length === 0) {
        return {
          content: [{ type: "text", text: "No categories found." }],
        };
      }

      const sorted = [...categories].sort((a, b) => b.count - a.count);

      const lines = [
        `${sorted.length} categories available:`,
        "",
        ...sorted.map(
          (cat) =>
            `- **${cat.name}** (slug: \`${cat.slug}\`) — ${cat.count} icon${cat.count === 1 ? "" : "s"}`
        ),
      ];

      return {
        content: [{ type: "text", text: lines.join("\n") }],
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [
          { type: "text", text: `Error fetching categories: ${message}` },
        ],
        isError: true,
      };
    }
  }
);

// --- Start ---

const transport = new StdioServerTransport();
await server.connect(transport);
