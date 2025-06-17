import { defineConfig } from "vite";
import { gadget } from "gadget-server/vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [gadget(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./web"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "extensions/theme-extension/assets"),
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: path.resolve(__dirname, "web/theme-extension.tsx"),
      output: {
        entryFileNames: "main.js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) return "style.css";
          return "[name].[ext]";
        },
        manualChunks: () => "main",
      },
    },
    chunkSizeWarningLimit: 100000000,
  },
});