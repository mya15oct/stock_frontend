// tests/realtime/simulateRealtime.ts
//
// Mô phỏng realtime bằng cách kết nối tới WebSocket gateway
// và emit các sự kiện mock `bar_update` và `trade_update`.
// Lưu ý: gateway hiện tại không lắng nghe các event này từ client,
// đây chủ yếu là ví dụ / test harness để bạn có thể mở rộng phía backend nếu cần.

import { io } from "socket.io-client";
import { mockBarUpdate } from "./mockBarUpdate";
import { mockTradeUpdate } from "./mockTradeUpdate";
import { randomSymbol } from "./mockData";

export const simulateRealtime = (wsUrl = "http://localhost:5000") => {
  const socket = io(wsUrl, {
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    // eslint-disable-next-line no-console
    console.log("[simulateRealtime] Connected to", wsUrl);
  });

  socket.on("disconnect", (reason) => {
    // eslint-disable-next-line no-console
    console.log("[simulateRealtime] Disconnected:", reason);
  });

  // Mô phỏng gửi bar_update mỗi 5 giây
  setInterval(() => {
    const symbol = randomSymbol();
    const barData = mockBarUpdate(symbol);
    socket.emit("bar_update", barData);
    // eslint-disable-next-line no-console
    console.log("[simulateRealtime] Sent bar_update:", barData);
  }, 5000);

  // Mô phỏng gửi trade_update mỗi 2 giây
  setInterval(() => {
    const symbol = randomSymbol();
    const tradeData = mockTradeUpdate(symbol);
    socket.emit("trade_update", tradeData);
    // eslint-disable-next-line no-console
    console.log("[simulateRealtime] Sent trade_update:", tradeData);
  }, 2000);

  return socket;
};


