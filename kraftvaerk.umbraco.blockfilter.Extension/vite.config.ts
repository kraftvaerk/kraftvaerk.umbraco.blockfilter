import { defineConfig } from "vite";

const outDir = process.env.OUT_DIR || './../kraftvaerk.umbraco.blockfilter.Backend/wwwroot/App_Plugins/kraftvaerk.umbraco.blockfilter.frontend';

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
