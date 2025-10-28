#!/usr/bin/env node

import {
	copyFileSync,
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as clack from "@clack/prompts";
import mri from "mri";
import pc from "picocolors";

// Available templates
const TEMPLATES = ["basic"] as const;
type Template = (typeof TEMPLATES)[number];

const renameFiles: Record<string, string | undefined> = {
	_gitignore: ".gitignore",
};

const defaultProjectName = "my-userscript";

function help() {
	console.log(`
${pc.cyan("create-usx")} - Scaffold a new userscript project

${pc.bold("Usage:")}
  npm create usx [project-name] [options]
  pnpm create usx [project-name] [options]

${pc.bold("Options:")}
  -t, --template <name>   Use a specific template (currently only 'basic')
  -h, --help             Display this help message

${pc.bold("Examples:")}
  npm create usx
  npm create usx my-script
  pnpm create usx my-script --template basic
`);
}

function isValidPackageName(projectName: string): boolean {
	return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(
		projectName,
	);
}

function toValidPackageName(projectName: string): string {
	return projectName
		.trim()
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/^[._]/, "")
		.replace(/[^a-z\d\-~]+/g, "-");
}

function formatTargetDir(targetDir: string | undefined): string {
	return targetDir?.trim().replace(/\/+$/g, "") || "";
}

function isEmpty(path: string): boolean {
	const files = readdirSync(path);
	return files.length === 0 || (files.length === 1 && files[0] === ".git");
}

function _emptyDir(dir: string): void {
	if (!existsSync(dir)) {
		return;
	}
	for (const file of readdirSync(dir)) {
		if (file === ".git") {
			continue;
		}
		const abs = resolve(dir, file);
		if (statSync(abs).isDirectory()) {
			_emptyDir(abs);
		}
	}
}

function copyDir(srcDir: string, destDir: string): void {
	mkdirSync(destDir, { recursive: true });
	for (const file of readdirSync(srcDir)) {
		const srcFile = join(srcDir, file);
		const destFile = join(destDir, file);
		const stat = statSync(srcFile);
		if (stat.isDirectory()) {
			copyDir(srcFile, destFile);
		} else {
			copyFileSync(srcFile, destFile);
		}
	}
}

function _write(file: string, content?: string): void {
	const targetPath = renameFiles[file] ?? file;
	if (content) {
		writeFileSync(targetPath, content);
	}
}

async function main() {
	const argv = mri(process.argv.slice(2), {
		alias: {
			h: "help",
			t: "template",
		},
		boolean: ["help"],
		string: ["template"],
	});

	if (argv.help) {
		help();
		process.exit(0);
	}

	clack.intro(pc.cyan("create-usx"));

	let targetDir = formatTargetDir(argv._[0] as string | undefined);
	const template = argv.template as Template | undefined;

	// Validate template if provided
	if (template && !TEMPLATES.includes(template)) {
		clack.outro(
			pc.red(
				`Invalid template: ${template}. Available: ${TEMPLATES.join(", ")}`,
			),
		);
		process.exit(1);
	}

	// Get project name
	if (!targetDir) {
		const result = await clack.text({
			message: "Project name:",
			placeholder: defaultProjectName,
			defaultValue: defaultProjectName,
			validate: (value) => {
				if (!value) {
					return "Project name is required";
				}
			},
		});

		if (clack.isCancel(result)) {
			clack.cancel("Operation cancelled");
			process.exit(0);
		}

		targetDir = formatTargetDir(result);
	}

	const root = resolve(process.cwd(), targetDir);

	// Handle existing directory
	if (existsSync(root)) {
		if (!isEmpty(root)) {
			const shouldContinue = await clack.confirm({
				message: `${pc.yellow("Directory is not empty.")} Continue?`,
				initialValue: false,
			});

			if (clack.isCancel(shouldContinue) || !shouldContinue) {
				clack.cancel("Operation cancelled");
				process.exit(0);
			}
		}
	} else {
		mkdirSync(root, { recursive: true });
	}

	// Get package name
	const pkgName =
		targetDir === "." ? resolve(root).split("/").pop() : targetDir;
	let packageName: string;

	if (!isValidPackageName(pkgName || "")) {
		const suggestedName = toValidPackageName(pkgName || defaultProjectName);
		const result = await clack.text({
			message: "Package name:",
			placeholder: suggestedName,
			defaultValue: suggestedName,
			validate: (value) => {
				if (!value) {
					return "Package name is required";
				}
				if (!isValidPackageName(value)) {
					return "Invalid package name";
				}
			},
		});

		if (clack.isCancel(result)) {
			clack.cancel("Operation cancelled");
			process.exit(0);
		}

		packageName = result;
	} else {
		packageName = pkgName || defaultProjectName;
	}

	// Get template if not provided
	let selectedTemplate = template;
	if (!selectedTemplate) {
		const result = await clack.select({
			message: "Select a template:",
			options: [
				{
					value: "basic",
					label: "Basic",
					hint: "Simple userscript with TypeScript",
				},
			],
		});

		if (clack.isCancel(result)) {
			clack.cancel("Operation cancelled");
			process.exit(0);
		}

		selectedTemplate = result as Template;
	}

	const spinner = clack.spinner();
	spinner.start("Scaffolding project...");

	// Copy template files
	const __dirname = dirname(fileURLToPath(import.meta.url));
	const templateDir = resolve(__dirname, "..", `template-${selectedTemplate}`);

	if (!existsSync(templateDir)) {
		spinner.stop("Error: Template not found!");
		clack.outro(pc.red(`Template directory not found: ${templateDir}`));
		process.exit(1);
	}

	// Copy all files from template
	const files = readdirSync(templateDir);
	for (const file of files) {
		const srcFile = join(templateDir, file);
		const stat = statSync(srcFile);

		if (stat.isDirectory()) {
			copyDir(srcFile, join(root, file));
		} else {
			const destFileName = renameFiles[file] ?? file;
			copyFileSync(srcFile, join(root, destFileName));
		}
	}

	// Update package.json with correct package name
	const pkgJsonPath = join(root, "package.json");
	const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf-8"));
	pkg.name = packageName;
	writeFileSync(pkgJsonPath, `${JSON.stringify(pkg, null, 2)}\n`);

	spinner.stop("Project scaffolded!");

	const pkgManager = /pnpm/.test(process.env.npm_config_user_agent || "")
		? "pnpm"
		: /yarn/.test(process.env.npm_config_user_agent || "")
			? "yarn"
			: "npm";

	const cdCommand = targetDir === "." ? "" : `cd ${targetDir}`;

	clack.outro(
		`${pc.green("")} Done! Next steps:\n\n  ${cdCommand ? `${pc.cyan(cdCommand)}\n  ` : ""}${pc.cyan(`${pkgManager} install`)}\n  ${pc.cyan(`${pkgManager} dev`)}`,
	);
}

main().catch((err) => {
	console.error(pc.red("Error:"), err);
	process.exit(1);
});
