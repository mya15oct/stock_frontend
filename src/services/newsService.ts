/**
 * News Service
 *
 * Service layer để fetch featured news từ API
 * TODO: Integrate WebSocket cho real-time news updates
 */

import { FeaturedNews } from "@/types/market";
import { apiRequest } from "./apiClient";

/**
 * Get featured news articles
 *
 * @param limit - Number of articles to fetch (default: 6)
 * @returns Array of news articles
 */
export async function getNews(limit: number = 6): Promise<FeaturedNews[]> {
  try {
    const endpoint = `/api/market/news?limit=${limit}`;
    const data = await apiRequest<FeaturedNews[]>(endpoint);
    return data;
  } catch (error) {
    console.error("Failed to fetch news:", error);
    // Fallback to empty array on error
    return [];
  }
}

// ==========================================
// WEBSOCKET CONNECTION (Future Implementation)
// ==========================================

/**
 * WebSocket connection for real-time news updates
 *
 * TODO: Uncomment khi WebSocket backend ready
 *
 * Usage:
 * ```ts
 * const ws = new NewsWebSocket();
 * ws.onNews((article) => {
 *   // Handle new news article
 *   console.log('New article:', article);
 * });
 * ws.connect();
 * ```
 */

// export class NewsWebSocket {
//   private ws: WebSocket | null = null;
//   private listeners: ((article: FeaturedNews) => void)[] = [];
//   private reconnectAttempts = 0;
//   private maxReconnectAttempts = 5;
//
//   connect() {
//     const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
//     this.ws = new WebSocket(`${wsUrl}/ws/market/news`);
//
//     this.ws.onopen = () => {
//       console.log("News WebSocket connected");
//       this.reconnectAttempts = 0;
//     };
//
//     this.ws.onmessage = (event) => {
//       try {
//         const article: FeaturedNews = JSON.parse(event.data);
//         this.listeners.forEach((listener) => listener(article));
//       } catch (error) {
//         console.error("Failed to parse news message:", error);
//       }
//     };
//
//     this.ws.onerror = (error) => {
//       console.error("News WebSocket error:", error);
//     };
//
//     this.ws.onclose = () => {
//       console.log("News WebSocket disconnected");
//       this.attemptReconnect();
//     };
//   }
//
//   disconnect() {
//     if (this.ws) {
//       this.ws.close();
//       this.ws = null;
//     }
//   }
//
//   onNews(listener: (article: FeaturedNews) => void) {
//     this.listeners.push(listener);
//     return () => {
//       this.listeners = this.listeners.filter((l) => l !== listener);
//     };
//   }
//
//   private attemptReconnect() {
//     if (this.reconnectAttempts < this.maxReconnectAttempts) {
//       this.reconnectAttempts++;
//       const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
//       console.log(`Reconnecting news WebSocket in ${delay}ms...`);
//       setTimeout(() => this.connect(), delay);
//     }
//   }
// }
