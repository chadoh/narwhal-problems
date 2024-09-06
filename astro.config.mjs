// @ts-check
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://chadoh.com",
  base: "narwhal-problems",
  vite: {
    define: {
      global: "window",
    },
  },
});
