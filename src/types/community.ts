// Community/Discussion type definitions

export interface Reply {
  id: number;
  author: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
}

export interface DiscussionPost {
  id: number;
  title: string;
  author: string;
  content: string;
  timestamp: string;
  replies: Reply[];
  views: number;
  likes: number;
  isLiked: boolean;
  sentiment: "bullish" | "bearish" | "neutral";
  tags: string[];
}
