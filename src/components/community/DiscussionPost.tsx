import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface Reply {
  id: number
  author: string
  content: string
  timestamp: string
  likes: number
  isLiked: boolean
}

interface DiscussionPost {
  id: number
  title: string
  author: string
  content: string
  timestamp: string
  replies: Reply[]
  views: number
  likes: number
  isLiked: boolean
  sentiment: 'bullish' | 'bearish' | 'neutral'
  tags: string[]
}

interface DiscussionPostProps {
  post: DiscussionPost
  onLike: (postId: number) => void
  onReply: (postId: number, content: string) => void
  onLikeReply: (postId: number, replyId: number) => void
}

export default function DiscussionPost({ post, onLike, onReply, onLikeReply }: DiscussionPostProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [showAllReplies, setShowAllReplies] = useState(false)

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return '📈'
      case 'bearish': return '📉'
      default: return '➖'
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-600 bg-green-100'
      case 'bearish': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (replyContent.trim()) {
      onReply(post.id, replyContent.trim())
      setReplyContent('')
      setShowReplyForm(false)
    }
  }

  const displayedReplies = showAllReplies ? post.replies : post.replies.slice(0, 3)

  return (
    <Card className="space-y-4">
      {/* Post Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900 mb-2">{post.title}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <span className="font-medium">{post.author}</span>
            <span>•</span>
            <span>{post.timestamp}</span>
            <span>•</span>
            <span>{post.views} views</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(post.sentiment)}`}>
            {getSentimentIcon(post.sentiment)} {post.sentiment}
          </span>
        </div>
      </div>

      {/* Post Content */}
      <div className="text-gray-700">
        {post.content}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {post.tags.map((tag, index) => (
          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
            #{tag}
          </span>
        ))}
      </div>

      {/* Post Actions */}
      <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
        <button
          onClick={() => onLike(post.id)}
          className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm transition-colors ${
            post.isLiked 
              ? 'bg-red-100 text-red-600' 
              : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          <svg className="w-4 h-4" fill={post.isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {post.likes}
        </button>
        <button
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="flex items-center gap-1 px-3 py-1 rounded-md text-sm hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Reply ({post.replies.length})
        </button>
      </div>

      {/* Reply Form */}
      {showReplyForm && (
        <form onSubmit={handleReplySubmit} className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Share your thoughts..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm">Post Reply</Button>
            <Button variant="outline" size="sm" type="button" onClick={() => setShowReplyForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Replies */}
      {post.replies.length > 0 && (
        <div className="space-y-3 pl-4 border-l-2 border-gray-100">
          <h4 className="font-medium text-gray-700">
            {post.replies.length} {post.replies.length === 1 ? 'Reply' : 'Replies'}
          </h4>
          {displayedReplies.map((reply) => (
            <div key={reply.id} className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">{reply.author}</span>
                  <span>•</span>
                  <span>{reply.timestamp}</span>
                </div>
                <button
                  onClick={() => onLikeReply(post.id, reply.id)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                    reply.isLiked 
                      ? 'bg-red-100 text-red-600' 
                      : 'hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  <svg className="w-3 h-3" fill={reply.isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {reply.likes}
                </button>
              </div>
              <p className="text-gray-700 text-sm">{reply.content}</p>
            </div>
          ))}
          {post.replies.length > 3 && !showAllReplies && (
            <button
              onClick={() => setShowAllReplies(true)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Show {post.replies.length - 3} more replies
            </button>
          )}
        </div>
      )}
    </Card>
  )
}
