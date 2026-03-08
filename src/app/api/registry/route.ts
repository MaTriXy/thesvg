import { NextRequest, NextResponse } from "next/server";
import { getAllIcons, getIconsByCategory } from "@/lib/icons";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=86400, s-maxage=86400",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category");

  const icons = category ? getIconsByCategory(category) : getAllIcons();

  const index = icons.map((icon) => ({
    slug: icon.slug,
    title: icon.title,
    categories: icon.categories,
    variants: Object.keys(icon.variants).filter(
      (key) => icon.variants[key as keyof typeof icon.variants]
    ),
  }));

  return NextResponse.json(
    { count: index.length, icons: index },
    { status: 200, headers: { ...CORS_HEADERS, ...CACHE_HEADERS } }
  );
}
