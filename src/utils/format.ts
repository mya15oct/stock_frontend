// Formatting utilities

/**
 * Format number as currency (USD)
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD"
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format number with specified decimal places
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format number as percentage
 */
export function formatPercent(value: number, decimals: number = 2): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${formatNumber(value, decimals)}%`;
}

/**
 * Format large numbers in compact notation (K, M, B, T)
 */
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Format financial numbers with M/B/T suffix and USD label
 * Optimized for financial statements
 */
export function formatFinancialNumber(value: number | undefined): string {
  if (value === undefined || value === null) return "-";
  
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  
  if (abs >= 1e12) {
    // Trillion
    return `${sign}${(abs / 1e12).toFixed(2)}T`;
  } else if (abs >= 1e9) {
    // Billion
    return `${sign}${(abs / 1e9).toFixed(2)}B`;
  } else if (abs >= 1e6) {
    // Million
    return `${sign}${(abs / 1e6).toFixed(2)}M`;
  } else if (abs >= 1e3) {
    // Thousand
    return `${sign}${(abs / 1e3).toFixed(2)}K`;
  } else {
    return `${sign}${abs.toFixed(2)}`;
  }
}

/**
 * Format money flow values in compact USD notation (e.g., $1.2B, $345.6M)
 * Used for money flow charts and displays
 */
export function formatMoneyFlow(value: number): string {
  if (value === 0) return "$0";
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absValue >= 1_000_000_000) {
    return `${sign}$${(absValue / 1_000_000_000).toFixed(1)}B`;
  }
  if (absValue >= 1_000_000) {
    return `${sign}$${(absValue / 1_000_000).toFixed(1)}M`;
  }
  if (absValue >= 1_000) {
    return `${sign}$${(absValue / 1_000).toFixed(1)}K`;
  }
  return `${sign}$${absValue.toFixed(1)}`;
}

/**
 * Determine the best scale for chart Y-axis based on data range
 * Returns the divisor and label (e.g., [1e9, "Billions"] or [1e6, "Millions"])
 */
export function getFinancialScale(values: number[]): {
  divisor: number;
  label: string;
  suffix: string;
} {
  const maxValue = Math.max(...values.map(Math.abs));
  
  if (maxValue >= 1e12) {
    return { divisor: 1e12, label: "Trillions", suffix: "T" };
  } else if (maxValue >= 1e9) {
    return { divisor: 1e9, label: "Billions", suffix: "B" };
  } else if (maxValue >= 1e6) {
    return { divisor: 1e6, label: "Millions", suffix: "M" };
  } else if (maxValue >= 1e3) {
    return { divisor: 1e3, label: "Thousands", suffix: "K" };
  } else {
    return { divisor: 1, label: "Units", suffix: "" };
  }
}
