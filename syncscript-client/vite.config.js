import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // This stops Vite from "searching" inside Monaco and finding broken maps
    exclude: ["monaco-editor"],
  },
  server: {
    fs: {
      allow: [".."], // Required for local node_modules access
    },
  },
  build: {
    sourcemap: false, // Kill the source map search during build
  },
});
