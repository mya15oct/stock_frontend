// tests/realtime/mockData.ts
// Các dữ liệu / helper dùng chung cho mock realtime.

export const MOCK_SYMBOLS = ["AAPL", "MSFT", "GOOGL", "NVDA", "TSLA"];

export const randomSymbol = (): string => {
  return MOCK_SYMBOLS[Math.floor(Math.random() * MOCK_SYMBOLS.length)];
};




