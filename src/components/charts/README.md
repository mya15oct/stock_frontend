# Chart Components

Thư viện các component biểu đồ tái sử dụng với animation mượt mà.

## Components

### 1. `PriceHistoryChart` 📈
**Mục đích:** Hiển thị lịch sử giá cổ phiếu theo thời gian

**Props:**
```typescript
interface PriceHistoryChartProps {
  data: PriceDataPoint[];           // [{date: string, price: number}]
  height?: number;                  // Chiều cao chart (default: 400)
  isStealthMode?: boolean;          // Ẩn giá trị (default: false)
  showMinMax?: boolean;             // Hiển thị đường min/max (default: true)
  animationDuration?: number;       // Thời gian animation (default: 1500ms)
  color?: string;                   // Màu line chart (default: "#3B82F6")
}
```

**Sử dụng:**
```tsx
import { PriceHistoryChart } from "@/components/charts";

const data = [
  { date: "2025-10-01", price: 245.27 },
  { date: "2025-10-02", price: 247.50 },
  // ...
];

<PriceHistoryChart 
  data={data}
  height={400}
  showMinMax={true}
/>
```

**Features:**
- ✨ Line chart với area gradient fill
- 📍 Hiển thị min/max price với reference lines
- 🎯 Dot highlight cho giá hiện tại
- 💡 Tooltip hiển thị chi tiết khi hover
- 🔒 Stealth mode support

---

### 2. `AnimatedBarChart` 📊
**Mục đích:** Biểu đồ cột với animation staggered

**Props:**
```typescript
interface AnimatedBarChartProps {
  data: ChartDataPoint[];           // [{period: string, metric1: number, ...}]
  metrics: string[];                // Tên các metrics cần hiển thị
  colors?: string[];                // Màu cho từng metric
  height?: number;                  // Chiều cao chart
  isStealthMode?: boolean;          // Ẩn giá trị
  animationDuration?: number;       // Thời gian animation (default: 1200ms)
  staggerDelay?: number;            // Delay giữa các bar (default: 100ms)
  yAxisLabel?: string;              // Label cho trục Y
  yAxisDivisor?: number;            // Chia giá trị trục Y (ví dụ: 1000000 cho millions)
}
```

---

### 3. `ComparisonBarChart` 📊
**Mục đích:** So sánh metrics giữa nhiều công ty

**Props:**
```typescript
interface ComparisonBarChartProps {
  data: ComparisonDataPoint[];      // Data với keys dạng "AAPL: Revenue"
  mainCompany: string;              // Tên công ty chính
  comparisonCompany: string | null; // Tên công ty so sánh
  metrics: string[];                // Metrics cần compare
  colors?: string[];                // Màu sắc
  height?: number;
  isStealthMode?: boolean;
}
```

---

## Integration với Real Data

### Ví dụ: Overview Tab với API

```tsx
// 1. Định nghĩa interface cho API response
interface PriceHistoryResponse {
  ticker: string;
  period: string;
  data: Array<{
    date: string;      // ISO format: "2025-10-24"
    price: number;
  }>;
}

// 2. Fetch data từ API
const [priceData, setPriceData] = useState<PriceDataPoint[]>([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  async function fetchPriceHistory() {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/stocks/${ticker}/price-history?period=${selectedPeriod}`
      );
      const data: PriceHistoryResponse = await response.json();
      setPriceData(data.data);  // ← Đổ data thật vào
    } catch (error) {
      console.error("Failed to fetch price history:", error);
      // Fallback to mock data
      setPriceData(mockPriceHistoryData[selectedPeriod]);
    } finally {
      setLoading(false);
    }
  }

  fetchPriceHistory();
}, [ticker, selectedPeriod]);

// 3. Render chart với real data
<PriceHistoryChart 
  data={priceData}  // ← Data từ API
  height={400}
  isStealthMode={isStealthMode}
/>
```

---

## Best Practices

### ✅ DO:
- Sử dụng mock data có **cấu trúc giống** real data
- Implement **loading states** khi fetch data
- Có **fallback** nếu API fails
- Test với **nhiều kích thước** data (7 days, 1 year, 5 years)
- Sử dụng `useMemo` để tối ưu **tính toán metrics**

### ❌ DON'T:
- Hardcode SVG paths (không thể reuse)
- Để data fetching logic trong chart component
- Quên xử lý edge cases (empty data, single data point)
- Bỏ qua responsive design

---

## Animation Presets

```typescript
import { ANIMATION_PRESETS } from "@/components/charts";

// Fast: 800ms, stagger 50ms
<AnimatedBarChart {...ANIMATION_PRESETS.fast} />

// Normal: 1200ms, stagger 100ms (default)
<AnimatedBarChart {...ANIMATION_PRESETS.normal} />

// Slow: 1600ms, stagger 150ms
<AnimatedBarChart {...ANIMATION_PRESETS.slow} />
```

---

## Color Palettes

```typescript
import { CHART_COLORS } from "@/components/charts";

// Primary colors
<AnimatedBarChart colors={CHART_COLORS.primary} />

// Gradient presets
const myGradient = CHART_COLORS.gradient.blue; // { from: "#667eea", to: "#764ba2" }
```
