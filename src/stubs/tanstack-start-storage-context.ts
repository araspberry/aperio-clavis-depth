/**
 * Stub for @tanstack/start-storage-context in Capacitor (client-only) builds.
 * AsyncLocalStorage is a Node.js server API not available in the browser.
 */
export const getContext = () => undefined;
export const setContext = () => {};
export const withContext = (_ctx: unknown, fn: () => unknown) => fn();
export default {};
