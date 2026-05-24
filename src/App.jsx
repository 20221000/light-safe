import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Sidebar from './components/Sidebar/Sidebar'
import MapView from './components/Map/MapView'
import RightPanel from './components/RightPanel/RightPanel'
import SosButton from './components/SosButton/SosButton'
import { useSafetyData } from './hooks/useSafetyData'
import './App.css'

export default function App() {
  // 'main' | 'login' | 'register'
  const [page, setPage] = useState('main')
  const [user, setUser] = useState(null)

  const { safetyStats, dangerZones, lastUpdated, isLoading } = useSafetyData()
  const [filters, setFilters] = useState({
    cctv: true, streetLamp: true, safeZone: true,
  })

  const handleLogin = (userData) => {
    setUser(userData)
    setPage('main')
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('accessToken')
    setPage('main')
  }

  if (page === 'login') {
    return (
      <LoginPage
        onLogin={handleLogin}
        onGoRegister={() => setPage('register')}
        onClose={() => setPage('main')}
      />
    )
  }

  if (page === 'register') {
    return (
      <RegisterPage
        onGoLogin={() => setPage('login')}
        onClose={() => setPage('main')}
      />
    )
  }

  return (
    <div style={{
      display: 'flex', height: '100vh', width: '100vw',
      overflow: 'hidden', backgroundColor: '#0D1117',
    }}>
      <Sidebar
        filters={filters}
        onFilterChange={key => setFilters(prev => ({ ...prev, [key]: !prev[key] }))}
        user={user}
        onLogout={handleLogout}
        onGoLogin={() => setPage('login')}
      />
      <main style={{ flex: 1, height: '100vh', position: 'relative', overflow: 'hidden' }}>
        <MapView filters={filters} />
        <SosButton />
      </main>
      <RightPanel
        safetyStats={safetyStats}
        dangerZones={dangerZones}
        lastUpdated={lastUpdated}
        isLoading={isLoading}
      />
    </div>
  )
}