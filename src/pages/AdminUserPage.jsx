import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSidebar } from '../hooks/useSidebar'
import SidebarToggleBtn from '../components/Sidebar/SidebarToggleBtn'

const NAV_ITEMS = [
  { key: 'dashboard',   label: '대시보드',    icon: '▦' },
  { key: 'users',       label: '사용자 관리',  icon: '👤' },
  { key: 'reports',     label: '신고 관리',    icon: '🔔' },
  { key: 'dangerzones', label: '위험구역 관리', icon: '📍' },
  { key: 'notices',     label: '공지사항',     icon: '📢' },
  { key: 'systemlog',   label: '시스템 로그',  icon: '📋' },
]

const STATUS_STYLE = {
  '정상':     { bg: '#00E676', color: '#000' },
  '주의':     { bg: '#FF9500', color: '#fff' },
  '블랙리스트': { bg: '#FF3B3B', color: '#fff' },
}

// 백엔드 연동 전 빈 상태
const EMPTY_STATS = { totalUsers: null, blacklistCount: null, todayJoin: null }
const EMPTY_USERS = []

export default function AdminUserPage({ user }) {
  const navigate = useNavigate()
  const { sidebarOpen, setSidebarOpen } = useSidebar()

  const [stats, setStats] = useState(EMPTY_STATS)
  const [users, setUsers] = useState(EMPTY_USERS)
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState('전체 상태')
  const [fakeFilter, setFakeFilter] = useState('허위신고')
  const [selectedUser, setSelectedUser] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [now, setNow] = useState(new Date())

  // 비관리자 접근 차단
  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      alert('관리자만 접근 가능합니다.')
      navigate('/')
    }
  }, [user])

  // 현재 시각 갱신
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // 백엔드 연동 시 주석 해제
  // useEffect(() => {
  //   const fetchUsers = async () => {
  //     const res = await fetch('/users')
  //     const json = await res.json()
  //     if (json.success) setUsers(json.data)
  //   }
  //   fetchUsers()
  // }, [])

  const handleNavClick = (key) => {
    if (key === 'dashboard') navigate('/admin')
    if (key === 'users')     navigate('/admin/users')
    if (key === 'reports')   navigate('/admin/reports')
  }

  const handleBlacklist = (userId) => {
    // PUT /users/{userId}/blacklist
  }

  const handleBlacklistRelease = (userId) => {
    // PUT /users/{userId}/blacklist/release
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
    navigate('/')
  }

  const formatDate = (date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const days = ['일', '월', '화', '수', '목', '금', '토']
    const day = days[date.getDay()]
    const h = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')
    const sec = String(date.getSeconds()).padStart(2, '0')
    return `${y}.${m}.${d} (${day}) ${h}:${min}:${sec}`
  }

  const s = styles

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#0D1117', position: 'relative' }}>

      {/* 사이드바 */}
      <aside style={{
        ...s.sidebar,
        width: sidebarOpen ? '200px' : '0px',
        padding: sidebarOpen ? '16px 12px' : '0',
        transition: 'width 0.3s ease, padding 0.3s ease',
      }}>
        <div style={s.logoRow}>
          <span style={{ fontSize: '20px' }}>🛡️</span>
          <span style={s.logoText}>Light Safe</span>
        </div>
        <div style={s.adminProfile}>
          <div style={s.adminAvatar}>관</div>
          <div>
            <div style={s.adminName}>관리자</div>
            <div style={s.adminEmail}>admin@lightsafe.kr</div>
          </div>
        </div>
        <div style={s.adminBadge}>관리자 모드</div>
        <div style={s.divider} />
        <nav style={{ flex: 1 }}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              style={{ ...s.navItem, ...(item.key === 'users' ? s.navItemActive : {}) }}
              onClick={() => handleNavClick(item.key)}
            >
              <span style={{ fontSize: '15px' }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div style={s.divider} />
        <button style={{ ...s.navItem, color: '#FF3B3B' }} onClick={handleLogout}>
          <span>🚪</span><span>로그아웃</span>
        </button>
      </aside>

      <SidebarToggleBtn isOpen={sidebarOpen} onClick={() => setSidebarOpen(prev => !prev)} />

      {/* 메인 콘텐츠 */}
      <main style={s.main}>

        {/* 헤더 */}
        <div style={s.header}>
          <h2 style={s.pageTitle}>사용자 관리</h2>
          <span style={s.dateText}>{formatDate(now)}</span>
        </div>

        <div style={s.scrollArea}>

        {/* 통계 카드 */}
        <div style={s.statsRow}>
        {[
            { icon: '👥', label: '전체 사용자', value: stats.totalUsers,    unit: '명', color: '#00E676' },
            { icon: '🚫', label: '블랙리스트',  value: stats.blacklistCount, unit: '명', color: '#FF3B3B' },
            { icon: '✨', label: '오늘 가입',   value: stats.todayJoin,     unit: '명', color: '#FFD600' },
        ].map(item => (
            <div key={item.label} style={s.statCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ ...s.statIcon, backgroundColor: item.color + '22' }}>
                <span style={{ fontSize: '28px' }}>{item.icon}</span>
                </div>
                <div>
                <div style={s.statLabel}>{item.label}</div>
                <div style={{ ...s.statValue, color: item.color }}>
                    {item.value !== null ? `${item.value.toLocaleString()}${item.unit}` : '-'}
                </div>
                </div>
            </div>
            </div>
        ))}
        </div>

          {/* 검색/필터 바 */}
          <div style={s.filterBar}>
            <div style={s.searchBox}>
              <input
                style={s.searchInput}
                placeholder="닉네임 또는 이메일 검색..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
              <span style={{ color: '#A0AEC0' }}>🔍</span>
            </div>
            <select
              style={s.select}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option>전체 상태</option>
              <option>정상</option>
              <option>주의</option>
              <option>블랙리스트</option>
            </select>
            <select
              style={s.select}
              value={fakeFilter}
              onChange={e => setFakeFilter(e.target.value)}
            >
              <option>허위신고</option>
              <option>0회</option>
              <option>1회</option>
              <option>2회 이상</option>
            </select>
            <button style={s.excelBtn}>⬇ 엑셀 다운로드</button>
          </div>

          {/* 사용자 테이블 */}
          <div style={s.tableCard}>
            <table style={s.table}>
              <thead>
                <tr>
                  {['번호', '닉네임', '아이디', '이메일', '가입일', '허위신고 횟수', '상태', '관리'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((u, idx) => (
                    <tr
                      key={u.userId}
                      style={{
                        ...s.tr,
                        ...(selectedUser?.userId === u.userId ? s.trSelected : {}),
                        ...(u.isBlacklisted ? s.trBlacklisted : {}),
                      }}
                      onClick={() => setSelectedUser(u)}
                    >
                      <td style={s.td}>{idx + 1}</td>
                      <td style={{ ...s.td, fontWeight: '600' }}>{u.nickname}</td>
                      <td style={s.td}>{u.username}</td>
                      <td style={s.td}>{u.email}</td>
                      <td style={s.td}>{u.createdAt}</td>
                      <td style={{
                        ...s.td,
                        color: u.fakeReports >= 2 ? '#FF3B3B' : '#fff',
                        fontWeight: u.fakeReports >= 2 ? '700' : '400',
                      }}>
                        {u.fakeReports ?? 0}회
                      </td>
                      <td style={s.td}>
                        <span style={{
                          ...s.badge,
                          backgroundColor: STATUS_STYLE[u.isBlacklisted ? '블랙리스트' : u.fakeReports >= 2 ? '주의' : '정상']?.bg,
                          color: STATUS_STYLE[u.isBlacklisted ? '블랙리스트' : u.fakeReports >= 2 ? '주의' : '정상']?.color,
                        }}>
                          {u.isBlacklisted ? '블랙리스트' : u.fakeReports >= 2 ? '주의' : '정상'}
                        </span>
                      </td>
                      <td style={s.td}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button style={s.detailBtn} onClick={(e) => { e.stopPropagation(); setSelectedUser(u) }}>상세보기</button>
                          {u.isBlacklisted ? (
                            <button style={s.releaseBtn} onClick={(e) => { e.stopPropagation(); handleBlacklistRelease(u.userId) }}>해제</button>
                          ) : (
                            <button style={s.blacklistBtn} onClick={(e) => { e.stopPropagation(); handleBlacklist(u.userId) }}>블랙리스트</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} style={{ ...s.td, textAlign: 'center', padding: '50px', color: '#A0AEC0' }}>
                      사용자 데이터가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* 페이지네이션 */}
            <div style={s.pagination}>
              <button style={s.pageBtn}>{'<'}</button>
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  style={{ ...s.pageBtn, ...(currentPage === n ? s.pageBtnActive : {}) }}
                  onClick={() => setCurrentPage(n)}
                >
                  {n}
                </button>
              ))}
              <button style={s.pageBtn}>{'...'}</button>
              <button style={s.pageBtn}>{'>'}</button>
            </div>
          </div>
        </div>
      </main>

      {/* 사용자 상세 패널 */}
      {selectedUser && (
        <aside style={s.detailPanel}>
          <div style={s.detailHeader}>
            <span style={s.detailTitle}>사용자 상세 정보</span>
            <button style={s.closeBtn} onClick={() => setSelectedUser(null)}>✕</button>
          </div>

          <div style={s.detailProfile}>
            <div style={s.detailAvatar}>{selectedUser.nickname?.charAt(0)}</div>
            <div>
              <div style={s.detailName}>{selectedUser.nickname}</div>
              {selectedUser.isBlacklisted && (
                <span style={{ ...s.badge, backgroundColor: '#FF3B3B', color: '#fff' }}>블랙리스트</span>
              )}
            </div>
          </div>

          <div style={s.detailInfoSection}>
            {[
              { label: '아이디',    value: selectedUser.username },
              { label: '이메일',    value: selectedUser.email },
              { label: '가입일',    value: selectedUser.createdAt },
              { label: '마지막 접속', value: selectedUser.lastActiveAt ?? '-' },
            ].map(item => (
              <div key={item.label} style={s.detailInfoRow}>
                <span style={s.detailInfoLabel}>{item.label}</span>
                <span style={s.detailInfoValue}>{item.value}</span>
              </div>
            ))}
          </div>

          <div style={s.detailDivider} />

          <div style={s.detailSection}>
            <div style={s.detailSectionTitle}>신고 내역</div>
            <div style={s.detailStatRow}>
              <div style={s.detailStatBox}>
                <div style={s.detailStatLabel}>총 신고 횟수</div>
                <div style={s.detailStatValue}>{selectedUser.totalReports ?? '-'}회</div>
              </div>
              <div style={s.detailStatBox}>
                <div style={s.detailStatLabel}>허위신고 횟수</div>
                <div style={{
                  ...s.detailStatValue,
                  color: (selectedUser.fakeReports ?? 0) > 0 ? '#FF3B3B' : '#fff',
                }}>
                  {selectedUser.fakeReports ?? '-'}회
                </div>
              </div>
            </div>
          </div>

          <div style={s.detailSection}>
            <div style={s.detailSectionTitle}>활동 내역</div>
            <div style={s.detailStatRow}>
              <div style={s.detailStatBox}>
                <div style={s.detailStatLabel}>작성 게시글 수</div>
                <div style={s.detailStatValue}>{selectedUser.postCount ?? '-'}개</div>
              </div>
              <div style={s.detailStatBox}>
                <div style={s.detailStatLabel}>작성 댓글 수</div>
                <div style={s.detailStatValue}>{selectedUser.commentCount ?? '-'}개</div>
              </div>
            </div>
          </div>

          <div style={s.detailDivider} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
            <button
              style={s.blacklistBtnFull}
              onClick={() => selectedUser.isBlacklisted
                ? handleBlacklistRelease(selectedUser.userId)
                : handleBlacklist(selectedUser.userId)
              }
            >
              {selectedUser.isBlacklisted ? '블랙리스트 해제' : '블랙리스트 등록'}
            </button>
            <button style={s.warnBtnFull}>✉ 경고 메시지 발송</button>
          </div>
        </aside>
      )}
    </div>
  )
}

