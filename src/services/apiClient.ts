/**
 * Enhanced API Client with retry logic, timeout, and better error handling
 */

import type { ApiResponse } from "@/types";

const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const PYTHON_API_URL =
    process.env.NEXT_PUBLIC_PYTHON_API_URL || BACKEND_URL;

export { BACKEND_URL, PYTHON_API_URL };

/**
 * Custom API Error Class
 */
export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public code?: string,
        public details?: any
    ) {
        super(message);
        this.name = "ApiError";
    }
}

/**
 * Network timeout wrapper
 */
function fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeout = 30000
): Promise<Response> {
    return Promise.race([
        fetch(url, options),
        new Promise<Response>((_, reject) =>
            setTimeout(() => reject(new Error("Request timeout")), timeout)
        ),
    ]);
}

/**
 * Retry logic for failed requests
 */
async function fetchWithRetry(
    url: string,
    options: RequestInit = {},
    retries = 3,
    delay = 1000
): Promise<Response> {
    try {
        return await fetchWithTimeout(url, options);
    } catch (error) {
        if (retries === 0) throw error;

        // Only retry on network errors, not on 4xx/5xx responses
        if (error instanceof TypeError || (error as Error).message === "Request timeout") {
            await new Promise((resolve) => setTimeout(resolve, delay));
            return fetchWithRetry(url, options, retries - 1, delay * 2);
        }

        throw error;
    }
}

/**
 * Enhanced API request function with retry, timeout, and better error handling
 */
export async function apiRequest<T>(
    endpoint: string,
    options?: RequestInit & { timeout?: number; retries?: number }
): Promise<T> {
    const url = endpoint.startsWith("http")
        ? endpoint
        : `${BACKEND_URL}${endpoint}`;

    const { timeout = 30000, retries = 3, ...fetchOptions } = options || {};

    try {
        const response = await fetchWithRetry(
            url,
            {
                headers: {
                    "Content-Type": "application/json",
                    ...fetchOptions?.headers,
                },
                ...fetchOptions,
            },
            retries
        );

        // Handle non-OK responses
        if (!response.ok) {
            let errorMessage = `API Error: ${response.statusText}`;
            let errorDetails = null;

            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorData.message || errorMessage;
                errorDetails = errorData.details || errorData;
            } catch {
                // If response is not JSON, use status text
                const errorText = await response.text();
                errorMessage = errorText || errorMessage;
            }

            throw new ApiError(
                errorMessage,
                response.status,
                response.status >= 500 ? "SERVER_ERROR" : "CLIENT_ERROR",
                errorDetails
            );
        }

        const data: ApiResponse<T> = await response.json();

        // Handle different response formats
        if (data.success === false) {
            throw new ApiError(
                data.error || "API request failed",
                undefined,
                "API_ERROR",
                data
            );
        }

        // If response has success and data properties, extract data
        if (data.success && data.data !== undefined) {
            return data.data;
        }

        // If response doesn't have success property, assume it's the data itself
        if (data.success === undefined) {
            return data as unknown as T;
        }

        // Invalid response structure
        throw new ApiError(
            "Invalid API response structure",
            undefined,
            "INVALID_RESPONSE",
            data
        );
    } catch (error) {
        // Re-throw ApiError as-is
        if (error instanceof ApiError) {
            throw error;
        }

        // Handle network errors
        if (error instanceof TypeError) {
            throw new ApiError(
                "Network error. Please check your internet connection.",
                undefined,
                "NETWORK_ERROR"
            );
        }

        // Handle timeout errors
        if ((error as Error).message === "Request timeout") {
            throw new ApiError(
                "Request timeout. The server took too long to respond.",
                undefined,
                "TIMEOUT_ERROR"
            );
        }

        // Unknown errors
        throw new ApiError(
            error instanceof Error ? error.message : "Unknown error occurred",
            undefined,
            "UNKNOWN_ERROR"
        );
    }
}




