import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://emilsadek.com",
  markdown: {
    shikiConfig: {
      theme: "catppuccin-mocha",
    },
  },
  integrations: [sitemap()],
  vite: {
    // @ts-expect-error
    plugins: [tailwindcss()],
  },
});
