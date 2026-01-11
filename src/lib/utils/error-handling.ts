/**
 * Error handling utility functions
 */

/**
 * Checks if an error message is an authentication error
 */
export const isAuthError = ({ errorMessage }: { errorMessage?: string }): boolean => {
  if (!errorMessage) return false;
  const message = errorMessage.toLowerCase();
  return message.includes('401') || 
         message.includes('403') || 
         message.includes('unauthorized') || 
         message.includes('forbidden');
};

/**
 * Checks if a user is authenticated by looking for an access token
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('access_token');
};

/**
 * Safely extracts error message from an unknown error
 */
export const getErrorMessage = ({ error, fallback = "An unexpected error occurred" }: { error: unknown; fallback?: string }): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return fallback;
};
