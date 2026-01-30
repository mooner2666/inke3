import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database.types'
import { User, Calendar, MessageCircle, ArrowLeft, Send } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useAuth } from '@/lib/AuthContext'
import Button from '@/components/Button'

type Post = Database['public']['Tables']['forum_posts']['Row'] & {
  profiles: { username: string; display_name: string | null } | null
}

type Comment = Database['public']['Tables']['comments']['Row'] & {
  profiles: { username: string; display_name: string | null } | null
}

type CommentWithReplies = Comment & {
  replies: CommentWithReplies[]
}

/**
 * 将扁平的评论列表转换为树形结构
 * parent_id 为 null 的是顶级评论，其他根据 parent_id 放入对应 replies
 */
function buildCommentTree(comments: Comment[]): CommentWithReplies[] {
  const byId = new Map<string, CommentWithReplies>()
  comments.forEach((c) => byId.set(c.id, { ...c, replies: [] }))
  const roots: CommentWithReplies[] = []
  comments.forEach((c) => {
    const node = byId.get(c.id)!
    if (c.parent_id == null) {
      roots.push(node)
    } else {
      const parent = byId.get(c.parent_id)
      if (parent) parent.replies.push(node)
      else roots.push(node)
    }
  })
  roots.sort((a, b) =>
    a.created_at && b.created_at
      ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      : 0
  )
  byId.forEach((node) =>
    node.replies.sort((a, b) =>
      a.created_at && b.created_at
        ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        : 0
    )
  )
  return roots
}

function countComments(tree: CommentWithReplies[]): number {
  return tree.reduce((sum, node) => sum + 1 + countComments(node.replies), 0)
}

type ReplyFormProps = {
  commentContent: string
  setCommentContent: (v: string) => void
  onSubmit: (e: React.FormEvent, parentId: string | null) => void
  submitting: boolean
  replyingTo: { commentId: string; username: string } | null
  onCancelReply: () => void
}

function ReplyForm({
  commentContent,
  setCommentContent,
  onSubmit,
  submitting,
  replyingTo,
  onCancelReply,
}: ReplyFormProps) {
  return (
    <form
      onSubmit={(e) => onSubmit(e, replyingTo?.commentId ?? null)}
      className="mb-6"
    >
      {replyingTo && (
        <div className="flex items-center gap-2 mb-2 text-sm font-mono text-silver-light">
          <span>正在回复</span>
          <span className="text-silver-main">@{replyingTo.username}</span>
          <button
            type="button"
            onClick={onCancelReply}
            className="text-gray-400 hover:text-silver-light transition-colors"
          >
            取消
          </button>
        </div>
      )}
      <textarea
        value={commentContent}
        onChange={(e) => setCommentContent(e.target.value)}
        rows={4}
        required
        className="w-full bg-deep-black border-2 border-silver-light/50 focus:border-silver-light rounded px-4 py-3 text-white font-mono outline-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(192,192,192,0.3)] resize-none mb-4"
        placeholder={replyingTo ? `回复 @${replyingTo.username}...` : '写下你的评论...'}
      />
      <Button
        type="submit"
        variant="accent"
        disabled={submitting}
        className="flex items-center space-x-2"
      >
        <Send size={18} />
        <span>
          {submitting ? '发送中...' : replyingTo ? '发送回复' : '发表评论'}
        </span>
      </Button>
    </form>
  )
}

