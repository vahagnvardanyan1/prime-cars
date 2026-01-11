import { API_BASE_URL } from "@/i18n/config";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Notify all subscribers when token is refreshed
const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// Add subscriber to wait for token refresh
const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Get tokens
export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

// Set tokens
export const setTokens = ({ 
  accessToken, 
  refreshToken 
}: { 
  accessToken: string; 
  refreshToken: string;
}): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const setAccessToken = ({ token }: { token: string }): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

// Remove tokens
export const removeTokens = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  isRefreshing = false;
  refreshSubscribers = [];
};

export const removeAccessToken = (): void => {
  removeTokens();
};

// Check if authenticated
export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

// Refresh access token using refresh token
export const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    console.error("No refresh token available");
    removeTokens();
    return null;
  }

  // Prevent multiple simultaneous refresh attempts
  if (isRefreshing) {
    return new Promise((resolve) => {
      addRefreshSubscriber((token: string) => {
        resolve(token);
      });
    });
  }

  isRefreshing = true;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      console.error("Failed to refresh token:", response.status);
      removeTokens();
      isRefreshing = false;
      
      // Don't reload - let the app handle showing login modal naturally
      return null;
    }

    const data = (await response.json()).data;

    const newAccessToken = data.access_token;
    const newRefreshToken = data.refresh_token || refreshToken;

    // Store new tokens
    setTokens({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
    
    // Notify all waiting subscribers
    onTokenRefreshed(newAccessToken);
    isRefreshing = false;

    return newAccessToken;
  } catch (error) {
    console.error("Error refreshing token:", error);
    removeTokens();
    isRefreshing = false;
    
    // Don't reload - let the app handle showing login modal naturally
    return null;
  }
};

// Authenticated fetch wrapper with automatic token refresh
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const accessToken = getAccessToken();

  if (!accessToken) {
    throw new Error("No access token available");
  }

  // Add Authorization header
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`,
  };

  let response = await fetch(url, { ...options, headers });

  // If 401 Unauthorized, try to refresh token
  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    
    if (!newToken) {
      throw new Error("Failed to refresh token");
    }

    // Retry the original request with new token
    const newHeaders = {
      ...options.headers,
      Authorization: `Bearer ${newToken}`,
    };

    response = await fetch(url, { ...options, headers: newHeaders });
  }

  return response;
};

