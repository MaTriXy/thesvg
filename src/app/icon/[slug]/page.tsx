import { notFound } from "next/navigation";
import { getAllIcons, getIconBySlug, getIconsByCategory } from "@/lib/icons";
import { IconDetailPage } from "@/components/icons/icon-detail-page";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const icons = getAllIcons();
  return icons.map((icon) => ({ slug: icon.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const icon = getIconBySlug(slug);
  if (!icon) return {};

  const variantCount = Object.values(icon.variants).filter(Boolean).length;
  const categoryList = icon.categories.join(", ");
  const description =
    `Download the ${icon.title} SVG icon for free. Available in ${variantCount} variant${variantCount !== 1 ? "s" : ""}` +
    (categoryList ? ` - ${categoryList}.` : ".") +
    " Copy as SVG, JSX, Vue component, CDN URL, or Data URI. Open-source.";

  return {
    title: `${icon.title} SVG Icon - theSVG`,
    description,
    keywords: [icon.title, icon.slug, ...icon.aliases, ...icon.categories, "SVG icon", "free icon", "brand icon"],
    openGraph: {
      title: `${icon.title} SVG Icon - theSVG`,
      description,
      url: `https://thesvg.org/icon/${slug}`,
      type: "website",
      images: [
        {
          url: `https://thesvg.org${icon.variants.default}`,
          width: 512,
          height: 512,
          alt: `${icon.title} icon`,
        },
      ],
    },
    twitter: {
      card: "summary",
      title: `${icon.title} SVG Icon - theSVG`,
      description,
      images: [`https://thesvg.org${icon.variants.default}`],
    },
    alternates: {
      canonical: `https://thesvg.org/icon/${slug}`,
    },
  };
}

export default async function IconPage({ params }: PageProps) {
  const { slug } = await params;
  const icon = getIconBySlug(slug);
  if (!icon) notFound();

  // Gather related icons: same primary category, excluding self, capped at 8
  const primaryCategory = icon.categories[0] ?? null;
  const relatedIcons = primaryCategory
    ? getIconsByCategory(primaryCategory)
        .filter((rel) => rel.slug !== icon.slug)
        .slice(0, 8)
    : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    name: `${icon.title} SVG Icon`,
    description: `Free ${icon.title} SVG icon in ${Object.values(icon.variants).filter(Boolean).length} variants`,
    contentUrl: `https://thesvg.org${icon.variants.default}`,
    url: `https://thesvg.org/icon/${slug}`,
    encodingFormat: "image/svg+xml",
    license: icon.license,
    ...(icon.url ? { sameAs: [icon.url] } : {}),
    keywords: [icon.title, ...icon.aliases, ...icon.categories].join(", "),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <IconDetailPage icon={icon} relatedIcons={relatedIcons} />
    </>
  );
}
