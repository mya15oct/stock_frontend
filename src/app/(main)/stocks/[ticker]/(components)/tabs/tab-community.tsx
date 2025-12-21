"use client";

import { useState } from "react";
import DiscussionPost from "@/components/community/DiscussionPost";
import NewPostForm from "@/components/community/NewPostForm";
import { Button } from "@/components/ui/Button";
import type { DiscussionPost as DiscussionPostType } from "@/types";

interface CommunityTabProps {
  ticker: string;
}

export default function CommunityTab({ ticker }: CommunityTabProps) {
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [posts, setPosts] = useState<DiscussionPostType[]>([
    {
      id: 1,
      title: `Strong earnings growth for ${ticker}`,
      author: "MarketGuru",
      content: `Looking at the latest financial data, ${ticker} is showing impressive revenue growth. The company has been consistently beating earnings expectations.`,
      timestamp: "2 hours ago",
      replies: [
        {
          id: 1,
          author: "ValueInvestor",
          content: "Great analysis! I agree, the fundamentals are solid.",
          timestamp: "1 hour ago",
          likes: 5,
          isLiked: false,
        },
        {
          id: 2,
          author: "TradingPro",
          content: "But what about the current market conditions? Still risky.",
          timestamp: "45 mins ago",
          likes: 2,
          isLiked: false,
        },
      ],
      views: 245,
      likes: 23,
      isLiked: false,
      sentiment: "bullish",
      tags: ["earnings", "analysis", "long-term"],
    },
    {
      id: 2,
      title: "Concerns about valuation",
      author: "CautiousTrader",
      content: `While ${ticker} has been performing well, I'm worried about the current P/E ratio. It seems overvalued compared to industry peers.`,
      timestamp: "5 hours ago",
      replies: [
        {
          id: 3,
          author: "GrowthFan",
          content:
            "Growth stocks often trade at premium valuations. You need to look at the bigger picture.",
          timestamp: "4 hours ago",
          likes: 8,
          isLiked: true,
        },
      ],
      views: 189,
      likes: 15,
      isLiked: false,
      sentiment: "bearish",
      tags: ["valuation", "risk", "analysis"],
    },
    {
      id: 3,
      title: "Upcoming dividend announcement",
      author: "DividendSeeker",
      content:
        "Anyone have insights on the upcoming dividend? Based on past trends, I'm expecting a modest increase.",
      timestamp: "1 day ago",
      replies: [],
      views: 156,
      likes: 12,
      isLiked: true,
      sentiment: "neutral",
      tags: ["dividends", "income"],
    },
  ]);

  const handleLikePost = (postId: number) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
            ...post,
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          }
          : post
      )
    );
  };

  const handleReply = (postId: number, content: string) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          const newReply = {
            id: post.replies.length + 1,
            author: "You",
            content,
            timestamp: "Just now",
            likes: 0,
            isLiked: false,
          };
          return { ...post, replies: [...post.replies, newReply] };
        }
        return post;
      })
    );
  };

  const handleLikeReply = (postId: number, replyId: number) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            replies: post.replies.map((reply) =>
              reply.id === replyId
                ? {
                  ...reply,
                  isLiked: !reply.isLiked,
                  likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                }
                : reply
            ),
          };
        }
        return post;
      })
    );
  };

  const handleNewPost = (postData: {
    title: string;
    content: string;
    tags: string[];
  }) => {
    const newPost: DiscussionPostType = {
      id: posts.length + 1,
      title: postData.title,
      author: "You",
      content: postData.content,
      timestamp: "Just now",
      replies: [],
      views: 1,
      likes: 0,
      isLiked: false,
      sentiment: "neutral",
      tags: postData.tags,
    };
    setPosts([newPost, ...posts]);
    setShowNewPostForm(false);
  };

  return (
    <div className="space-y-6 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Community Discussion
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Share insights and discuss {ticker} with other investors
          </p>
        </div>
        {!showNewPostForm && (
          <Button onClick={() => setShowNewPostForm(true)}>
            New Discussion
          </Button>
        )}
      </div>

      {showNewPostForm && (
        <NewPostForm
          ticker={ticker}
          onSubmit={handleNewPost}
          onCancel={() => setShowNewPostForm(false)}
        />
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <DiscussionPost
            key={post.id}
            post={post}
            onLike={handleLikePost}
            onReply={handleReply}
            onLikeReply={handleLikeReply}
          />
        ))}
      </div>

      {posts.length === 0 && !showNewPostForm && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            No discussions yet. Be the first to start one!
          </p>
          <Button onClick={() => setShowNewPostForm(true)}>
            Start Discussion
          </Button>
        </div>
      )}
    </div>
  );
}
