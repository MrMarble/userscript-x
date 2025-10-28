/**
 * Improved wrappers around Greasemonkey/Tampermonkey/Violentmonkey APIs
 */

export interface FetchOptions extends RequestInit {
	/**
	 * Timeout in milliseconds
	 */
	timeout?: number;

	/**
	 * Response type
	 */
	responseType?: "text" | "json" | "blob" | "arraybuffer" | "document";
}

export interface FetchResponse<T = unknown> {
	status: number;
	statusText: string;
	headers: Record<string, string>;
	data: T;
	finalUrl: string;
}

/**
 * Make HTTP requests using GM_xmlhttpRequest with a fetch-like API
 *
 * @param url - Request URL
 * @param options - Request options
 * @returns Promise with response data
 *
 * @example
 * ```ts
 * const response = await fetch<User>('https://api.example.com/user');
 * console.log(response.data.name);
 * ```
 */
export function fetch<T = unknown>(
	url: string,
	options: FetchOptions = {},
): Promise<FetchResponse<T>> {
	return new Promise((resolve, reject) => {
		const {
			method = "GET",
			headers = {},
			body,
			timeout = 30000,
			responseType = "json",
		} = options;

		// Check if GM_xmlhttpRequest is available
		if (
			typeof GM_xmlhttpRequest === "undefined" &&
			(typeof GM === "undefined" || !GM.xmlHttpRequest)
		) {
			reject(new Error("GM_xmlhttpRequest is not available"));
			return;
		}

		const gmFetch =
			typeof GM !== "undefined" && GM.xmlHttpRequest
				? GM.xmlHttpRequest
				: GM_xmlhttpRequest;

		gmFetch({
			method,
			url,
			headers: headers as Record<string, string>,
			data: body as string,
			timeout,
			responseType: responseType as "text",
			onload: (response: {
				status: number;
				statusText: string;
				responseText: string;
				response: unknown;
				responseHeaders?: string;
				finalUrl?: string;
			}) => {
				let data: T;

				if (responseType === "json") {
					try {
						data = JSON.parse(response.responseText) as T;
					} catch (error) {
						reject(new Error(`Failed to parse JSON response: ${error}`));
						return;
					}
				} else {
					data = response.response as T;
				}

				// Parse headers into object
				const headersObj: Record<string, string> = {};
				if (response.responseHeaders) {
					response.responseHeaders.split("\n").forEach((line: string) => {
						const [key, ...valueParts] = line.split(":");
						if (key && valueParts.length > 0) {
							headersObj[key.trim().toLowerCase()] = valueParts
								.join(":")
								.trim();
						}
					});
				}

				resolve({
					status: response.status,
					statusText: response.statusText,
					headers: headersObj,
					data,
					finalUrl: response.finalUrl || url,
				});
			},
			onerror: (error: { statusText?: string }) => {
				reject(
					new Error(`Request failed: ${error.statusText || "Unknown error"}`),
				);
			},
			ontimeout: () => {
				reject(new Error(`Request timeout after ${timeout}ms`));
			},
		});
	});
}

/**
 * Add CSS styles to the page
 *
 * @param css - CSS string to inject
 * @returns Style element (if available)
 *
 * @example
 * ```ts
 * addStyle(`
 *   .my-class {
 *     color: red;
 *   }
 * `);
 * ```
 */
export function addStyle(css: string): HTMLStyleElement | undefined {
	if (typeof GM !== "undefined" && GM.addStyle) {
		GM.addStyle(css);
		return undefined;
	}

	if (typeof GM_addStyle !== "undefined") {
		GM_addStyle(css);
		return undefined;
	}

	// Fallback to manual style injection
	const style = document.createElement("style");
	style.textContent = css;
	(document.head || document.documentElement).appendChild(style);
	return style;
}

/**
 * Open a URL in a new tab
 *
 * @param url - URL to open
 * @param background - Open in background (default: false)
 * @returns Window object or tab reference
 *
 * @example
 * ```ts
 * openInTab('https://example.com');
 * ```
 */
export function openInTab(
	url: string,
	background = false,
): Window | object | null {
	if (typeof GM !== "undefined" && GM.openInTab) {
		return GM.openInTab(url, background);
	}

	if (typeof GM_openInTab !== "undefined") {
		return GM_openInTab(url, background);
	}

	// Fallback to window.open
	return window.open(url, "_blank");
}

/**
 * Set clipboard contents
 *
 * @param text - Text to copy to clipboard
 *
 * @example
 * ```ts
 * await setClipboard('Hello, world!');
 * ```
 */
export async function setClipboard(text: string): Promise<void> {
	if (typeof GM !== "undefined" && GM.setClipboard) {
		GM.setClipboard(text);
		return;
	}

	if (typeof GM_setClipboard !== "undefined") {
		GM_setClipboard(text);
		return;
	}

	// Fallback to navigator.clipboard
	if (navigator.clipboard?.writeText) {
		await navigator.clipboard.writeText(text);
		return;
	}

	throw new Error("Clipboard API not available");
}

/**
 * Show a notification
 *
 * @param text - Notification text
 * @param title - Notification title
 * @param options - Additional notification options
 *
 * @example
 * ```ts
 * notification('Task completed!', 'Success');
 * ```
 */
export function notification(
	text: string,
	title?: string,
	options: { image?: string; onclick?: () => void } = {},
): void {
	if (typeof GM !== "undefined" && GM.notification) {
		GM.notification({
			text,
			title,
			image: options.image,
			onclick: options.onclick,
		});
		return;
	}

	if (typeof GM_notification !== "undefined") {
		GM_notification({
			text,
			title,
			image: options.image,
			onclick: options.onclick,
		});
		return;
	}

	// Fallback to browser notification API
	if ("Notification" in window && Notification.permission === "granted") {
		const notification = new Notification(title || "Notification", {
			body: text,
			icon: options.image,
		});

		if (options.onclick) {
			notification.onclick = options.onclick;
		}
	}
}
