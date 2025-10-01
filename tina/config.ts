import { defineConfig } from "tinacms";

const branch =
  process.env.TINA_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

const isLocal =
  process.env.TINA_PUBLIC_IS_LOCAL === "true" ||
  process.env.NODE_ENV === "development";

export default defineConfig({
  branch,
  clientId: process.env.TINA_CLIENT_ID || "",
  token: process.env.TINA_TOKEN || "",
  localClient: isLocal,
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "public",
    },
  },
  schema: {
    collections: [
      {
        label: "Blogs",
        name: "blogs",
        path: "src/content/blogs",
        format: "md",
        ui: {
          defaultItem: {
            author: "Lefthand Editorial",
            category: "General",
            heroImageAlt: "",
          },
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "Description",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "string",
            name: "pubDate",
            label: "Publish Date",
            required: true,
            ui: {
              component: "date",
              parse(value: string) {
                return value ? value.split("T")[0] : value;
              },
            },
          },
          {
            type: "string",
            name: "category",
            label: "Category",
          },
          {
            type: "string",
            name: "author",
            label: "Author",
          },
          {
            type: "image",
            name: "heroImage",
            label: "Hero Image",
          },
          {
            type: "string",
            name: "heroImageAlt",
            label: "Hero Image Alt Text",
            ui: {
              component: "textarea",
            },
          },
        ],
      },
    ],
  },
});
