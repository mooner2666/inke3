import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database.types'
import WorkCard from '@/components/WorkCard'
import PostCard from '@/components/PostCard'
import TagPill from '@/components/TagPill'
import { Search as SearchIcon, User, FileText, Tag } from 'lucide-react'
import Button from '@/components/Button'

type Work = Database['public']['Tables']['works']['Row'] & {
  profiles: { username: string; display_name: string | null } | null
  work_tags: Array<{ tags: { name: string } | null }>
}

type Post = Database['public']['Tables']['forum_posts']['Row'] & {
  profiles: { username: string; display_name: string | null } | null
  comments: Array<{ id: string }>
}

type SearchType = 'all' | 'works' | 'posts' | 'authors' | 'tags'

export default function Search() {
  const [query, setQuery] = useState('')
  const [searchType, setSearchType] = useState<SearchType>('all')
  const [works, setWorks] = useState<Work[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [authors, setAuthors] = useState<{ id: string; username: string; display_name: string | null }[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setHasSearched(true)

    try {
      // Search works
      if (searchType === 'all' || searchType === 'works') {
        const { data: worksData } = await supabase
          .from('works')
          .select('*, profiles(username, display_name), work_tags(tags(name))')
          .or(`title.ilike.%${query}%,description.ilike.%${query}%,content.ilike.%${query}%`)
          .order('created_at', { ascending: false })

        setWorks((worksData as Work[]) || [])
      }

      // Search posts
      if (searchType === 'all' || searchType === 'posts') {
        const { data: postsData } = await supabase
          .from('forum_posts')
          .select('*, profiles(username, display_name), comments(id)')
          .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
          .order('created_at', { ascending: false })

        setPosts((postsData as Post[]) || [])
      }

      // Search tags
      if (searchType === 'all' || searchType === 'tags') {
        const { data: tagsData } = await supabase
          .from('tags')
          .select('name')
          .ilike('name', `%${query}%`)

        setTags(tagsData?.map(t => t.name) || [])
      }

      // Search authors
      if (searchType === 'all' || searchType === 'authors') {
        const { data: authorsData } = await supabase
          .from('profiles')
          .select('id, username, display_name')
          .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)

        setAuthors(authorsData || [])
      }
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  const totalResults = works.length + posts.length + tags.length + authors.length

  return (
    <div className="min-h-screen bg-deep-black pt-24 pb-12">
      <div className="container mx-auto px-4">
        <h1 className="text-5xl font-cyber font-bold text-transparent bg-clip-text bg-gradient-to-r from-silver-light to-silver-main mb-8">
          搜索
        </h1>

        {/* Search Form */}
        <div className="bg-surface-dark border-2 border-silver-light/50 rounded-lg p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Search Input */}
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-silver-light" size={24} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-deep-black border-2 border-silver-light/50 focus:border-silver-light rounded-lg pl-14 pr-4 py-4 text-white font-mono text-lg outline-none transition-all duration-300 focus:shadow-[0_0_20px_rgba(0,240,255,0.5)]"
                placeholder="搜索作品、帖子、作者、标签..."
              />
            </div>

            {/* Search Type Filters */}
            <div className="flex flex-wrap gap-3">
              {(['all', 'works', 'posts', 'authors', 'tags'] as SearchType[]).map((type) => {
                const labels = {
                  all: '全部',
                  works: '作品',
                  posts: '帖子',
                  authors: '作者',
                  tags: '标签',
                }

                const icons = {
                  all: null,
                  works: <FileText size={16} />,
                  posts: <SearchIcon size={16} />,
                  authors: <User size={16} />,
                  tags: <Tag size={16} />,
                }

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSearchType(type)}
                    className={`px-4 py-2 font-cyber rounded border-2 transition-all duration-300 flex items-center space-x-2 ${
                      searchType === type
                        ? 'bg-silver-light border-silver-light text-deep-black shadow-[0_0_15px_#E8E8E8]'
                        : 'bg-transparent border-silver-light/50 text-silver-light hover:border-silver-light'
                    }`}
                  >
                    {icons[type]}
                    <span>{labels[type]}</span>
                  </button>
                )
              })}
            </div>

            {/* Submit Button */}
            <Button type="submit" variant="accent" size="lg" disabled={loading} className="w-full">
              {loading ? '搜索中...' : '搜索'}
            </Button>
          </form>
        </div>

        {/* Search Results */}
        {hasSearched && (
          <div>
            <h2 className="text-3xl font-cyber font-bold text-white mb-6">
              搜索结果 ({totalResults})
            </h2>

            {totalResults === 0 ? (
              <div className="text-center py-20">
                <p className="text-2xl text-gray-500 font-mono">未找到相关结果</p>
              </div>
            ) : (
              <div className="space-y-12">
                {/* Works Results */}
                {works.length > 0 && (searchType === 'all' || searchType === 'works') && (
                  <section>
                    <h3 className="text-2xl font-cyber font-bold text-silver-main mb-6">
                      作品 ({works.length})
                    </h3>
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
                  </section>
                )}

                {/* Posts Results */}
                {posts.length > 0 && (searchType === 'all' || searchType === 'posts') && (
                  <section>
                    <h3 className="text-2xl font-cyber font-bold text-silver-medium mb-6">
                      帖子 ({posts.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {posts.map((post) => (
                        <PostCard
                          key={post.id}
                          id={post.id}
                          title={post.title}
                          content={post.content}
                          author={post.profiles?.display_name || post.profiles?.username || 'Unknown'}
                          createdAt={post.created_at || ''}
                          commentCount={post.comments.length}
                          category={post.category}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Authors Results */}
                {authors.length > 0 && (searchType === 'all' || searchType === 'authors') && (
                  <section>
                    <h3 className="text-2xl font-cyber font-bold text-silver-light mb-6">
                      作者 ({authors.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {authors.map((author) => (
                        <a
                          key={author.id}
                          href={`/profile/${author.id}`}
                          className="bg-surface-dark border-2 border-silver-light/30 rounded-lg p-4 hover:border-silver-light hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all duration-300"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-silver-light/20 border-2 border-silver-light rounded-full flex items-center justify-center">
                              <User size={24} className="text-silver-light" />
                            </div>
                            <div>
                              <p className="text-white font-cyber font-bold">
                                {author.display_name || author.username}
                              </p>
                              <p className="text-sm text-gray-400 font-mono">@{author.username}</p>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </section>
                )}

                {/* Tags Results */}
                {tags.length > 0 && (searchType === 'all' || searchType === 'tags') && (
                  <section>
                    <h3 className="text-2xl font-cyber font-bold text-glow-yellow mb-6">
                      标签 ({tags.length})
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {tags.map((tag, index) => (
                        <TagPill key={index} tag={tag} />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
