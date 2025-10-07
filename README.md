# levogiro

Publicação editorial minimalista construída com [Astro](https://astro.build), Tailwind CSS, Svelte e TinaCMS. O projeto mantém um layout inspirado em revistas, com temas claro/escuro, cartões editoriais responsivos e tipografia focada na leitura — agora totalmente em português.

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
  title: "Título do artigo"
  description: "Linha fina exibida nos cartões."
  pubDate: 2024-02-12
  category: "TECNOLOGIA" # TECNOLOGIA | GEOPOLÍTICA | XADREZ & HOBBIES | ARTE & CULTURA | MUSICALIDADE | OFF-TOPIC
  author: "Antonio Maluf"
  heroImage: "https://..." # opcional, imagem 16:9
  heroImageAlt: "Texto alternativo acessível"
  ---
  ```
- As categorias válidas são `TECNOLOGIA`, `GEOPOLÍTICA`, `XADREZ & HOBBIES`, `ARTE & CULTURA`, `MUSICALIDADE` e `OFF-TOPIC`. Atualize `src/utils/categories.ts` se precisar alterar ou estender essa lista.
- Add or edit Markdown body copy below the frontmatter to update article pages.

## TinaCMS content editing

TinaCMS is configured to edit the Astro content collection directly. The Tina admin UI is
exposed at `/admin` (served via `src/pages/admin/[...tina].astro`).

### Environment variables

Add the following variables to your `.env` file or hosting provider:

| Variable | Description |
| --- | --- |
| `TINA_CLIENT_ID` | Tina Cloud client ID for the project. |
| `TINA_TOKEN` | Tina Cloud read/write token. |
| `TINA_BRANCH` | (Optional) Git branch to source content from. Defaults to `main`. |

### Setup steps

1. Install dependencies (requires access to Tina's public npm packages):
   ```sh
   npm install
   ```
2. Generate the Tina client output:
   ```sh
   npx tina@latest init
   ```
   This populates `.tina/__generated__` and builds the `/admin` SPA assets.
3. Start Astro as normal:
   ```sh
   npm run dev
   ```

> **Note**
> If your environment blocks access to scoped npm packages (e.g. `@tinacms/cli`), request access
> or configure an authenticated registry mirror before running the commands above.

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
