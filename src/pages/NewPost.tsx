import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthContext'
import Button from '@/components/Button'

export default function NewPost() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<'chat' | 'general'>('chat')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setError('')
    setLoading(true)

    try {
      const { data, error: postError } = await supabase
        .from('forum_posts')
        .insert({
          user_id: user.id,
          title,
          content,
          category,
        })
        .select()
        .single()

      if (postError) throw postError

      navigate(`/forum/${data.id}`)
    } catch (err: any) {
      setError(err.message || '发帖失败')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    navigate('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-deep-black pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-5xl font-cyber font-bold text-transparent bg-clip-text bg-gradient-to-r from-silver-medium to-silver-light mb-8">
          发表新帖
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-warning-red/10 border border-warning-red rounded text-warning-red font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-mono text-silver-light mb-2">
              分类 *
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setCategory('chat')}
                className={`px-6 py-3 font-cyber rounded-lg border-2 transition-all duration-300 ${
                  category === 'chat'
                    ? 'bg-silver-medium border-silver-medium text-white shadow-[0_0_20px_#A8A8A8]'
                    : 'bg-transparent border-silver-medium/50 text-silver-medium hover:border-silver-medium'
                }`}
              >
                闲聊
              </button>
              <button
                type="button"
                onClick={() => setCategory('general')}
                className={`px-6 py-3 font-cyber rounded-lg border-2 transition-all duration-300 ${
                  category === 'general'
                    ? 'bg-silver-light border-silver-light text-deep-black shadow-[0_0_20px_#E8E8E8]'
                    : 'bg-transparent border-silver-light/50 text-silver-light hover:border-silver-light'
                }`}
              >
                通用
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-mono text-silver-light mb-2">
              标题 *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-deep-black border-2 border-silver-medium/50 focus:border-silver-medium rounded px-4 py-3 text-white font-mono outline-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(255,46,151,0.5)]"
              placeholder="输入帖子标题"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-mono text-silver-light mb-2">
              内容 *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={15}
              className="w-full bg-deep-black border-2 border-silver-medium/50 focus:border-silver-medium rounded px-4 py-3 text-white font-mono outline-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(255,46,151,0.5)] resize-none"
              placeholder="输入帖子内容..."
            />
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <Button type="submit" variant="secondary" size="lg" disabled={loading} className="flex-1">
              {loading ? '发布中...' : '发布帖子'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => navigate('/forum')}
            >
              取消
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
