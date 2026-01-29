import { useEffect, useState } from 'react'
import Hero from '@/components/Hero'
import WorkCard from '@/components/WorkCard'
import PostCard from '@/components/PostCard'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database.types'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

type Work = Database['public']['Tables']['works']['Row'] & {
  profiles: { username: string } | null
  work_tags: Array<{ tags: { name: string } | null }>
}

type Post = Database['public']['Tables']['forum_posts']['Row'] & {
  profiles: { username: string } | null
  comments: Array<{ id: string }>
}

export default function Home() {
  const [works, setWorks] = useState<Work[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch latest works
      const { data: worksData } = await supabase
        .from('works')
        .select('*, profiles(username), work_tags(tags(name))')
        .order('created_at', { ascending: false })
        .limit(6)

      // Fetch latest posts
      const { data: postsData } = await supabase
        .from('forum_posts')
        .select('*, profiles(username), comments(id)')
        .order('created_at', { ascending: false })
        .limit(6)

      setWorks((worksData as Work[]) || [])
      setPosts((postsData as Post[]) || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-deep-black">
      <Hero />

      {/* Latest Works Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl font-cyber font-bold text-transparent bg-clip-text bg-gradient-to-r from-silver-main to-silver-medium">
            最新作品
          </h2>
          <Link to="/works" className="flex items-center space-x-2 text-silver-light hover:text-silver-main transition-colors duration-300 font-cyber">
            <span>查看更多</span>
            <ArrowRight size={20} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 bg-surface-dark border-2 border-silver-main/30 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {works.map((work) => (
              <WorkCard
                key={work.id}
                id={work.id}
                title={work.title}
                description={work.description}
                coverUrl={work.cover_url}
                author={work.profiles?.username || 'Unknown'}
                viewCount={work.view_count}
                tags={work.work_tags.map(wt => wt.tags?.name || '').filter(Boolean)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Latest Posts Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl font-cyber font-bold text-transparent bg-clip-text bg-gradient-to-r from-silver-medium to-silver-light">
            最新讨论
          </h2>
          <Link to="/forum" className="flex items-center space-x-2 text-silver-light hover:text-silver-medium transition-colors duration-300 font-cyber">
            <span>查看更多</span>
            <ArrowRight size={20} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-surface-dark border-2 border-silver-medium/30 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-dark-purple via-grid-gray to-dark-purple border-2 border-silver-main rounded-lg p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(176,38,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(176,38,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px] opacity-30" />
          <div className="relative z-10">
            <h2 className="text-4xl font-cyber font-bold text-white mb-4">
              加入万维银客城
            </h2>
            <p className="text-xl text-gray-300 font-mono mb-8">
              开始分享你的创意作品，与赛博空间的创作者们连接
            </p>
            <Link to="/register">
              <button className="px-8 py-4 bg-transparent border-2 border-silver-light text-silver-light hover:bg-silver-light hover:text-deep-black transition-all duration-300 rounded-lg font-cyber text-lg hover:shadow-[0_0_30px_#E8E8E8]">
                立即注册
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
