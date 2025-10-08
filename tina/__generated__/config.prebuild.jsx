// tina/config.ts
import { defineConfig } from "tinacms";

// tina/schema.ts
import { defineSchema } from "tinacms";
var schema_default = defineSchema({
  collections: [
    {
      name: "blogs",
      label: "Posts",
      path: "src/content/blogs",
      format: "md",
      // use "mdx" se seus posts forem .mdx
      ui: { filename: { slugify: (values) => (values?.title || "post").toLowerCase().replace(/\s+/g, "-") } },
      fields: [
        { name: "title", label: "T\xEDtulo", type: "string", required: true },
        { name: "description", label: "Descri\xE7\xE3o", type: "string" },
        { name: "pubDate", label: "Data", type: "datetime", required: true },
        // Mantemos "category" como STRING para evitar schema drift.
        // Você pode digitar livremente ou (depois) adicionar um UI helper.
        { name: "category", label: "Categoria", type: "string" },
        { name: "author", label: "Autor", type: "string", required: true },
        { name: "heroImage", label: "Hero image", type: "image" },
        { name: "heroImageAlt", label: "Hero alt", type: "string" },
        { name: "body", label: "Conte\xFAdo", type: "rich-text", isBody: true }
      ]
    },
    {
      name: "categories",
      label: "Categories",
      path: "src/content/categories",
      format: "json",
      ui: { filename: { slugify: (values) => (values?.slug || values?.label || "categoria").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-") } },
      fields: [
        { name: "label", label: "Label", type: "string", required: true },
        { name: "slug", label: "Slug (sem acento/espA\xE7os)", type: "string", required: true },
        { name: "heroImage", label: "Thumb fixa (opcional)", type: "image" }
      ]
    }
  ]
});

// tina/config.ts
var branch = process.env.TINA_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || process.env.HEAD || "main";
var clientId = process.env.TINA_CLIENT_ID ?? "";
var token = process.env.TINA_TOKEN ?? "";
var config_default = defineConfig({
  branch,
  clientId,
  token,
  build: {
    outputFolder: "admin",
    publicFolder: "public"
  },
  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "public"
    }
  },
  schema: schema_default
});
export {
  config_default as default
};
