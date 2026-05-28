import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import MainPage from './pages/MainPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import RoutePage from './pages/RoutePage'
import CommunityPage from './pages/CommunityPage'
import MyInfoPage from './pages/MyInfoPage'
import PostDetailPage from './pages/PostDetailPage'
import PostWritePage from './pages/PostWritePage'
import './App.css'

function AppRoutes() {
  const navigate = useNavigate()

  // localStorage에서 유저 정보 복원
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const handleLogin = (userData) => {
    setUser(userData)
    // 유저 정보 localStorage에 저장
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
  }

  // 토큰 만료 체크 — 백엔드 연동 시 활성화
  // useEffect(() => {
  //   const token = localStorage.getItem('accessToken')
  //   if (!token && user) {
  //     handleLogout()
  //     navigate('/login')
  //   }
  // }, [])

  return (
    <Routes>
      <Route path="/" element={<MainPage user={user} onLogout={handleLogout} onGoLogin={() => navigate('/login')} />} />
      <Route path="/login" element={<LoginPage onLogin={(userData) => { handleLogin(userData); navigate('/') }} onGoRegister={() => navigate('/register')} onClose={() => navigate('/')} />} />
      <Route path="/register" element={<RegisterPage onGoLogin={() => navigate('/login')} onClose={() => navigate('/')} />} />
      <Route path="/route" element={<RoutePage user={user} onLogout={handleLogout} />} />
      <Route path="/community" element={<CommunityPage user={user} onLogout={handleLogout} />} />
      <Route path="/community/write" element={<PostWritePage user={user} onLogout={handleLogout} />} />
      <Route path="/community/:postId" element={<PostDetailPage user={user} onLogout={handleLogout} />} />
      <Route path="/myinfo" element={<MyInfoPage user={user} onLogout={handleLogout} />} />
    </Routes>
  )
}

export default function App() {
  return <AppRoutes />
}