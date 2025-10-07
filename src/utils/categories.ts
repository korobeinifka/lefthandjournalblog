export const CATEGORY_LINKS = [
  {
    label: "TECNOLOGIA",
    slug: "tecnologia",
    description: "Ferramentas, linguagens e impactos das inovações digitais.",
  },
  {
    label: "ARTE & CULTURA",
    slug: "arte-cultura",
    description: "Crítica, processos criativos e movimentos culturais em destaque.",
  },
  {
    label: "GEOPOLÍTICA",
    slug: "geopolitica",
    description: "Disputas globais, diplomacia e as narrativas que moldam o mundo.",
  },
  {
    label: "XADREZ",
    slug: "xadrez",
    description: "Estratégias, partidas históricas e táticas do tabuleiro.",
  },
  {
    label: "OUTROS",
    slug: "outros",
    description: "Ensaios diversos que desafiam classificações tradicionais.",
  },
] as const;

export type Category = (typeof CATEGORY_LINKS)[number]["label"];

export const CATEGORY_OPTIONS = CATEGORY_LINKS.map((category) => category.label) as readonly Category[];
