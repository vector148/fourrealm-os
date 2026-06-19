import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const port = Number(process.env.VITE_PORT ?? 5173);
const apiTarget = process.env.VITE_API_TARGET ?? "http://localhost:3001";

export default defineConfig({
  plugins: [react()],
  server: {
    port,
    strictPort: true,
    proxy: {
      "/api": {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
});
