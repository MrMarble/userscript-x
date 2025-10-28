import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["src/config.ts", "src/cli.ts"],
	format: ["esm"],
	target: "node20",
	dts: true,
	clean: true,
	shims: true,
	treeshake: true,
	publint: true,
	minify: false,
	external: ["tsdown", "mri", "picocolors", "ws", "chokidar"],
});
