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
