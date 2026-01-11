/**
 * URL parameter utility functions
 */

/**
 * Builds a URLSearchParams object from an object of key-value pairs
 * Only includes values that are truthy or explicitly pass a condition
 */
export const buildUrlParams = ({ params }: { params: Record<string, string | number | boolean | undefined | null> }): URLSearchParams => {
  const urlParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      urlParams.set(key, String(value));
    }
  });
  
  return urlParams;
};

/**
 * Updates the current URL with new parameters without triggering navigation
 */
export const updateUrlWithParams = ({ 
  params, 
  router,
  pathname = window.location.pathname 
}: { 
  params: URLSearchParams; 
  router: { replace: (url: string, options?: { scroll?: boolean }) => void };
  pathname?: string;
}): void => {
  const queryString = params.toString();
  const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
  router.replace(newUrl, { scroll: false });
};
