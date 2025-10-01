# Lefthand Journal

Minimal editorial blog built with [Astro](https://astro.build) and Tailwind CSS. The project reimagines the original template as a calm magazine-inspired layout with light/dark themes, responsive editorial cards, and focused typography.

## Getting started

```sh
npm install
npm run dev
```

The site runs at `http://localhost:4321` by default.

## Editing content

- Articles live in `src/content/blogs`. Each Markdown file uses the following frontmatter:
  ```yaml
  ---
  title: "Article title"
  description: "One-sentence dek that appears in cards."
  pubDate: 2024-02-12
  category: "Chess" # Chess | Geopolitics | Philosophy | Technology
  author: "Lefthand Editorial"
  heroImage: "https://..." # optional 16:9 image
  heroImageAlt: "Accessible alt text"
  ---
  ```
- Categories are locked to `Chess`, `Geopolitics`, `Philosophy`, and `Technology`. Update `src/utils/categories.ts` if you need to change or extend them.
- Add or edit Markdown body copy below the frontmatter to update article pages.

## Customising the look and feel

- Global colours, fonts, and theme tokens are defined in `src/styles/global.css` and `tailwind.config.mjs`.
- Editorial cards live in `src/components/Blog/EditorialCard.astro` and are reused across the home page, archive, and category views.
- Theme persistence is handled in `src/components/Header/HeaderBtns.svelte`. The toggle writes to `localStorage` and updates the `data-theme` attribute on `<html>`.

## Building for production

```sh
npm run build
npm run preview
```

The project ships as a static site and can be deployed to any static hosting provider.

## Publishing & database operations

For Hostinger setup instructions, SQL schema details, API endpoint overview, and export/import guidance, see [docs/publishing.md](docs/publishing.md).
