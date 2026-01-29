import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'
import Button from '@/components/Button'
import { Mail, Lock } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
      navigate('/')
    } catch (err: any) {
      setError(err.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-deep-black flex items-center justify-center px-4 pt-20">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-surface-dark border-2 border-silver-main rounded-lg p-8 shadow-[0_0_30px_rgba(176,38,255,0.3)] relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(176,38,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(176,38,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />

          <div className="relative z-10">
            {/* Title */}
            <h1 className="text-4xl font-cyber font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-silver-main to-silver-medium">
              登录
            </h1>
            <p className="text-center text-gray-400 font-mono mb-8">
              欢迎回到万维银客城
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-warning-red/10 border border-warning-red rounded text-warning-red text-sm font-mono">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-mono text-silver-light mb-2">
                  邮箱
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-silver-main" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-deep-black border-2 border-silver-main/50 focus:border-silver-main rounded pl-12 pr-4 py-3 text-white font-mono outline-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(176,38,255,0.5)]"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-mono text-silver-light mb-2">
                  密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-silver-main" size={20} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-deep-black border-2 border-silver-main/50 focus:border-silver-main rounded pl-12 pr-4 py-3 text-white font-mono outline-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(176,38,255,0.5)]"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? '登录中...' : '登录'}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center text-sm font-mono text-gray-400">
              还没有账号？{' '}
              <Link to="/register" className="text-silver-light hover:text-silver-main transition-colors duration-300">
                立即注册
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
