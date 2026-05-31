import { useState, useEffect, useRef } from 'react'
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
  REPORTED:   { label: '접수됨',   bg: '#FF3B3B', color: '#fff' },
  PROCESSING: { label: '처리중',   bg: '#FF9500', color: '#fff' },
  RESOLVED:   { label: '해결완료', bg: '#00E676', color: '#000' },
}

const LEVEL_STYLE = {
  HIGH:   { bg: '#FF3B3B', color: '#fff' },
  MEDIUM: { bg: '#FF9500', color: '#fff' },
  LOW:    { bg: '#00E676', color: '#000' },
}

export default function AdminReportPage({ user }) {
  const navigate = useNavigate()
  const { sidebarOpen, setSidebarOpen } = useSidebar()
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markersRef = useRef([])

  const [stats, setStats] = useState({
    total: null, reported: null, processing: null, resolved: null,
  })
  const [reports, setReports] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [statusFilter, setStatusFilter] = useState('전체 상태')
  const [searchInput, setSearchInput] = useState('')
  const [dangerRadius, setDangerRadius] = useState(150)
  const [dangerLevel, setDangerLevel] = useState('HIGH')
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

  // 카카오맵 초기화
  useEffect(() => {
    const initMap = () => {
      if (!window.kakao || !window.kakao.maps) return
      const container = mapRef.current
      const options = {
        center: new window.kakao.maps.LatLng(37.4979, 127.0276),
        level: 5,
      }
      mapInstance.current = new window.kakao.maps.Map(container, options)
    }
    if (window.kakao && window.kakao.maps) {
      initMap()
    } else {
      const check = setInterval(() => {
        if (window.kakao && window.kakao.maps) { clearInterval(check); initMap() }
      }, 300)
      return () => clearInterval(check)
    }
  }, [])

  // 백엔드 연동 시 주석 해제
  // useEffect(() => {
  //   const fetchReports = async () => {
  //     const res = await fetch('/emergency-reports')
  //     const json = await res.json()
  //     if (json.success) {
  //       setReports(json.data.items)
  //       setStats({
  //         total: json.data.totalElements,
  //         reported: json.data.items.filter(r => r.reportStatus === 'REPORTED').length,
  //         processing: json.data.items.filter(r => r.reportStatus === 'PROCESSING').length,
  //         resolved: json.data.items.filter(r => r.reportStatus === 'RESOLVED').length,
  //       })
  //       addMarkersToMap(json.data.items)
  //     }
  //   }
  //   fetchReports()
  //   const interval = setInterval(fetchReports, 30000)
  //   return () => clearInterval(interval)
  // }, [])

  // 지도에 신고 마커 추가
  const addMarkersToMap = (reportList) => {
    if (!mapInstance.current || !window.kakao) return
    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []

    reportList.forEach(r => {
      const color = STATUS_STYLE[r.reportStatus]?.bg ?? '#FF3B3B'
      const content = `
        <div style="
          background:${color};color:#fff;
          padding:4px 8px;border-radius:6px;
          font-size:11px;font-weight:700;
          box-shadow:0 2px 6px rgba(0,0,0,0.3);
          white-space:nowrap;cursor:pointer;
        ">
          #ER-${r.reportId} ${STATUS_STYLE[r.reportStatus]?.label ?? ''}
        </div>
      `
      const overlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(r.latitude, r.longitude),
        content, yAnchor: 1,
      })
      overlay.setMap(mapInstance.current)
      markersRef.current.push(overlay)
    })
  }

  // 선택된 신고 지도 이동
  const handleSelectReport = (report) => {
    setSelectedReport(report)
    if (mapInstance.current && report.latitude && report.longitude) {
      mapInstance.current.setCenter(
        new window.kakao.maps.LatLng(report.latitude, report.longitude)
      )
      mapInstance.current.setLevel(3)
    }
  }

  const handleStatusChange = async (reportId, status) => {
    // PUT /emergency-reports/{reportId}/status
    // await fetch(`/emergency-reports/${reportId}/status`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
    //   body: JSON.stringify({ status }),
    // })
  }

  const handleFalseReport = async (reportId) => {
    // PUT /emergency-reports/{reportId}/false-report
    // await fetch(`/emergency-reports/${reportId}/false-report`, { method: 'PUT', ... })
  }

  const handleDangerZoneCreate = async () => {
    if (!selectedReport) return
    // POST /danger-zones
    // await fetch('/danger-zones', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     centerLatitude: selectedReport.latitude,
    //     centerLongitude: selectedReport.longitude,
    //     radius: dangerRadius,
    //     dangerLevel,
    //   }),
    // })
    window.alert('위험구역이 지정되었습니다.')
  }

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

  const filteredReports = reports.filter(r => {
    const matchStatus = statusFilter === '전체 상태' || STATUS_STYLE[r.reportStatus]?.label === statusFilter
    const matchSearch = !searchInput || r.nickname?.includes(searchInput) || r.location?.includes(searchInput)
    return matchStatus && matchSearch
  })

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
              style={{ ...s.navItem, ...(item.key === 'reports' ? s.navItemActive : {}) }}
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
          <h2 style={s.pageTitle}>신고 관리</h2>
          <span style={s.dateText}>{formatDate(now)}</span>
        </div>

        {/* KPI 카드 */}
        <div style={s.kpiRow}>
          {[
            { icon: '🚨', label: '전체 신고',  value: stats.total,      unit: '건', color: '#00E676' },
            { icon: '🔴', label: '접수됨',     value: stats.reported,   unit: '건', color: '#FF3B3B' },
            { icon: '🟠', label: '처리중',     value: stats.processing, unit: '건', color: '#FF9500' },
            { icon: '✅', label: '해결완료',   value: stats.resolved,   unit: '건', color: '#A0AEC0' },
          ].map(item => (
            <div key={item.label} style={s.kpiCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ ...s.kpiIcon, backgroundColor: item.color + '22' }}>
                  <span style={{ fontSize: '22px' }}>{item.icon}</span>
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

        {/* 지도 + 우측 패널 */}
        <div style={s.contentRow}>

          {/* 지도 */}
          <div style={s.mapArea}>
            <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

            {/* 지도 범례 */}
            <div style={s.mapLegend}>
              <div style={s.legendTitle}>신고 위치 현황</div>
              {[
                { color: '#FF3B3B', label: '접수됨',   value: stats.reported },
                { color: '#FF9500', label: '처리중',   value: stats.processing },
                { color: '#00E676', label: '해결완료', value: stats.resolved },
              ].map(item => (
                <div key={item.label} style={s.legendRow}>
                  <span style={{ ...s.legendDot, backgroundColor: item.color }} />
                  <span style={s.legendLabel}>{item.label}</span>
                  <span style={s.legendValue}>{item.value !== null ? `${item.value}건` : '-'}</span>
                </div>
              ))}
            </div>

            {/* 줌 컨트롤 */}
            <div style={s.zoomControl}>
              {['+', '−'].map(btn => (
                <button key={btn} style={s.zoomBtn} onClick={() => {
                  if (!mapInstance.current) return
                  const level = mapInstance.current.getLevel()
                  mapInstance.current.setLevel(btn === '+' ? level - 1 : level + 1)
                }}>{btn}</button>
              ))}
            </div>
          </div>

          {/* 우측 패널 */}
          <div style={s.rightPanel}>

            {/* 필터 */}
            <div style={s.filterRow}>
              <select
                style={s.select}
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option>전체 상태</option>
                <option>접수됨</option>
                <option>처리중</option>
                <option>해결완료</option>
              </select>
              <div style={s.searchBox}>
                <input
                  style={s.searchInput}
                  placeholder="신고자 또는 위치 검색..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                />
                <span style={{ color: '#A0AEC0', fontSize: '14px' }}>🔍</span>
              </div>
            </div>

            {/* 신고 목록 */}
            <div style={s.reportList}>
              {filteredReports.length > 0 ? (
                filteredReports.map(r => (
                  <div
                    key={r.reportId}
                    style={{
                      ...s.reportItem,
                      ...(selectedReport?.reportId === r.reportId ? s.reportItemActive : {}),
                    }}
                    onClick={() => handleSelectReport(r)}
                  >
                    <div style={s.reportItemTop}>
                      <span style={s.reportId}>#ER-{r.reportId}</span>
                      <span style={{
                        ...s.badge,
                        backgroundColor: STATUS_STYLE[r.reportStatus]?.bg ?? '#4A5568',
                        color: STATUS_STYLE[r.reportStatus]?.color ?? '#fff',
                      }}>
                        {STATUS_STYLE[r.reportStatus]?.label ?? r.reportStatus}
                      </span>
                      <span style={s.reportNickname}>{r.nickname}</span>
                      <span style={s.reportTime}>{r.reportedAt?.slice(11, 16)}</span>
                    </div>
                    <div style={s.reportLocation}>{r.location ?? `위도 ${r.latitude}, 경도 ${r.longitude}`}</div>
                    <div style={s.reportCoord}>위도 {r.latitude}, 경도 {r.longitude}</div>
                  </div>
                ))
              ) : (
                <div style={s.emptySmall}>신고 데이터가 없습니다.</div>
              )}
            </div>

            {/* 신고 상세 */}
            {selectedReport && (
              <div style={s.detailPanel}>
                <div style={s.detailTitle}>신고 상세</div>

                <div style={s.detailGrid}>
                  <div style={s.detailRow}>
                    <span style={s.detailLabel}>신고 ID</span>
                    <span style={s.detailValue}>#ER-{selectedReport.reportId}</span>
                  </div>
                  <div style={s.detailRow}>
                    <span style={s.detailLabel}>신고자</span>
                    <span style={s.detailValue}>{selectedReport.nickname ?? '-'}</span>
                  </div>
                  <div style={s.detailRow}>
                    <span style={s.detailLabel}>발생 시각</span>
                    <span style={s.detailValue}>{selectedReport.reportedAt ?? '-'}</span>
                  </div>
                  <div style={s.detailRow}>
                    <span style={s.detailLabel}>위치</span>
                    <span style={s.detailValue}>{selectedReport.location ?? '-'}</span>
                  </div>
                  <div style={s.detailRow}>
                    <span style={s.detailLabel}>위도 / 경도</span>
                    <span style={s.detailValue}>{selectedReport.latitude}, {selectedReport.longitude}</span>
                  </div>
                  <div style={s.detailRow}>
                    <span style={s.detailLabel}>가까운 CCTV</span>
                    <span style={s.detailValue}>
                      {selectedReport.nearestCctvId ? `CCTV-${selectedReport.nearestCctvId}` : '-'}
                    </span>
                  </div>
                  <div style={s.detailRow}>
                    <span style={s.detailLabel}>현재 상태</span>
                    <span style={{
                      ...s.badge,
                      backgroundColor: STATUS_STYLE[selectedReport.reportStatus]?.bg ?? '#4A5568',
                      color: STATUS_STYLE[selectedReport.reportStatus]?.color ?? '#fff',
                    }}>
                      {STATUS_STYLE[selectedReport.reportStatus]?.label ?? selectedReport.reportStatus}
                    </span>
                  </div>
                </div>

                {/* 상태 변경 버튼 */}
                <div style={s.actionRow}>
                  <button
                    style={s.processingBtn}
                    onClick={() => handleStatusChange(selectedReport.reportId, 'PROCESSING')}
                  >
                    처리중으로 변경
                  </button>
                  <button
                    style={s.resolvedBtn}
                    onClick={() => handleStatusChange(selectedReport.reportId, 'RESOLVED')}
                  >
                    해결완료
                  </button>
                  <button
                    style={s.falseBtn}
                    onClick={() => handleFalseReport(selectedReport.reportId)}
                  >
                    허위신고 처리
                  </button>
                </div>

                {/* 위험구역 지정 */}
                <div style={s.dangerSection}>
                  <div style={s.dangerTitle}>위험구역 지정</div>
                  <div style={s.dangerDesc}>
                    이 위치를 위험구역으로 지정하여 다른 사용자에게 알립니다.
                  </div>
                  <div style={s.dangerRow}>
                    <span style={s.detailLabel}>반경</span>
                    <input
                      style={s.radiusInput}
                      type="number"
                      value={dangerRadius}
                      onChange={e => setDangerRadius(e.target.value)}
                    />
                    <span style={{ color: '#A0AEC0', fontSize: '13px' }}>m</span>
                  </div>
                  <div style={s.dangerRow}>
                    <span style={s.detailLabel}>위험도</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {['HIGH', 'MEDIUM', 'LOW'].map(level => (
                        <button
                          key={level}
                          style={{
                            ...s.levelBtn,
                            backgroundColor: dangerLevel === level ? LEVEL_STYLE[level].bg : 'transparent',
                            color: dangerLevel === level ? LEVEL_STYLE[level].color : '#A0AEC0',
                            border: `1px solid ${LEVEL_STYLE[level].bg}`,
                          }}
                          onClick={() => setDangerLevel(level)}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button style={s.dangerBtn} onClick={handleDangerZoneCreate}>
                    이 위치를 위험구역으로 지정
                  </button>
                </div>
              </div>
            )}
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
  kpiRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', padding: '12px 24px', flexShrink: 0 },
  kpiCard: { backgroundColor: '#161B27', borderRadius: '10px', padding: '14px', border: '1px solid #1E2535' },
  kpiIcon: { width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  kpiLabel: { color: '#A0AEC0', fontSize: '11px', marginBottom: '2px' },
  kpiValue: { fontSize: '22px', fontWeight: '800' },
  contentRow: { flex: 1, display: 'flex', overflow: 'hidden' },
  mapArea: { flex: 1, position: 'relative', overflow: 'hidden' },
  mapLegend: { position: 'absolute', top: '16px', left: '16px', zIndex: 10, backgroundColor: 'rgba(13,17,23,0.92)', borderRadius: '10px', padding: '12px 16px', border: '1px solid #1E2535', minWidth: '160px' },
  legendTitle: { color: '#fff', fontSize: '13px', fontWeight: '700', marginBottom: '10px' },
  legendRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' },
  legendDot: { width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0 },
  legendLabel: { color: '#A0AEC0', fontSize: '12px', flex: 1 },
  legendValue: { color: '#fff', fontSize: '12px', fontWeight: '600' },
  zoomControl: { position: 'absolute', top: '16px', right: '16px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '4px' },
  zoomBtn: { width: '36px', height: '36px', backgroundColor: '#161B27', border: '1px solid #2D3748', borderRadius: '6px', color: '#fff', fontSize: '18px', cursor: 'pointer' },
  rightPanel: { width: '380px', flexShrink: 0, height: '100%', backgroundColor: '#0D1117', borderLeft: '1px solid #1E2535', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  filterRow: { display: 'flex', gap: '8px', padding: '12px', flexShrink: 0 },
  select: { backgroundColor: '#161B27', border: '1px solid #1E2535', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '12px', cursor: 'pointer', outline: 'none' },
  searchBox: { flex: 1, display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#161B27', border: '1px solid #1E2535', borderRadius: '8px', padding: '8px 12px' },
  searchInput: { flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: '12px' },
  reportList: { flex: 1, overflowY: 'auto', borderBottom: '1px solid #1E2535' },
  reportItem: { padding: '12px', borderBottom: '1px solid #1E2535', cursor: 'pointer', borderLeft: '3px solid transparent' },
  reportItemActive: { borderLeft: '3px solid #00E676', backgroundColor: 'rgba(0,230,118,0.05)' },
  reportItemTop: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' },
  reportId: { color: '#fff', fontSize: '13px', fontWeight: '700' },
  reportNickname: { color: '#A0AEC0', fontSize: '12px', flex: 1 },
  reportTime: { color: '#A0AEC0', fontSize: '12px' },
  reportLocation: { color: '#fff', fontSize: '12px', marginBottom: '2px' },
  reportCoord: { color: '#A0AEC0', fontSize: '11px' },
  badge: { display: 'inline-block', fontSize: '10px', fontWeight: '700', padding: '2px 7px', borderRadius: '4px', whiteSpace: 'nowrap' },
  emptySmall: { color: '#A0AEC0', fontSize: '13px', textAlign: 'center', padding: '40px 0' },
  detailPanel: { backgroundColor: '#161B27', borderTop: '2px solid #1E2535', padding: '14px', overflowY: 'auto', flexShrink: 0, maxHeight: '55%' },
  detailTitle: { color: '#fff', fontSize: '14px', fontWeight: '700', marginBottom: '12px' },
  detailGrid: { marginBottom: '12px' },
  detailRow: { display: 'flex', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #1E2535' },
  detailLabel: { color: '#A0AEC0', fontSize: '12px', width: '90px', flexShrink: 0 },
  detailValue: { color: '#fff', fontSize: '12px' },
  actionRow: { display: 'flex', gap: '6px', marginBottom: '14px' },
  processingBtn: { flex: 1, backgroundColor: '#FF9500', border: 'none', borderRadius: '6px', padding: '8px 4px', color: '#fff', fontSize: '11px', fontWeight: '700', cursor: 'pointer' },
  resolvedBtn: { flex: 1, backgroundColor: '#00E676', border: 'none', borderRadius: '6px', padding: '8px 4px', color: '#000', fontSize: '11px', fontWeight: '700', cursor: 'pointer' },
  falseBtn: { flex: 1, backgroundColor: 'transparent', border: '1px solid #FF3B3B', borderRadius: '6px', padding: '8px 4px', color: '#FF3B3B', fontSize: '11px', cursor: 'pointer' },
  dangerSection: { backgroundColor: '#0D1117', borderRadius: '8px', padding: '12px', border: '1px solid #1E2535' },
  dangerTitle: { color: '#fff', fontSize: '13px', fontWeight: '700', marginBottom: '4px' },
  dangerDesc: { color: '#A0AEC0', fontSize: '11px', marginBottom: '10px', lineHeight: '1.5' },
  dangerRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' },
  radiusInput: { width: '70px', backgroundColor: '#161B27', border: '1px solid #2D3748', borderRadius: '6px', padding: '6px 10px', color: '#fff', fontSize: '13px', outline: 'none' },
  levelBtn: { padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' },
  dangerBtn: { width: '100%', marginTop: '8px', backgroundColor: 'transparent', border: '1px solid #00E676', borderRadius: '8px', padding: '10px', color: '#00E676', fontWeight: '600', fontSize: '12px', cursor: 'pointer' },
}