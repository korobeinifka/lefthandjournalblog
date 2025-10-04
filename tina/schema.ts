// tina/schema.ts
import { CATEGORY_OPTIONS } from "../src/utils/categories";
import type { Collection } from "tinacms";
import { slugify } from "./slugify"; // <-- novo

const blogsCollection: Collection = {
  name: "blogs",
  label: "Blog Posts",
  path: "src/content/blogs",
  format: "md",
  ui: {
    // controla o nome do arquivo gerado/renomeado a partir do título
    filename: {
      slugify: (values) => slugify(values?.title || "post"),
    },
    // controla a URL usada por "Preview/Link" no painel
    router: ({ document }) => `/blog/${document._sys.filename}/`,
    // Se você quiser esconder/limitar botões da barra do Tina, dá para usar `beforeSubmit`/`afterSubmit`,
    // mas o principal aqui é o router/slugify mesmo.
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
