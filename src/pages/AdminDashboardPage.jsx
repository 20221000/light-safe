import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSidebar } from '../hooks/useSidebar'
import SidebarToggleBtn from '../components/Sidebar/SidebarToggleBtn'

const EMPTY_STATS = { totalUsers: null, todayReports: null, activeDangerZones: null, blacklistCount: null }
const EMPTY_REPORTS = []
const EMPTY_DANGER_ZONES = []
const EMPTY_USERS = []

const NAV_ITEMS = [
  { key: 'dashboard',   label: '대시보드',    icon: '▦' },
  { key: 'users',       label: '사용자 관리',  icon: '👤' },
  { key: 'reports',     label: '신고 관리',    icon: '🔔' },
  { key: 'dangerzones', label: '위험구역 관리', icon: '📍' },
  { key: 'notices',     label: '공지사항',     icon: '📢' },
  { key: 'systemlog',   label: '시스템 로그',  icon: '📋' },
]

const STATUS_STYLE = {
  REPORTED:   { label: '접수됨',   bg: '#FF3B3B', color: '#fff' },
  PROCESSING: { label: '처리중',   bg: '#FF9500', color: '#fff' },
  RESOLVED:   { label: '해결완료', bg: '#00E676', color: '#000' },
}

const LEVEL_STYLE = {
  HIGH:   { bg: '#FF3B3B', color: '#fff' },
  MEDIUM: { bg: '#FF9500', color: '#fff' },
  LOW:    { bg: '#00E676', color: '#000' },
}

