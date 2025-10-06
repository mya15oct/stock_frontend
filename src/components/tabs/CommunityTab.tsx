'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import NewPostForm from '@/components/community/NewPostForm'
import DiscussionPost from '@/components/community/DiscussionPost'

interface Reply {
  id: number
  author: string
  content: string
  timestamp: string
  likes: number
  isLiked: boolean
}

interface DiscussionPostType {
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

interface CommunityTabProps {
  ticker: string
}

export default function CommunityTab({ ticker }: CommunityTabProps) {
  const [showNewPostForm, setShowNewPostForm] = useState(false)
  const [posts, setPosts] = useState<DiscussionPostType[]>([
    {
      id: 1,
      title: `Is ${ticker} a good long-term investment after recent earnings?`,
      author: "InvestorPro2024",
      content: "Just finished analyzing the latest earnings report and I'm impressed by the revenue growth and margin expansion. The company seems to be executing well on their strategic initiatives. However, the current valuation gives me some pause. What are your thoughts on the risk/reward at these levels?",
      timestamp: "2 hours ago",
      replies: [
        {
          id: 1,
          author: "ValueHunter",
          content: "I agree on the fundamentals, but I think the market is getting ahead of itself. P/E of 28+ seems rich for the growth rate.",
          timestamp: "1 hour ago",
          likes: 3,
          isLiked: false
        },
        {
          id: 2,
          author: "TechBull",
          content: "The moat is getting stronger each quarter. I'm willing to pay a premium for quality growth.",
          timestamp: "45 minutes ago",
          likes: 7,
          isLiked: true
        }
      ],
      views: 1250,
      likes: 15,
      isLiked: false,
      sentiment: "bullish",
      tags: ["earnings", "long-term", "analysis", "valuation"]
    },
    {
      id: 2,
      title: `Technical Analysis: ${ticker} showing strong resistance at current levels`,
      author: "ChartMaster",
      content: "Looking at the daily chart, we're seeing clear resistance around the $190 level with declining volume on the recent push higher. RSI is approaching overbought territory. I'm watching for a potential pullback to the 50-day MA around $175 for a better entry point.",
      timestamp: "4 hours ago",
      replies: [
        {
          id: 3,
          author: "SwingTrader",
          content: "Good analysis! I'm seeing the same pattern. Also noticed the MACD starting to diverge.",
          timestamp: "3 hours ago",
          likes: 2,
          isLiked: false
        }
      ],
      views: 890,
      likes: 8,
      isLiked: false,
      sentiment: "neutral",
      tags: ["technical-analysis", "resistance", "trading", "charts"]
    },
    {
      id: 3,
      title: `Why I'm bearish on ${ticker} despite strong fundamentals`,
      author: "ContrianView",
      content: "While the company is executing well operationally, I believe the market is underestimating several headwinds: 1) Increasing competition in core markets, 2) Regulatory pressures building, 3) Economic slowdown impact on enterprise spending. The current multiple assumes perfection.",
      timestamp: "6 hours ago",
      replies: [
        {
          id: 4,
          author: "BullMarket",
          content: "These concerns seem overblown to me. The company has navigated similar challenges before.",
          timestamp: "5 hours ago",
          likes: 1,
          isLiked: false
        },
        {
          id: 5,
          author: "RiskManager",
          content: "Valid points. Always good to consider the bear case even in strong markets.",
          timestamp: "4 hours ago",
          likes: 4,
          isLiked: true
        }
      ],
      views: 2100,
      likes: 12,
      isLiked: false,
      sentiment: "bearish",
      tags: ["bearish", "fundamentals", "risk-analysis", "headwinds"]
    }
  ])

  const handleNewPost = (postData: { title: string; content: string; tags: string[] }) => {
    const newPost: DiscussionPostType = {
      id: Date.now(),
      title: postData.title,
      author: "CurrentUser",
      content: postData.content,
      timestamp: "Just now",
      replies: [],
      views: 1,
      likes: 0,
      isLiked: false,
      sentiment: "neutral",
      tags: postData.tags
    }
    setPosts([newPost, ...posts])
    setShowNewPostForm(false)
  }

  const handleLike = (postId: number) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? {
            ...post,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            isLiked: !post.isLiked
          }
        : post
    ))
  }

  const handleReply = (postId: number, content: string) => {
    const newReply: Reply = {
      id: Date.now(),
      author: "CurrentUser",
      content,
      timestamp: "Just now",
      likes: 0,
      isLiked: false
    }

    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, replies: [...post.replies, newReply] }
        : post
    ))
  }

  const handleLikeReply = (postId: number, replyId: number) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? {
            ...post,
            replies: post.replies.map(reply =>
              reply.id === replyId
                ? {
                    ...reply,
                    likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                    isLiked: !reply.isLiked
                  }
                : reply
            )
          }
        : post
    ))
  }

  const totalPosts = posts.length
  const totalReplies = posts.reduce((sum, post) => sum + post.replies.length, 0)
  const bullishSentiment = posts.filter(p => p.sentiment === 'bullish').length
  const bearishSentiment = posts.filter(p => p.sentiment === 'bearish').length
  const neutralSentiment = posts.filter(p => p.sentiment === 'neutral').length

  return (
    <div className="space-y-6">
      {/* Community Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Community Discussions</h3>
          <p className="text-gray-600">Share insights and discuss {ticker} with other investors</p>
        </div>
        <Button onClick={() => setShowNewPostForm(!showNewPostForm)}>
          {showNewPostForm ? 'Cancel' : 'Start Discussion'}
        </Button>
      </div>

      {/* New Post Form */}
      {showNewPostForm && (
        <NewPostForm
          ticker={ticker}
          onSubmit={handleNewPost}
          onCancel={() => setShowNewPostForm(false)}
        />
      )}

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">{totalPosts}</div>
          <div className="text-sm text-gray-600">Total Discussions</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-purple-600">{totalReplies}</div>
          <div className="text-sm text-gray-600">Total Replies</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">{bullishSentiment}</div>
          <div className="text-sm text-gray-600">Bullish Posts</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-red-600">{bearishSentiment}</div>
          <div className="text-sm text-gray-600">Bearish Posts</div>
        </Card>
      </div>

      {/* Discussion Posts */}
      <div className="space-y-4">
        {posts.map((post) => (
          <DiscussionPost
            key={post.id}
            post={post}
            onLike={handleLike}
            onReply={handleReply}
            onLikeReply={handleLikeReply}
          />
        ))}
      </div>

      {/* Community Sentiment Summary */}
      <Card>
        <h4 className="text-lg font-semibold mb-4">Community Sentiment on {ticker}</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 flex items-center gap-2">
              <span>📈</span> Bullish
            </span>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${(bullishSentiment / totalPosts) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-semibold w-12 text-right">
                {Math.round((bullishSentiment / totalPosts) * 100)}%
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 flex items-center gap-2">
              <span>➖</span> Neutral
            </span>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gray-500 h-2 rounded-full"
                  style={{ width: `${(neutralSentiment / totalPosts) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-semibold w-12 text-right">
                {Math.round((neutralSentiment / totalPosts) * 100)}%
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 flex items-center gap-2">
              <span>📉</span> Bearish
            </span>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: `${(bearishSentiment / totalPosts) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-semibold w-12 text-right">
                {Math.round((bearishSentiment / totalPosts) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
