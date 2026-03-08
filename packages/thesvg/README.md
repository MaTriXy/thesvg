# thesvg

3,800+ brand SVG icons for developers. Tree-shakeable, typed, dual ESM/CJS.

This is the convenience package for [`@the-svg/icons`](https://www.npmjs.com/package/@the-svg/icons). Both packages contain the same icons.

Browse all icons at [thesvg.org](https://thesvg.org).

## Installation

```bash
npm install thesvg
pnpm add thesvg
bun add thesvg
```

## Usage

### Import a single icon (tree-shakeable)

```ts
import github from "thesvg/github";

console.log(github.svg);        // raw SVG string
console.log(github.title);      // "GitHub"
console.log(github.hex);        // "181717"
console.log(github.categories); // ["DevTool", "VCS"]
console.log(github.variants);   // { default: "<svg...>", mono: "<svg...>" }
```

### Named exports

```ts
import { svg, title, hex, categories, variants } from "thesvg/github";
```

### Barrel import

> Importing from the root includes all icons. Prefer individual imports when bundle size matters.

```ts
import { github, vercel, tailwindcss } from "thesvg";
```

### Render in React

```tsx
import { svg } from "thesvg/github";

export function GithubLogo() {
  return <div dangerouslySetInnerHTML={{ __html: svg }} />;
}
```

### Check available variants

```ts
import github from "thesvg/github";

// Keys: "default", "mono", "light", "dark", "wordmark", etc.
const monoSvg = github.variants["mono"];
```

## Icon module shape

```ts
interface IconModule {
  slug: string;       // URL-safe slug, e.g. "github"
  title: string;      // Brand name, e.g. "GitHub"
  hex: string;        // Brand color without "#", e.g. "181717"
  categories: string[];
  aliases: string[];
  svg: string;        // Raw SVG string (default variant)
  variants: Record<string, string>;
  license: string;
  url: string;
}
```

## CDN

```html
<img src="https://thesvg.org/icons/github/default.svg" alt="GitHub" width="24" height="24" />
```

## License

Icons are distributed under their respective upstream licenses. The package itself is MIT.

Built with data from [thesvg.org](https://thesvg.org).
