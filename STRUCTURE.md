# 📁 Cấu trúc Stock Frontend - Hoàn chỉnh

## Tổng quan

Cấu trúc này tuân theo best practices của Next.js App Router và tách biệt rõ ràng giữa:

- **UI Components** (tái sử dụng)
- **Business Logic** (services, lib)
- **Type Definitions** (types)
- **Utilities** (utils)
- **Configuration** (config, constants)

---

## 🗂️ Cấu trúc thư mục chi tiết

```
stock_frontend/
├── src/
│   ├── app/                              # Next.js App Router
│   │   ├── (auth)/                       # ✅ Route group - Xác thực
│   │   │   ├── sign-in/
│   │   │   │   └── page.tsx              # Trang đăng nhập
│   │   │   ├── sign-up/
│   │   │   │   └── page.tsx              # Trang đăng ký
│   │   │   └── layout.tsx                # Layout trống (không Header/Footer)
│   │   │
│   │   ├── (main)/                       # ✅ Route group - App chính
│   │   │   ├── portfolio/
│   │   │   │   └── page.tsx              # Trang danh mục đầu tư
│   │   │   │
│   │   │   ├── stocks/
│   │   │   │   ├── [ticker]/             # Dynamic route
│   │   │   │   │   ├── (components)/     # Co-located components
│   │   │   │   │   │   ├── stock-header.tsx
│   │   │   │   │   │   ├── stock-tab-navigation.tsx
│   │   │   │   │   │   └── tabs/         # 🆕 Tab components
│   │   │   │   │   │       ├── tab-overview.tsx
│   │   │   │   │   │       ├── tab-dividends.tsx
│   │   │   │   │   │       ├── tab-financials.tsx
│   │   │   │   │   │       ├── tab-news.tsx
│   │   │   │   │   │       └── tab-community.tsx
│   │   │   │   │   └── page.tsx          # Stock detail page
│   │   │   │   └── page.tsx              # Stocks list page
│   │   │   │
│   │   │   ├── tools/
│   │   │   │   ├── dividend-calendar/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── ex-dividend-calendar/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   │
│   │   │   ├── layout.tsx                # Layout có Header/Footer
│   │   │   └── page.tsx                  # Trang chủ
│   │   │
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   └── layout.tsx                    # Root layout
│   │
│   ├── components/                       # ✅ Components TÁI SỬ DỤNG
│   │   ├── ui/                           # Primitive components (shadcn/ui)
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── table.tsx
│   │   │   └── tabs.tsx
│   │   │
│   │   ├── layout/                       # Layout components
│   │   │   ├── Header.tsx                # App header với navigation
│   │   │   ├── Footer.tsx                # App footer
│   │   │   └── Breadcrumb.tsx            # Breadcrumb navigation
│   │   │
│   │   ├── shared/                       # Business components (reusable)
│   │   │   └── StockCard.tsx             # Stock card component
│   │   │
│   │   └── community/                    # Domain-specific reusable components
│   │       ├── DiscussionPost.tsx        # Discussion post component
│   │       └── NewPostForm.tsx           # New post form component
│   │
│   ├── services/                         # 🆕 API Service Layer
│   │   ├── apiBase.ts                    # Base API configuration & fetch wrapper
│   │   ├── stockService.ts               # Stock-related API calls
│   │   │   # - getStocks()
│   │   │   # - getStock(ticker)
│   │   │   # - getDividends(ticker)
│   │   │   # - getFinancials(ticker, type, period)
│   │   │   # - getNews(ticker)
│   │   │   # - searchStocks(query)
│   │   │
│   │   └── portfolioService.ts           # Portfolio-related API calls
│   │       # - getPortfolio()
│   │       # - addStock(item)
│   │       # - updateStock(ticker, item)
│   │       # - deleteStock(ticker)
│   │
│   ├── types/                            # 🆕 Type Definitions
│   │   ├── stock.ts                      # Stock, DividendEvent, NewsArticle, Financial types
│   │   ├── portfolio.ts                  # PortfolioPosition, PortfolioItem types
│   │   ├── community.ts                  # Reply, DiscussionPost types
│   │   ├── api.ts                        # ApiResponse type
│   │   └── index.ts                      # Central export
│   │
│   ├── lib/                              # 🆕 Business Logic Core
│   │   ├── auth.ts                       # NextAuth configuration & helpers
│   │   │   # - authConfig
│   │   │   # - getServerSession()
│   │   │   # - requireAuth()
│   │   │
│   │   ├── db.ts                         # Database client (Prisma/Drizzle)
│   │   │   # - db instance (singleton)
│   │   │
│   │   └── validations.ts                # Zod schemas for validation
│   │       # - Form validation schemas
│   │       # - Input sanitization
│   │
│   ├── config/                           # 🆕 Global Configuration
│   │   ├── site.ts                       # Site metadata
│   │   │   # - name, description, url
│   │   │   # - ogImage, links
│   │   │
│   │   └── navigation.ts                 # Navigation configuration
│   │       # - mainNav[]
│   │       # - toolsNav[]
│   │       # - footerNav[]
│   │
│   ├── utils/                            # 🆕 Utility Functions
│   │   ├── format.ts                     # Formatting utilities
│   │   │   # - formatCurrency(amount)
│   │   │   # - formatNumber(value)
│   │   │   # - formatPercent(value)
│   │   │   # - formatCompactNumber(value)
│   │   │
│   │   ├── date.ts                       # Date utilities
│   │   │   # - formatDate(date)
│   │   │   # - formatDateTime(date)
│   │   │   # - getRelativeTime(date)
│   │   │
│   │   └── index.ts                      # Main utilities
│   │       # - cn() - Tailwind class merger
│   │       # - debounce()
│   │       # - Re-exports from format & date
│   │
│   ├── hooks/                            # ✅ Custom React Hooks
│   │   ├── useURLTabState.ts             # Tab state via URL params
│   │   └── useDebounce.ts                # Debounce hook
│   │
│   ├── contexts/                         # ✅ React Contexts
│   │   └── StealthContext.tsx            # Stealth mode context
│   │
│   └── constants/                        # ✅ App Constants
│       └── index.ts                      # STOCK_TABS, API_BASE_URL, etc.
│
├── next.config.ts                        # Next.js configuration
├── tsconfig.json                         # TypeScript configuration
├── tailwind.config.ts                    # Tailwind CSS configuration
├── postcss.config.mjs                    # PostCSS configuration
├── package.json                          # Dependencies
└── README.md                             # Project documentation

```

