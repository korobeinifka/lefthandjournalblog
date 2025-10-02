import { slugify } from "./slug";

export { slugify };

export function nameToSlug(name: string): string {
  return slugify(name);
}
