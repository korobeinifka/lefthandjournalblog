import { defineCollection, z } from "astro:content";

const blogs = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    category: z.string().optional(),
    author: z.string(),
    heroImage: z.string().optional(),
    heroImageAlt: z.string().optional(),
  }),
});

const categories = defineCollection({
  type: "data",
  schema: z.object({
    label: z.string(),          // Ex.: "Geopolítica"
    slug: z.string(),           // Ex.: "geopolitica"
    heroImage: z.string().optional(),
    showInMenu: z.boolean().optional(), // true/false (default: true)
    order: z.number().optional(),       // ordem no dropdown (menor primeiro)
  }),
});

export const collections = { blogs, categories };
