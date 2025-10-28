/**
 * Storage utilities with type-safe wrappers around GM storage APIs
 */

/**
 * Type-safe wrapper around GM_getValue/GM_setValue
 */
export const storage = {
	/**
	 * Get a value from userscript storage
	 *
	 * @param key - Storage key
	 * @param defaultValue - Default value if key doesn't exist
	 * @returns Stored value or default value
	 *
	 * @example
	 * ```ts
	 * const count = await storage.get('count', 0);
	 * const user = await storage.get<User>('user');
	 * ```
	 */
	async get<T = unknown>(key: string, defaultValue?: T): Promise<T> {
		if (typeof GM !== "undefined" && GM.getValue) {
			return GM.getValue(key, defaultValue);
		}

		if (typeof GM_getValue !== "undefined") {
			return GM_getValue(key, defaultValue);
		}

		// Fallback to localStorage if GM APIs not available
		const stored = localStorage.getItem(key);
		if (stored === null) {
			return defaultValue as T;
		}

		try {
			return JSON.parse(stored) as T;
		} catch {
			return stored as T;
		}
	},

	/**
	 * Set a value in userscript storage
	 *
	 * @param key - Storage key
	 * @param value - Value to store
	 *
	 * @example
	 * ```ts
	 * await storage.set('count', 42);
	 * await storage.set('user', { name: 'John' });
	 * ```
	 */
	async set<T = unknown>(key: string, value: T): Promise<void> {
		if (typeof GM !== "undefined" && GM.setValue) {
			return GM.setValue(key, value);
		}

		if (typeof GM_setValue !== "undefined") {
			return GM_setValue(key, value);
		}

		// Fallback to localStorage if GM APIs not available
		const serialized =
			typeof value === "string" ? value : JSON.stringify(value);
		localStorage.setItem(key, serialized);
	},

	/**
	 * Delete a value from userscript storage
	 *
	 * @param key - Storage key
	 *
	 * @example
	 * ```ts
	 * await storage.delete('count');
	 * ```
	 */
	async delete(key: string): Promise<void> {
		if (typeof GM !== "undefined" && GM.deleteValue) {
			return GM.deleteValue(key);
		}

		if (typeof GM_deleteValue !== "undefined") {
			return GM_deleteValue(key);
		}

		// Fallback to localStorage
		localStorage.removeItem(key);
	},

	/**
	 * List all keys in userscript storage
	 *
	 * @returns Array of storage keys
	 *
	 * @example
	 * ```ts
	 * const keys = await storage.listKeys();
	 * console.log('Stored keys:', keys);
	 * ```
	 */
	async listKeys(): Promise<string[]> {
		if (typeof GM !== "undefined" && GM.listValues) {
			return GM.listValues();
		}

		if (typeof GM_listValues !== "undefined") {
			return GM_listValues();
		}

		// Fallback to localStorage
		return Object.keys(localStorage);
	},
};