export default function ForumDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentContent, setCommentContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<{
    commentId: string
    username: string
  } | null>(null)

  useEffect(() => {
    if (id) {
      fetchPost()
      fetchComments()
    }
  }, [id])

  const fetchPost = async () => {
    const { data } = await supabase
      .from('forum_posts')
      .select('*, profiles(username, display_name)')
      .eq('id', id!)
      .single()

    setPost(data as Post)
    setLoading(false)
  }

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(username, display_name)')
      .eq('post_id', id!)
      .order('created_at', { ascending: true })

    setComments((data as Comment[]) || [])
  }

  const handleSubmitComment = async (
    e: React.FormEvent,
    parentId?: string | null
  ) => {
    e.preventDefault()
    if (!user || !commentContent.trim()) return

    setSubmitting(true)

    try {
      await supabase.from('comments').insert({
        post_id: id!,
        user_id: user.id,
        content: commentContent.trim(),
        parent_id: parentId ?? null,
      })

      setCommentContent('')
      setReplyingTo(null)
      fetchComments()
    } catch (err) {
      console.error('Error submitting comment:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReplyClick = (comment: CommentWithReplies) => {
    const name =
      comment.profiles?.display_name || comment.profiles?.username || '用户'
    setReplyingTo({ commentId: comment.id, username: name })
    setCommentContent(`@${name} `)
  }

  const handleCancelReply = () => {
    setReplyingTo(null)
    setCommentContent('')
  }

  const handleDelete = async () => {
    if (!confirm('确定要删除这个帖子吗？')) return

    await supabase.from('forum_posts').delete().eq('id', id!)
    navigate('/forum')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-black pt-24 flex items-center justify-center">
        <div className="text-2xl text-silver-medium font-cyber animate-pulse">
          加载中...
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-deep-black pt-24 flex items-center justify-center">
        <div className="text-2xl text-gray-500 font-mono">帖子不存在</div>
      </div>
    )
  }

  const isOwner = user?.id === post.user_id
  const commentTree = buildCommentTree(comments)
  const totalComments = countComments(commentTree)

  const replyForm = user ? (
    <ReplyForm
      commentContent={commentContent}
      setCommentContent={setCommentContent}
      onSubmit={handleSubmitComment}
      submitting={submitting}
      replyingTo={replyingTo}
      onCancelReply={handleCancelReply}
    />
  ) : null

  return (
    <div className="min-h-screen bg-deep-black pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => navigate('/forum')}
          className="flex items-center space-x-2 text-silver-light hover:text-silver-medium transition-colors duration-300 mb-6 font-mono"
        >
          <ArrowLeft size={20} />
          <span>返回版面</span>
        </button>

        {/* Post Content */}
        <div className="bg-surface-dark border-2 border-silver-medium/50 rounded-lg p-8 mb-8">
          <div className="mb-4">
            <span className="px-3 py-1 text-xs font-mono bg-silver-medium/10 border border-silver-medium text-silver-medium rounded-full uppercase">
              {post.category === 'chat' ? '闲聊' : '通用'}
            </span>
          </div>

          <h1 className="text-4xl font-cyber font-bold text-white mb-6">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-gray-400 font-mono text-sm mb-6 pb-6 border-b border-silver-medium/30">
            <div className="flex items-center space-x-2">
              <User size={16} className="text-silver-light" />
              <span>{post.profiles?.display_name || post.profiles?.username}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar size={16} className="text-silver-medium" />
              <span>
                {post.created_at &&
                  formatDistanceToNow(new Date(post.created_at), {
                    addSuffix: true,
                    locale: zhCN,
                  })}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <MessageCircle size={16} className="text-silver-main" />
              <span>{totalComments} 条评论</span>
            </div>
          </div>

          <div className="text-white font-mono leading-relaxed whitespace-pre-wrap mb-6">
            {post.content}
          </div>

          {isOwner && (
            <Button variant="destructive" onClick={handleDelete} size="sm">
              删除帖子
            </Button>
          )}
        </div>

        {/* Comments Section */}
        <div className="bg-surface-dark border-2 border-silver-light/50 rounded-lg p-8">
          <h2 className="text-2xl font-cyber font-bold text-silver-light mb-6 flex items-center space-x-2">
            <MessageCircle size={24} />
            <span>评论 ({totalComments})</span>
          </h2>

          {/* 未在回复时：评论框在顶部 */}
          {user && !replyingTo && replyForm}

          {!user && (
            <div className="mb-8 p-4 bg-grid-gray border border-silver-light/30 rounded text-center">
              <p className="text-gray-400 font-mono">
                请先{' '}
                <a
                  href="/login"
                  className="text-silver-light hover:text-silver-main transition-colors duration-300"
                >
                  登录
                </a>{' '}
                后再评论
              </p>
            </div>
          )}

          {/* 评论树：回复时评论框会出现在对应评论下方 */}
          <div className="space-y-4">
            {commentTree.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                depth={0}
                onReply={handleReplyClick}
                replyingToId={replyingTo?.commentId ?? null}
                replyForm={replyingTo?.commentId === comment.id ? replyForm : null}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

type CommentItemProps = {
  comment: CommentWithReplies
  depth: number
  onReply: (comment: CommentWithReplies) => void
  replyingToId: string | null
  replyForm: React.ReactNode
}

/**
 * 递归渲染单条评论：回复按钮、子回复缩进 + 左侧银色竖线
 * 当正在回复本条时，在下方渲染评论框
 */
function CommentItem({
  comment,
  depth,
  onReply,
  replyingToId,
  replyForm,
}: CommentItemProps) {
  const isReply = depth >= 1
  const indentClass = depth === 0 ? '' : depth === 1 ? 'ml-8' : 'ml-12'

  return (
    <div
      className={`${indentClass} ${
        isReply ? 'border-l-2 border-silver-light/30 pl-4' : ''
      }`}
    >
      <div
        className={`bg-grid-gray border rounded-lg p-4 transition-all duration-300 ${
          replyingToId === comment.id
            ? 'border-silver-light shadow-[0_0_20px_rgba(192,192,192,0.2)]'
            : 'border-silver-light/30 hover:border-silver-light/50'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-sm font-mono text-gray-400">
            <User size={14} className="text-silver-light" />
            <span className="text-white">
              {comment.profiles?.display_name || comment.profiles?.username}
            </span>
            <span>·</span>
            <span>
              {comment.created_at &&
                formatDistanceToNow(new Date(comment.created_at), {
                  addSuffix: true,
                  locale: zhCN,
                })}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onReply(comment)}
            className="text-xs font-mono text-silver-light hover:text-silver-main border border-silver-light/50 hover:border-silver-main/50 px-2 py-1 rounded transition-all duration-300"
          >
            回复
          </button>
        </div>
        <p className="text-white font-mono leading-relaxed whitespace-pre-wrap">
          {comment.content}
        </p>
      </div>

      {/* 点击回复本条时，评论框移到此评论下方 */}
      {replyingToId === comment.id && replyForm}

      {comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              onReply={onReply}
              replyingToId={replyingToId}
              replyForm={replyForm}
            />
          ))}
        </div>
      )}
    </div>
  )
}
