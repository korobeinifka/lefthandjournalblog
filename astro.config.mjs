import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import svelte from "@astrojs/svelte";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel/static";

// Habilita SSR apenas quando ASTRO_SSR=true (ex.: no dev)
const isSSR = process.env.ASTRO_SSR === "true";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), icon(), svelte(), react(), sitemap()],
  site: "https://levogiro.com",
  // base: "/blog2.0",
  output: isSSR ? "server" : "static",
  adapter: isSSR ? undefined : vercel(), // evita conflito no modo server (dev)
  // (opcional) se quiser fixar host/porta aqui em vez do script:
  // server: { host: true, port: 4323 },
});
