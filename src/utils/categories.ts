export const CATEGORY_OPTIONS = [
  "Chess",
  "Geopolitics",
  "Philosophy",
  "Technology",
] as const;

export type Category = (typeof CATEGORY_OPTIONS)[number];

export const CATEGORY_LINKS = CATEGORY_OPTIONS.map((label) => ({
  label,
  slug: label.toLowerCase(),
}));

