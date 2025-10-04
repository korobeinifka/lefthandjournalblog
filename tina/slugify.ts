// tina/slugify.ts
export const slugify = (s: string) =>
  (s || "")
    .normalize("NFKD")                // separa acentos
    .replace(/[\u0300-\u036f]/g, "")  // remove marcas de acento
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")      // tudo que não for a-z0-9 vira hífen
    .replace(/-{2,}/g, "-")           // colapsa múltiplos hífens
    .replace(/^-+|-+$/g, "");         // tira hífen das pontas
