import { io, Socket } from "socket.io-client";

/**
 * Socket.IO client with auto-reconnection and exponential backoff
 */
export const socket: Socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: Infinity, // Keep trying to reconnect
  reconnectionDelay: 1000, // Start with 1 second
  reconnectionDelayMax: 5000, // Max 5 seconds between attempts
  randomizationFactor: 0.5, // Add some randomness to prevent thundering herd
});

// Log connection events for debugging
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




