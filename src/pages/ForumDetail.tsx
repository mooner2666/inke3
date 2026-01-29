import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database.types'
import { User, Calendar, MessageCircle, ArrowLeft, Send } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useAuth } from '@/lib/AuthContext'
import Button from '@/components/Button'

type Post = Database['public']['Tables']['forum_posts']['Row'] & {
  profiles: { username: string; display_name: string | null } | null
}

type Comment = Database['public']['Tables']['comments']['Row'] & {
  profiles: { username: string; display_name: string | null } | null
}

export default function ForumDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentContent, setCommentContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (id) {
      fetchPost()
      fetchComments()
    }
  }, [id])

  const fetchPost = async () => {
    const { data } = await supabase
      .from('forum_posts')
      .select('*, profiles(username, display_name)')
      .eq('id', id!)
      .single()

    setPost(data as Post)
    setLoading(false)
  }

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(username, display_name)')
      .eq('post_id', id!)
      .order('created_at', { ascending: true })

    setComments((data as Comment[]) || [])
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !commentContent.trim()) return

    setSubmitting(true)

    try {
      await supabase.from('comments').insert({
        post_id: id!,
        user_id: user.id,
        content: commentContent,
      })

      setCommentContent('')
      fetchComments()
    } catch (err) {
      console.error('Error submitting comment:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('确定要删除这个帖子吗？')) return

    await supabase.from('forum_posts').delete().eq('id', id!)
    navigate('/forum')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-black pt-24 flex items-center justify-center">
        <div className="text-2xl text-silver-medium font-cyber animate-pulse">加载中...</div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-deep-black pt-24 flex items-center justify-center">
        <div className="text-2xl text-gray-500 font-mono">帖子不存在</div>
      </div>
    )
  }

  const isOwner = user?.id === post.user_id

  return (
    <div className="min-h-screen bg-deep-black pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => navigate('/forum')}
          className="flex items-center space-x-2 text-silver-light hover:text-silver-medium transition-colors duration-300 mb-6 font-mono"
        >
          <ArrowLeft size={20} />
          <span>返回版面</span>
        </button>

        {/* Post Content */}
        <div className="bg-surface-dark border-2 border-silver-medium/50 rounded-lg p-8 mb-8">
          {/* Category Badge */}
          <div className="mb-4">
            <span className="px-3 py-1 text-xs font-mono bg-silver-medium/10 border border-silver-medium text-silver-medium rounded-full uppercase">
              {post.category === 'chat' ? '闲聊' : '通用'}
            </span>
          </div>

          <h1 className="text-4xl font-cyber font-bold text-white mb-6">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-gray-400 font-mono text-sm mb-6 pb-6 border-b border-silver-medium/30">
            <div className="flex items-center space-x-2">
              <User size={16} className="text-silver-light" />
              <span>{post.profiles?.display_name || post.profiles?.username}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar size={16} className="text-silver-medium" />
              <span>
                {post.created_at && formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: zhCN })}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <MessageCircle size={16} className="text-silver-main" />
              <span>{comments.length} 条评论</span>
            </div>
          </div>

          <div className="text-white font-mono leading-relaxed whitespace-pre-wrap mb-6">
            {post.content}
          </div>

          {isOwner && (
            <Button variant="destructive" onClick={handleDelete} size="sm">
              删除帖子
            </Button>
          )}
        </div>

        {/* Comments Section */}
        <div className="bg-surface-dark border-2 border-silver-light/50 rounded-lg p-8">
          <h2 className="text-2xl font-cyber font-bold text-silver-light mb-6 flex items-center space-x-2">
            <MessageCircle size={24} />
            <span>评论 ({comments.length})</span>
          </h2>

          {/* Comment Form */}
          {user ? (
            <form onSubmit={handleSubmitComment} className="mb-8">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                rows={4}
                required
                className="w-full bg-deep-black border-2 border-silver-light/50 focus:border-silver-light rounded px-4 py-3 text-white font-mono outline-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(0,240,255,0.5)] resize-none mb-4"
                placeholder="写下你的评论..."
              />
              <Button type="submit" variant="accent" disabled={submitting} className="flex items-center space-x-2">
                <Send size={18} />
                <span>{submitting ? '发送中...' : '发表评论'}</span>
              </Button>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-grid-gray border border-silver-light/30 rounded text-center">
              <p className="text-gray-400 font-mono">
                请先{' '}
                <a href="/login" className="text-silver-light hover:text-silver-main transition-colors duration-300">
                  登录
                </a>{' '}
                后再评论
              </p>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-grid-gray border border-silver-light/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2 text-sm font-mono text-gray-400">
                    <User size={14} className="text-silver-light" />
                    <span className="text-white">{comment.profiles?.display_name || comment.profiles?.username}</span>
                    <span>·</span>
                    <span>
                      {comment.created_at && formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: zhCN })}
                    </span>
                  </div>
                </div>
                <p className="text-white font-mono leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
