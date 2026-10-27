import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        // Libraries every page uses get their own long-lived chunks, so a deploy that only
        // changes app code doesn't make browsers re-download them. Page-specific libraries
        // (recharts, DayPilot, Leaflet, xlsx) stay in their lazily loaded pages' chunks.
        codeSplitting: {
          groups: [
            {
              name: "vendor-react",
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            },
            {
              name: "vendor-antd",
              test: /[\\/]node_modules[\\/](antd|@ant-design|@rc-component|rc-[^\\/]+)[\\/]/,
            },
            {
              name: "vendor-tanstack",
              test: /[\\/]node_modules[\\/]@tanstack[\\/]/,
            },
          ],
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: true,
  },
});
