import path from "node:path";
import url from "node:url";
import { defineConfig } from "tsdown";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default defineConfig(() => ({
	entry: ["src/index.ts"],
	target: "node20",
	minify: true,
}));
