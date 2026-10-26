import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
    // Tests call the API through a fake fetch; pin the base URL so paths are predictable.
    env: { VITE_API_BASE_URL: "http://api.test/api/v1" },
    restoreMocks: true,
    unstubGlobals: true,
  },
});
