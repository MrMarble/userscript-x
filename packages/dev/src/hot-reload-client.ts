/**
 * Hot reload client code that gets injected into userscripts during development
 */
export function getHotReloadClient(port: number): string {
	return `
// Hot reload client - injected in development mode
(function() {
  const HOT_RELOAD_PORT = ${port};
  let ws;
  let reconnectTimer;

  function connect() {
    try {
      ws = new WebSocket(\`ws://localhost:\${HOT_RELOAD_PORT}\`);

      ws.onopen = () => {
        console.log('[USX] Hot reload connected');
        if (reconnectTimer) {
          clearTimeout(reconnectTimer);
          reconnectTimer = null;
        }
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'reload' && data.code) {
          console.log('[USX] Hot reloading userscript...');

          try {
            // Call user-defined cleanup if available
            if (typeof window.__USX_CLEANUP__ === 'function') {
              try {
                window.__USX_CLEANUP__();
              } catch (cleanupError) {
                console.warn('[USX] Cleanup function error:', cleanupError);
              }
            }

            // Execute the new code
            // Using indirect eval to run in global scope
            (0, eval)(data.code);

            console.log('[USX] ✓ Hot reload complete');
          } catch (error) {
            console.error('[USX] Hot reload execution error:', error);
          }
        }
      };

      ws.onclose = () => {
        console.log('[USX] Hot reload disconnected, reconnecting...');
        // Reconnect after 1 second
        reconnectTimer = setTimeout(connect, 1000);
      };

      ws.onerror = (error) => {
        console.error('[USX] Hot reload error:', error);
        ws.close();
      };
    } catch (error) {
      console.error('[USX] Failed to connect to hot reload server:', error);
      reconnectTimer = setTimeout(connect, 1000);
    }
  }

  // Start connection
  connect();

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    if (ws) {
      ws.close();
    }
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
    }
  });
})();
`;
}
