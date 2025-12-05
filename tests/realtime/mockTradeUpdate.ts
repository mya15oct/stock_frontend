// tests/realtime/mockTradeUpdate.ts

export type MockTradePayload = {
  symbol: string;
  price: number;
  size: number;
  timestamp: number;
  type: "trade";
};

export const mockTradeUpdate = (symbol: string = "AAPL"): MockTradePayload => {
  const base = 145 + Math.random();

  return {
    symbol,
    price: Number((base + 0.2).toFixed(2)),
    size: 500 + Math.floor(Math.random() * 1_500),
    timestamp: Date.now(),
    type: "trade",
  };
};


