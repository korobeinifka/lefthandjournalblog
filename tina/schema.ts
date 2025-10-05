import type { Collection, Schema } from "tinacms";
import { CATEGORY_OPTIONS } from "../src/utils/categories";

// slugify determinístico
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
  label: "Blog Posts",
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

    // corpo do post
    { type: "rich-text", name: "body", label: "Body", isBody: true },
  ],
};

const schema: Schema = { collections: [blogsCollection] };
export default schema;
