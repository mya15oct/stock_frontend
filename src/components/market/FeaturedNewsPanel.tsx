"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FeaturedNews } from "@/types/market";
import { getNews } from "@/services/newsService";

// Mock data matching the screenshot
const MOCK_NEWS: FeaturedNews[] = [
  {
    id: "1",
    title: 'Dự án trạm dừng nghỉ trên cao tốc nguy cơ "trễ hẹn", Bộ Xây...',
    thumbnail: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400",
    source: "",
    publishedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    category: "economy",
  },
  {
    id: "2",
    title: "PVD: Một cổ phiếu dầu khí tăng bốc 40% lên đỉnh 1 năm, CTCK...",
    thumbnail: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400",
    source: "PVD",
    ticker: "PVD",
    change: 0.0,
    changePercent: 0.0,
    publishedAt: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
    category: "stock",
  },
  {
    id: "3",
    title: "Chỉ báo kỹ thuật độc vị dòng tiền giúp nhà đầu tư phát hiện cổ...",
    thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400",
    source: "VNINDEX",
    ticker: "VNINDEX",
    change: 1.16,
    changePercent: 1.16,
    publishedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    category: "market",
  },
  {
    id: "4",
    title: "VTR: Doanh nghiệp trên sàn chứng khoán do Thủy Tiên năm...",
    thumbnail: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400",
    source: "VTR",
    ticker: "VTR",
    change: 0.67,
    changePercent: 0.67,
    publishedAt: new Date(Date.now() - 11 * 60 * 1000).toISOString(),
    category: "stock",
  },
  {
    id: "5",
    title: "CTCK dự báo kế hoạch giải ngân của quỹ Vanguard sau khi thị trường...",
    thumbnail: "https://images.unsplash.com/photo-1582719471137-c3967ffb1c42?w=400",
    source: "HNXINDEX",
    ticker: "HNXINDEX",
    ticker2: "UPINDEX",
    change: 0.4,
    changePercent: 0.4,
    change2: 0.47,
    changePercent2: 0.47,
    publishedAt: new Date(Date.now() - 13 * 60 * 1000).toISOString(),
    category: "market",
    reactions: { likes: 1, dislikes: 2 },
  },
  {
    id: "6",
    title: "Thái Lan sẽ áp thuế 10% đối với hàng nhập khẩu giá rẻ",
    thumbnail: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=400",
    source: "",
    publishedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    category: "economy",
  },
  {
    id: "7",
    title: "Đường sắt Trung Quốc đạt số hành khách kỷ lục với gần 4 tỷ...",
    thumbnail: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400",
    source: "",
    publishedAt: new Date(Date.now() - 16 * 60 * 1000).toISOString(),
    category: "economy",
  },
];

/**
 * FeaturedNewsPanel - Hiển thị bài nổi bật
 *
 * Design theo FireAnt với:
 * - Tiêu đề "Bài nổi bật"
 * - Danh sách bài viết với thumbnail bên trái
 * - Tiêu đề và thời gian đăng
 */
export default function FeaturedNewsPanel() {
  const [news, setNews] = useState<FeaturedNews[]>(MOCK_NEWS);
  const [loading, setLoading] = useState(false);

  // Load initial news (disabled for now, using mock data)
  useEffect(() => {
    // const loadNews = async () => {
    //   setLoading(true);
    //   const data = await getNews(6);
    //   setNews(data);
    //   setLoading(false);
    // };
    // loadNews();
  }, []);

  // Auto-refresh news every 5 minutes (disabled for now)
  useEffect(() => {
    // const interval = setInterval(async () => {
    //   const data = await getNews(6);
    //   if (data.length > 0) {
    //     setNews(data);
    //   }
    // }, 300000); // 5 minutes
    // return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (isoString: string): string => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMinutes < 1) return "Vừa xong";
    if (diffMinutes < 60) return `${diffMinutes} phút`;
    if (diffHours < 24) return `Khoảng ${diffHours} tiếng`;
    return `${Math.floor(diffHours / 24)} ngày`;
  };

  const getCategoryColor = (category: FeaturedNews["category"]): string => {
    const colors = {
      market: "text-blue-500",
      economy: "text-green-500",
      stock: "text-purple-500",
      commodity: "text-yellow-500",
      crypto: "text-orange-500",
    };
    return colors[category];
  };

  return (
    <div className="bg-[#2a2d3a] rounded-lg shadow-lg h-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <h2 className="text-base font-semibold text-gray-100">Bài nổi bật</h2>
        <button className="text-gray-400 hover:text-gray-200 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* News List */}
      {loading && news.length === 0 ? (
        // Loading skeleton
        <div className="space-y-2 p-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex gap-2 animate-pulse">
              <div className="w-20 h-16 bg-gray-700 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-700 rounded w-full" />
                <div className="h-3 bg-gray-700 rounded w-3/4" />
                <div className="h-2 bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-2 py-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {news.map((article) => (
            <div
              key={article.id}
              className="group cursor-pointer hover:bg-gray-800/30 rounded p-2 transition-colors mb-2"
            >
              <div className="flex gap-2">
                {/* Thumbnail */}
                <div className="relative w-20 h-16 flex-shrink-0 rounded overflow-hidden bg-gray-800">
                  <Image
                    src={article.thumbnail}
                    alt={article.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  {/* Ticker info (if exists) */}
                  {article.ticker && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold ${
                        article.changePercent === 0 ? 'text-yellow-500' :
                        article.changePercent! > 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {article.ticker}
                      </span>
                      <span className={`text-xs font-medium ${
                        article.changePercent === 0 ? 'text-yellow-500' :
                        article.changePercent! > 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {article.changePercent! >= 0 ? '+' : ''}{article.changePercent?.toFixed(2)}%
                      </span>

                      {/* Second ticker if exists */}
                      {article.ticker2 && (
                        <>
                          <span className={`text-xs font-semibold ${
                            article.changePercent2! > 0 ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {article.ticker2}
                          </span>
                          <span className={`text-xs font-medium ${
                            article.changePercent2! > 0 ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {article.changePercent2! >= 0 ? '+' : ''}{article.changePercent2?.toFixed(2)}%
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="text-xs text-gray-200 font-normal line-clamp-2 group-hover:text-blue-400 transition-colors mb-1">
                    {article.title}
                  </h3>

                  {/* Meta info */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500">
                      {formatTimeAgo(article.publishedAt)}
                    </span>

                    {/* Reactions */}
                    {article.reactions && (
                      <div className="flex items-center gap-2 text-[10px] text-gray-500">
                        <span className="flex items-center gap-0.5">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                          </svg>
                          {article.reactions.likes}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 113 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                          </svg>
                          {article.reactions.dislikes}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
