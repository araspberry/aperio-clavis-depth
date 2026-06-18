/**
 * Stub for @tanstack/start-server-core in Capacitor (client-only) builds.
 * Server functions are not available in the native app — they would be
 * called via the Supabase / API layer instead.
 */
export const createServerFn = () => () => {
  throw new Error("Server functions are not available in the native app.");
};
export const createMiddleware = () => ({});
export const serverOnly$ = (fn: unknown) => fn;
export const json = (data: unknown) => data;
export const redirect = (url: string) => ({ url });
export const getWebRequest = () => null;
export const getEvent = () => null;
export const setResponseStatus = () => {};
export const getCookie = () => undefined;
export const setCookie = () => {};
export const deleteCookie = () => {};
export default {};
