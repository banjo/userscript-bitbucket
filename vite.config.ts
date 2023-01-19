import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        monkey({
            entry: "src/main.ts",
            userscript: {
                namespace: "userscript/astra",
                match: ["https://bitbucket.org/*"],
                author: "Anton",
                "run-at": "document-end",
            },
        }),
    ],
});
