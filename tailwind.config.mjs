/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    borderRadius: {
      DEFAULT: "var(--radius)", // 0.5rem
      sm: "var(--radius)",
      md: "var(--radius)",
      lg: "var(--radius)",
      xl: "var(--radius)",
      "2xl": "var(--radius)",
      "3xl": "var(--radius)",
      full: "9999px", // se algum dia usar “pill/circle”
      none: "0px",
    },
    extend: {
      colors: {
        "primary-bg": "rgb(var(--primary-bg)/<alpha-value>)",
        "surface-bg": "rgb(var(--surface-bg)/<alpha-value>)",
        "card-bg": "rgb(var(--card-bg)/<alpha-value>)",
        "border-ink": "rgb(var(--border-ink)/<alpha-value>)",
        "primary-text": "rgb(var(--primary-text)/<alpha-value>)",
        "secondary-text": "rgb(var(--secondary-text)/<alpha-value>)",
        "muted-text": "rgb(var(--muted-text)/<alpha-value>)",
      },
    },
    fontFamily: {
      sans: ["'Source Sans 3'", "Inter", "system-ui", "sans-serif"],
      serif: ["'Playfair Display'", "Georgia", "serif"],
      body: ["'Source Sans 3'", "Inter", "system-ui", "sans-serif"],
      display: ["'Playfair Display'", "Georgia", "serif"],
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
