import { Link } from 'react-router-dom'
import { Eye, User } from 'lucide-react'

interface WorkCardProps {
  id: string
  title: string
  description: string | null
  coverUrl: string | null
  author: string
  authorDisplayName?: string | null // 这里就是我们要显示的昵称
  viewCount: number | null
  tags: string[]
  category?: 'original' | 'fanfiction' | string | null
}

export default function WorkCard({ 
  id, 
  title, 
  description, 
  coverUrl, 
  author, 
  authorDisplayName, 
  viewCount, 
  tags,
  category = 'original'
}: WorkCardProps) {
  // 核心逻辑：如果 authorDisplayName 存在且不等于 ID，就用昵称
  const displayName = authorDisplayName || author;
  const isFanfiction = category === 'fanfiction';

  return (
    <Link to={`/works/${id}`}>
      <div className="group relative bg-surface-dark border-2 border-silver-main/30 rounded-lg overflow-hidden hover:border-silver-main hover:shadow-[0_0_30px_rgba(192,192,192,0.5)] transition-all duration-300">
        
        {/* Cover Image - 固定 3:4 竖向比例 */}
        <div className="relative bg-grid-gray overflow-hidden w-full aspect-[3/4]">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover rounded-t-lg group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-charcoal-dark to-grid-gray rounded-t-lg">
              <span className="text-6xl font-cyber text-silver-main/30">W</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-surface-dark/60 via-transparent to-transparent opacity-40 rounded-t-lg pointer-events-none" />
        </div>

        {/* 封面下方简介 - 单行截断 */}
        {description && (
          <p className="text-sm text-gray-400 line-clamp-1 px-3 mt-2 font-mono">
            {description}
          </p>
        )}

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start gap-2 mb-2">
            <span
              className={`shrink-0 px-2 py-0.5 text-[10px] font-cyber font-medium border rounded ${
                isFanfiction
                  ? 'bg-pink-600/80 border-pink-500 text-white'
                  : 'bg-silver-main/20 border-silver-main text-silver-light'
              }`}
            >
              {isFanfiction ? '★ 同人' : '✦ 原创'}
            </span>
            <h3 className="text-white font-semibold text-sm leading-snug min-w-0">
              {title}
            </h3>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3 h-7 overflow-hidden">
            {tags.length > 0 ? (
              tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 text-[10px] font-mono bg-silver-main/10 border border-silver-main/50 text-silver-light rounded"
                >
                  #{tag}
                </span>
              ))
            ) : (
              <span className="text-transparent text-[10px]">placeholder</span>
            )}
          </div>

          {/* Footer - 彻底解决昵称显示问题 */}
          <div className="flex items-center justify-between text-sm text-gray-500 font-mono pt-3 border-t border-white/5">
            <div className="flex items-center space-x-2">
              <User size={14} className="text-silver-light" />
              <span className="truncate max-w-[120px]">
                {/* 这里现在会优先渲染 MOONER2666 */}
                {displayName}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Eye size={14} className="text-silver-medium" />
              <span>{viewCount || 0}</span>
            </div>
          </div>
        </div>

        {/* Glitch effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-silver-main/0 via-silver-main/10 to-silver-main/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
      </div>
    </Link>
  )
}