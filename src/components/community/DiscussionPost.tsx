import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Reply, DiscussionPost } from "@/types";

interface DiscussionPostProps {
  post: DiscussionPost;
  onLike: (postId: number) => void;
  onReply: (postId: number, content: string) => void;
  onLikeReply: (postId: number, replyId: number) => void;
}

export default function DiscussionPost({
  post,
  onLike,
  onReply,
  onLikeReply,
}: DiscussionPostProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [showAllReplies, setShowAllReplies] = useState(false);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "bullish":
        return "📈";
      case "bearish":
        return "📉";
      default:
        return "➖";
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "bullish":
        return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30";
      case "bearish":
        return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30";
      default:
        return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800";
    }
  };

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyContent.trim()) {
      onReply(post.id, replyContent);
      setReplyContent("");
      setShowReplyForm(false);
    }
  };

  const displayedReplies = showAllReplies
    ? post.replies
    : post.replies.slice(0, 2);

  return (
    <Card className="hover:shadow-md transition-shadow dark:hover:shadow-gray-800">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
            {post.author.charAt(0)}
          </div>
        </div>

        <div className="flex-grow">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {post.author}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{post.timestamp}</span>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {post.title}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-3">{post.content}</p>

          <div className="flex items-center gap-2 mb-3">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded text-xs border border-transparent dark:border-gray-700"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4 pt-3 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={() => onLike(post.id)}
              className={`flex items-center gap-1 text-sm transition-colors ${post.isLiked
                ? "text-blue-600 dark:text-blue-400 font-medium"
                : "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
            >
              <svg
                className="w-5 h-5"
                fill={post.isLiked ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                />
              </svg>
              {post.likes}
            </button>
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              {post.replies.length} replies
            </button>
          </div>

          {showReplyForm && (
            <form onSubmit={handleSubmitReply} className="mt-4">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your reply..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
                rows={3}
              />
              <div className="flex gap-2 mt-2">
                <Button type="submit" size="sm">
                  Post Reply
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReplyForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {post.replies.length > 0 && (
            <div className="mt-4 space-y-3">
              {displayedReplies.map((reply) => (
                <div
                  key={reply.id}
                  className="flex items-start gap-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700"
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      {reply.author.charAt(0)}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-gray-900 dark:text-white">
                        {reply.author}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {reply.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {reply.content}
                    </p>
                    <button
                      onClick={() => onLikeReply(post.id, reply.id)}
                      className={`flex items-center gap-1 text-xs transition-colors ${reply.isLiked
                        ? "text-blue-600 dark:text-blue-400 font-medium"
                        : "text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                        }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill={reply.isLiked ? "currentColor" : "none"}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                        />
                      </svg>
                      {reply.likes}
                    </button>
                  </div>
                </div>
              ))}
              {post.replies.length > 2 && (
                <button
                  onClick={() => setShowAllReplies(!showAllReplies)}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  {showAllReplies
                    ? "Show less"
                    : `View ${post.replies.length - 2} more replies`}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
