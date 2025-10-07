import type { Collection, Schema } from "tinacms";
import { CATEGORY_OPTIONS } from "../src/utils/categories";

// slugify determinístico (espelha src/utils/slug.ts)
function slugifyInline(value: string): string {
  const s = (value || "").trim();
  if (!s) return "untitled";
  return (
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/&/g, " e ")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-") || "untitled"
  );
}

const blogsCollection: Collection = {
  name: "blogs",
  label: "Publicações",
  path: "src/content/blogs",
  format: "md",

  ui: {
    filename: {
      slugify: (values: Record<string, unknown>) => {
        const raw = (values?.title as string) || "untitled";
        return slugifyInline(raw);
      },
    },
  },

  fields: [
    { type: "string", name: "title", label: "Título", required: true, isTitle: true },
    {
      type: "string",
      name: "description",
      label: "Descrição",
      required: true,
      ui: { component: "textarea" },
    },
    {
      type: "datetime",
      name: "pubDate",
      label: "Data de publicação",
      required: true,
      ui: { dateFormat: "YYYY-MM-DD" },
    },
    {
      type: "string",
      name: "category",
      label: "Categoria",
      required: true,
      options: CATEGORY_OPTIONS.map((option) => ({ label: option, value: option })),
    },
    { type: "string", name: "author", label: "Autor", required: true },
    { type: "image", name: "heroImage", label: "Imagem destaque" },
    { type: "string", name: "heroImageAlt", label: "Texto alternativo da imagem" },

    // corpo do post
    { type: "rich-text", name: "body", label: "Conteúdo", isBody: true },
  ],
};

const schema: Schema = { collections: [blogsCollection] };
export default schema;
