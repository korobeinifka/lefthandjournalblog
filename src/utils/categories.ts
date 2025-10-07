import { slugify } from "./slug";

export const CATEGORY_OPTIONS = [
  "TECNOLOGIA",
  "GEOPOLÍTICA",
  "XADREZ & HOBBIES",
  "ARTE & CULTURA",
  "MUSICALIDADE",
  "OFF-TOPIC",
<<<<<<< HEAD
=======
  "Tecnologia",
  "Geopolítica",
  "Xadrez",
>>>>>>> main
] as const;

export type Category = (typeof CATEGORY_OPTIONS)[number];

const toCategorySlug = (label: Category) => slugify(label.replace(/&/g, " e "));

export const CATEGORY_LINKS = CATEGORY_OPTIONS.map((label) => ({
  label,
  slug: toCategorySlug(label),
}));

export const CATEGORY_BY_SLUG = CATEGORY_LINKS.reduce<Record<string, Category>>(
  (acc, { label, slug }) => {
    acc[slug] = label;
    return acc;
  },
  {},
);

