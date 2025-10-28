/**
 * @userscript-x/core
 *
 * Runtime utilities for userscripts
 */

export type { OnElementOptions, WaitForOptions } from "./dom.js";
// DOM helpers
export { onDOMLoaded, onElement, waitFor } from "./dom.js";
export type {
	FetchOptions,
	FetchResponse,
} from "./gm.js";

// GM API wrappers
export {
	addStyle,
	fetch,
	notification,
	openInTab,
	setClipboard,
} from "./gm.js";
// Storage utilities
export { storage } from "./storage.js";
