import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthContext'
import Button from '@/components/Button'
import { Upload, X, Plus, ChevronUp, ChevronDown, Trash2 } from 'lucide-react'

interface Chapter {
  id: string
  title: string
  content: string
  authorNote: string
  fromDb: boolean
}

type WorkRow = {
  id: string
  user_id: string | null
  title: string
  description: string | null
  content: string
  cover_url: string | null
  category: string | null
  work_tags: Array<{ tags: { name: string } | null }>
}

export default function EditWork() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<'original' | 'fanfiction'>('original')
  const [detail, setDetail] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string>('')
  const [chapters, setChapters] = useState<Chapter[]>([])

  useEffect(() => {
    if (!id || !user) return
    fetchWork()
  }, [id, user])

  const fetchWork = async () => {
    if (!id) return
    setLoading(true)
    setError('')

    const { data: workData, error: workErr } = await supabase
      .from('works')
      .select('*, work_tags(tags(name))')
      .eq('id', id)
      .single()

    if (workErr || !workData) {
      setError('作品不存在或加载失败')
      setLoading(false)
      return
    }

    const work = workData as WorkRow
    if (work.user_id !== user?.id) {
      setError('无权编辑此作品')
      setLoading(false)
      return
    }

    setTitle(work.title)
    setDescription(work.description || '')
    setCategory((work.category as 'original' | 'fanfiction') || 'original')
    setDetail(work.content || '')
    setTags(work.work_tags?.map(wt => wt.tags?.name).filter(Boolean) as string[] || [])
    setCoverPreview(work.cover_url || '')

    const { data: chaptersData } = await supabase
      .from('chapters')
      .select('id, title, content, author_note')
      .eq('work_id', id)
      .order('chapter_number', { ascending: true })

    if (chaptersData?.length) {
      setChapters(chaptersData.map(c => ({
        id: c.id,
        title: c.title,
        content: c.content,
        authorNote: c.author_note || '',
        fromDb: true,
      })))
    } else {
      setChapters([{ id: crypto.randomUUID(), title: '', content: '', authorNote: '', fromDb: false }])
    }

    setLoading(false)
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverFile(file)
      setCoverPreview(URL.createObjectURL(file))
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const addChapter = () => {
    setChapters([...chapters, { id: crypto.randomUUID(), title: '', content: '', authorNote: '', fromDb: false }])
  }

  const removeChapter = (chapterId: string) => {
    if (chapters.length > 1) {
      setChapters(chapters.filter(c => c.id !== chapterId))
    }
  }

  const updateChapter = (chapterId: string, field: keyof Chapter, value: string | boolean) => {
    setChapters(chapters.map(c => c.id === chapterId ? { ...c, [field]: value } : c))
  }

  const moveChapterUp = (index: number) => {
    if (index > 0) {
      const newChapters = [...chapters]
      ;[newChapters[index - 1], newChapters[index]] = [newChapters[index], newChapters[index - 1]]
      setChapters(newChapters)
    }
  }

  const moveChapterDown = (index: number) => {
    if (index < chapters.length - 1) {
      const newChapters = [...chapters]
      ;[newChapters[index], newChapters[index + 1]] = [newChapters[index + 1], newChapters[index]]
      setChapters(newChapters)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !id) return

    const hasEmptyChapter = chapters.some(c => !c.title.trim() || !c.content.trim())
    if (hasEmptyChapter) {
      setError('请填写所有章节的标题和内容')
      return
    }

    setError('')
    setSaving(true)

    try {
      let coverUrl: string | null = null

      if (coverFile) {
        const fileExt = coverFile.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('covers')
          .upload(fileName, coverFile)
        if (uploadError) throw uploadError
        const { data: { publicUrl } } = supabase.storage.from('covers').getPublicUrl(fileName)
        coverUrl = publicUrl
      }

      const shortDesc = description.slice(0, 20)
      const updatePayload: Record<string, unknown> = {
        title,
        description: shortDesc,
        content: detail || '',
      }
      if (coverUrl) updatePayload.cover_url = coverUrl
      else if (!coverFile && coverPreview === '') updatePayload.cover_url = null

      const { error: workError } = await supabase
        .from('works')
        .update(updatePayload)
        .eq('id', id)
        .eq('user_id', user.id)

      if (workError) throw workError

      const keptIds: string[] = []

      for (let i = 0; i < chapters.length; i++) {
        const ch = chapters[i]
        if (ch.fromDb) {
          keptIds.push(ch.id)
          await supabase
            .from('chapters')
            .update({
              chapter_number: i + 1,
              title: ch.title,
              content: ch.content,
              author_note: ch.authorNote || null,
            })
            .eq('id', ch.id)
        } else {
          const { data: inserted } = await supabase
            .from('chapters')
            .insert({
              work_id: id,
              chapter_number: i + 1,
              title: ch.title,
              content: ch.content,
              author_note: ch.authorNote || null,
            })
            .select('id')
            .single()
          if (inserted?.id) keptIds.push(inserted.id)
        }
      }

      const { data: allChapters } = await supabase
        .from('chapters')
        .select('id')
        .eq('work_id', id)
      const toDelete = (allChapters || []).filter(c => !keptIds.includes(c.id)).map(c => c.id)
      for (const chapterId of toDelete) {
        await supabase.from('chapters').delete().eq('id', chapterId)
      }

      await supabase.from('work_tags').delete().eq('work_id', id)
      for (const tagName of tags) {
        let { data: tagData } = await supabase.from('tags').select('id').eq('name', tagName).single()
        if (!tagData) {
          const { data: newTag } = await supabase.from('tags').insert({ name: tagName }).select().single()
          tagData = newTag
        }
        if (tagData) {
          await supabase.from('work_tags').insert({ work_id: id, tag_id: tagData.id })
        }
      }

      navigate(`/works/${id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    navigate('/login')
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-black pt-24 flex items-center justify-center">
        <div className="text-2xl text-silver-main font-cyber animate-pulse">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-deep-black pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-5xl font-cyber font-bold text-transparent bg-clip-text bg-gradient-to-r from-silver-main to-silver-bright mb-8">
          编辑作品
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-warning-red/10 border border-warning-red rounded text-warning-red font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-sm font-mono text-silver-light mb-2">作品标题 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-deep-black border-2 border-silver-main/50 focus:border-silver-main rounded px-4 py-3 text-white font-mono outline-none transition-all duration-300"
              placeholder="输入作品标题"
            />
          </div>

          <div>
            <label className="block text-sm font-mono text-silver-light mb-2">作品简介</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={20}
              className="w-full bg-deep-black border-2 border-silver-main/50 focus:border-silver-main rounded px-4 py-3 text-white font-mono outline-none transition-all duration-300"
              placeholder="用一句话吸引读者（最多20字）"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 font-mono mb-2">板块选择</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as 'original' | 'fanfiction')}
              className="w-full bg-deep-black border-2 border-silver-main/50 focus:border-silver-main rounded px-4 py-3 text-white font-mono outline-none transition-all duration-300"
            >
              <option value="original">原创</option>
              <option value="fanfiction">同人</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-mono text-silver-light mb-2">作品详情</label>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              rows={4}
              className="w-full bg-deep-black border-2 border-silver-main/50 focus:border-silver-main rounded px-4 py-3 text-white font-mono outline-none transition-all duration-300 resize-none"
              placeholder="详细介绍你的作品，吸引读者关注……"
            />
          </div>

          <div>
            <label className="block text-sm font-mono text-silver-light mb-2">标签</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 bg-deep-black border-2 border-silver-main/50 focus:border-silver-main rounded px-4 py-2 text-white font-mono outline-none transition-all duration-300"
                placeholder="输入标签后按回车或点击添加"
              />
              <Button type="button" variant="primary" onClick={addTag}>添加</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-silver-main/20 border border-silver-main text-silver-light rounded font-mono text-sm flex items-center space-x-2"
                >
                  <span>#{tag}</span>
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-warning-red transition-colors duration-300">
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-mono text-silver-light mb-2">封面图片</label>
            <div className="border-2 border-dashed border-silver-main/50 rounded-lg p-6 hover:border-silver-main transition-colors duration-300">
              {coverPreview ? (
                <div className="relative">
                  <img src={coverPreview} alt="Cover" className="w-full h-64 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => { setCoverFile(null); setCoverPreview('') }}
                    className="absolute top-2 right-2 bg-warning-red text-white rounded-full p-2 hover:bg-warning-red/80"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center cursor-pointer">
                  <Upload size={48} className="text-silver-main mb-2" />
                  <span className="text-gray-400 font-mono text-sm">点击上传封面图片</span>
                  <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <div className="border-t-2 border-silver-main/30 pt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-cyber font-bold text-silver-bright">章节管理</h2>
              <Button type="button" variant="primary" onClick={addChapter} className="flex items-center space-x-2">
                <Plus size={18} />
                <span>添加章节</span>
              </Button>
            </div>
            <div className="space-y-6">
              {chapters.map((chapter, index) => (
                <div key={chapter.id} className="bg-surface-dark border-2 border-silver-main/30 rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-cyber text-silver-light">第 {index + 1} 章</h3>
                    <div className="flex items-center space-x-2">
                      <button type="button" onClick={() => moveChapterUp(index)} disabled={index === 0} className="p-2 text-silver-main hover:text-silver-bright disabled:opacity-30 disabled:cursor-not-allowed">
                        <ChevronUp size={20} />
                      </button>
                      <button type="button" onClick={() => moveChapterDown(index)} disabled={index === chapters.length - 1} className="p-2 text-silver-main hover:text-silver-bright disabled:opacity-30 disabled:cursor-not-allowed">
                        <ChevronDown size={20} />
                      </button>
                      <button type="button" onClick={() => removeChapter(chapter.id)} disabled={chapters.length === 1} className="p-2 text-warning-red hover:text-warning-red/80 disabled:opacity-30 disabled:cursor-not-allowed">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-silver-medium mb-1">章节标题 *</label>
                    <input
                      type="text"
                      value={chapter.title}
                      onChange={(e) => updateChapter(chapter.id, 'title', e.target.value)}
                      required
                      className="w-full bg-charcoal-dark border border-silver-main/50 focus:border-silver-main rounded px-3 py-2 text-white font-mono outline-none"
                      placeholder="输入章节标题"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-silver-medium mb-1">章节内容 *</label>
                    <textarea
                      value={chapter.content}
                      onChange={(e) => updateChapter(chapter.id, 'content', e.target.value)}
                      required
                      rows={10}
                      className="w-full bg-charcoal-dark border border-silver-main/50 focus:border-silver-main rounded px-3 py-2 text-white font-mono outline-none resize-none"
                      placeholder="输入章节内容..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-silver-medium mb-1">作者有话要说</label>
                    <textarea
                      value={chapter.authorNote}
                      onChange={(e) => updateChapter(chapter.id, 'authorNote', e.target.value)}
                      rows={3}
                      className="w-full bg-charcoal-dark border border-silver-main/50 focus:border-silver-main rounded px-3 py-2 text-white font-mono outline-none"
                      placeholder="作者的话（可选）"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <Button type="submit" variant="primary" size="lg" disabled={saving} className="flex-1">
              {saving ? '保存中...' : '保存修改'}
            </Button>
            <Button type="button" variant="ghost" size="lg" onClick={() => navigate(`/works/${id}`)}>
              取消
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
