import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/lib/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute.tsx'  // 去掉 default
import Navbar from '@/components/Navbar'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Works from '@/pages/Works'
import WorkDetail from '@/pages/WorkDetail'
import NewWork from '@/pages/NewWork'
import Forum from '@/pages/Forum'
import ForumDetail from '@/pages/ForumDetail'
import NewPost from '@/pages/NewPost'
import Search from '@/pages/Search'
import Profile from '@/pages/Profile'
import { Toaster } from '@/components/Toaster'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster />  {/* ← 添加这行 */}
        <div className="min-h-screen bg-deep-black">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/works" element={<Works />} />
            <Route path="/works/:id" element={<WorkDetail />} />
            <Route path="/works/new" element={
              <ProtectedRoute>
                <NewWork />
              </ProtectedRoute>
            } />

            <Route path="/forum" element={<Forum />} />
            <Route path="/forum/:id" element={<ForumDetail />} />
            <Route path="/forum/new" element={
              <ProtectedRoute>
                <NewPost />
              </ProtectedRoute>
            } />

            <Route path="/search" element={<Search />} />
            <Route path="/profile/:id" element={<Profile />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App