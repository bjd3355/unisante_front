import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";


export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src', // Permet d'utiliser des alias pour les chemins
    },
  },
  css: {
    postcss: './postcss.config.js', // Assure-toi que ce fichier existe
  },
});

