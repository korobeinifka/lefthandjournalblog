import { defineCollection, z } from "astro:content";
import { CATEGORY_OPTIONS } from "../utils/categories";

const blogs = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    category: z.enum(CATEGORY_OPTIONS),
    author: z.string(),
    heroImage: z.string().optional(),
    heroImageAlt: z.string().optional(),
  }),
});

export const collections = { blogs };
