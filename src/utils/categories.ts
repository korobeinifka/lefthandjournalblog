import { slugify } from "@/utils/slug";

export const CATEGORY_OPTIONS = [
  "Sociedade & Geopolítica",
  "Filosofia & Literatura",
  "Tecnologia & Dados",
  "Xadrez & Hobbies",
  "Arte & Cultura",
  "Miscelânea (off-topic)",
] as const;

export type Category = (typeof CATEGORY_OPTIONS)[number];

export const CATEGORY_LINKS = CATEGORY_OPTIONS.map((label) => ({
  label,
  slug: slugify(label),
}));
