// tina/config.ts
import { defineConfig } from "tinacms";

// src/utils/slug.ts
function slugify(value) {
  const raw = (typeof value === "string" ? value : String(value ?? "")).trim();
  if (!raw) return "untitled";
  const slug = raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-") || "untitled";
  return slug;
}

// src/utils/categories.ts
var CATEGORY_OPTIONS = [
  "Sociedade & Geopol\xEDtica",
  "Filosofia & Literatura",
  "Tecnologia & Dados",
  "Xadrez & Hobbies",
  "Arte & Cultura",
  "Miscel\xE2nea (off-topic)"
];
var CATEGORY_LINKS = CATEGORY_OPTIONS.map((label) => ({
  label,
  slug: slugify(label)
}));

// tina/schema.ts
function slugifyInline(value) {
  const s = (value || "").trim();
  if (!s) return "untitled";
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-") || "untitled";
}
var blogsCollection = {
  name: "blogs",
  label: "Posts",
  path: "src/content/blogs",
  format: "md",
  ui: {
    filename: {
      slugify: (values) => {
        const raw = values?.title || "untitled";
        return slugifyInline(raw);
      }
    }
  },
  fields: [
    { type: "string", name: "title", label: "T\xEDtulo", required: true, isTitle: true },
    { type: "string", name: "description", label: "Descri\xE7\xE3o", required: true, ui: { component: "textarea" } },
    { type: "datetime", name: "pubDate", label: "Publicado em", required: true, ui: { dateFormat: "YYYY-MM-DD" } },
    {
      type: "string",
      name: "category",
      label: "T\xF3pico",
      required: true,
      options: CATEGORY_OPTIONS.map((option) => ({ label: option, value: option }))
    },
    { type: "string", name: "author", label: "Autor", required: true },
    { type: "image", name: "heroImage", label: "Imagem de capa" },
    { type: "string", name: "heroImageAlt", label: "Alt da capa" },
    { type: "rich-text", name: "body", label: "Conte\xFAdo", isBody: true }
  ]
};
var schema = { collections: [blogsCollection] };
var schema_default = schema;

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
