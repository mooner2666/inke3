import { Link, useNavigate } from 'react-router-dom'
import { Search, User, LogOut, BookOpen, MessageSquare } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'
import Button from './Button'
import InkeCityLogo from './InkeCityLogo'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-deep-black/95 backdrop-blur-md border-b-2 border-silver-main shadow-[0_0_20px_rgba(192,192,192,0.3)]">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="group">
            <div className="w-20 md:w-24 group-hover:scale-105 transition-transform duration-300">
              <InkeCityLogo animated={true} showText={true} />
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/works" className="flex items-center space-x-2 text-white hover:text-silver-main transition-colors duration-300 font-cyber">
              <BookOpen size={20} />
              <span>作品库</span>
            </Link>
            <Link to="/forum" className="flex items-center space-x-2 text-white hover:text-silver-medium transition-colors duration-300 font-cyber">
              <MessageSquare size={20} />
              <span>闲聊版面</span>
            </Link>
            <Link to="/search" className="flex items-center space-x-2 text-white hover:text-silver-light transition-colors duration-300 font-cyber">
              <Search size={20} />
              <span>搜索</span>
            </Link>
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to={`/profile/${user.id}`}>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <User size={18} />
                    <span>个人中心</span>
                  </Button>
                </Link>
                <Button variant="destructive" size="sm" onClick={handleSignOut} className="flex items-center space-x-2">
                  <LogOut size={18} />
                  <span>退出</span>
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="primary" size="sm">登录</Button>
                </Link>
                <Link to="/register">
                  <Button variant="accent" size="sm">注册</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
