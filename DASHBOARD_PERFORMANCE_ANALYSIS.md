# 📊 Dashboard Performance Analysis

## 🔍 Flow Analysis - Dashboard Loading

### 1. Initial Page Load Flow

```
User navigates to /market
  ↓
MarketOverviewPage renders
  ↓
3 Components mount simultaneously:
  ├─ LeftChartPanel
  ├─ HeatmapPanel  
  └─ FeaturedNewsPanel
  ↓
Each component triggers hooks:
  ├─ LeftChartPanel → useRealtimeHeatmap()
  ├─ HeatmapPanel → useRealtimeHeatmap() + useRealtimeContext()
  └─ FeaturedNewsPanel → useState (mock data, no API)
  ↓
RealtimeProvider mounts (if not already mounted)
  ↓
WebSocket connection attempt
  ↓
useRealtimeHeatmap() triggers:
  ├─ fetchMarketStocks() API call
  ├─ Wait for response (~500ms-2s)
  ├─ fetchPreviousClosesBatch() API call (background)
  ├─ Set isLoading = false (after metadata loaded)
  └─ Start volume polling (every 2s)
  ↓
UI renders with data
```

### 2. API Calls Timeline

| Time | Action | Duration | Blocking |
|------|--------|----------|----------|
| 0ms | Page load | - | - |
| 0-50ms | Component mount | 50ms | No |
| 50-100ms | WebSocket connect attempt | 50ms | No |
| 100ms | `fetchMarketStocks()` starts | - | **YES** |
| 100-1500ms | Wait for `/api/market/stocks` | **1400ms** | **YES** |
| 1500ms | Metadata received | - | - |
| 1500ms | `setIsLoading(false)` | - | - |
| 1500ms | `fetchPreviousClosesBatch()` starts (background) | - | No |
| 1500-2000ms | Wait for `/api/quote/previous-closes` | 500ms | No |
| 2000ms | Volume polling starts (every 2s) | - | No |
| 2000ms+ | Realtime trade updates | - | No |

### 3. Identified Bottlenecks

#### 🔴 **Critical Issues**

1. **Sequential API Calls (Blocking)**
   - `fetchMarketStocks()` blocks UI until complete
   - Even with optimistic loading, still takes 1-2 seconds
   - **Impact**: User sees loading spinner for 1-2s

2. **Multiple Hook Instances**
   - `LeftChartPanel` and `HeatmapPanel` both call `useRealtimeHeatmap()`
   - Each triggers separate API calls and effects
   - **Impact**: Duplicate API calls, duplicate volume polling

3. **Volume Polling Overhead**
   - Starts immediately after data load
   - Polls every 2 seconds even if no trades
   - **Impact**: Unnecessary network requests

4. **WebSocket Connection Delay**
   - WebSocket connection may take 100-500ms
   - Blocks realtime data display
   - **Impact**: "Waiting for realtime data..." message shown

#### 🟡 **Medium Issues**

5. **Excessive Console Logging**
   - `console.log` in every trade update
   - `console.log` in every volume fetch
   - **Impact**: Performance degradation in production

6. **Image Loading in News Panel**
   - 7 images from unsplash.com
   - No lazy loading or optimization
   - **Impact**: Slow initial render, especially on slow networks

7. **Re-render Triggers**
   - `hasActiveRealtimeData` useMemo recalculates frequently
   - `latestTrades` Map changes trigger re-renders
   - **Impact**: Unnecessary component re-renders

#### 🟢 **Minor Issues**

8. **Retry Logic Overhead**
   - Retry with backoff adds delay on failures
   - May retry unnecessarily
   - **Impact**: Additional delay on network issues

9. **Data Transformation**
   - Complex data transformation in `useRealtimeHeatmap`
   - Sorting and mapping on every update
   - **Impact**: CPU overhead on large datasets

### 4. Component Dependencies

```
MarketOverviewPage
├─ LeftChartPanel
│  └─ useRealtimeHeatmap() ← Duplicate hook instance
│     ├─ fetchMarketStocks()
│     ├─ fetchPreviousClosesBatch()
│     └─ fetchAccumulatedVolumes() (polling)
│
├─ HeatmapPanel
│  ├─ useRealtimeHeatmap() ← Duplicate hook instance
│  │  ├─ fetchMarketStocks() ← DUPLICATE API CALL
│  │  ├─ fetchPreviousClosesBatch() ← DUPLICATE API CALL
│  │  └─ fetchAccumulatedVolumes() (polling) ← DUPLICATE POLLING
│  └─ useRealtimeContext()
│     └─ WebSocket connection
│
└─ FeaturedNewsPanel
   └─ useState (mock data, no API)
```

### 5. Performance Metrics (Estimated)

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| **Time to First Paint** | ~100ms | ~50ms | 50ms |
| **Time to Interactive** | ~1500ms | ~500ms | **1000ms** |
| **API Calls on Load** | 3-4 calls | 1-2 calls | 2 calls |
| **Volume Polling Frequency** | Every 2s | Every 5s | 3s |
| **WebSocket Connect Time** | 100-500ms | <100ms | 400ms |

### 6. Recommendations

#### 🚀 **High Priority**

1. **Share Hook Instance**
   - Move `useRealtimeHeatmap()` to page level
   - Pass data as props to child components
   - **Expected improvement**: -50% API calls, -50% volume polling

2. **Optimize Initial Load**
   - Cache metadata in localStorage/sessionStorage
   - Load from cache first, refresh in background
   - **Expected improvement**: -80% initial load time

3. **Debounce Volume Polling**
   - Only poll when WebSocket is connected
   - Increase interval to 5 seconds
   - **Expected improvement**: -60% network requests

4. **Remove Console Logs**
   - Use conditional logging (dev only)
   - **Expected improvement**: +10-20% render performance

#### 📈 **Medium Priority**

5. **Lazy Load Images**
   - Use Next.js Image with `loading="lazy"`
   - Add placeholder/skeleton
   - **Expected improvement**: -30% initial render time

6. **Optimize Re-renders**
   - Use `React.memo` more aggressively
   - Memoize expensive calculations
   - **Expected improvement**: -20% CPU usage

7. **WebSocket Connection Pooling**
   - Reuse existing connections
   - Pre-connect on app init
   - **Expected improvement**: -200ms connection time

#### 🔧 **Low Priority**

8. **Reduce Retry Attempts**
   - Current: 2 retries
   - Consider: 1 retry for initial load
   - **Expected improvement**: -200ms on failures

9. **Optimize Data Transformation**
   - Use Web Workers for heavy calculations
   - Batch updates
   - **Expected improvement**: -10% CPU usage

### 7. Implementation Priority

```
Phase 1 (Quick Wins - 1-2 hours):
  ✅ Remove console.logs (dev only)
  ✅ Share useRealtimeHeatmap hook
  ✅ Increase volume polling interval

Phase 2 (Medium Effort - 2-4 hours):
  ✅ Add metadata caching
  ✅ Lazy load images
  ✅ Optimize re-renders

Phase 3 (Long Term - 1-2 days):
  ✅ WebSocket connection pooling
  ✅ Web Workers for data transformation
  ✅ Advanced caching strategy
```

### 8. Expected Overall Improvement

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Initial Load Time** | 1500ms | 500ms | **-67%** |
| **API Calls** | 3-4 | 1-2 | **-50%** |
| **Network Requests/min** | 30 | 12 | **-60%** |
| **Time to Interactive** | 1500ms | 500ms | **-67%** |

---

**Generated**: 2025-01-27
**Last Updated**: 2025-01-27


