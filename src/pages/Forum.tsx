import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database.types'
import PostCard from '@/components/PostCard'
import { Plus, MessageSquare } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'
import Button from '@/components/Button'

type Post = Database['public']['Tables']['forum_posts']['Row'] & {
  profiles: { username: string } | null
  comments: Array<{ id: string }>
}

export default function Forum() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [category, setCategory] = useState<'all' | 'chat' | 'general'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [category])

  const fetchPosts = async () => {
    setLoading(true)
    let query = supabase
      .from('forum_posts')
      .select('*, profiles(username), comments(id)')
      .order('created_at', { ascending: false })

    if (category !== 'all') {
      query = query.eq('category', category)
    }

    const { data } = await query
    setPosts((data as Post[]) || [])
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-deep-black pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-cyber font-bold text-transparent bg-clip-text bg-gradient-to-r from-silver-medium to-silver-light mb-2">
              闲聊版面
            </h1>
            <p className="text-gray-400 font-mono">与社区成员自由交流讨论</p>
          </div>
          {user && (
            <Link to="/forum/new">
              <Button variant="secondary" className="flex items-center space-x-2 mt-4 md:mt-0">
                <Plus size={20} />
                <span>发新帖</span>
              </Button>
            </Link>
          )}
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex gap-4">
          <button
            onClick={() => setCategory('all')}
            className={`px-6 py-3 font-cyber rounded-lg border-2 transition-all duration-300 ${
              category === 'all'
                ? 'bg-silver-medium border-silver-medium text-white shadow-[0_0_20px_#A8A8A8]'
                : 'bg-transparent border-silver-medium/50 text-silver-medium hover:border-silver-medium'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setCategory('chat')}
            className={`px-6 py-3 font-cyber rounded-lg border-2 transition-all duration-300 ${
              category === 'chat'
                ? 'bg-silver-medium border-silver-medium text-white shadow-[0_0_20px_#A8A8A8]'
                : 'bg-transparent border-silver-medium/50 text-silver-medium hover:border-silver-medium'
            }`}
          >
            <MessageSquare size={18} className="inline mr-2" />
            闲聊
          </button>
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-surface-dark border-2 border-silver-medium/30 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-500 font-mono">暂无帖子</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                title={post.title}
                content={post.content}
                author={post.profiles?.username || 'Unknown'}
                createdAt={post.created_at || ''}
                commentCount={post.comments.length}
                category={post.category}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
