// tina/schema.ts
import { CATEGORY_OPTIONS } from "../src/utils/categories";

// ⚠️ Função determinística de slug: sem datas, envs ou imports externos
function slugifyInline(value: string): string {
  const s = (value || "").trim();
  if (!s) return "untitled";
  return (
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove acentos
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")     // qualquer grupo não-alfanumérico -> "-"
      .replace(/^-+|-+$/g, "")         // remove hífens nas pontas
      .replace(/-{2,}/g, "-") || "untitled" // colapsa múltiplos hífens
  );
}

// ⚠️ Sem anotar como Collection p/ evitar confusão de tipos (FieldCollection vs ui.filename)
const blogsCollection = {
  name: "blogs",
  label: "Blog Posts",
  path: "src/content/blogs",
  format: "md",

  // Customização oficial de filename no Tina (determinística)
  ui: {
    filename: {
      slugify: (values: Record<string, unknown>) => {
        const raw = (values?.title as string) || "untitled";
        return slugifyInline(raw);
      },
    },
  },

  fields: [
    { type: "string", name: "title", label: "Title", required: true, isTitle: true },
    {
      type: "string",
      name: "description",
      label: "Description",
      required: true,
      ui: { component: "textarea" },
    },
    {
      type: "datetime",
      name: "pubDate",
      label: "Published Date",
      required: true,
      ui: { dateFormat: "YYYY-MM-DD" },
    },
    {
      type: "string",
      name: "category",
      label: "Category",
      required: true,
      options: CATEGORY_OPTIONS.map((option) => ({ label: option, value: option })),
    },
    { type: "string", name: "author", label: "Author", required: true },
    { type: "image", name: "heroImage", label: "Hero Image" },
    { type: "string", name: "heroImageAlt", label: "Hero Image Alt Text" },

    // Corpo do post no editor
    { type: "rich-text", name: "body", label: "Body", isBody: true },
  ],
};

const schema = { collections: [blogsCollection] };
export default schema; 
