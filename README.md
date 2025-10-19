# Stock Frontend

Next.js frontend application for Snow Analytics Stock platform.

---

## 📁 Structure

```
stock_frontend/
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── portfolio/
│   │   ├── stocks/
│   │   └── tools/
│   │
│   ├── components/             # React components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── StockCard.tsx
│   │   └── tabs/
│   │       ├── FinancialsTab.tsx
│   │       ├── NewsTab.tsx
│   │       └── OverviewTab.tsx
│   │
│   ├── lib/
│   │   ├── api.ts             # API client
│   │   └── utils.ts           # Utilities
│   │
│   └── contexts/
│
├── public/
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md                  # This file
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+**
- **npm or pnpm**
- **Backend API running** (http://localhost:8000)

### Installation

#### 1. Install Dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

**What gets installed:**

**Core:**

- `next@15.5.4` - React framework
- `react@18.3.1` - UI library
- `react-dom@18.3.1` - React DOM renderer

**Styling:**

- `tailwindcss@3.4.1` - Utility-first CSS
- `postcss@8.4.35` - CSS processor
- `autoprefixer@10.4.17` - CSS autoprefixer

**Data Visualization:**

- `recharts@2.5.0` - Chart library

**HTTP:**

- `axios@1.6.5` (if used) - HTTP client

**TypeScript:**

- `typescript@5.3.3` - Type safety
- `@types/node` - Node.js types
- `@types/react` - React types

**Development:**

```bash
# Install dev dependencies
npm install --save-dev

# Or specific packages
npm install next@latest react@latest react-dom@latest
npm install -D tailwindcss postcss autoprefixer
npm install -D typescript @types/react @types/node
```

#### 2. Environment Setup

Create `.env.local`:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_PYTHON_API_URL=http://localhost:8000
```

**Important:** `.env.local` is gitignored by default.

---

## 🏃 Running

### Development Mode

```bash
npm run dev
# or
pnpm dev
```

Runs on http://localhost:3000

**Features:**

- ✅ Hot reload
- ✅ Fast refresh
- ✅ TypeScript checking
- ✅ CSS hot reload

### Production Build

```bash
# Build
npm run build

# Start production server
npm start
```

### Linting

```bash
npm run lint
```

---

## 🔧 Configuration

### Environment Variables

**File:** `.env.local`

```env
# Backend APIs
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_PYTHON_API_URL=http://localhost:8000

# Optional
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

**Usage in code:**

```typescript
const apiUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL;
```

### Next.js Config

**File:** `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["static.finnhub.io"], // For external images
  },
};

module.exports = nextConfig;
```

### Tailwind Config

**File:** `tailwind.config.js`

```javascript
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors
      },
    },
  },
  plugins: [],
};
```

---

## 📡 API Integration

### API Client

**File:** `src/lib/api.ts`

```typescript
const PYTHON_API_URL =
  process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://localhost:8000";

export type StatementType = "IS" | "BS" | "CF";
export type PeriodType = "annual" | "quarterly";

export interface FinancialDataResponse {
  company: string;
  type: StatementType;
  period: PeriodType;
  periods: string[];
  data: {
    [itemName: string]: {
      [period: string]: number;
    };
  };
}

class ApiClient {
  async getFinancials(
    company: string,
    type: StatementType,
    period: PeriodType
  ): Promise<FinancialDataResponse> {
    const params = new URLSearchParams({ company, type, period });
    const response = await fetch(`${PYTHON_API_URL}/api/financials?${params}`);

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return await response.json();
  }
}

export const api = new ApiClient();
```

### Usage in Components

```typescript
"use client";

import { useState, useEffect } from "react";
import { api, StatementType, PeriodType } from "@/lib/api";

export default function FinancialsTab({ ticker }: { ticker: string }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.getFinancials(ticker, "IS", "quarterly");
        setData(result);
      } catch (error) {
        console.error("Failed to load:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ticker]);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>No data</div>;

  return <div>{/* Render data */}</div>;
}
```

---

## 🎨 Styling

### Tailwind CSS

**Global styles:** `src/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900;
  }
}

