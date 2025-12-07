/**
 * Chart Components Export
 *
 * Tập hợp các component biểu đồ với animation
 */

export { default as AnimatedBarChart } from "./AnimatedBarChart";
export type { AnimatedBarChartProps, ChartDataPoint } from "./AnimatedBarChart";

export { default as ComparisonBarChart } from "./ComparisonBarChart";
export type {
  ComparisonBarChartProps,
  ComparisonDataPoint,
} from "./ComparisonBarChart";

export { default as PriceHistoryChart } from "./PriceHistoryChart";
export type {
  PriceHistoryChartProps,
  PriceDataPoint,
  ChartType,
} from "./PriceHistoryChart";

export { default as CandlestickChart } from "./CandlestickChart";
export type { CandlestickChartProps } from "./CandlestickChart";

export { default as HeatmapChart } from "./HeatmapChart";
export type { HeatmapChartProps } from "./HeatmapChart";

// Default colors cho charts
export const CHART_COLORS = {
  primary: [
    "#3699ff", // blue
    "#a855f7", // purple
    "#ec4899", // pink
    "#f59e0b", // amber
    "#10b981", // green
    "#06b6d4", // cyan
    "#ef4444", // red
    "#f97316", // orange
  ],
  gradient: {
    blue: { from: "#667eea", to: "#764ba2" },
    pink: { from: "#f093fb", to: "#f5576c" },
    cyan: { from: "#4facfe", to: "#00f2fe" },
    green: { from: "#43e97b", to: "#38f9d7" },
    orange: { from: "#fa709a", to: "#fee140" },
    purple: { from: "#30cfd0", to: "#330867" },
  },
};

// Animation presets
export const ANIMATION_PRESETS = {
  fast: {
    duration: 800,
    staggerDelay: 50,
  },
  normal: {
    duration: 1200,
    staggerDelay: 100,
  },
  slow: {
    duration: 1600,
    staggerDelay: 150,
  },
};
