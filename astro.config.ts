import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://emilsadek.com",
  integrations: [tailwind()],
});
