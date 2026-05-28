import { useState } from 'react'

const NAV_ITEMS = [
  { key: 'map',       label: '지도',     icon: '🗺️' },
  { key: 'route',     label: '경로 안내', icon: '🧭' },
  { key: 'community', label: '커뮤니티',  icon: '💬' },
  { key: 'myinfo',    label: '내 정보',   icon: '👤' },
]

export default function Sidebar({ filters, onFilterChange, user, onLogout, onGoLogin, onNavigate, activePage, isOpen }) {
  const s = styles
  const avatarChar = user?.nickname?.charAt(0) ?? '?'

  return (
    <aside style={{
      ...s.sidebar,
      width: isOpen ? '200px' : '0px',
      padding: isOpen ? '16px 12px' : '0',
      transition: 'width 0.3s ease, padding 0.3s ease',
    }}>

      <div style={s.logoRow}>
        <span style={s.logoIcon}>🛡️</span>
        <span style={s.logoText}>Light Safe</span>
      </div>

      <div style={s.profileRow}>
        <div style={s.avatar}>{user ? avatarChar : '?'}</div>
        <div style={{ overflow: 'hidden' }}>
          <div style={s.profileName}>{user ? user.nickname : '비로그인'}</div>
          <div style={s.profileEmail}>{user ? user.username : '로그인이 필요합니다'}</div>
        </div>
      </div>

      <div style={s.divider} />

      <div style={s.card}>
        <div style={s.cardTitle}>지도 표시 설정</div>
        <ToggleRow color="#00E676" label="CCTV"    checked={filters.cctv}       onChange={() => onFilterChange('cctv')} />
        <ToggleRow color="#FFD600" label="가로등"  checked={filters.streetLamp} onChange={() => onFilterChange('streetLamp')} />
        <ToggleRow color="#00E676" label="안전 구역" checked={filters.safeZone} onChange={() => onFilterChange('safeZone')} />
      </div>

      <div style={{ flex: 1 }} />

      <nav>
        {NAV_ITEMS.map(item => (
          <button
            key={item.key}
            style={{
              ...s.navItem,
              ...(activePage === item.key ? s.navItemActive : {}),
            }}
            onClick={() => onNavigate(item.key)}
          >
            <span style={s.navIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}

        <div style={{ ...s.divider, margin: '8px 0' }} />

        {user ? (
          <button style={{ ...s.navItem, color: '#FF3B3B' }} onClick={onLogout}>
            <span style={s.navIcon}>🚪</span>
            <span>로그아웃</span>
          </button>
        ) : (
          <button style={{ ...s.navItem, color: '#00E676' }} onClick={onGoLogin}>
            <span style={s.navIcon}>🔑</span>
            <span>로그인</span>
          </button>
        )}
      </nav>
    </aside>
  )
}

function ToggleRow({ color, label, checked, onChange }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '6px 0',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{
          width: '8px', height: '8px', borderRadius: '50%',
          backgroundColor: color, display: 'inline-block',
        }} />
        <span style={{ color: '#fff', fontSize: '13px' }}>{label}</span>
      </div>
      <div
        onClick={onChange}
        style={{
          width: '36px', height: '20px', borderRadius: '10px',
          backgroundColor: checked ? color : '#374151',
          cursor: 'pointer', position: 'relative',
          transition: 'background-color 0.2s',
        }}
      >
        <div style={{
          position: 'absolute', top: '2px',
          left: checked ? '18px' : '2px',
          width: '16px', height: '16px', borderRadius: '50%',
          backgroundColor: '#fff', transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }} />
      </div>
    </div>
  )
}

const styles = {
  sidebar: {
    flexShrink: 0, height: '100vh',
    backgroundColor: '#0D1117', borderRight: '1px solid #1E2535',
    display: 'flex', flexDirection: 'column',
    overflowY: 'auto', overflowX: 'hidden',
  },
  logoRow: {
    display: 'flex', alignItems: 'center', gap: '8px',
    marginBottom: '16px', whiteSpace: 'nowrap',
  },
  logoIcon: { fontSize: '20px' },
  logoText: { color: '#fff', fontWeight: '700', fontSize: '16px', letterSpacing: '-0.3px' },
  profileRow: {
    display: 'flex', alignItems: 'center', gap: '10px',
    marginBottom: '16px', whiteSpace: 'nowrap',
  },
  avatar: {
    width: '36px', height: '36px', borderRadius: '50%',
    backgroundColor: '#1E2535', border: '1px solid #2D3748',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#A0AEC0', fontSize: '13px', fontWeight: '600', flexShrink: 0,
  },
  profileName: {
    color: '#fff', fontSize: '13px', fontWeight: '600',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  profileEmail: {
    color: '#A0AEC0', fontSize: '11px', marginTop: '1px',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  divider: { height: '1px', backgroundColor: '#1E2535', margin: '8px 0' },
  card: {
    backgroundColor: '#161B27', borderRadius: '10px',
    padding: '12px', marginBottom: '8px', border: '1px solid #1E2535',
    whiteSpace: 'nowrap',
  },
  cardTitle: {
    color: '#fff', fontSize: '12px', fontWeight: '600',
    marginBottom: '10px', letterSpacing: '0.3px',
  },
  navItem: {
    display: 'flex', alignItems: 'center', gap: '10px',
    width: '100%', padding: '10px 8px',
    backgroundColor: 'transparent', border: 'none',
    borderRadius: '8px', cursor: 'pointer',
    color: '#A0AEC0', fontSize: '13px', textAlign: 'left',
    whiteSpace: 'nowrap',
  },
  navItemActive: { backgroundColor: '#00E676', color: '#000', fontWeight: '700' },
  navIcon: { fontSize: '15px' },
}