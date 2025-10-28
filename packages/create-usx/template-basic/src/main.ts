// Import utilities from @userscript-x/core
import { addStyle, onDOMLoaded, storage } from "@userscript-x/core";

// This is your userscript entry point
console.log("Userscript loaded!");

// Add custom styles
addStyle(`
  .usx-message {
    position: fixed;
    top: 10px;
    right: 10px;
    padding: 10px 20px;
    background: #4CAF50;
    color: white;
    border-radius: 4px;
    z-index: 10000;
    font-family: sans-serif;
  }
`);

// Run when DOM is ready
onDOMLoaded(async () => {
	console.log("DOM is ready!");

	// Example: Load stored count
	const count = await storage.get<number>("visit-count", 0);
	await storage.set("visit-count", count + 1);

	// Show a message
	const message = document.createElement("div");
	message.className = "usx-message";
	message.textContent = `Hello from your userscript! (Visit #${count + 1})`;
	document.body.appendChild(message);

	// Remove message after 3 seconds
	setTimeout(() => {
		message.remove();
	}, 3000);
});
