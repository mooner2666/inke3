import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database.types'
import { User, Calendar, Eye, ArrowLeft, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react'
import TagPill from '@/components/TagPill'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useAuth } from '@/lib/AuthContext'
import Button from '@/components/Button'

type Work = Database['public']['Tables']['works']['Row'] & {
  profiles: { username: string; display_name: string | null } | null
  work_tags: Array<{ tags: { name: string } | null }>
}

type Chapter = Database['public']['Tables']['chapters']['Row']

export default function WorkDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [work, setWork] = useState<Work | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  const currentChapter = chapters[currentChapterIndex]

  useEffect(() => {
    if (id) {
      fetchWork()
      fetchChapters()
      incrementViewCount()
    }
  }, [id])

  useEffect(() => {
    const chapterParam = searchParams.get('chapter')
    if (chapterParam && chapters.length > 0) {
      const chapterNum = parseInt(chapterParam)
      if (chapterNum > 0 && chapterNum <= chapters.length) {
        setCurrentChapterIndex(chapterNum - 1)
      }
    }
  }, [searchParams, chapters])

  const fetchWork = async () => {
    const { data } = await supabase
      .from('works')
      .select('*, profiles(username, display_name), work_tags(tags(name))')
      .eq('id', id!)
      .single()

    setWork(data as Work)
    setLoading(false)
  }

  const fetchChapters = async () => {
    const { data } = await supabase
      .from('chapters')
      .select('*')
      .eq('work_id', id!)
      .order('chapter_number', { ascending: true })

    if (data) {
      setChapters(data)
    }
  }

  const incrementViewCount = async () => {
    const { data: currentWork } = await supabase
      .from('works')
      .select('view_count')
      .eq('id', id!)
      .single()

    if (currentWork) {
      await supabase
        .from('works')
        .update({ view_count: (currentWork.view_count || 0) + 1 })
        .eq('id', id!)
    }
  }

  const handleDelete = async () => {
    if (!confirm('确定要删除这个作品吗？')) return

    await supabase.from('works').delete().eq('id', id!)
    navigate('/works')
  }

  const goToChapter = (index: number) => {
    setCurrentChapterIndex(index)
    setSearchParams({ chapter: (index + 1).toString() })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goToPreviousChapter = () => {
    if (currentChapterIndex > 0) {
      goToChapter(currentChapterIndex - 1)
    }
  }

  const goToNextChapter = () => {
    if (currentChapterIndex < chapters.length - 1) {
      goToChapter(currentChapterIndex + 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-black pt-24 flex items-center justify-center">
        <div className="text-2xl text-silver-main font-cyber animate-pulse">加载中...</div>
      </div>
    )
  }

  if (!work) {
    return (
      <div className="min-h-screen bg-deep-black pt-24 flex items-center justify-center">
        <div className="text-2xl text-gray-500 font-mono">作品不存在</div>
      </div>
    )
  }

  const isOwner = user?.id === work.user_id

  return (
    <div className="min-h-screen bg-deep-black pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Back Button */}
        <button
          onClick={() => navigate('/works')}
          className="flex items-center space-x-2 text-silver-light hover:text-silver-bright transition-colors duration-300 mb-6 font-mono"
        >
          <ArrowLeft size={20} />
          <span>返回作品库</span>
        </button>

        {/* Cover Image - 铺满边框且居中 */}
        {work.cover_url && (
          <div className="mb-10 max-w-md mx-auto rounded-lg overflow-hidden border-2 border-silver-main/50 shadow-[0_0_20px_rgba(192,192,192,0.2)] aspect-[3/4]">
            <img 
              src={work.cover_url} 
              alt={work.title}
              className="w-full h-full object-cover" 
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          </div>
        )}

        {/* Title and Meta */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-cyber font-bold text-silver-bright mb-4">
            {work.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-4 text-gray-400 font-mono text-sm mb-6">
            <div className="flex items-center space-x-2">
              <User size={16} className="text-silver-light" />
              <span>{work.profiles?.display_name || work.profiles?.username}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar size={16} className="text-silver-medium" />
              <span>
                {work.created_at && formatDistanceToNow(new Date(work.created_at), { addSuffix: true, locale: zhCN })}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Eye size={16} className="text-silver-main" />
              <span>{work.view_count || 0} 浏览</span>
            </div>
            <div className="flex items-center space-x-2">
              <BookOpen size={16} className="text-mercury-glow" />
              <span>{chapters.length} 章节</span>
            </div>
          </div>

          {/* Tags */}
          {work.work_tags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {work.work_tags.map((wt, index) => (
                wt.tags && <TagPill key={index} tag={wt.tags.name} />
              ))}
            </div>
          )}

          {/* Description */}
          {work.description && (
            <div className="max-w-3xl mx-auto">
              <p className="text-lg text-gray-300 font-mono mb-6 bg-surface-dark border-l-4 border-silver-light p-4 rounded text-left">
                {work.description}
              </p>
            </div>
          )}

          {/* Actions */}
          {isOwner && (
            <div className="flex justify-center gap-4">
              <Button variant="destructive" onClick={handleDelete}>
                删除作品
              </Button>
            </div>
          )}
        </div>

        {/* 章节部分保持不变... */}
        {chapters.length > 0 ? (
          <>
            <div className="mb-6 bg-surface-dark border-2 border-silver-main/30 rounded-lg p-4">
              <h2 className="text-2xl font-cyber font-bold text-silver-bright mb-4">章节列表</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {chapters.map((chapter, index) => (
                  <button
                    key={chapter.id}
                    onClick={() => goToChapter(index)}
                    className={`px-4 py-2 rounded font-mono text-sm transition-all duration-300 ${
                      currentChapterIndex === index
                        ? 'bg-silver-main text-deep-black font-bold'
                        : 'bg-charcoal-dark text-silver-light hover:bg-silver-main/20 border border-silver-main/30'
                    }`}
                  >
                    第 {chapter.chapter_number} 章
                  </button>
                ))}
              </div>
            </div>

            {currentChapter && (
              <div className="bg-surface-dark border-2 border-silver-main/30 rounded-lg p-8 mb-6">
                <div className="border-b border-silver-main/30 pb-4 mb-6">
                  <h2 className="text-3xl font-cyber font-bold text-silver-bright mb-2">
                    第 {currentChapter.chapter_number} 章: {currentChapter.title}
                  </h2>
                  <p className="text-sm text-gray-400 font-mono">
                    {currentChapter.created_at && formatDistanceToNow(new Date(currentChapter.created_at), { addSuffix: true, locale: zhCN })}
                  </p>
                </div>

                <div className="prose prose-invert max-w-none mb-8">
                  <div className="text-white font-mono leading-relaxed whitespace-pre-wrap text-lg">
                    {currentChapter.content}
                  </div>
                </div>

                {currentChapter.author_note && (
                  <div className="mt-8 pt-6 border-t border-silver-main/30">
                    <h3 className="text-xl font-cyber font-bold text-silver-light mb-3 flex items-center space-x-2">
                      <span>作者有话要说</span>
                    </h3>
                    <div className="bg-charcoal-dark border-l-4 border-silver-medium p-4 rounded">
                      <p className="text-gray-300 font-mono leading-relaxed whitespace-pre-wrap">
                        {currentChapter.author_note}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between items-center gap-4">
              <Button
                variant="ghost"
                size="lg"
                onClick={goToPreviousChapter}
                disabled={currentChapterIndex === 0}
                className="flex items-center space-x-2"
              >
                <ChevronLeft size={20} />
                <span>上一章</span>
              </Button>

              <div className="text-center font-mono text-silver-medium">
                {currentChapterIndex + 1} / {chapters.length}
              </div>

              <Button
                variant="ghost"
                size="lg"
                onClick={goToNextChapter}
                disabled={currentChapterIndex === chapters.length - 1}
                className="flex items-center space-x-2"
              >
                <span>下一章</span>
                <ChevronRight size={20} />
              </Button>
            </div>
          </>
        ) : (
          <div className="bg-surface-dark border-2 border-silver-main/30 rounded-lg p-8">
            <div className="text-center text-gray-400 font-mono">
              <p>该作品暂无章节内容</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}