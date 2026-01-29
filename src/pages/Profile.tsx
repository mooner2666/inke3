import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database.types'
import WorkCard from '@/components/WorkCard'
import PostCard from '@/components/PostCard'
import { User, Calendar, BookOpen, MessageSquare, Camera, X, Check } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

type Profile = Database['public']['Tables']['profiles']['Row']
type Work = Database['public']['Tables']['works']['Row'] & {
  profiles: { username: string } | null
  work_tags: Array<{ tags: { name: string } | null }>
}
type Post = Database['public']['Tables']['forum_posts']['Row'] & {
  profiles: { username: string } | null
  comments: Array<{ id: string }>
}

export default function Profile() {
  const { id } = useParams()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [profile, setProfile] = useState<Profile | null>(null)
  const [works, setWorks] = useState<Work[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [activeTab, setActiveTab] = useState<'works' | 'posts'>('works')
  const [loading, setLoading] = useState(true)
  
  // 编辑相关状态
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (id) {
      checkUser()
      fetchProfile()
      fetchUserContent()
    }
  }, [id])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user && user.id === id) {
      setIsOwnProfile(true)
    }
  }

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id!)
      .single()

    if (data) {
      setProfile(data)
      setEditName(data.display_name || '')
    }
    setLoading(false)
  }

  const fetchUserContent = async () => {
    const { data: worksData } = await supabase
      .from('works')
      .select('*, profiles(username), work_tags(tags(name))')
      .eq('user_id', id!)
      .order('created_at', { ascending: false })
    setWorks((worksData as Work[]) || [])

    const { data: postsData } = await supabase
      .from('forum_posts')
      .select('*, profiles(username), comments(id)')
      .eq('user_id', id!)
      .order('created_at', { ascending: false })
    setPosts((postsData as Post[]) || [])
  }

  // 1:1 图像处理逻辑
  const processAvatar = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const size = Math.min(img.width, img.height)
          canvas.width = 500
          canvas.height = 500
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(
            img,
            (img.width - size) / 2, (img.height - size) / 2, size, size,
            0, 0, 500, 500
          )
          canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.8)
        }
      }
    })
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    setUploading(true)
    try {
      const processedBlob = await processAvatar(file)
      const fileName = `${profile.id}/${crypto.randomUUID()}.jpg`
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, processedBlob)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id)

      if (updateError) throw updateError
      setProfile({ ...profile, avatar_url: publicUrl })
    } catch (err) {
      alert('上传失败，请确保已创建 avatars 存储桶并开启 Public 权限')
    } finally {
      setUploading(false)
    }
  }

  const saveName = async () => {
    if (!profile) return
    setUploading(true)
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: editName })
      .eq('id', profile.id)
    
    if (!error) {
      setProfile({ ...profile, display_name: editName })
      setIsEditing(false)
    }
    setUploading(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-deep-black pt-24 flex items-center justify-center">
      <div className="text-2xl text-silver-light font-cyber animate-pulse">加载中...</div>
    </div>
  )

  if (!profile) return (
    <div className="min-h-screen bg-deep-black pt-24 flex items-center justify-center">
      <div className="text-2xl text-gray-500 font-mono">用户不存在</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-deep-black pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="bg-surface-dark border-2 border-silver-light/50 rounded-lg p-8 mb-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            
            {/* Avatar with Click to Upload */}
            <div 
              className={`relative group w-32 h-32 rounded-full flex items-center justify-center border-4 border-silver-light shadow-[0_0_30px_rgba(192,192,192,0.3)] ${isOwnProfile ? 'cursor-pointer' : ''}`}
              onClick={() => isOwnProfile && fileInputRef.current?.click()}
            >
              {profile.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full rounded-full object-cover" />
              ) : (
                <User size={64} className="text-white" />
              )}
              {isOwnProfile && (
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white" />
                </div>
              )}
              {uploading && <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-xs text-white">处理中...</div>}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input 
                      value={editName} 
                      onChange={(e) => setEditName(e.target.value)}
                      className="bg-black border border-silver-main px-2 py-1 text-white rounded font-cyber"
                      autoFocus
                    />
                    <button onClick={saveName} className="text-green-500 hover:scale-110"><Check size={20}/></button>
                    <button onClick={() => setIsEditing(false)} className="text-red-500 hover:scale-110"><X size={20}/></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-cyber font-bold text-white">
                      {profile.display_name || profile.username}
                    </h1>
                    {isOwnProfile && (
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-silver-light transition"
                      >
                        编辑昵称
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              <p className="text-silver-light font-mono mb-4">@{profile.username}</p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-mono text-gray-400">
                <div className="flex items-center space-x-2">
                  <Calendar size={16} className="text-silver-medium" />
                  <span>加入于 {profile.created_at && formatDistanceToNow(new Date(profile.created_at), { addSuffix: true, locale: zhCN })}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen size={16} className="text-silver-main" />
                  <span>{works.length} 作品</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageSquare size={16} className="text-silver-light" />
                  <span>{posts.length} 帖子</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button onClick={() => setActiveTab('works')} className={`px-6 py-3 font-cyber rounded-lg border-2 transition-all duration-300 ${activeTab === 'works' ? 'bg-silver-main border-silver-main text-white shadow-[0_0_20px_#C0C0C0]' : 'bg-transparent border-silver-main/50 text-silver-main hover:border-silver-main'}`}>
            <BookOpen size={18} className="inline mr-2" /> 作品 ({works.length})
          </button>
          <button onClick={() => setActiveTab('posts')} className={`px-6 py-3 font-cyber rounded-lg border-2 transition-all duration-300 ${activeTab === 'posts' ? 'bg-silver-medium border-silver-medium text-white shadow-[0_0_20px_#A8A8A8]' : 'bg-transparent border-silver-medium/50 text-silver-medium hover:border-silver-medium'}`}>
            <MessageSquare size={18} className="inline mr-2" /> 帖子 ({posts.length})
          </button>
        </div>

        {activeTab === 'works' ? (
          works.length === 0 ? <div className="text-center py-20"><p className="text-2xl text-gray-500 font-mono">暂无作品</p></div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {works.map((work) => (
                <WorkCard 
                  key={work.id} 
                  id={work.id} 
                  title={work.title} 
                  description={work.description} 
                  coverUrl={work.cover_url} 
                  author={profile.username} 
                  authorDisplayName={profile.display_name} // 核心修改：确保这里传了昵称
                  viewCount={work.view_count} 
                  tags={work.work_tags.map(wt => wt.tags?.name || '').filter(Boolean)} 
                />
              ))}
            </div>
          )
        ) : (
          posts.length === 0 ? <div className="text-center py-20"><p className="text-2xl text-gray-500 font-mono">暂无帖子</p></div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map((post) => (
                <PostCard 
                  key={post.id} 
                  id={post.id} 
                  title={post.title} 
                  content={post.content} 
                  author={profile.username} 
                  createdAt={post.created_at || ''} 
                  commentCount={post.comments.length} 
                  category={post.category} 
                />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}