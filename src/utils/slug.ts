// src/utils/slug.ts
// Slug determinístico e seguro (com fallback para "untitled").
// Obs.: no Tina, mantenha uma cópia inline equivalente (não importe daqui).

export function slugify(value: unknown): string {
  const raw = (typeof value === "string" ? value : String(value ?? "")).trim();
  if (!raw) return "untitled";

  const slug =
    raw
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove acentos
      .toLowerCase()
      .replace(/&/g, " and ")          // trata & explicitamente
      .replace(/[^a-z0-9]+/g, "-")     // qualquer não-alfanumérico => "-"
      .replace(/^-+|-+$/g, "")         // remove hífens nas pontas
      .replace(/-{2,}/g, "-") || "untitled";

  return slug;
}

// Helper opcional para montar a URL do post
export const postHref = (slug: string) => `/blog/${slug}/`;
