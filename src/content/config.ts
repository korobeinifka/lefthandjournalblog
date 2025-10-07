import { defineCollection, z } from "astro:content";
import { CATEGORY_OPTIONS } from "../utils/categories";

// antigas (para não quebrar posts antigos)
const LEGACY = ["Chess", "Geopolitics", "Philosophy", "Technology"] as const;

const blogs = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    category: z.enum([...CATEGORY_OPTIONS, ...LEGACY] as unknown as [string, ...string[]]),
    author: z.string(),
    heroImage: z.string().optional(),
    heroImageAlt: z.string().optional(),
  }),
});

export const collections = { blogs };
