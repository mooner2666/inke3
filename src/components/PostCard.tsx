import { Link } from 'react-router-dom'
import { MessageCircle, User, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface PostCardProps {
  id: string
  title: string
  content: string
  author: string
  createdAt: string
  commentCount?: number
  category: string
}

export default function PostCard({ id, title, content, author, createdAt, commentCount = 0, category }: PostCardProps) {
  const getCategoryColor = (cat: string) => {
    return cat === 'chat' ? 'silver-medium' : 'silver-light'
  }

  const color = getCategoryColor(category)

  return (
    <Link to={`/forum/${id}`}>
      <div className={`group bg-surface-dark border-2 border-${color}/30 rounded-lg p-4 hover:border-${color} hover:shadow-[0_0_20px_rgba(255,46,151,0.3)] transition-all duration-300`}>
        {/* Category Badge */}
        <div className="mb-3">
          <span className={`px-3 py-1 text-xs font-mono bg-${color}/10 border border-${color} text-${color} rounded-full uppercase`}>
            {category === 'chat' ? '闲聊' : '通用'}
          </span>
        </div>

        {/* Title */}
        <h3 className={`text-xl font-cyber font-bold text-white mb-2 line-clamp-2 group-hover:text-${color} transition-colors duration-300`}>
          {title}
        </h3>

        {/* Content Preview */}
        <p className="text-sm text-gray-400 mb-4 line-clamp-3 font-mono">
          {content}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-gray-500 font-mono">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User size={14} className="text-silver-light" />
              <span>{author}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock size={14} className="text-silver-main" />
              <span>
                {formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: zhCN })}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <MessageCircle size={14} className={`text-${color}`} />
            <span>{commentCount}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
