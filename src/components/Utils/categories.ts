// src/utils/categories.ts

/** Normaliza um texto para slug: minúsculas, sem acentos, hífens simples */
export function slugify(input: string): string {
  return input
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")   // remove diacríticos
    .replace(/[^a-z0-9]+/g, "-")       // troca separadores por hífen
    .replace(/^-+|-+$/g, "")           // tira hífens da ponta
    .replace(/-{2,}/g, "-");           // colapsa hífens
}

/** Labels canônicos exibidos na UI */
export const CATEGORY_OPTIONS = [
  "Tecnologia",
  "Geopolítica",
  "Xadrez",
] as const;

export type Category = (typeof CATEGORY_OPTIONS)[number];

/** Slugs gerados a partir dos labels */
export const CATEGORY_LINKS = CATEGORY_OPTIONS.map((label) => ({
  label,
  slug: slugify(label),
}));

/** Dado um slug, devolve o label canônico (ou undefined) */
export function getCategoryLabel(slug: string): string | undefined {
  const s = slugify(slug);
  return CATEGORY_LINKS.find((c) => c.slug === s)?.label;
}