const styles = {
  sidebar: { flexShrink: 0, height: '100vh', backgroundColor: '#0D1117', borderRight: '1px solid #1E2535', display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'hidden' },
  logoRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', whiteSpace: 'nowrap' },
  logoText: { color: '#fff', fontWeight: '700', fontSize: '16px' },
  adminProfile: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' },
  adminAvatar: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#00E676', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', flexShrink: 0 },
  adminName: { color: '#fff', fontSize: '13px', fontWeight: '600' },
  adminEmail: { color: '#A0AEC0', fontSize: '11px' },
  adminBadge: { display: 'inline-block', backgroundColor: '#00E676', color: '#000', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', marginBottom: '8px' },
  divider: { height: '1px', backgroundColor: '#1E2535', margin: '8px 0' },
  navItem: { display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 8px', backgroundColor: 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#A0AEC0', fontSize: '13px', textAlign: 'left', whiteSpace: 'nowrap' },
  navItemActive: { backgroundColor: '#00E676', color: '#000', fontWeight: '700' },
  main: { flex: 1, height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px 12px', borderBottom: '1px solid #1E2535', flexShrink: 0 },
  pageTitle: { color: '#fff', fontSize: '22px', fontWeight: '700', margin: 0 },
  dateText: { color: '#A0AEC0', fontSize: '13px' },
  scrollArea: { flex: 1, overflowY: 'auto', padding: '16px 28px', display: 'flex', flexDirection: 'column', gap: '16px' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' },
  statCard: { backgroundColor: '#161B27', borderRadius: '12px', padding: '20px', border: '1px solid #1E2535' },
  statIcon: { width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statLabel: { color: '#A0AEC0', fontSize: '13px', marginBottom: '4px' },
  statValue: { fontSize: '28px', fontWeight: '800' },
  filterBar: { display: 'flex', alignItems: 'center', gap: '10px' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#161B27', border: '1px solid #1E2535', borderRadius: '8px', padding: '10px 14px', flex: 1 },
  searchInput: { flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: '13px' },
  select: { backgroundColor: '#161B27', border: '1px solid #1E2535', borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '13px', cursor: 'pointer', outline: 'none' },
  excelBtn: { backgroundColor: 'transparent', border: '1px solid #2D3748', borderRadius: '8px', padding: '10px 16px', color: '#A0AEC0', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' },
  tableCard: { backgroundColor: '#161B27', borderRadius: '12px', border: '1px solid #1E2535', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { color: '#A0AEC0', fontSize: '12px', fontWeight: '600', padding: '12px 14px', textAlign: 'left', borderBottom: '1px solid #1E2535', backgroundColor: '#0D1117' },
  tr: { borderBottom: '1px solid #1E2535', cursor: 'pointer' },
  trSelected: { borderLeft: '3px solid #00E676', backgroundColor: 'rgba(0,230,118,0.05)' },
  trBlacklisted: { backgroundColor: 'rgba(255,59,59,0.05)' },
  td: { color: '#fff', fontSize: '13px', padding: '12px 14px' },
  badge: { display: 'inline-block', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '4px', whiteSpace: 'nowrap' },
  detailBtn: { backgroundColor: 'transparent', border: '1px solid #2D3748', borderRadius: '6px', padding: '5px 10px', color: '#A0AEC0', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' },
  blacklistBtn: { backgroundColor: 'transparent', border: '1px solid #FF3B3B', borderRadius: '6px', padding: '5px 10px', color: '#FF3B3B', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' },
  releaseBtn: { backgroundColor: '#00E676', border: 'none', borderRadius: '6px', padding: '5px 10px', color: '#000', fontSize: '12px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', padding: '16px' },
  pageBtn: { width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#0D1117', border: '1px solid #1E2535', color: '#A0AEC0', fontSize: '13px', cursor: 'pointer' },
  pageBtnActive: { backgroundColor: '#00E676', color: '#000', border: '1px solid #00E676', fontWeight: '700' },
  detailPanel: { width: '360px', flexShrink: 0, height: '100vh', backgroundColor: '#161B27', borderLeft: '1px solid #1E2535', padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0' },
  detailHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' },
  detailTitle: { color: '#fff', fontSize: '16px', fontWeight: '700' },
  closeBtn: { background: 'none', border: 'none', color: '#A0AEC0', fontSize: '18px', cursor: 'pointer' },
  detailProfile: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' },
  detailAvatar: { width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#00E676', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '700', flexShrink: 0 },
  detailName: { color: '#fff', fontSize: '20px', fontWeight: '700', marginBottom: '6px' },
  detailInfoSection: { marginBottom: '16px' },
  detailInfoRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1E2535' },
  detailInfoLabel: { color: '#A0AEC0', fontSize: '13px' },
  detailInfoValue: { color: '#fff', fontSize: '13px', fontWeight: '500' },
  detailDivider: { height: '1px', backgroundColor: '#1E2535', margin: '16px 0' },
  detailSection: { marginBottom: '16px' },
  detailSectionTitle: { color: '#fff', fontSize: '14px', fontWeight: '700', marginBottom: '12px' },
  detailStatRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  detailStatBox: { backgroundColor: '#0D1117', borderRadius: '8px', padding: '14px', border: '1px solid #1E2535', textAlign: 'center' },
  detailStatLabel: { color: '#A0AEC0', fontSize: '11px', marginBottom: '6px' },
  detailStatValue: { color: '#fff', fontSize: '22px', fontWeight: '700' },
  blacklistBtnFull: { width: '100%', backgroundColor: 'transparent', border: '1px solid #FF3B3B', borderRadius: '8px', padding: '12px', color: '#FF3B3B', fontWeight: '600', fontSize: '14px', cursor: 'pointer' },
  warnBtnFull: { width: '100%', backgroundColor: 'transparent', border: '1px solid #2D3748', borderRadius: '8px', padding: '12px', color: '#A0AEC0', fontWeight: '600', fontSize: '14px', cursor: 'pointer' },
}