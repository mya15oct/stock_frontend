import { io, Socket } from "socket.io-client";

/**
 * Socket.IO client with auto-reconnection and exponential backoff
 * ✅ Step 7: WebSocket Connection Optimization - Pre-connect on app init
 * Connection is established immediately when this module is imported
 * This happens when RealtimeProvider mounts, which is at app root level
 */
const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL || "http://localhost:5000";

export const socket: Socket = io(WS_URL, {
  transports: ["websocket", "polling"], // Cho phép cả websocket và polling fallback
  reconnection: true,
  reconnectionAttempts: Infinity, // Keep trying to reconnect
  reconnectionDelay: 1000, // Start with 1 second
  reconnectionDelayMax: 5000, // Max 5 seconds between attempts
  randomizationFactor: 0.5, // Add some randomness to prevent thundering herd
  timeout: 20000, // Connection timeout: 20 seconds
  forceNew: false, // ✅ Reuse existing connection if available (connection pooling)
  // Tối ưu để tránh ngắt kết nối
  upgrade: true, // Allow upgrade from polling to websocket
  rememberUpgrade: true, // Remember upgrade preference
});

// ✅ Step 4: Dev-only logging
if (process.env.NODE_ENV === "development") {
  socket.on("connect", () => {
    // eslint-disable-next-line no-console
    console.log("[Socket.IO] Connected to realtime server");
  });

  socket.on("disconnect", (reason) => {
    // eslint-disable-next-line no-console
    console.warn("[Socket.IO] Disconnected:", reason);
  });

  socket.on("reconnect_attempt", (attemptNumber) => {
    // eslint-disable-next-line no-console
    console.log(`[Socket.IO] Reconnection attempt ${attemptNumber}`);
  });

  socket.on("reconnect", (attemptNumber) => {
    // eslint-disable-next-line no-console
    console.log(`[Socket.IO] Reconnected after ${attemptNumber} attempts`);
  });

  socket.on("reconnect_error", (error) => {
    // eslint-disable-next-line no-console
    console.error("[Socket.IO] Reconnection error:", error);
  });

  socket.on("reconnect_failed", () => {
    // eslint-disable-next-line no-console
    console.error("[Socket.IO] Reconnection failed - will keep trying");
  });
}
