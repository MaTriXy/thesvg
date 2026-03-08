// Registry API client - uses Node 18+ native fetch

const BASE_URL = "https://thesvg.org";

export interface IconVariants {
  default: string;
  light?: string;
  dark?: string;
  mono?: string;
  wordmark?: string;
  wordmarkLight?: string;
  wordmarkDark?: string;
}

export interface IconEntry {
  slug: string;
  title: string;
  aliases: string[];
  hex: string;
  categories: string[];
  variants: IconVariants;
  license: string;
  url?: string;
  guidelines?: string;
}

export interface IconListResponse {
  total: number;
  offset: number;
  limit: number;
  icons: IconEntry[];
}

function isIconEntry(value: unknown): value is IconEntry {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v["slug"] === "string" &&
    typeof v["title"] === "string" &&
    typeof v["variants"] === "object" &&
    v["variants"] !== null
  );
}

function isIconListResponse(value: unknown): value is IconListResponse {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v["total"] === "number" &&
    Array.isArray(v["icons"])
  );
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiFetch(path: string): Promise<unknown> {
  const url = `${BASE_URL}${path}`;
  let response: Response;

  try {
    response = await fetch(url);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown network error";
    throw new ApiError(`Network error fetching ${url}: ${message}`);
  }

  if (!response.ok) {
    if (response.status === 404) {
      throw new ApiError(`Not found: ${url}`, 404);
    }
    throw new ApiError(
      `Request failed with status ${response.status}: ${url}`,
      response.status
    );
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw new ApiError(`Invalid JSON response from ${url}`);
  }

  return json;
}

/**
 * Fetch a single icon by slug from the registry.
 */
export async function fetchIcon(slug: string): Promise<IconEntry> {
  const data = await apiFetch(`/api/icons/${encodeURIComponent(slug)}`);

  if (!isIconEntry(data)) {
    throw new ApiError(`Unexpected response shape for icon "${slug}"`);
  }

  return data;
}

/**
 * Fetch the full icon list, optionally filtered by category.
 */
export async function fetchIconList(options?: {
  category?: string;
  query?: string;
  limit?: number;
}): Promise<IconListResponse> {
  const params = new URLSearchParams();

  if (options?.category) {
    params.set("category", options.category);
  }
  if (options?.query) {
    params.set("q", options.query);
  }
  if (options?.limit !== undefined) {
    params.set("limit", String(options.limit));
  }

  const qs = params.toString();
  const path = `/api/icons${qs ? `?${qs}` : ""}`;
  const data = await apiFetch(path);

  if (!isIconListResponse(data)) {
    throw new ApiError("Unexpected response shape for icon list");
  }

  return data;
}

/**
 * Fetch the raw SVG content for a given icon + variant from the CDN.
 */
export async function fetchSvgContent(
  slug: string,
  variant: string = "default"
): Promise<string> {
  const filename = variantToFilename(variant);
  const url = `${BASE_URL}/icons/${encodeURIComponent(slug)}/${filename}.svg`;

  let response: Response;
  try {
    response = await fetch(url);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown network error";
    throw new ApiError(`Network error fetching SVG from ${url}: ${message}`);
  }

  if (!response.ok) {
    if (response.status === 404) {
      throw new ApiError(
        `SVG not found for "${slug}" (variant: ${variant})`,
        404
      );
    }
    throw new ApiError(
      `Failed to fetch SVG: HTTP ${response.status}`,
      response.status
    );
  }

  return response.text();
}

function variantToFilename(variant: string): string {
  return variant.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}
