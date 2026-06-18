// Stub for @tanstack/react-start/server in Capacitor (client-only) builds.
// Server middleware runs on the server; in the native app auth is handled
// via Supabase client-side auth directly.
export const getRequest = () => null;
export const getWebRequest = () => null;
export const getEvent = () => null;
export const setResponseStatus = () => {};
export const getCookie = () => undefined;
export const setCookie = () => {};
export const deleteCookie = () => {};
export const getRequestHeader = () => undefined;
export const setResponseHeader = () => {};
export default {};
