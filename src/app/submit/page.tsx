import { ArrowLeft, CheckCircle, FileCode, GitBranch, Upload } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { getAllCategories } from "@/lib/icons";
import { SubmitForm } from "@/components/submit/submit-form";

export const metadata: Metadata = {
  title: "Submit an Icon - theSVG",
  description: "Every brand deserves a place. Submit your brand SVG to theSVG.",
};

export default function SubmitPage() {
  const categories = getAllCategories();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to all icons
      </Link>

      <h1 className="mb-3 text-3xl font-bold">Submit an Icon</h1>
      <p className="mb-8 text-lg text-muted-foreground">
        Every brand deserves a place. No gatekeeping.
      </p>

      <div className="space-y-10">
        {/* Steps */}
        <div className="grid gap-6 sm:grid-cols-2">
          <Step
            number={1}
            icon={<GitBranch className="h-5 w-5" />}
            title="Fork the repo"
            description="Fork github.com/glincker/thesvg and clone it locally."
          />
          <Step
            number={2}
            icon={<Upload className="h-5 w-5" />}
            title="Add your SVGs"
            description="Place SVG files in public/icons/{slug}/ with proper naming (default.svg, mono.svg, light.svg, dark.svg)."
          />
          <Step
            number={3}
            icon={<FileCode className="h-5 w-5" />}
            title="Update icons.json"
            description="Add your icon entry to src/data/icons.json following the schema."
          />
          <Step
            number={4}
            icon={<CheckCircle className="h-5 w-5" />}
            title="Open a PR"
            description="Run pnpm validate, then open a pull request. CI will auto-check your submission."
          />
        </div>

        {/* SVG Requirements */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">SVG Requirements</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
              Valid SVG/XML markup
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
              Under 50KB file size
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
              No embedded scripts or external references
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
              viewBox attribute present
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
              Gradients and multi-color SVGs welcome
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
              You have the right to redistribute the icon
            </li>
          </ul>
        </div>

        {/* Icon Entry Schema */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Icon Entry Schema</h2>
          <pre className="overflow-auto rounded-lg bg-muted/50 p-4 text-xs">
            <code>{`{
  "slug": "your-brand",
  "title": "Your Brand",
  "aliases": [],
  "hex": "FF5733",
  "categories": ["Software"],
  "variants": {
    "default": "/icons/your-brand/default.svg",
    "mono": "/icons/your-brand/mono.svg",
    "dark": "/icons/your-brand/dark.svg"
  },
  "license": "MIT",
  "url": "https://yourbrand.com"
}`}</code>
          </pre>
        </div>

        {/* Interactive Submission Form */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-6">
            <h2 className="mb-1 text-lg font-semibold">Quick Submit</h2>
            <p className="text-sm text-muted-foreground">
              Drop your SVG below to validate it and generate a pre-filled GitHub issue -
              no local setup required.
            </p>
          </div>
          <SubmitForm availableCategories={categories} />
        </div>
      </div>
    </div>
  );
}

function Step({
  number,
  icon,
  title,
  description,
}: {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 rounded-xl border border-border bg-card p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
        {icon}
      </div>
      <div>
        <h3 className="font-medium">
          <span className="text-muted-foreground">#{number}</span> {title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
