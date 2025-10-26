/**
 * PriceHistoryChart Component
 *
 * Biểu đồ lịch sử giá cổ phiếu với animation mượt mà sử dụng Recharts
 *
 * Features:
 * - 📈 Line chart với area fill gradient
 * - 🎯 Hiển thị min/max price với đường reference
 * - ✨ Smooth animation
 * - 🔒 Stealth mode để ẩn giá trị
 * - 📊 Tooltip hiển thị thông tin chi tiết
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  ReferenceLine,
  Dot,
} from "recharts";

export interface PriceDataPoint {
  date: string; // Format: "2024-11-01" or "Nov '24"
  price: number;
}

export interface PriceHistoryChartProps {
  data: PriceDataPoint[];
  height?: number;
  isStealthMode?: boolean;
  showMinMax?: boolean; // Hiển thị đường min/max
  animationDuration?: number;
  color?: string;
}

export default function PriceHistoryChart({
  data,
  height = 400,
  isStealthMode = false,
  showMinMax = true,
  animationDuration = 1500,
  color = "#3B82F6", // blue-500
}: PriceHistoryChartProps) {
  // Tính min/max price
  const prices = data.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const currentPrice = data[data.length - 1]?.price || 0;

  // Tính toán domain để chia đều các mốc
  const calculateNiceDomain = () => {
    const range = maxPrice - minPrice;
    const padding = range * 0.1; // 10% padding
    const domainMin = minPrice - padding;
    const domainMax = maxPrice + padding;
    
    // Làm tròn đẹp cho min/max
    const niceMin = Math.floor(domainMin / 10) * 10;
    const niceMax = Math.ceil(domainMax / 10) * 10;
    
    return [niceMin, niceMax];
  };

  const [yMin, yMax] = calculateNiceDomain();

  // Format price cho tooltip và labels
  const formatPrice = (value: number) => {
    if (isStealthMode) return "••••";
    return `$${value.toFixed(2)}`;
  };

  // Format date cho tooltip
  const formatDate = (dateStr: string) => {
    // Nếu đã format sẵn dạng "Nov '24" thì giữ nguyên
    if (dateStr.includes("'")) return dateStr;
    
    // Convert "2024-11-01" → "Nov 01, 2024"
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="text-xs text-gray-600 mb-1">{formatDate(data.date)}</p>
          <p className="text-sm font-semibold text-gray-900">
            {formatPrice(data.price)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom dot cho điểm cuối (current price)
  const CustomDot = (props: any) => {
    const { cx, cy, index } = props;
    // Chỉ hiển thị dot cho điểm cuối cùng
    if (index === data.length - 1) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={5}
          fill={color}
          stroke="#FFFFFF"
          strokeWidth={2}
        />
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        {/* Grid */}
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

        {/* X Axis */}
        <XAxis
          dataKey="date"
          tick={{ fill: "#6b7280", fontSize: 12 }}
          axisLine={{ stroke: "#d1d5db" }}
          tickFormatter={(value) => {
            // Hiển thị label rút gọn trên trục X
            if (value.includes("'")) return value;
            try {
              const date = new Date(value);
              return date.toLocaleDateString("en-US", {
                month: "short",
                year: "2-digit",
              });
            } catch {
              return value;
            }
          }}
        />

        {/* Y Axis */}
        <YAxis
          tick={{ fill: "#6b7280", fontSize: 12 }}
          axisLine={{ stroke: "#d1d5db" }}
          tickFormatter={formatPrice}
          domain={[yMin, yMax]}
          tickCount={8}
          allowDataOverflow={false}
        />

        {/* Tooltip */}
        <Tooltip content={<CustomTooltip />} />

        {/* Reference lines cho min/max */}
        {showMinMax && !isStealthMode && (
          <>
            <ReferenceLine
              y={maxPrice}
              stroke="#10b981"
              strokeDasharray="4 2"
              strokeWidth={1.5}
              label={{
                value: `Max: ${formatPrice(maxPrice)}`,
                position: "insideTopRight",
                fill: "#059669",
                fontSize: 13,
                fontWeight: 600,
                offset: 10,
              }}
            />
            <ReferenceLine
              y={minPrice}
              stroke="#ef4444"
              strokeDasharray="4 2"
              strokeWidth={1.5}
              label={{
                value: `Min: ${formatPrice(minPrice)}`,
                position: "insideBottomRight",
                fill: "#dc2626",
                fontSize: 13,
                fontWeight: 600,
                offset: 10,
              }}
            />
          </>
        )}

        {/* Area fill với gradient */}
        <defs>
          <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>

        <Area
          type="monotone"
          dataKey="price"
          fill="url(#priceGradient)"
          stroke="none"
          animationDuration={animationDuration}
          animationEasing="ease-out"
        />

        {/* Line chart */}
        <Line
          type="monotone"
          dataKey="price"
          stroke={color}
          strokeWidth={2.5}
          dot={<CustomDot />}
          animationDuration={animationDuration}
          animationEasing="ease-out"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
