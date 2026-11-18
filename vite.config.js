import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxy = {
    "/api": {
      target: env.BACKEND_URL || "http://127.0.0.1:8080",
      changeOrigin: true,
      configure(proxy) {
        proxy.on("proxyReq", (request) => request.removeHeader("origin"));
      },
    },
  };
  return {
    plugins: [react()],
    server: { proxy },
    preview: { proxy },
    build: { sourcemap: false },
    test: { environment: "node", include: ["tests/unit/**/*.test.js"] },
  };
});
