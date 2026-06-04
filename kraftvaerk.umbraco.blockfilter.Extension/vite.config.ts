import { defineConfig } from "vite";

const outDir = process.env.OUT_DIR || './../kraftvaerk.umbraco.blockfilter.Backend/ui';

export default defineConfig({
    build: {
        lib: {
            entry: "src/index.ts",
            formats: ["es"],
            fileName: "dist",
        },
        outDir,
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            external: [/^@umbraco/],
        },
    },
});
