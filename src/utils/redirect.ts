/*
 * Only allow in-site paths as post-login destinations.
 */
export const safeRedirect = (
  value: string | null,
  fallback = "/my-courses"
): string =>
  value && value.startsWith("/") && !value.startsWith("//") ? value : fallback;