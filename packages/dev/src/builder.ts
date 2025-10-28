import { existsSync, readFileSync, renameSync } from "node:fs";
import { basename, resolve } from "node:path";
import { build as tsdownBuild } from "tsdown";
import type { UserscriptConfig, UserscriptMetadata } from "./config.js";
import { getHotReloadClient } from "./hot-reload-client.js";

/**
 * Load userscript config from file
 */
export async function loadConfig(
	configPath: string = "userscript.config.ts",
): Promise<UserscriptConfig> {
	const fullPath = resolve(process.cwd(), configPath);

	if (!existsSync(fullPath)) {
		throw new Error(`Config file not found: ${fullPath}`);
	}

	// Dynamic import the config file
	const configModule = await import(`file://${fullPath}`);
	const config = configModule.default || configModule;

	if (!config || !config.metadata) {
		throw new Error("Invalid config: must export a config with metadata");
	}

	return config;
}

/**
 * Generate userscript header from metadata
 */
export function generateHeader(metadata: UserscriptMetadata): string {
	const lines: string[] = ["// ==UserScript=="];

	// Helper to add metadata line
	const addLine = (key: string, value: string | string[] | undefined) => {
		if (value === undefined) return;

		if (Array.isArray(value)) {
			for (const v of value) {
				lines.push(`// @${key.padEnd(12)} ${v}`);
			}
		} else {
			lines.push(`// @${key.padEnd(12)} ${value}`);
		}
	};

	// Add metadata in conventional order
	addLine("name", metadata.name);
	addLine("namespace", metadata.namespace);
	addLine("version", metadata.version);
	addLine("description", metadata.description);
	addLine("author", metadata.author);
	addLine("match", metadata.match);
	addLine("exclude", metadata.exclude);
	addLine("include", metadata.include);
	addLine("icon", metadata.icon);
	addLine("grant", metadata.grant);
	addLine("require", metadata.require);

	// Handle resource object
	if (metadata.resource) {
		Object.entries(metadata.resource).forEach(([name, url]) => {
			addLine("resource", `${name} ${url}`);
		});
	}

	addLine("connect", metadata.connect);
	addLine("run-at", metadata.runAt);
	addLine("sandbox", metadata.sandbox);
	if (metadata.noframes) {
		lines.push("// @noframes");
	}
	addLine("updateURL", metadata.updateURL);
	addLine("downloadURL", metadata.downloadURL);
	addLine("supportURL", metadata.supportURL);

	lines.push("// ==/UserScript==");
	lines.push("");

	return lines.join("\n");
}

/**
 * Get default output filename from package.json
 */
export function getDefaultOutputFile(): string {
	try {
		const pkgPath = resolve(process.cwd(), "package.json");
		if (existsSync(pkgPath)) {
			const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
			if (pkg.name) {
				// Convert package name to filename (e.g., @scope/name -> scope-name)
				const filename = pkg.name.replace(/^@/, "").replace(/\//g, "-");
				return `${filename}.user.js`;
			}
		}
	} catch (_error) {
		// Ignore errors, fall back to default
	}
	return "bundle.user.js";
}

/**
 * Build userscript
 */
export async function build(
	options: {
		config?: UserscriptConfig;
		configPath?: string;
		dev?: boolean;
		hotReloadPort?: number;
	} = {},
): Promise<void> {
	// Load config
	const config = options.config || (await loadConfig(options.configPath));

	// Default build options
	const outDir = config.build?.outDir || "dist";
	const outFile = config.build?.outFile || getDefaultOutputFile();
	const outputPath = resolve(process.cwd(), outDir, outFile);

	// Generate banner with header and optional hot reload client
	let banner = generateHeader(config.metadata);

	if (options.dev && options.hotReloadPort) {
		banner += `\n${getHotReloadClient(options.hotReloadPort)}`;
	}

	// Run tsdown to build
	await tsdownBuild({
		entry: ["src/main.ts"],
		format: ["iife"],
		outDir,
		clean: true,
		dts: false,
		treeshake: true,
		minify: false,
		platform: "browser",
		target: "es2022",
		banner: {
			js: banner,
		},
	});

	// tsdown creates main.iife.js by default, rename to desired output filename
	const tsdownOutput = resolve(process.cwd(), outDir, "main.iife.js");
	if (existsSync(tsdownOutput) && basename(outputPath) !== "main.iife.js") {
		renameSync(tsdownOutput, outputPath);
	}

	if (!options.dev) {
		console.log(`✓ Built userscript: ${outputPath}`);
	}
}
