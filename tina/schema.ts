// tina/schema.ts
import { CATEGORY_OPTIONS } from "../src/utils/categories";
import type { Collection } from "tinacms";

const blogsCollection: Collection = {
  name: "blogs",
  label: "Blog Posts",
  path: "src/content/blogs",
  format: "md",
  ui: {
    filename: {
      slugify: (values) => {
        const rawTitle = (values?.title || "untitled").trim();
        let slug = rawTitle
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/-{2,}/g, "-")
          .replace(/^-+|-+$/g, "");
        if (!slug) slug = "untitled";

        // OPCIONAIS (mantidos desligados):
        // const d = new Date();
        // const yyyy = d.getFullYear();
        // const mm = String(d.getMonth() + 1).padStart(2, "0");
        // const dd = String(d.getDate()).padStart(2, "0");
        // slug = `${yyyy}${mm}${dd}-${slug}`;
        // if (slug.length > 60) slug = slug.slice(0, 60).replace(/-+$/g, "");

        return slug;
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
    { type: "rich-text", name: "body", label: "Body", isBody: true },
  ],
}; 

const schema = { collections: [blogsCollection] };
export default schema;
 
