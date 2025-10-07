import type { Collection, Schema } from "tinacms";
import { CATEGORY_OPTIONS } from "../src/utils/categories";

function slugifyInline(value: string): string {
  const s = (value || "").trim();
  if (!s) return "untitled";
  return (
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-") || "untitled"
  );
}

const blogsCollection: Collection = {
  name: "blogs",
  label: "Posts",
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
    { type: "string", name: "description", label: "Descrição", required: true, ui: { component: "textarea" } },
    { type: "datetime", name: "pubDate", label: "Publicado em", required: true, ui: { dateFormat: "YYYY-MM-DD" } },
    {
      type: "string",
      name: "category",
      label: "Tópico",
      required: true,
      options: CATEGORY_OPTIONS.map((option) => ({ label: option, value: option })),
    },
    { type: "string", name: "author", label: "Autor", required: true },
    { type: "image", name: "heroImage", label: "Imagem de capa" },
    { type: "string", name: "heroImageAlt", label: "Alt da capa" },
    { type: "rich-text", name: "body", label: "Conteúdo", isBody: true },
  ],
};

const schema: Schema = { collections: [blogsCollection] };
export default schema;
