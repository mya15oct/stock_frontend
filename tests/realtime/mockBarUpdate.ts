// tests/realtime/mockBarUpdate.ts

export type MockBarPayload = {
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
  type: "bar";
};

export const mockBarUpdate = (symbol: string = "AAPL"): MockBarPayload => {
  const base = 145 + Math.random(); // giá cơ sở ngẫu nhiên nhẹ

  return {
    symbol,
    open: Number((base - 0.5).toFixed(2)),
    high: Number((base + 1.0).toFixed(2)),
    low: Number((base - 1.0).toFixed(2)),
    close: Number((base + 0.3).toFixed(2)),
    volume: 2_000_000 + Math.floor(Math.random() * 500_000),
    timestamp: Date.now(),
    type: "bar",
  };
};




