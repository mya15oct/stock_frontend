/**
 * Retry utility with exponential backoff
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: unknown) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 5,
  initialDelay: 300,
  maxDelay: 3000,
  backoffMultiplier: 2,
  onRetry: () => {},
};

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 *
 * @param fn - Function to retry
 * @param options - Retry configuration
 * @returns Result of the function
 * @throws Last error if all retries fail
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: unknown;
  let delay = opts.initialDelay;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on the last attempt
      if (attempt < opts.maxRetries) {
        opts.onRetry?.(attempt + 1, error);
        await sleep(delay);
        delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelay);
      }
    }
  }

  throw lastError;
}