@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700;
  }
}
```

**Component styling:**

```typescript
<button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
  Click me
</button>
```

---

## 🧪 Testing

### Run Tests

```bash
# If you have tests configured
npm test

# With coverage
npm run test:coverage
```

### Manual Testing

1. Start backend: `cd ../stock_backend/etl && python server.py`
2. Start frontend: `npm run dev`
3. Open http://localhost:3000
4. Navigate to stocks page
5. Click on a stock (e.g., IBM)
6. Verify all tabs work:
   - Overview
   - Financials
   - News
   - Community

---

## 🐛 Troubleshooting

### Port 3000 Already in Use

```bash
# Change port
PORT=3001 npm run dev
```

Or kill the process:

**Windows:**

```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Linux/Mac:**

```bash
lsof -ti:3000 | xargs kill -9
```

### "Failed to fetch" Error

**Checklist:**

- [ ] Backend API running? (http://localhost:8000)
- [ ] Correct URL in `.env.local`?
- [ ] CORS enabled in backend?
- [ ] Network inspector shows correct request?

**Fix:**

1. Check `.env.local` exists
2. Verify `NEXT_PUBLIC_PYTHON_API_URL=http://localhost:8000`
3. Restart dev server: `npm run dev`

### Module Not Found

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Or with pnpm
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### TypeScript Errors

```bash
# Check TypeScript
npm run type-check

# If type-check script doesn't exist, add to package.json:
{
  "scripts": {
    "type-check": "tsc --noEmit"
  }
}
```

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

---

## 📦 Package Management

### Adding New Packages

```bash
# Production dependency
npm install package-name

# Dev dependency
npm install -D package-name

# Specific version
npm install package-name@1.2.3
```

### Common Packages

**UI Components:**

```bash
npm install @headlessui/react @heroicons/react
```

**State Management:**

```bash
npm install zustand
# or
npm install @tanstack/react-query
```

**Forms:**

```bash
npm install react-hook-form zod @hookform/resolvers
```

**Date Handling:**

```bash
npm install date-fns
```

### Update Packages

```bash
# Check outdated
npm outdated

# Update all
npm update

# Update specific package
npm update package-name

# Update to latest (including major)
npm install package-name@latest
```

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Build for Production

```bash
# Build
npm run build

# Test production build locally
npm start
```

### Environment Variables

Add to Vercel/deployment platform:

```
NEXT_PUBLIC_BACKEND_URL=https://api.yourdomain.com
NEXT_PUBLIC_PYTHON_API_URL=https://python-api.yourdomain.com
```

---

## 📁 Important Files

### package.json

```json
{
  "name": "stock-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "15.5.4",
    "react": "18.3.1",
    "react-dom": "18.3.1"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "esnext",
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## 🔗 Related Documentation

- [Main README](../README.md) - Project overview
- [Backend README](../stock_backend/README.md) - Backend setup
- [Next.js Docs](https://nextjs.org/docs) - Next.js documentation
- [Tailwind Docs](https://tailwindcss.com/docs) - Tailwind CSS documentation

---

## ✅ Checklist

Before running frontend:

- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` created with API URLs
- [ ] Backend API running (http://localhost:8000)
- [ ] PostgreSQL has data

---

## 📝 Development Tips

### Hot Reload

Changes auto-reload. If not working:

```bash
# Restart dev server
npm run dev
```

### VS Code Extensions

Recommended:

- **ES7+ React/Redux/React-Native snippets**
- **Tailwind CSS IntelliSense**
- **Prettier - Code formatter**
- **ESLint**

### Debugging

**Browser DevTools:**

- Network tab → Check API requests
- Console → Check errors
- React DevTools → Inspect components

**VS Code Debugging:**

`.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

---

**Happy coding! 🚀**
