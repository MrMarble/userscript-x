/**
 * Userscript metadata configuration
 * @see https://www.tampermonkey.net/documentation.php#_name
 */
export interface UserscriptMetadata {
	/** The name of the script */
	name: string;
	/** The namespace of the script */
	namespace?: string;
	/** The version of the script */
	version?: string;
	/** A brief summary of what the script does */
	description?: string;
	/** The author of the script */
	author?: string;
	/** URL patterns where the script should run */
	match?: string | string[];
	/** URL patterns to exclude */
	exclude?: string | string[];
	/** URL patterns to include */
	include?: string | string[];
	/** GM API functions the script needs */
	grant?: string | string[];
	/** Script update URL */
	updateURL?: string;
	/** Script download URL */
	downloadURL?: string;
	/** Script support/homepage URL */
	supportURL?: string;
	/** Script icon URL */
	icon?: string;
	/** When to inject the script */
	runAt?: "document-start" | "document-body" | "document-end" | "document-idle";
	/** External resources to require */
	require?: string | string[];
	/** External resources to fetch */
	resource?: Record<string, string>;
	/** Whether to use sandboxing */
	sandbox?: "raw" | "JavaScript" | "DOM";
	/** Connect domains for GM_xmlhttpRequest */
	connect?: string | string[];
	/** Whether to run in main page context or isolated world */
	noframes?: boolean;
}

/**
 * Userscript development configuration
 */
export interface UserscriptConfig {
	/** Userscript metadata */
	metadata: UserscriptMetadata;
	/** Build options */
	build?: {
		/** Output directory */
		outDir?: string;
		/** Output filename */
		outFile?: string;
	};
}

/**
 * Define a userscript configuration
 */
export function defineConfig(config: UserscriptConfig): UserscriptConfig {
	return config;
}
