/**
 * DOM utility functions for userscripts
 */

export interface WaitForOptions {
	/**
	 * Maximum time to wait in milliseconds (default: 10000ms / 10s)
	 */
	timeout?: number;

	/**
	 * Parent element to search within (default: document)
	 */
	parent?: Document | Element;

	/**
	 * Interval to check for element in milliseconds (default: 100ms)
	 */
	interval?: number;
}

export interface OnElementOptions {
	/**
	 * Parent element to observe (default: document.body)
	 */
	parent?: Element;

	/**
	 * Whether to call callback for existing elements (default: true)
	 */
	existing?: boolean;
}

/**
 * Wait for an element to appear in the DOM
 *
 * @param selector - CSS selector to wait for
 * @param options - Configuration options
 * @returns Promise that resolves with the found element
 *
 * @example
 * ```ts
 * const button = await waitFor('.my-button');
 * button.click();
 * ```
 */
export function waitFor<T extends Element = Element>(
	selector: string,
	options: WaitForOptions = {},
): Promise<T> {
	const { timeout = 10000, parent = document } = options;

	return new Promise((resolve, reject) => {
		// Check if element already exists
		const existing = parent.querySelector<T>(selector);
		if (existing) {
			resolve(existing);
			return;
		}

		// Set up timeout
		const timeoutId = setTimeout(() => {
			observer.disconnect();
			reject(new Error(`Timeout waiting for element: ${selector}`));
		}, timeout);

		// Use MutationObserver for efficient element detection
		const observer = new MutationObserver(() => {
			const element = parent.querySelector<T>(selector);
			if (element) {
				clearTimeout(timeoutId);
				observer.disconnect();
				resolve(element);
			}
		});

		observer.observe(parent === document ? document.documentElement : parent, {
			childList: true,
			subtree: true,
		});
	});
}

/**
 * Execute a callback when elements matching a selector appear in the DOM
 *
 * @param selector - CSS selector to watch for
 * @param callback - Function to call when elements are found
 * @param options - Configuration options
 * @returns Function to stop observing
 *
 * @example
 * ```ts
 * const stop = onElement('.item', (element) => {
 *   console.log('New item:', element);
 * });
 *
 * // Later, stop observing
 * stop();
 * ```
 */
export function onElement<T extends Element = Element>(
	selector: string,
	callback: (element: T) => void,
	options: OnElementOptions = {},
): () => void {
	const { parent = document.body, existing = true } = options;

	// Call callback for existing elements
	if (existing) {
		const existingElements = parent.querySelectorAll<T>(selector);
		existingElements.forEach(callback);
	}

	// Set up MutationObserver for new elements
	const observer = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			for (const node of mutation.addedNodes) {
				if (node.nodeType !== Node.ELEMENT_NODE) continue;

				const element = node as Element;

				// Check if the added node matches the selector
				if (element.matches(selector)) {
					callback(element as T);
				}

				// Check for matching descendants
				const descendants = element.querySelectorAll<T>(selector);
				descendants.forEach(callback);
			}
		}
	});

	observer.observe(parent, {
		childList: true,
		subtree: true,
	});

	// Return cleanup function
	return () => observer.disconnect();
}

/**
 * Execute a callback when the DOM is loaded and ready
 *
 * If the DOM is already loaded, the callback is executed immediately.
 * Otherwise, waits for the DOMContentLoaded event.
 *
 * @param callback - Function to execute when DOM is ready
 *
 * @example
 * ```ts
 * onDOMLoaded(() => {
 *   console.log('DOM is ready!');
 *   // Your initialization code here
 * });
 * ```
 */
export function onDOMLoaded(callback: () => void): void {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", callback, { once: true });
	} else {
		// DOM is already loaded (readyState is 'interactive' or 'complete')
		callback();
	}
}
