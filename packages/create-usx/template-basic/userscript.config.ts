import { defineConfig } from "@userscript-x/dev";

export default defineConfig({
	metadata: {
		name: "My Userscript",
		namespace: "http://tampermonkey.net/",
		version: "0.0.1",
		description: "A userscript",
		author: "",
		match: ["https://example.com/*"],
		grant: ["none"],
	},
});
