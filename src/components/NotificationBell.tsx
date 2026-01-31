import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthContext'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

type Notification = {
  id: string
  type: string
  is_read: boolean
  created_at: string
  actor: { username: string; display_name: string | null } | null
  work: { id: string; title: string } | null
  post: { id: string; title: string } | null
}

export default function NotificationBell() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      fetchUnreadCount()
      const interval = setInterval(fetchUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  const fetchUnreadCount = async () => {
    if (!user) return
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false)
    setUnreadCount(count || 0)
  }

  const fetchNotifications = async () => {
    if (!user) return
    setLoading(true)
    const { data } = (await supabase
      .from('notifications')
      .select(`
        *,
        actor:actor_id(username, display_name),
        work:work_id(id, title),
        post:post_id(id, title)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)) as any

    setNotifications((data as Notification[]) || [])
    setLoading(false)
  }

  const markAsRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
    fetchUnreadCount()
    fetchNotifications()
  }

  const markAllAsRead = async () => {
    if (!user) return
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)
    fetchUnreadCount()
    fetchNotifications()
  }

  const handleOpen = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      fetchNotifications()
    }
  }

  const getNotificationText = (notif: Notification) => {
    const actorName = notif.actor?.display_name || notif.actor?.username || '某人'
    switch (notif.type) {
      case 'like':
        return `${actorName} 点赞了你的作品 "${notif.work?.title}"`
      case 'favorite':
        return `${actorName} 收藏了你的作品 "${notif.work?.title}"`
      case 'comment':
        return `${actorName} 评论了你的帖子 "${notif.post?.title}"`
      case 'reply':
        return `${actorName} 回复了你的评论`
      default:
        return '新通知'
    }
  }

  const getNotificationLink = (notif: Notification) => {
    if (notif.work?.id) return `/works/${notif.work.id}`
    if (notif.post?.id) return `/forum/${notif.post.id}`
    return '#'
  }

  if (!user) return null

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 text-silver-light hover:text-silver-main transition-colors"
        aria-label="通知"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-warning-red text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <div
            className="fixed inset-0 z-40 bg-black/50 md:bg-transparent"
            onClick={() => setIsOpen(false)}
          />
          
          {/* 通知面板 */}
          <div className="fixed md:absolute inset-x-4 top-20 md:inset-x-auto md:top-auto md:right-0 md:mt-2 md:w-96 bg-surface-dark border-2 border-silver-light/50 rounded-lg shadow-[0_0_30px_rgba(192,192,192,0.3)] z-50 max-h-[70vh] md:max-h-[600px] overflow-hidden flex flex-col">
            {/* 标题栏 */}
            <div className="p-4 border-b border-silver-light/30 flex items-center justify-between bg-deep-black/50 backdrop-blur">
              <h3 className="font-cyber text-lg text-white">通知</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-silver-light hover:text-silver-main font-mono transition-colors"
                >
                  全部已读
                </button>
              )}
            </div>

            {/* 通知列表 */}
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-8 text-center text-silver-medium font-mono">加载中...</div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500 font-mono">暂无通知</div>
              ) : (
                <div className="divide-y divide-silver-light/20">
                  {notifications.map((notif) => (
                    <Link
                      key={notif.id}
                      to={getNotificationLink(notif)}
                      onClick={() => {
                        if (!notif.is_read) markAsRead(notif.id)
                        setIsOpen(false)
                      }}
                      className={`block p-4 hover:bg-silver-light/10 transition-colors ${
                        !notif.is_read ? 'bg-silver-main/5' : ''
                      }`}
                    >
                      <p className="text-sm text-white font-mono mb-1 leading-relaxed">
                        {getNotificationText(notif)}
                      </p>
                      <p className="text-xs text-gray-400 font-mono">
                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: zhCN })}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}