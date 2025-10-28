#!/usr/bin/env node

import mri from "mri";
import pc from "picocolors";
import { build } from "./builder.js";
import { startDevServer } from "./dev-server.js";

function help() {
	console.log(`
${pc.cyan("usx")} - Userscript development CLI

${pc.bold("Usage:")}
  usx <command> [options]

${pc.bold("Commands:")}
  build              Build the userscript for production
  dev                Start development server with hot reload

${pc.bold("Options:")}
  -c, --config <file>  Specify config file (default: userscript.config.ts)
  -p, --port <port>    HTTP server port (default: 3000)
  -h, --help          Display this help message

${pc.bold("Examples:")}
  usx build
  usx dev
  usx dev --port 8080
`);
}

async function main() {
	const argv = mri(process.argv.slice(2), {
		alias: {
			h: "help",
			c: "config",
			p: "port",
		},
		boolean: ["help"],
		string: ["config", "port"],
	});

	if (argv.help) {
		help();
		process.exit(0);
	}

	const command = argv._[0];

	try {
		switch (command) {
			case "build":
				await build({
					configPath: argv.config,
				});
				break;

			case "dev":
				await startDevServer({
					configPath: argv.config,
					port: argv.port ? parseInt(argv.port, 10) : undefined,
				});
				break;

			default:
				console.error(pc.red(`Unknown command: ${command || "(none)"}`));
				console.log(`\nRun ${pc.cyan("usx --help")} for usage information`);
				process.exit(1);
		}
	} catch (error) {
		console.error(
			pc.red("Error:"),
			error instanceof Error ? error.message : error,
		);
		process.exit(1);
	}
}

main();
