import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthContext'
import { Heart } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

// --- 类型定义 ---
type ProfileInfo = { id: string; username: string; display_name: string | null }
type ReplyTo = { id: string; display_name: string | null; username: string }

type WorkCommentRow = {
  id: string
  work_id: string
  user_id: string
  content: string
  parent_id: string | null
  reply_to_id: string | null
  likes_count: number
  created_at: string
}

type WorkComment = WorkCommentRow & {
  author: ProfileInfo | null
  reply_to_user: ProfileInfo | null
}

interface WorkCommentsProps {
  workId: string
}

export default function WorkComments({ workId }: WorkCommentsProps) {
  const { user: currentUser } = useAuth()
  const [topComments, setTopComments] = useState<WorkComment[]>([])
  const [repliesByParentId, setRepliesByParentId] = useState<Map<string, WorkComment[]>>(new Map())
  const [commentText, setCommentText] = useState('')
  const [replyTo, setReplyTo] = useState<{ user: ReplyTo; topLevelParentId: string } | null>(null)
  const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // --- 获取数据 ---
  const fetchComments = useCallback(async () => {
    if (!workId) return
    setLoading(true)

    try {
      // 通过 (supabase.from('...') as any) 强行绕过 TS 检查
      const { data: allRows, error: fetchError } = await (supabase
        .from('work_comments' as any)
        .select('*')
        .eq('work_id', workId)
        .order('created_at', { ascending: true }) as any)

      if (fetchError || !allRows) throw fetchError

      const userIds = new Set<string>()
      allRows.forEach((c: WorkCommentRow) => {
        userIds.add(c.user_id)
        if (c.reply_to_id) userIds.add(c.reply_to_id)
      })

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, display_name')
        .in('id', Array.from(userIds))

      const profileMap = new Map<string, ProfileInfo>()
      ;(profiles || []).forEach((p: ProfileInfo) => profileMap.set(p.id, p))

      const topLevel: WorkComment[] = []
      const repliesMap = new Map<string, WorkComment[]>()

      allRows.forEach((row: WorkCommentRow) => {
        const fullComment: WorkComment = {
          ...row,
          author: profileMap.get(row.user_id) || null,
          reply_to_user: row.reply_to_id ? profileMap.get(row.reply_to_id) || null : null,
          likes_count: row.likes_count || 0
        }

        if (!row.parent_id) {
          topLevel.push(fullComment)
        } else {
          const list = repliesMap.get(row.parent_id) || []
          list.push(fullComment)
          repliesMap.set(row.parent_id, list)
        }
      })

      setTopComments(topLevel.reverse())
      setRepliesByParentId(repliesMap)

      if (currentUser) {
        const { data: likes } = await (supabase
          .from('work_comment_likes' as any)
          .select('comment_id')
          .eq('user_id', currentUser.id) as any)
        setLikedCommentIds(new Set((likes || []).map((l: any) => l.comment_id)))
      }
    } catch (err: unknown) {
      const e = err as { message?: string; details?: string }
      console.error('获取评论失败:', { message: e?.message ?? String(err), details: e?.details })
    } finally {
      setLoading(false)
    }
  }, [workId, currentUser?.id])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  // --- 发布评论 ---
  const handleSubmit = async () => {
    if (!currentUser || !commentText.trim()) return
    setSubmitting(true)
    try {
      const insertPayload: Record<string, unknown> = {
        work_id: workId,
        user_id: currentUser.id,
        content: commentText.trim(),
        parent_id: replyTo != null ? replyTo.topLevelParentId : null,
      }
      // 一级评论时 reply_to_id 必须为 null，绝不传空字符串
      insertPayload.reply_to_id =
        replyTo != null && replyTo.user?.id ? replyTo.user.id : null

      const { error } = await (supabase.from('work_comments' as any).insert(insertPayload) as any)

      if (error) {
        console.log('Error Message:', error.message, 'Error Detail:', error.details)
        throw error
      }

      setCommentText('')
      setReplyTo(null)
      await fetchComments()
    } catch (err: unknown) {
      const e = err as { message?: string; details?: string }
      console.log('Error Message:', e?.message ?? String(err), 'Error Detail:', e?.details)
      alert('发布失败，请检查网络或联系管理员。若为 400 错误，请查看控制台 Error Message / Error Detail 输出。')
    } finally {
      setSubmitting(false)
    }
  }

  // --- 点赞 ---
  const handleCommentLike = async (commentId: string, isCurrentlyLiked: boolean) => {
    if (!currentUser) return
    try {
      const table = supabase.from('work_comment_likes' as any) as any
      if (isCurrentlyLiked) {
        await table.delete().match({ comment_id: commentId, user_id: currentUser.id })
      } else {
        await table.insert({ comment_id: commentId, user_id: currentUser.id })
      }
      await fetchComments()
    } catch (err: unknown) {
      const e = err as { message?: string; details?: string }
      console.error('点赞操作失败:', { message: e?.message ?? String(err), details: e?.details })
      alert('点赞操作失败，请稍后重试。')
    }
  }

  // --- 删除 ---
  const handleDelete = async (commentId: string) => {
    if (!confirm('确定要删除这条评论吗？')) return
    try {
      await (supabase.from('work_comments' as any).delete().eq('id', commentId) as any)
      await fetchComments()
    } catch (err: unknown) {
      const e = err as { message?: string; details?: string }
      console.error('删除评论失败:', { message: e?.message ?? String(err), details: e?.details })
      alert('删除失败，请稍后重试。')
    }
  }

  const getReplies = (commentId: string): WorkComment[] => repliesByParentId.get(commentId) || []

  const formatDate = (createdAt: string) =>
    formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: zhCN })

  return (
    <div id="comments" className="mt-8 pt-8 border-t border-silver-main/30">
      <h3 className="text-white font-semibold mb-4 font-cyber text-lg tracking-wider font-mono">评论区</h3>

      {currentUser ? (
        <div className="mb-6 bg-charcoal-dark/50 p-4 rounded-xl border border-silver-main/10">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={replyTo ? `回复 @${replyTo.user.display_name || replyTo.user.username}…` : '写下你的评论…'}
            className="w-full bg-deep-black/50 border border-silver-main/20 rounded-lg p-3 text-white text-sm resize-none focus:outline-none focus:border-silver-main/60 transition-colors font-mono"
            rows={3}
          />
          <div className="flex justify-between items-center mt-3">
            <div className="text-xs text-gray-500">
              {replyTo && (
                <div className="flex items-center gap-2 text-silver-main">
                  <span>正在回复 @{replyTo.user.display_name || replyTo.user.username}</span>
                  <button onClick={() => setReplyTo(null)} className="hover:text-white">✕</button>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !commentText.trim()}
              className="px-6 py-2 bg-silver-main hover:bg-white text-deep-black text-xs rounded font-bold tracking-widest transition-all disabled:opacity-30"
            >
              {submitting ? '发布中...' : '发布评论'}
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 border border-dashed border-silver-main/20 rounded-lg text-center font-mono text-gray-500 text-sm">
          请先登录以发表评论
        </div>
      )}

      {loading && topComments.length === 0 ? (
        <p className="text-gray-400 text-sm font-mono animate-pulse uppercase">同步中...</p>
      ) : topComments.length === 0 ? (
        <p className="text-gray-500 text-sm font-mono py-10 text-center uppercase tracking-widest">暂无评论</p>
      ) : (
        <div className="space-y-1">
          {topComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              replies={getReplies(comment.id)}
              currentUser={currentUser}
              likedCommentIds={likedCommentIds}
              onReply={(user, topLevelParentId) => setReplyTo({ user, topLevelParentId })}
              onLike={handleCommentLike}
              onDelete={handleDelete}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CommentItem({
  comment,
  replies,
  currentUser,
  likedCommentIds,
  onReply,
  onLike,
  onDelete,
  formatDate,
}: any) {
  const authorName = comment.author?.display_name || comment.author?.username || '匿名用户'
  const isLiked = likedCommentIds.has(comment.id)
  const topLevelId = comment.parent_id || comment.id

  return (
    <div className="border-b border-white/5 py-4 last:border-0">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded bg-silver-main/10 border border-silver-main/10 flex items-center justify-center text-xs text-silver-main font-mono shrink-0">
          {authorName[0]?.toUpperCase()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-silver-bright text-sm font-bold font-mono tracking-tight">{authorName}</span>
            <span className="text-gray-600 text-[10px] font-mono">{formatDate(comment.created_at)}</span>
          </div>

          <p className="text-gray-300 text-sm leading-relaxed font-mono break-words">{comment.content}</p>

          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => onLike(comment.id, isLiked)}
              className={`flex items-center gap-1.5 text-[10px] font-mono transition-colors ${isLiked ? 'text-pink-500' : 'text-gray-500 hover:text-pink-400'}`}
            >
              <Heart size={12} fill={isLiked ? 'currentColor' : 'none'} />
              <span>{comment.likes_count || 0}</span>
            </button>
            <button
              onClick={() => onReply({ id: comment.user_id, display_name: authorName, username: comment.author?.username || '' }, topLevelId)}
              className="text-[10px] text-gray-500 hover:text-silver-main font-mono uppercase"
            >
              回复
            </button>
            {currentUser?.id === comment.user_id && (
              <button onClick={() => onDelete(comment.id)} className="text-[10px] text-gray-500 hover:text-red-500 font-mono uppercase">
                删除
              </button>
            )}
          </div>

          {replies.length > 0 && (
            <div className="mt-4 space-y-4 border-l border-white/10 pl-4">
              {replies.map((reply: any) => {
                const rLiked = likedCommentIds.has(reply.id)
                const rAuthor = reply.author?.display_name || reply.author?.username || '匿名'
                return (
                  <div key={reply.id}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-silver-main/80 text-xs font-bold font-mono">{rAuthor}</span>
                      <span className="text-gray-600 text-[9px] font-mono">{formatDate(reply.created_at)}</span>
                    </div>
                    <p className="text-gray-400 text-xs font-mono">
                      {reply.reply_to_user && <span className="text-silver-main/40 mr-1.5">@{reply.reply_to_user.display_name || reply.reply_to_user.username}</span>}
                      {reply.content}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <button onClick={() => onLike(reply.id, rLiked)} className={`flex items-center gap-1 text-[9px] ${rLiked ? 'text-pink-500' : 'text-gray-600'}`}>
                        <Heart size={10} fill={rLiked ? 'currentColor' : 'none'} />
                        {reply.likes_count || 0}
                      </button>
                      <button onClick={() => onReply({ id: reply.user_id, display_name: rAuthor, username: reply.author?.username || '' }, topLevelId)} className="text-[9px] text-gray-600 hover:text-silver-main uppercase">
                        回复
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}