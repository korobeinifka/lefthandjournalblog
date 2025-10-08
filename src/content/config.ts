import { defineCollection, z } from "astro:content";

const blogs = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    // 🔑 Agora string livre (sem enum), não quebra com novas categorias
    category: z.string().optional(),
    author: z.string(),
    heroImage: z.string().optional(),
    heroImageAlt: z.string().optional(),
  }),
});

const categories = defineCollection({
  type: "data",
  schema: z.object({
    label: z.string(),
    slug: z.string(),               // ex.: "geopolitica"
    heroImage: z.string().optional() // thumb fixa opcional
  }),
});

export const collections = { blogs, categories };
