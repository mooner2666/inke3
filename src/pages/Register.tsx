import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'
import Button from '@/components/Button'
import { Mail, Lock, User as UserIcon, Type } from 'lucide-react'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('密码不匹配')
      return
    }

    if (password.length < 6) {
      setError('密码至少需要6个字符')
      return
    }

    setLoading(true)

    try {
      await signUp(email, password, username, displayName)
      navigate('/')
    } catch (err: any) {
      setError(err.message || '注册失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-deep-black flex items-center justify-center px-4 pt-20 pb-10">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-surface-dark border-2 border-silver-light rounded-lg p-8 shadow-[0_0_30px_rgba(0,240,255,0.3)] relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />

          <div className="relative z-10">
            {/* Title */}
            <h1 className="text-4xl font-cyber font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-silver-light to-silver-main">
              注册
            </h1>
            <p className="text-center text-gray-400 font-mono mb-8">
              加入万维银客城社区
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-warning-red/10 border border-warning-red rounded text-warning-red text-sm font-mono">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-mono text-silver-light mb-2">
                  邮箱
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-silver-light" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-deep-black border-2 border-silver-light/50 focus:border-silver-light rounded pl-12 pr-4 py-3 text-white font-mono outline-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(0,240,255,0.5)]"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-mono text-silver-light mb-2">
                  用户名
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-silver-light" size={20} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full bg-deep-black border-2 border-silver-light/50 focus:border-silver-light rounded pl-12 pr-4 py-3 text-white font-mono outline-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(0,240,255,0.5)]"
                    placeholder="username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-mono text-silver-light mb-2">
                  显示名称
                </label>
                <div className="relative">
                  <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-silver-light" size={20} />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className="w-full bg-deep-black border-2 border-silver-light/50 focus:border-silver-light rounded pl-12 pr-4 py-3 text-white font-mono outline-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(0,240,255,0.5)]"
                    placeholder="Display Name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-mono text-silver-light mb-2">
                  密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-silver-light" size={20} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-deep-black border-2 border-silver-light/50 focus:border-silver-light rounded pl-12 pr-4 py-3 text-white font-mono outline-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(0,240,255,0.5)]"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-mono text-silver-light mb-2">
                  确认密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-silver-light" size={20} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full bg-deep-black border-2 border-silver-light/50 focus:border-silver-light rounded pl-12 pr-4 py-3 text-white font-mono outline-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(0,240,255,0.5)]"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="accent"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? '注册中...' : '注册'}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center text-sm font-mono text-gray-400">
              已有账号？{' '}
              <Link to="/login" className="text-silver-main hover:text-silver-light transition-colors duration-300">
                立即登录
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
