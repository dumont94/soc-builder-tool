import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/soc-builder-tool/",
  server: {
    port: 5174,
  },
});