export default function AdminDashboardPage({ user }) {
  const navigate = useNavigate()
  const { sidebarOpen, setSidebarOpen } = useSidebar()

  const [stats, setStats] = useState(EMPTY_STATS)
  const [reports, setReports] = useState(EMPTY_REPORTS)
  const [dangerZones, setDangerZones] = useState(EMPTY_DANGER_ZONES)
  const [users, setUsers] = useState(EMPTY_USERS)
  const [chartData, setChartData] = useState([])
  const [noticeTitle, setNoticeTitle] = useState('')
  const [noticeContent, setNoticeContent] = useState('')
  const [floatingAlert, setFloatingAlert] = useState(null)
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
  //   const fetchAll = async () => {
  //     const [statsRes, reportsRes, zonesRes, usersRes, chartRes] = await Promise.all([
  //       fetch('/admin/stats'),
  //       fetch('/emergency-reports'),
  //       fetch('/danger-zones'),
  //       fetch('/users'),
  //       fetch('/admin/reports/stats?days=7'),
  //     ])
  //     const statsJson = await statsRes.json()
  //     const reportsJson = await reportsRes.json()
  //     const zonesJson = await zonesRes.json()
  //     const usersJson = await usersRes.json()
  //     const chartJson = await chartRes.json()
  //     if (statsJson.success)   setStats(statsJson.data)
  //     if (reportsJson.success) setReports(reportsJson.data)
  //     if (zonesJson.success)   setDangerZones(zonesJson.data)
  //     if (usersJson.success)   setUsers(usersJson.data)
  //     if (chartJson.success)   setChartData(chartJson.data)
  //     // chartJson.data 형식: [{ day: 'Mon', date: '05.14', count: 12 }, ...]
  //   }
  //   fetchAll()
  //   const interval = setInterval(fetchAll, 30000)
  //   return () => clearInterval(interval)
  // }, [])

  const handleReportProcess = (reportId) => {
    // PUT /emergency-reports/{reportId}/status
  }

  const handleFalseReport = (reportId) => {
    // PUT /emergency-reports/{reportId}/false-report
  }

  const handleDangerZoneUpdate = (zoneId) => {
    // PUT /danger-zones/{zoneId}/level
  }

  const handleDangerZoneOff = (zoneId) => {
    // PUT /danger-zones/{zoneId}/off
  }

  const handleBlacklist = (userId) => {
    // 블랙리스트 처리
  }

  const handleNoticeSubmit = async () => {
    if (!noticeTitle.trim() || !noticeContent.trim()) {
      window.alert('제목과 내용을 입력해주세요.')
      return
    }
    // POST /posts/admin/notices
    // await fetch('/posts/admin/notices', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ title: noticeTitle, content: noticeContent, adminUserId: 1 }),
    // })
    window.alert('공지사항이 등록되었습니다.')
    setNoticeTitle('')
    setNoticeContent('')
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
    navigate('/')
  }

  const handleNavClick = (key) => {
    if (key === 'dashboard')   navigate('/admin')
    if (key === 'users')       navigate('/admin/users')
    if (key === 'reports')     navigate('/admin/reports')
    if (key === 'dangerzones') navigate('/admin/dangerzones')
    if (key === 'notices')     navigate('/admin/notices')
    if (key === 'systemlog')   navigate('/admin/systemlog')
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

      {/* 좌측 사이드바 */}
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
              style={{ ...s.navItem, ...(item.key === 'dashboard' ? s.navItemActive : {}) }}
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
          <h2 style={s.pageTitle}>관리자 대시보드</h2>
          <div style={s.headerRight}>
            <span style={s.dateText}>{formatDate(now)}</span>
            <button style={s.bellBtn}>🔔</button>
          </div>
        </div>

        <div style={s.scrollArea}>

          {/* KPI 카드 */}
          <div style={s.kpiRow}>
            {[
              { icon: '👤', label: '전체 사용자',   value: stats.totalUsers,        unit: '명', color: '#00E676' },
              { icon: '🚨', label: '오늘 신고 건수', value: stats.todayReports,      unit: '건', color: '#FF3B3B' },
              { icon: '⚠️', label: '활성 위험구역', value: stats.activeDangerZones, unit: '개', color: '#FF9500' },
              { icon: '🚫', label: '허위신고 누적',  value: stats.blacklistCount,    unit: '명', color: '#FFD600' },
            ].map(item => (
              <div key={item.label} style={s.kpiCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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

          {/* 중간 행 */}
          <div style={s.midRow}>

            {/* 긴급 신고 현황 */}
            <div style={{ ...s.card, flex: 2 }}>
              <div style={s.cardHeaderRow}>
                <span style={s.cardTitle}>🚨 실시간 긴급 신고 현황</span>
              </div>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['신고ID', '신고자', '발생시간', '위치', '상태', '액션'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reports.length > 0 ? (
                    reports.slice(0, 5).map(r => (
                      <tr key={r.reportId} style={s.tr}>
                        <td style={s.td}>#{r.reportId}</td>
                        <td style={s.td}>{r.nickname}</td>
                        <td style={s.td}>{r.reportedAt}</td>
                        <td style={s.td}>{r.location}</td>
                        <td style={s.td}>
                          <span style={{
                            ...s.badge,
                            backgroundColor: STATUS_STYLE[r.reportStatus]?.bg ?? '#4A5568',
                            color: STATUS_STYLE[r.reportStatus]?.color ?? '#fff',
                          }}>
                            {STATUS_STYLE[r.reportStatus]?.label ?? r.reportStatus}
                          </span>
                        </td>
                        <td style={s.td}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button style={s.actionBtnMint} onClick={() => handleReportProcess(r.reportId)}>처리</button>
                            <button style={s.actionBtnGray} onClick={() => handleFalseReport(r.reportId)}>허위신고</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ ...s.td, textAlign: 'center', padding: '30px', color: '#A0AEC0' }}>
                        신고 데이터가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div style={{ textAlign: 'right', marginTop: '8px' }}>
                <button style={s.linkBtn}>전체 보기 →</button>
              </div>
            </div>

            {/* 위험구역 현황 */}
            <div style={{ ...s.card, flex: 1 }}>
              <div style={s.cardTitle}>⚠️ 위험구역 현황</div>
              {dangerZones.length > 0 ? (
                dangerZones.map(zone => (
                  <div key={zone.dangerZoneId} style={s.zoneItem}>
                    <div style={{ flex: 1 }}>
                      <div style={s.zoneName}>{zone.name}</div>
                      <div style={s.zoneAddr}>{zone.address}</div>
                    </div>
                    <span style={{
                      ...s.badge,
                      backgroundColor: LEVEL_STYLE[zone.dangerLevel]?.bg,
                      color: LEVEL_STYLE[zone.dangerLevel]?.color,
                    }}>
                      {zone.dangerLevel}
                    </span>
                    <div style={{ fontSize: '12px', color: '#A0AEC0' }}>반경 {zone.radius}m</div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button style={s.actionBtnMint} onClick={() => handleDangerZoneUpdate(zone.dangerZoneId)}>갱신</button>
                      <button style={s.actionBtnRed} onClick={() => handleDangerZoneOff(zone.dangerZoneId)}>비활성화</button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={s.emptySmall}>위험구역 데이터가 없습니다.</div>
              )}
              <button style={s.addZoneBtn}>+ 위험구역 추가</button>
            </div>
          </div>

          {/* 하단 행 */}
          <div style={s.bottomRow}>

            {/* 최근 가입 사용자 */}
            <div style={{ ...s.card, flex: 1 }}>
              <div style={s.cardTitle}>👤 최근 가입 사용자</div>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['닉네임', '가입일', '허위신고', '상태', '관리'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.slice(0, 5).map(u => (
                      <tr key={u.userId} style={s.tr}>
                        <td style={s.td}>{u.nickname}</td>
                        <td style={s.td}>{u.createdAt}</td>
                        <td style={{ ...s.td, color: u.fakeReports >= 2 ? '#FF3B3B' : '#fff', fontWeight: u.fakeReports >= 2 ? '700' : '400' }}>
                          {u.fakeReports ?? 0}회
                        </td>
                        <td style={s.td}>
                          <span style={{
                            ...s.badge,
                            backgroundColor: u.isBlacklisted ? '#FF3B3B' : '#00E676',
                            color: u.isBlacklisted ? '#fff' : '#000',
                          }}>
                            {u.isBlacklisted ? '블랙리스트' : '정상'}
                          </span>
                        </td>
                        <td style={s.td}>
                          <button
                            style={u.isBlacklisted ? s.actionBtnGray : s.actionBtnRed}
                            onClick={() => handleBlacklist(u.userId)}
                          >
                            {u.isBlacklisted ? '해제' : '블랙리스트'}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ ...s.td, textAlign: 'center', padding: '30px', color: '#A0AEC0' }}>
                        사용자 데이터가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div style={{ textAlign: 'right', marginTop: '8px' }}>
                <button style={s.linkBtn}>전체 보기 →</button>
              </div>
            </div>

            {/* 공지사항 작성 */}
            <div style={{ ...s.card, flex: 1 }}>
              <div style={s.cardTitle}>📢 공지사항 작성</div>
              <div style={{ marginBottom: '12px' }}>
                <label style={s.inputLabel}>제목</label>
                <input
                  style={s.input}
                  placeholder="공지 제목을 입력하세요"
                  value={noticeTitle}
                  onChange={e => setNoticeTitle(e.target.value)}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={s.inputLabel}>내용</label>
                <textarea
                  style={s.textarea}
                  placeholder={'공지 내용을 입력하세요.\n사용자에게 전달할 중요한 내용을 작성해주세요.'}
                  value={noticeContent}
                  onChange={e => setNoticeContent(e.target.value)}
                />
              </div>
              <button style={s.submitBtn} onClick={handleNoticeSubmit}>공지 등록</button>
            </div>

            {/* 신고 통계 차트 */}
            <div style={{ ...s.card, flex: 1 }}>
              <div style={s.cardHeaderRow}>
                <span style={s.cardTitle}>📈 신고 통계 (최근 7일)</span>
              </div>
              <MiniChart data={chartData} />
            </div>
          </div>
        </div>
      </main>

      {/* 긴급 신고 플로팅 알림 */}
      {floatingAlert && (
        <div style={s.floatingAlert}>
          <div style={s.alertTitle}>🚨 긴급 신고 발생</div>
          <div style={s.alertName}>{floatingAlert.nickname}</div>
          <div style={s.alertLocation}>📍 {floatingAlert.location}</div>
          <button style={s.alertBtn} onClick={() => setFloatingAlert(null)}>확인</button>
        </div>
      )}
    </div>
  )
}

function MiniChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '150px', color: '#A0AEC0', fontSize: '13px',
      }}>
        데이터 준비 중입니다.
      </div>
    )
  }

  const values = data.map(d => d.count)
  const max = Math.max(...values)
  const w = 280, h = 120, pad = 20

  const points = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2)
    const y = pad + (1 - v / max) * (h - pad * 2)
    return `${x},${y}`
  }).join(' ')

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${w} ${h + 30}`} style={{ overflow: 'visible' }}>
        <polyline points={points} fill="none" stroke="#00E676" strokeWidth="2" strokeLinejoin="round" />
        {data.map((d, i) => {
          const x = pad + (i / (data.length - 1)) * (w - pad * 2)
          const y = pad + (1 - d.count / max) * (h - pad * 2)
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={4} fill="#00E676" />
              <text x={x} y={y - 8} textAnchor="middle" fill="#fff" fontSize="10">{d.count}</text>
              <text x={x} y={h + 15} textAnchor="middle" fill="#A0AEC0" fontSize="8">{d.day}</text>
              <text x={x} y={h + 25} textAnchor="middle" fill="#A0AEC0" fontSize="8">{d.date}</text>
            </g>
          )
        })}
      </svg>
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
  headerRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  dateText: { color: '#A0AEC0', fontSize: '13px' },
  bellBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' },
  scrollArea: { flex: 1, overflowY: 'auto', padding: '16px 28px', display: 'flex', flexDirection: 'column', gap: '16px' },
  kpiRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' },
  kpiCard: { backgroundColor: '#161B27', borderRadius: '12px', padding: '16px', border: '1px solid #1E2535' },
  kpiIcon: { width: '52px', height: '52px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  kpiLabel: { color: '#A0AEC0', fontSize: '12px', marginBottom: '4px' },
  kpiValue: { fontSize: '24px', fontWeight: '800' },
  midRow: { display: 'flex', gap: '16px' },
  bottomRow: { display: 'flex', gap: '16px', paddingBottom: '16px' },
  card: { backgroundColor: '#161B27', borderRadius: '12px', padding: '16px', border: '1px solid #1E2535' },
  cardHeaderRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' },
  cardTitle: { color: '#fff', fontSize: '14px', fontWeight: '700', marginBottom: '14px', display: 'block' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { color: '#A0AEC0', fontSize: '12px', fontWeight: '600', padding: '8px 10px', textAlign: 'left', borderBottom: '1px solid #1E2535' },
  tr: { borderBottom: '1px solid #1E2535' },
  td: { color: '#fff', fontSize: '13px', padding: '10px 10px' },
  badge: { display: 'inline-block', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '4px', whiteSpace: 'nowrap' },
  actionBtnMint: { backgroundColor: '#00E676', border: 'none', borderRadius: '6px', padding: '5px 10px', color: '#000', fontSize: '12px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' },
  actionBtnGray: { backgroundColor: 'transparent', border: '1px solid #2D3748', borderRadius: '6px', padding: '5px 10px', color: '#A0AEC0', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' },
  actionBtnRed: { backgroundColor: 'transparent', border: '1px solid #FF3B3B', borderRadius: '6px', padding: '5px 10px', color: '#FF3B3B', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' },
  linkBtn: { background: 'none', border: 'none', color: '#00E676', fontSize: '13px', cursor: 'pointer' },
  zoneItem: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 0', borderBottom: '1px solid #1E2535' },
  zoneName: { color: '#fff', fontSize: '13px', fontWeight: '600' },
  zoneAddr: { color: '#A0AEC0', fontSize: '11px', marginTop: '2px' },
  addZoneBtn: { width: '100%', marginTop: '12px', backgroundColor: 'transparent', border: '1px solid #00E676', borderRadius: '8px', padding: '10px', color: '#00E676', fontWeight: '600', fontSize: '13px', cursor: 'pointer' },
  emptySmall: { color: '#A0AEC0', fontSize: '12px', textAlign: 'center', padding: '20px 0' },
  inputLabel: { display: 'block', color: '#A0AEC0', fontSize: '12px', marginBottom: '6px', fontWeight: '500' },
  input: { width: '100%', backgroundColor: '#0D1117', border: '1px solid #2D3748', borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box', marginBottom: '4px' },
  textarea: { width: '100%', height: '100px', backgroundColor: '#0D1117', border: '1px solid #2D3748', borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '13px', outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
  submitBtn: { width: '100%', backgroundColor: '#00E676', border: 'none', borderRadius: '8px', padding: '12px', color: '#000', fontWeight: '700', fontSize: '14px', cursor: 'pointer' },
  floatingAlert: { position: 'fixed', top: '20px', right: '20px', zIndex: 9999, backgroundColor: '#161B27', border: '1px solid #00E676', borderRadius: '12px', padding: '16px', minWidth: '200px', boxShadow: '0 0 20px rgba(0,230,118,0.3)' },
  alertTitle: { color: '#FF3B3B', fontSize: '14px', fontWeight: '700', marginBottom: '8px' },
  alertName: { color: '#fff', fontSize: '13px', fontWeight: '600', marginBottom: '4px' },
  alertLocation: { color: '#A0AEC0', fontSize: '12px', marginBottom: '12px' },
  alertBtn: { width: '100%', backgroundColor: '#00E676', border: 'none', borderRadius: '8px', padding: '8px', color: '#000', fontWeight: '700', fontSize: '13px', cursor: 'pointer' },
}