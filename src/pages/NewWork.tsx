import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthContext'
import Button from '@/components/Button'
import { Upload, X, Plus, ChevronUp, ChevronDown, Trash2 } from 'lucide-react'

interface Chapter {
  id: string
  title: string
  content: string
  authorNote: string
}

export default function NewWork() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string>('')
  const [chapters, setChapters] = useState<Chapter[]>([
    { id: crypto.randomUUID(), title: '', content: '', authorNote: '' }
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
    setChapters([...chapters, { id: crypto.randomUUID(), title: '', content: '', authorNote: '' }])
  }

  const removeChapter = (id: string) => {
    if (chapters.length > 1) {
      setChapters(chapters.filter(c => c.id !== id))
    }
  }

  const updateChapter = (id: string, field: keyof Chapter, value: string) => {
    setChapters(chapters.map(c => c.id === id ? { ...c, [field]: value } : c))
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
    if (!user) return

    // Validate chapters
    const hasEmptyChapter = chapters.some(c => !c.title.trim() || !c.content.trim())
    if (hasEmptyChapter) {
      setError('请填写所有章节的标题和内容')
      return
    }

    setError('')
    setLoading(true)

    try {
      let coverUrl = null

      // Upload cover image if exists
      if (coverFile) {
        const fileExt = coverFile.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('covers')
          .upload(fileName, coverFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('covers')
          .getPublicUrl(fileName)

        coverUrl = publicUrl
      }

      // Create work
      const { data: workData, error: workError } = await supabase
        .from('works')
        .insert({
          user_id: user.id,
          title,
          description,
          content: description || '', // Keep for backward compatibility
          cover_url: coverUrl,
        })
        .select()
        .single()

      if (workError) throw workError

      // Add chapters
      for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i]
        const { error: chapterError } = await supabase
          .from('chapters')
          .insert({
            work_id: workData.id,
            chapter_number: i + 1,
            title: chapter.title,
            content: chapter.content,
            author_note: chapter.authorNote || null,
          })

        if (chapterError) throw chapterError
      }

      // Add tags
      for (const tagName of tags) {
        // Get or create tag
        let { data: tagData } = await supabase
          .from('tags')
          .select('id')
          .eq('name', tagName)
          .single()

        if (!tagData) {
          const { data: newTag } = await supabase
            .from('tags')
            .insert({ name: tagName })
            .select()
            .single()
          tagData = newTag
        }

        if (tagData) {
          await supabase
            .from('work_tags')
            .insert({ work_id: workData.id, tag_id: tagData.id })
        }
      }

      navigate(`/works/${workData.id}`)
    } catch (err: any) {
      setError(err.message || '发布失败')
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
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-5xl font-cyber font-bold text-transparent bg-clip-text bg-gradient-to-r from-silver-main to-silver-bright mb-8">
          发布新作品
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-warning-red/10 border border-warning-red rounded text-warning-red font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Cover Upload */}
          <div>
            <label className="block text-sm font-mono text-silver-light mb-2">
              封面图片
            </label>
            <div className="border-2 border-dashed border-silver-main/50 rounded-lg p-6 hover:border-silver-main transition-colors duration-300">
              {coverPreview ? (
                <div className="relative">
                  <img src={coverPreview} alt="Cover preview" className="w-full h-64 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => {
                      setCoverFile(null)
                      setCoverPreview('')
                    }}
                    className="absolute top-2 right-2 bg-warning-red text-white rounded-full p-2 hover:bg-warning-red/80 transition-colors duration-300"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center cursor-pointer">
                  <Upload size={48} className="text-silver-main mb-2" />
                  <span className="text-gray-400 font-mono text-sm">点击上传封面图片</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-mono text-silver-light mb-2">
              作品标题 *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-deep-black border-2 border-silver-main/50 focus:border-silver-main rounded px-4 py-3 text-white font-mono outline-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(192,192,192,0.5)]"
              placeholder="输入作品标题"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-mono text-silver-light mb-2">
              作品简介
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-deep-black border-2 border-silver-main/50 focus:border-silver-main rounded px-4 py-3 text-white font-mono outline-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(192,192,192,0.5)] resize-none"
              placeholder="简短描述你的作品"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-mono text-silver-light mb-2">
              标签
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 bg-deep-black border-2 border-silver-main/50 focus:border-silver-main rounded px-4 py-2 text-white font-mono outline-none transition-all duration-300"
                placeholder="输入标签后按回车或点击添加"
              />
              <Button type="button" variant="primary" onClick={addTag}>
                添加
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-silver-main/20 border border-silver-main text-silver-light rounded font-mono text-sm flex items-center space-x-2"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-warning-red transition-colors duration-300"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Chapters Section */}
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
                      <button
                        type="button"
                        onClick={() => moveChapterUp(index)}
                        disabled={index === 0}
                        className="p-2 text-silver-main hover:text-silver-bright disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-300"
                      >
                        <ChevronUp size={20} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveChapterDown(index)}
                        disabled={index === chapters.length - 1}
                        className="p-2 text-silver-main hover:text-silver-bright disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-300"
                      >
                        <ChevronDown size={20} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeChapter(chapter.id)}
                        disabled={chapters.length === 1}
                        className="p-2 text-warning-red hover:text-warning-red/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-300"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-silver-medium mb-1">
                      章节标题 *
                    </label>
                    <input
                      type="text"
                      value={chapter.title}
                      onChange={(e) => updateChapter(chapter.id, 'title', e.target.value)}
                      required
                      className="w-full bg-charcoal-dark border border-silver-main/50 focus:border-silver-main rounded px-3 py-2 text-white font-mono outline-none transition-all duration-300"
                      placeholder="输入章节标题"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-silver-medium mb-1">
                      章节内容 *
                    </label>
                    <textarea
                      value={chapter.content}
                      onChange={(e) => updateChapter(chapter.id, 'content', e.target.value)}
                      required
                      rows={10}
                      className="w-full bg-charcoal-dark border border-silver-main/50 focus:border-silver-main rounded px-3 py-2 text-white font-mono outline-none transition-all duration-300 resize-none"
                      placeholder="输入章节内容..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-silver-medium mb-1">
                      作者有话要说
                    </label>
                    <textarea
                      value={chapter.authorNote}
                      onChange={(e) => updateChapter(chapter.id, 'authorNote', e.target.value)}
                      rows={3}
                      className="w-full bg-charcoal-dark border border-silver-main/50 focus:border-silver-main rounded px-3 py-2 text-white font-mono outline-none transition-all duration-300 resize-none"
                      placeholder="作者的话（可选）"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-6">
            <Button type="submit" variant="primary" size="lg" disabled={loading} className="flex-1">
              {loading ? '发布中...' : '发布作品'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => navigate('/works')}
            >
              取消
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
