import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["esm"],
	target: "es2022",
	platform: "browser",
	dts: true,
	clean: true,
	publint: true,
	treeshake: true,
	minify: false,
});
