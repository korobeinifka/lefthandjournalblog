# Lefthand Journal

Minimal editorial blog built with [Astro](https://astro.build) and Tailwind CSS. The project reimagines the original template as a calm magazine-inspired layout with light/dark themes, responsive editorial cards, and focused typography.

## Getting started

```sh
npm install
npm run dev
```

The site runs at `http://localhost:4321` by default.

### Managing content with TinaCMS

TinaCMS is configured to edit the Markdown posts stored in `src/content/blogs` without changing their frontmatter structure. To
run the editor locally:

1. Install dependencies (includes the Tina CLI):
   ```sh
   npm install
   ```
2. Start the Tina development server alongside Astro:
   ```sh
   npm run tina:dev
   ```
   This command runs `tinacms dev -c "npm run dev"`, which proxies Git commits through the Tina local backend so every save wri
   tes directly to the repository.
3. Visit `http://localhost:4321/admin` to launch the Tina UI. Authenticate if prompted (the local backend will use your Git cre
   dentials) and edit posts inline.
4. Commit the generated Markdown updates in `src/content/blogs` once you finish editing.

For a production build of the Tina admin, run `npm run tina:build`. The static assets are emitted to `public/admin` and can be
served along with the site.

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
