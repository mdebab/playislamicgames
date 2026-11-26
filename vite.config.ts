import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

export default defineConfig(({ command }) => ({
  plugins: [
    tsConfigPaths(),
    // Use src/server.ts (SSR error wrapper) as the server entry.
    tanstackStart({ server: { entry: "server" } }),
    viteReact(),
    tailwindcss(),
    // Node server output (.output/server/index.mjs), suitable for Render.
    ...(command === "build" ? [nitro({ preset: "node-server" })] : []),
  ],
  resolve: {
    dedupe: ["react", "react-dom", "@tanstack/react-router", "@tanstack/react-query"],
  },
}));
