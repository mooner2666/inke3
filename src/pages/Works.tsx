import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database.types'
import WorkCard from '@/components/WorkCard'
import TagPill from '@/components/TagPill'
import { Plus, Filter } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'
import Button from '@/components/Button'

type Work = Database['public']['Tables']['works']['Row'] & {
  profiles: { username: string; display_name: string | null } | null
  work_tags: Array<{ tags: { name: string } | null }>
}

type Tag = Database['public']['Tables']['tags']['Row']

export default function Works() {
  const { user } = useAuth()
  const [works, setWorks] = useState<Work[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTags()
    fetchWorks()
  }, [selectedTags])

  const fetchTags = async () => {
    const { data } = await supabase.from('tags').select('*').order('name')
    setTags(data || [])
  }

  const fetchWorks = async () => {
    setLoading(true)
    let query = supabase
      .from('works')
      .select('*, profiles(username, display_name), work_tags(tags(name))')
      .order('created_at', { ascending: false })

    if (selectedTags.length > 0) {
      // Filter by tags
      const { data: filteredWorks } = await query
      const filtered = filteredWorks?.filter(work =>
        selectedTags.every(selectedTag =>
          work.work_tags.some(wt => wt.tags?.name === selectedTag)
        )
      )
      setWorks((filtered as Work[]) || [])
    } else {
      const { data } = await query
      setWorks((data as Work[]) || [])
    }

    setLoading(false)
  }

  const toggleTag = (tagName: string) => {
    setSelectedTags(prev =>
      prev.includes(tagName) ? prev.filter(t => t !== tagName) : [...prev, tagName]
    )
  }

  return (
    <div className="min-h-screen bg-deep-black pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-cyber font-bold text-transparent bg-clip-text bg-gradient-to-r from-silver-main to-silver-medium mb-2">
              作品库
            </h1>
            <p className="text-gray-400 font-mono">探索社区创作者的优秀作品</p>
          </div>
          {user && (
            <Link to="/works/new">
              <Button variant="primary" className="flex items-center space-x-2 mt-4 md:mt-0">
                <Plus size={20} />
                <span>发布作品</span>
              </Button>
            </Link>
          )}
        </div>

        {/* Tag Filter */}
        <div className="mb-8 bg-surface-dark border-2 border-silver-main/30 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Filter size={20} className="text-silver-light" />
            <h3 className="text-xl font-cyber font-bold text-silver-light">按标签筛选</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {tags.map(tag => (
              <TagPill
                key={tag.id}
                tag={tag.name}
                selected={selectedTags.includes(tag.name)}
                onClick={() => toggleTag(tag.name)}
              />
            ))}
          </div>
          {selectedTags.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setSelectedTags([])}
                className="text-sm font-mono text-warning-red hover:text-silver-medium transition-colors duration-300"
              >
                清除筛选
              </button>
            </div>
          )}
        </div>

        {/* Works Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-80 bg-surface-dark border-2 border-silver-main/30 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : works.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-500 font-mono">暂无作品</p>
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
                authorDisplayName={work.profiles?.display_name}
                viewCount={work.view_count}
                tags={work.work_tags.map(wt => wt.tags?.name || '').filter(Boolean)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
