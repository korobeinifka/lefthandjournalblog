export const CATEGORY_OPTIONS = [
  "Tecnologia",
  "Geopolítica",
  "Xadrez",
] as const;

export type Category = (typeof CATEGORY_OPTIONS)[number];

export const CATEGORY_LINKS = CATEGORY_OPTIONS.map((label) => ({
  label,
  slug: label.toLowerCase(),
}));

