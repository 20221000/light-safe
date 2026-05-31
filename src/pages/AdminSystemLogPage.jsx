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

const TYPE_STYLE = {
  USER:    { label: 'USER',    bg: '#3182CE', color: '#fff' },
  REPORT:  { label: 'REPORT',  bg: '#FF3B3B', color: '#fff' },
  DANGER:  { label: 'DANGER',  bg: '#FF9500', color: '#fff' },
  POST:    { label: 'POST',    bg: '#00E676', color: '#000' },
  COMMENT: { label: 'COMMENT', bg: '#4A5568', color: '#fff' },
}

export default function AdminSystemLogPage({ user }) {
  const navigate = useNavigate()
  const { sidebarOpen, setSidebarOpen } = useSidebar()

  const [logs, setLogs] = useState([])
  const [selectedLog, setSelectedLog] = useState(null)
  const [typeFilter, setTypeFilter] = useState('전체 유형')
  const [dateFilter, setDateFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [now, setNow] = useState(new Date())

  const stats = {
    total: logs.length,
    today: logs.filter(l => l.createdAt?.slice(0, 10) === new Date().toISOString().slice(0, 10)).length,
    reports: logs.filter(l => l.type === 'REPORT').length,
    users: logs.filter(l => l.type === 'USER').length,
  }

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
  //   const fetchLogs = async () => {
  //     const res = await fetch('/admin/logs', {
  //       headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
  //     })
  //     const json = await res.json()
  //     if (json.success) setLogs(json.data)
  //   }
  //   fetchLogs()
  //   const interval = setInterval(fetchLogs, 30000)
  //   return () => clearInterval(interval)
  // }, [])

  // 백엔드 응답 형식:
  // GET /admin/logs
  // [{ logId, type, action, detail, createdAt,
  //    relatedUserId, relatedUsername, relatedEmail,
  //    ipAddress, endpoint, browser, os }]

  const handleNavClick = (key) => {
    if (key === 'dashboard')   navigate('/admin')
    if (key === 'users')       navigate('/admin/users')
    if (key === 'reports')     navigate('/admin/reports')
    if (key === 'dangerzones') navigate('/admin/dangerzones')
    if (key === 'notices')     navigate('/admin/notices')
    if (key === 'systemlog')   navigate('/admin/systemlog')
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
    navigate('/')
  }

  const handleExport = () => {
    // 로그 내보내기 — CSV 다운로드
    // const csv = logs.map(l =>
    //   `${l.logId},${l.type},${l.action},${l.detail},${l.createdAt}`
    // ).join('\n')
    // const blob = new Blob([csv], { type: 'text/csv' })
    // const url = URL.createObjectURL(blob)
    // const a = document.createElement('a')
    // a.href = url; a.download = 'system_logs.csv'; a.click()
    window.alert('로그 내보내기 기능은 백엔드 연동 후 사용 가능합니다.')
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

  const filteredLogs = logs.filter(l => {
    const matchType = typeFilter === '전체 유형' || l.type === typeFilter
    const matchDate = !dateFilter || l.createdAt?.slice(0, 10) === dateFilter
    const matchSearch = !searchInput || l.detail?.includes(searchInput) || l.action?.includes(searchInput)
    return matchType && matchDate && matchSearch
  })

  const PAGE_SIZE = 10
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE))
  const pagedLogs = filteredLogs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

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
              style={{ ...s.navItem, ...(item.key === 'systemlog' ? s.navItemActive : {}) }}
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
          <h2 style={s.pageTitle}>시스템 로그</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={s.dateText}>{formatDate(now)}</span>
            <button style={s.bellBtn}>🔔</button>
          </div>
        </div>

        <div style={s.scrollArea}>

          {/* KPI 카드 */}
          <div style={s.kpiRow}>
            {[
              { icon: '📋', label: '전체 로그',  value: stats.total,   unit: '건', color: '#00E676' },
              { icon: '📅', label: '오늘 활동',  value: stats.today,   unit: '건', color: '#3182CE' },
              { icon: '🚨', label: '신고 로그',  value: stats.reports, unit: '건', color: '#FF3B3B' },
              { icon: '👤', label: '사용자 로그', value: stats.users,   unit: '건', color: '#FFD600' },
            ].map(item => (
              <div key={item.label} style={s.kpiCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ ...s.kpiIcon, backgroundColor: item.color + '22' }}>
                    <span style={{ fontSize: '24px' }}>{item.icon}</span>
                  </div>
                  <div>
                    <div style={s.kpiLabel}>{item.label}</div>
                    <div style={{ ...s.kpiValue, color: item.color }}>
                      {item.value !== null ? `${item.value.toLocaleString()}${item.unit}` : '-'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 로그 테이블 + 상세 패널 */}
          <div style={s.contentRow}>

            {/* 테이블 영역 */}
            <div style={s.tableArea}>

              {/* 필터 바 */}
              <div style={s.filterBar}>
                <select
                  style={s.select}
                  value={typeFilter}
                  onChange={e => { setTypeFilter(e.target.value); setCurrentPage(1) }}
                >
                  <option>전체 유형</option>
                  <option>USER</option>
                  <option>REPORT</option>
                  <option>DANGER</option>
                  <option>POST</option>
                  <option>COMMENT</option>
                </select>
                <input
                  style={s.dateInput}
                  type="date"
                  value={dateFilter}
                  onChange={e => { setDateFilter(e.target.value); setCurrentPage(1) }}
                />
                <div style={s.searchBox}>
                  <input
                    style={s.searchInput}
                    placeholder="로그 내용 검색..."
                    value={searchInput}
                    onChange={e => { setSearchInput(e.target.value); setCurrentPage(1) }}
                  />
                  <span style={{ color: '#A0AEC0' }}>🔍</span>
                </div>
                <button style={s.exportBtn} onClick={handleExport}>⬇ 로그 내보내기</button>
              </div>

              {/* 테이블 */}
              <div style={s.tableCard}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {['번호', '유형', '액션', '상세 내용', '발생 시각'].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pagedLogs.length > 0 ? (
                      pagedLogs.map((log, idx) => (
                        <tr
                          key={log.logId}
                          style={{
                            ...s.tr,
                            ...(selectedLog?.logId === log.logId ? s.trSelected : {}),
                            backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                          }}
                          onClick={() => setSelectedLog(log)}
                        >
                          <td style={s.td}>{(currentPage - 1) * PAGE_SIZE + idx + 1}</td>
                          <td style={s.td}>
                            <span style={{
                              ...s.badge,
                              backgroundColor: TYPE_STYLE[log.type]?.bg ?? '#4A5568',
                              color: TYPE_STYLE[log.type]?.color ?? '#fff',
                            }}>
                              {TYPE_STYLE[log.type]?.label ?? log.type}
                            </span>
                          </td>
                          <td style={{ ...s.td, fontWeight: '600' }}>{log.action}</td>
                          <td style={{ ...s.td, color: '#A0AEC0' }}>{log.detail}</td>
                          <td style={{ ...s.td, color: '#A0AEC0', whiteSpace: 'nowrap' }}>{log.createdAt}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} style={{ ...s.td, textAlign: 'center', padding: '50px', color: '#A0AEC0' }}>
                          로그 데이터가 없습니다.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* 페이지네이션 */}
              <div style={s.pagination}>
                <button style={s.pageBtn} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>{'<'}</button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    style={{ ...s.pageBtn, ...(currentPage === n ? s.pageBtnActive : {}) }}
                    onClick={() => setCurrentPage(n)}
                  >
                    {n}
                  </button>
                ))}
                {totalPages > 5 && <button style={s.pageBtn}>...</button>}
                <button style={s.pageBtn} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>{'>'}</button>
              </div>
            </div>

            {/* 로그 상세 패널 */}
            <div style={s.detailPanel}>
              <div style={s.detailTitle}>로그 상세</div>

              {selectedLog ? (
                <>
                  <div style={s.detailSection}>
                    <div style={s.detailSectionLabel}>유형</div>
                    <span style={{
                      ...s.badge,
                      backgroundColor: TYPE_STYLE[selectedLog.type]?.bg ?? '#4A5568',
                      color: TYPE_STYLE[selectedLog.type]?.color ?? '#fff',
                      fontSize: '13px', padding: '4px 12px',
                    }}>
                      {selectedLog.type}
                    </span>
                  </div>

                  <div style={s.detailSection}>
                    <div style={s.detailSectionLabel}>액션</div>
                    <div style={s.detailAction}>{selectedLog.action}</div>
                  </div>

                  <div style={s.detailSection}>
                    <div style={s.detailSectionLabel}>상세 내용</div>
                    <div style={s.detailText}>{selectedLog.detail}</div>
                  </div>

                  <div style={s.detailSection}>
                    <div style={s.detailSectionLabel}>발생 시각</div>
                    <div style={s.detailText}>🕐 {selectedLog.createdAt}</div>
                  </div>

                  <div style={s.detailDivider} />

                  <div style={s.detailSection}>
                    <div style={s.detailSectionLabel}>관련 정보</div>
                    {[
                      { label: 'userId',   value: selectedLog.relatedUserId },
                      { label: 'username', value: selectedLog.relatedUsername },
                      { label: 'email',    value: selectedLog.relatedEmail },
                      { label: 'IP 주소',  value: selectedLog.ipAddress },
                      { label: '접속 경로', value: selectedLog.endpoint },
                      { label: '브라우저', value: selectedLog.browser },
                      { label: '운영체제', value: selectedLog.os },
                    ].map(item => item.value && (
                      <div key={item.label} style={s.detailInfoRow}>
                        <span style={s.detailInfoLabel}>{item.label}</span>
                        <span style={s.detailInfoValue}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={s.emptyDetail}>
                  로그를 선택하면<br />상세 정보가 표시됩니다.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
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
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px 12px', borderBottom: '1px solid #1E2535', flexShrink: 0 },
  pageTitle: { color: '#fff', fontSize: '22px', fontWeight: '700', margin: 0 },
  dateText: { color: '#A0AEC0', fontSize: '13px' },
  bellBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' },
  scrollArea: { flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '16px' },
  kpiRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', flexShrink: 0 },
  kpiCard: { backgroundColor: '#161B27', borderRadius: '12px', padding: '16px', border: '1px solid #1E2535' },
  kpiIcon: { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  kpiLabel: { color: '#A0AEC0', fontSize: '12px', marginBottom: '4px' },
  kpiValue: { fontSize: '22px', fontWeight: '800' },
  contentRow: { display: 'flex', gap: '16px', flex: 1 },
  tableArea: { flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'hidden' },
  filterBar: { display: 'flex', gap: '8px', flexShrink: 0 },
  select: { backgroundColor: '#161B27', border: '1px solid #1E2535', borderRadius: '8px', padding: '9px 12px', color: '#fff', fontSize: '12px', cursor: 'pointer', outline: 'none' },
  dateInput: { backgroundColor: '#161B27', border: '1px solid #1E2535', borderRadius: '8px', padding: '9px 12px', color: '#fff', fontSize: '12px', outline: 'none', cursor: 'pointer' },
  searchBox: { flex: 1, display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#161B27', border: '1px solid #1E2535', borderRadius: '8px', padding: '9px 14px' },
  searchInput: { flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: '13px' },
  exportBtn: { backgroundColor: 'transparent', border: '1px solid #2D3748', borderRadius: '8px', padding: '9px 16px', color: '#A0AEC0', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' },
  tableCard: { backgroundColor: '#161B27', borderRadius: '12px', border: '1px solid #1E2535', overflow: 'auto', flex: 1 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { color: '#A0AEC0', fontSize: '12px', fontWeight: '600', padding: '12px 14px', textAlign: 'left', borderBottom: '1px solid #1E2535', backgroundColor: '#0D1117', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid #1E2535', cursor: 'pointer' },
  trSelected: { borderLeft: '3px solid #00E676', backgroundColor: 'rgba(0,230,118,0.05)' },
  td: { color: '#fff', fontSize: '13px', padding: '11px 14px' },
  badge: { display: 'inline-block', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '4px', whiteSpace: 'nowrap' },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', flexShrink: 0 },
  pageBtn: { width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#161B27', border: '1px solid #1E2535', color: '#A0AEC0', fontSize: '13px', cursor: 'pointer' },
  pageBtnActive: { backgroundColor: '#00E676', color: '#000', border: '1px solid #00E676', fontWeight: '700' },
  detailPanel: { width: '280px', flexShrink: 0, backgroundColor: '#161B27', borderRadius: '12px', border: '1px solid #1E2535', padding: '16px', overflowY: 'auto' },
  detailTitle: { color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '16px' },
  detailSection: { marginBottom: '14px' },
  detailSectionLabel: { color: '#A0AEC0', fontSize: '11px', fontWeight: '600', marginBottom: '6px' },
  detailAction: { color: '#fff', fontSize: '20px', fontWeight: '700' },
  detailText: { color: '#E2E8F0', fontSize: '13px', lineHeight: '1.5' },
  detailDivider: { height: '1px', backgroundColor: '#1E2535', margin: '14px 0' },
  detailInfoRow: { display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #1E2535' },
  detailInfoLabel: { color: '#A0AEC0', fontSize: '11px' },
  detailInfoValue: { color: '#fff', fontSize: '11px', fontWeight: '500', textAlign: 'right', maxWidth: '160px', wordBreak: 'break-all' },
  emptyDetail: { color: '#A0AEC0', fontSize: '13px', textAlign: 'center', padding: '40px 0', lineHeight: '1.8' },
}