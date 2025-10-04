// tina/schema.ts
import { CATEGORY_OPTIONS } from "../src/utils/categories";
import type { Collection } from "tinacms";

const blogsCollection: Collection = {
  name: "blogs",
  label: "Blog Posts",
  path: "src/content/blogs",
  format: "md",
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

    // corpo do post no editor
    { type: "rich-text", name: "body", label: "Body", isBody: true },
  ],
};

const schema = { collections: [blogsCollection] };
export default schema;
