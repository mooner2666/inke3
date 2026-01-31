import { Link, useNavigate } from 'react-router-dom'
import { Search, User, LogOut, BookOpen, MessageSquare, Menu, X } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'
import Button from './Button'
import NotificationBell from '@/components/NotificationBell'
import { useState } from 'react'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
    setMobileMenuOpen(false)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-deep-black/95 backdrop-blur-md border-b-2 border-silver-main shadow-[0_0_20px_rgba(192,192,192,0.3)]">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="group" onClick={closeMobileMenu}>
            <img 
              src="/万维银客城横版 logo.png" 
              alt="万维银客城" 
              className="h-12 md:h-16 w-auto hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            />
          </Link>

          {/* Desktop Navigation Links */}
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

          {/* Right Section: Notification + User + Mobile Menu */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {user ? (
              <>
                <NotificationBell />
                <Link to={`/profile/${user.id}`} className="hidden md:block">
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <User size={18} />
                    <span>个人中心</span>
                  </Button>
                </Link>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleSignOut} 
                  className="hidden md:flex items-center space-x-2"
                >
                  <LogOut size={18} />
                  <span>退出</span>
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="hidden md:block">
                  <Button variant="primary" size="sm">登录</Button>
                </Link>
                <Link to="/register" className="hidden md:block">
                  <Button variant="accent" size="sm">注册</Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-silver-light hover:text-silver-main transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-silver-main/30 pt-4">
            <div className="flex flex-col space-y-3">
              {/* Navigation Links */}
              <Link 
                to="/works" 
                onClick={closeMobileMenu}
                className="flex items-center space-x-3 text-white hover:text-silver-main transition-colors duration-300 font-cyber py-2 px-2 rounded hover:bg-silver-main/10"
              >
                <BookOpen size={20} />
                <span>作品库</span>
              </Link>
              <Link 
                to="/forum" 
                onClick={closeMobileMenu}
                className="flex items-center space-x-3 text-white hover:text-silver-medium transition-colors duration-300 font-cyber py-2 px-2 rounded hover:bg-silver-medium/10"
              >
                <MessageSquare size={20} />
                <span>闲聊版面</span>
              </Link>
              <Link 
                to="/search" 
                onClick={closeMobileMenu}
                className="flex items-center space-x-3 text-white hover:text-silver-light transition-colors duration-300 font-cyber py-2 px-2 rounded hover:bg-silver-light/10"
              >
                <Search size={20} />
                <span>搜索</span>
              </Link>

              {/* User Section */}
              {user ? (
                <>
                  <div className="border-t border-silver-main/30 pt-3 mt-2" />
                  <Link 
                    to={`/profile/${user.id}`}
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-3 text-white hover:text-silver-main transition-colors duration-300 font-cyber py-2 px-2 rounded hover:bg-silver-main/10"
                  >
                    <User size={20} />
                    <span>个人中心</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-3 text-warning-red hover:text-red-400 transition-colors duration-300 font-cyber py-2 px-2 rounded hover:bg-warning-red/10 w-full text-left"
                  >
                    <LogOut size={20} />
                    <span>退出</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="border-t border-silver-main/30 pt-3 mt-2" />
                  <Link to="/login" onClick={closeMobileMenu}>
                    <Button variant="primary" size="sm" className="w-full">登录</Button>
                  </Link>
                  <Link to="/register" onClick={closeMobileMenu}>
                    <Button variant="accent" size="sm" className="w-full mt-2">注册</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}