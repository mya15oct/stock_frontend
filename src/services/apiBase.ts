// Base API configuration and utilities
import type { ApiResponse } from "@/types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const PYTHON_API_URL =
  process.env.NEXT_PUBLIC_PYTHON_API_URL || BACKEND_URL;

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

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (process.env.NODE_ENV === 'development') {
      console.error("API Error Response:", errorText);
    }
    throw new Error(`API Error: ${response.statusText}`);
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

  // If data.success is true but data.data is missing
  throw new Error("Invalid API response structure");
}
