// Base API configuration and utilities
import type { ApiResponse } from "@/types";

const BACKEND_URL =
  // process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5000";
  "http://127.0.0.1:5000";
const PYTHON_API_URL = BACKEND_URL;

export { BACKEND_URL, PYTHON_API_URL };

/**
 * Generic API request function
 */
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${BACKEND_URL}${endpoint}`;

  const { headers: customHeaders, ...customOptions } = options || {};

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...customHeaders,
    },
    ...customOptions,
  });

  if (!response.ok) {
    // Demo Stability Fix: Auto-logout on 401 Unauthorized
    if (response.status === 401) {
      if (typeof window !== "undefined") {
        console.warn("Session expired (401). Redirecting to login...");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/sign-in";
        return {} as T; // Prevent further error handling
      }
    }

    let errorMessage = `API Error: ${response.statusText}`;
    let errorDetails = null;

    try {
      const errorData = await response.json();
      // Handle FastAPI "detail" field and other common error formats
      errorMessage = errorData.detail || errorData.error || errorData.message || errorMessage;
      errorDetails = errorData;

      if (process.env.NODE_ENV === 'development') {
        console.error("API Error Response parsed:", errorData);
      }
    } catch (e) {
      // If parsing fails, use text
      const errorText = await response.text();
      console.error("API Error Response (text):", errorText);
      errorMessage = errorText || errorMessage;
    }

    const error = new Error(errorMessage);
    (error as any).details = errorDetails;
    (error as any).status = response.status;
    throw error;
  }

  const data: ApiResponse<T> = await response.json();

  // Handle different response formats
  if (data.success === false) {
    throw new Error(data.error || "API request failed");
  }

  // If response has success and data/results properties, extract data
  if (data.success && (data.data || (data as any).results)) {
    return data.data || (data as any).results;
  }

  // If response doesn't have success property, assume it's the data itself
  if (data.success === undefined) {
    return data as unknown as T;
  }

  // If data.success is true but data.data is missing, it might be a simple success message
  if (data.success) {
    return data as unknown as T;
  }

  throw new Error("Invalid API response structure");
}
