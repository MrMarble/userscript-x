import { existsSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import { resolve } from "node:path";
import chokidar from "chokidar";
import pc from "picocolors";
import { type WebSocket, WebSocketServer } from "ws";
import { build, getDefaultOutputFile, loadConfig } from "./builder.js";
import type { UserscriptConfig } from "./config.js";

interface DevServerOptions {
	port?: number;
	wsPort?: number;
	configPath?: string;
}

export async function startDevServer(options: DevServerOptions = {}) {
	const port = options.port || 3000;
	const wsPort = options.wsPort || port + 1;
	const configPath = options.configPath || "userscript.config.ts";

	// Load config
	let config: UserscriptConfig;
	try {
		config = await loadConfig(configPath);
	} catch (error) {
		console.error(pc.red("Failed to load config:"), error);
		process.exit(1);
	}

	const outDir = config.build?.outDir || "dist";
	const outFile = config.build?.outFile || getDefaultOutputFile();
	const scriptPath = resolve(process.cwd(), outDir, outFile);

	// Build initially
	console.log(pc.cyan("Building userscript..."));
	try {
		await build({
			config,
			dev: true,
			hotReloadPort: wsPort,
		});
		console.log(pc.green("✓ Initial build complete"));
	} catch (error) {
		console.error(pc.red("Build failed:"), error);
		process.exit(1);
	}

	// Create HTTP server
	const server = createServer((req, res) => {
		// Serve the userscript
		if (req.url === `/${outFile}` || req.url === "/") {
			if (!existsSync(scriptPath)) {
				res.writeHead(404, { "Content-Type": "text/plain" });
				res.end("Userscript not found");
				return;
			}

			try {
				const content = readFileSync(scriptPath, "utf-8");
				res.writeHead(200, {
					"Content-Type": "text/javascript",
					"Access-Control-Allow-Origin": "*",
				});
				res.end(content);
			} catch (_error) {
				res.writeHead(500, { "Content-Type": "text/plain" });
				res.end("Error reading userscript");
			}
		} else {
			res.writeHead(404, { "Content-Type": "text/plain" });
			res.end("Not found");
		}
	});

	// Create WebSocket server
	const wss = new WebSocketServer({ port: wsPort });
	const clients = new Set<WebSocket>();

	wss.on("connection", (ws) => {
		clients.add(ws);
		console.log(pc.gray(`[WS] Client connected (${clients.size} total)`));

		ws.on("close", () => {
			clients.delete(ws);
			console.log(pc.gray(`[WS] Client disconnected (${clients.size} total)`));
		});
	});

	// Function to notify all clients
	function notifyClients() {
		// Read the built script and strip the userscript header
		try {
			const scriptContent = readFileSync(scriptPath, "utf-8");

			// Strip userscript header (everything before and including // ==/UserScript==)
			const headerEndMarker = "// ==/UserScript==";
			const headerEndIndex = scriptContent.indexOf(headerEndMarker);

			let code = scriptContent;
			if (headerEndIndex !== -1) {
				// Skip past the header and any following newlines
				code = scriptContent
					.slice(headerEndIndex + headerEndMarker.length)
					.trimStart();
			}

			// Also strip the hot reload client itself to avoid nested injection
			const hotReloadMarker =
				"// Hot reload client - injected in development mode";
			const hotReloadIndex = code.indexOf(hotReloadMarker);
			if (hotReloadIndex !== -1) {
				// Find the end of the hot reload IIFE
				const hotReloadEndMarker = "})();";
				const hotReloadEndIndex = code.indexOf(
					hotReloadEndMarker,
					hotReloadIndex,
				);
				if (hotReloadEndIndex !== -1) {
					code = code
						.slice(hotReloadEndIndex + hotReloadEndMarker.length)
						.trimStart();
				}
			}

			const message = JSON.stringify({ type: "reload", code });
			clients.forEach((client) => {
				if (client.readyState === 1) {
					// OPEN
					client.send(message);
				}
			});
			console.log(
				pc.yellow(
					`[WS] Sent reload to ${clients.size} client(s) (${Math.round(code.length / 1024)}kb)`,
				),
			);
		} catch (error) {
			console.error(pc.red("Failed to read script for hot reload:"), error);
		}
	}

	// Watch files
	const watchPaths = [
		resolve(process.cwd(), "src"),
		resolve(process.cwd(), configPath),
	];

	console.log(pc.gray(`Watching: ${watchPaths.join(", ")}`));

	const watcher = chokidar.watch(watchPaths, {
		ignored: /(^|[/\\])\../, // ignore dotfiles
		persistent: true,
		ignoreInitial: true,
	});

	let rebuilding = false;
	let needsRebuild = false;

	async function rebuild() {
		if (rebuilding) {
			needsRebuild = true;
			return;
		}

		rebuilding = true;
		console.log(pc.cyan("\nRebuilding..."));

		try {
			// Reload config in case it changed
			const freshConfig = await loadConfig(configPath);
			await build({
				config: freshConfig,
				dev: true,
				hotReloadPort: wsPort,
			});
			console.log(pc.green("✓ Rebuild complete"));

			// Notify clients
			notifyClients();
		} catch (error) {
			console.error(pc.red("Build failed:"), error);
		}

		rebuilding = false;

		if (needsRebuild) {
			needsRebuild = false;
			rebuild();
		}
	}

	watcher.on("ready", () => {
		console.log(pc.gray("File watcher ready"));
	});

	watcher.on("error", (error) => {
		console.error(pc.red("Watcher error:"), error);
	});

	watcher.on("change", (path) => {
		console.log(pc.cyan(`\n[WATCH] File changed: ${path}`));
		rebuild();
	});

	watcher.on("add", (path) => {
		console.log(pc.cyan(`\n[WATCH] File added: ${path}`));
		rebuild();
	});

	// Start HTTP server
	server.listen(port, () => {
		console.log("");
		console.log(pc.green("✓ Dev server started"));
		console.log("");
		console.log(
			`  ${pc.bold("Userscript URL:")} ${pc.cyan(`http://localhost:${port}/${outFile}`)}`,
		);
		console.log(
			`  ${pc.bold("Hot reload:")}    ${pc.cyan(`ws://localhost:${wsPort}`)}`,
		);
		console.log("");
		console.log(pc.gray("  Watching for changes..."));
		console.log("");
	});

	// Handle shutdown
	const shutdown = () => {
		console.log("\n\nShutting down...");
		watcher.close();
		wss.close();
		server.close();
		process.exit(0);
	};

	process.on("SIGINT", shutdown);
	process.on("SIGTERM", shutdown);
}
