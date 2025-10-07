// tina/config.ts
import { defineConfig } from "tinacms";

// src/utils/categories.ts
var CATEGORY_OPTIONS = [
  "Tecnologia",
  "Geopol\xEDtica",
  "Xadrez"
];
var CATEGORY_LINKS = CATEGORY_OPTIONS.map((label) => ({
  label,
  slug: label.toLowerCase()
}));

// tina/schema.ts
function slugifyInline(value) {
  const s = (value || "").trim();
  if (!s) return "untitled";
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-") || "untitled";
}
var blogsCollection = {
  name: "blogs",
  label: "Blog Posts",
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
    { type: "string", name: "title", label: "Title", required: true, isTitle: true },
    {
      type: "string",
      name: "description",
      label: "Description",
      required: true,
      ui: { component: "textarea" }
    },
    {
      type: "datetime",
      name: "pubDate",
      label: "Published Date",
      required: true,
      ui: { dateFormat: "YYYY-MM-DD" }
    },
    {
      type: "string",
      name: "category",
      label: "Category",
      required: true,
      options: CATEGORY_OPTIONS.map((option) => ({ label: option, value: option }))
    },
    { type: "string", name: "author", label: "Author", required: true },
    { type: "image", name: "heroImage", label: "Hero Image" },
    { type: "string", name: "heroImageAlt", label: "Hero Image Alt Text" },
    // corpo do post
    { type: "rich-text", name: "body", label: "Body", isBody: true }
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