---

## 📋 Phân loại theo chức năng

### 🎨 UI Layer

```
components/
├── ui/          → Primitive, dumb components (Button, Card, Input)
├── layout/      → Layout wrappers (Header, Footer, Breadcrumb)
├── shared/      → Reusable business components (StockCard)
└── community/   → Domain-specific reusable (DiscussionPost, NewPostForm)
```

### 🔧 Business Logic Layer

```
services/        → API calls (stockService, portfolioService)
lib/             → Core logic (auth, db, validations)
```

### 📊 Data Layer

```
types/           → TypeScript definitions
config/          → Global configurations
constants/       → Magic strings, enums
```

### 🛠️ Utilities Layer

```
utils/           → Pure functions (format, date, cn)
hooks/           → React hooks
contexts/        → React contexts
```

### 🌐 Routing Layer

```
app/
├── (auth)/      → Authentication pages (no header/footer)
└── (main)/      → Main app pages (with header/footer)
```

---

## 🎯 Import Paths

### Đường dẫn tuyệt đối (sử dụng alias `@/`)

```typescript
// Types
import type { Stock, PortfolioPosition } from "@/types";

// Services
import { stockService } from "@/services/stockService";
import { portfolioService } from "@/services/portfolioService";

// Utils
import { cn, formatCurrency, formatDate } from "@/utils";

// Components
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import StockCard from "@/components/shared/StockCard";
import Header from "@/components/layout/Header";

// Config
import { siteConfig } from "@/config/site";
import { mainNav, toolsNav } from "@/config/navigation";

// Constants
import { STOCK_TABS, API_BASE_URL } from "@/constants";

// Hooks & Contexts
import { useURLTabState } from "@/hooks/useURLTabState";
import { useStealthMode } from "@/contexts/StealthContext";

// Lib (business logic core)
import { authConfig, getServerSession } from "@/lib/auth";
import { db } from "@/lib/db";
```

### Đường dẫn tương đối (cho co-located components)

```typescript
// Trong stock detail page
import StockHeader from "./(components)/stock-header";
import OverviewTab from "./(components)/tabs/tab-overview";
```

---

## 🔑 Nguyên tắc tổ chức

### 1. **Separation of Concerns**

- `components/` = Chỉ UI, không có business logic
- `services/` = Chỉ API calls, không có UI
- `lib/` = Core business logic (auth, db, validation)
- `utils/` = Pure functions, không có side effects

### 2. **Co-location**

- Components chỉ dùng cho 1 page → Đặt trong `app/route/(components)/`
- Components dùng nhiều nơi → Đặt trong `components/`

### 3. **Type Safety**

- Tất cả types tập trung trong `types/`
- Export qua `types/index.ts` để dễ import
- Dùng `type` import để tránh conflict

### 4. **API Layer**

- Tất cả API calls qua `services/`
- Không gọi `fetch()` trực tiếp trong components
- Sử dụng `apiBase.ts` cho configuration chung

### 5. **Configuration**

- `config/` = External configuration (navigation, site metadata)
- `constants/` = Internal constants (enums, magic strings)
- `lib/` = Core logic configuration (auth, db setup)

---

## ✅ Đã xóa (không còn sử dụng)

- ❌ `lib/definitions.ts` → ✅ Chuyển sang `types/`
- ❌ `lib/api.ts` → ✅ Chuyển sang `services/`
- ❌ `lib/utils.ts` → ✅ Chuyển sang `utils/`
- ❌ `constants/navigation.ts` → ✅ Chuyển sang `config/navigation.ts`

---

## 🚀 Kết luận

Cấu trúc này:

- ✅ **Scalable**: Dễ dàng mở rộng khi thêm features
- ✅ **Maintainable**: Dễ tìm kiếm và sửa code
- ✅ **Type-safe**: TypeScript definitions tập trung
- ✅ **Clean**: Tách biệt rõ ràng giữa UI, Logic, Data
- ✅ **Best practices**: Tuân theo chuẩn Next.js App Router
