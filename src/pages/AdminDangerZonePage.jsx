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

const LEVEL_STYLE = {
  HIGH:   { bg: '#FF3B3B', color: '#fff', circle: 'rgba(255,59,59,0.2)',  border: 'rgba(255,59,59,0.8)' },
  MEDIUM: { bg: '#FF9500', color: '#fff', circle: 'rgba(255,149,0,0.2)',  border: 'rgba(255,149,0,0.8)' },
  LOW:    { bg: '#00E676', color: '#000', circle: 'rgba(0,230,118,0.2)',  border: 'rgba(0,230,118,0.8)' },
}

export default function AdminDangerZonePage({ user }) {
  const navigate = useNavigate()
  const { sidebarOpen, setSidebarOpen } = useSidebar()
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const circlesRef = useRef([])
  const markersRef = useRef([])

  const [dangerZones, setDangerZones] = useState([])
  const [selectedZone, setSelectedZone] = useState(null)
  const [levelFilter, setLevelFilter] = useState('전체 위험도')
  const [statusFilter, setStatusFilter] = useState('전체 상태')
  const [newZone, setNewZone] = useState({ latitude: '', longitude: '', radius: '', dangerLevel: 'HIGH' })
  const [changingLevel, setChangingLevel] = useState('HIGH')
  const [now, setNow] = useState(new Date())

  const stats = {
    total: dangerZones.length,
    active: dangerZones.filter(z => z.isActive).length,
    inactive: dangerZones.filter(z => !z.isActive).length,
    high: dangerZones.filter(z => z.dangerLevel === 'HIGH' && z.isActive).length,
    medium: dangerZones.filter(z => z.dangerLevel === 'MEDIUM' && z.isActive).length,
    low: dangerZones.filter(z => z.dangerLevel === 'LOW' && z.isActive).length,
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
  //   const fetchZones = async () => {
  //     const res = await fetch('/danger-zones')
  //     const json = await res.json()
  //     if (json.success) {
  //       setDangerZones(json.data)
  //       drawCircles(json.data)
  //     }
  //   }
  //   fetchZones()
  //   const interval = setInterval(fetchZones, 30000)
  //   return () => clearInterval(interval)
  // }, [])

  // 지도에 원 + 마커 그리기
  const drawCircles = (zones) => {
    if (!mapInstance.current || !window.kakao) return
    circlesRef.current.forEach(c => c.setMap(null))
    markersRef.current.forEach(m => m.setMap(null))
    circlesRef.current = []
    markersRef.current = []

    zones.filter(z => z.isActive).forEach(zone => {
      const level = zone.dangerLevel
      const center = new window.kakao.maps.LatLng(zone.centerLatitude, zone.centerLongitude)

      // 원 그리기
      const circle = new window.kakao.maps.Circle({
        center,
        radius: zone.radius,
        strokeWeight: 2,
        strokeColor: LEVEL_STYLE[level]?.border ?? '#FF3B3B',
        strokeOpacity: 0.8,
        strokeStyle: 'dashed',
        fillColor: LEVEL_STYLE[level]?.circle ?? 'rgba(255,59,59,0.2)',
        fillOpacity: 1,
      })
      circle.setMap(mapInstance.current)
      circlesRef.current.push(circle)

      // 커스텀 마커
      const content = `
        <div style="
          background:${LEVEL_STYLE[level]?.bg ?? '#FF3B3B'};
          color:${LEVEL_STYLE[level]?.color ?? '#fff'};
          padding:4px 10px;border-radius:6px;
          font-size:12px;font-weight:700;
          box-shadow:0 2px 8px rgba(0,0,0,0.4);
          cursor:pointer;white-space:nowrap;
        ">${level}</div>
      `
      const overlay = new window.kakao.maps.CustomOverlay({
        position: center, content, yAnchor: 1,
      })
      overlay.setMap(mapInstance.current)
      markersRef.current.push(overlay)
    })
  }

  // 선택된 구역 지도 이동
  const handleSelectZone = (zone) => {
    setSelectedZone(zone)
    setChangingLevel(zone.dangerLevel)
    if (mapInstance.current && zone.centerLatitude && zone.centerLongitude) {
      mapInstance.current.setCenter(
        new window.kakao.maps.LatLng(zone.centerLatitude, zone.centerLongitude)
      )
      mapInstance.current.setLevel(4)
    }
  }

  // 위험도 변경
  const handleLevelChange = async () => {
    if (!selectedZone) return
    // PUT /danger-zones/{dangerZoneId}/level
    // await fetch(`/danger-zones/${selectedZone.dangerZoneId}/level`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
    //   body: JSON.stringify({ dangerLevel: changingLevel }),
    // })
    window.alert(`위험도가 ${changingLevel}으로 변경되었습니다.`)
  }

  // 비활성화
  const handleDeactivate = async () => {
    if (!selectedZone) return
    // PUT /danger-zones/{dangerZoneId}/off
    // await fetch(`/danger-zones/${selectedZone.dangerZoneId}/off`, { method: 'PUT', ... })
    window.alert('위험구역이 비활성화되었습니다.')
  }

  // 삭제
  const handleDelete = async () => {
    if (!selectedZone) return
    if (!window.confirm('정말 삭제하시겠습니까?')) return
    // DELETE /danger-zones/{dangerZoneId}
    // await fetch(`/danger-zones/${selectedZone.dangerZoneId}`, { method: 'DELETE', ... })
    window.alert('위험구역이 삭제되었습니다.')
    setSelectedZone(null)
  }

  // 새 위험구역 추가
  const handleAddZone = async () => {
    if (!newZone.latitude || !newZone.longitude || !newZone.radius) {
      window.alert('위도, 경도, 반경을 모두 입력해주세요.')
      return
    }
    // POST /danger-zones
    // await fetch('/danger-zones', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     centerLatitude: parseFloat(newZone.latitude),
    //     centerLongitude: parseFloat(newZone.longitude),
    //     radius: parseInt(newZone.radius),
    //     dangerLevel: newZone.dangerLevel,
    //   }),
    // })
    window.alert('새 위험구역이 추가되었습니다.')
    setNewZone({ latitude: '', longitude: '', radius: '', dangerLevel: 'HIGH' })
  }

  // 현재 위치 버튼
  const handleMyLocation = () => {
    navigator.geolocation?.getCurrentPosition(pos => {
      if (!mapInstance.current) return
      const latlng = new window.kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude)
      mapInstance.current.setCenter(latlng)
      mapInstance.current.setLevel(4)
    })
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

  const filteredZones = dangerZones.filter(z => {
    const matchLevel = levelFilter === '전체 위험도' || z.dangerLevel === levelFilter
    const matchStatus = statusFilter === '전체 상태'
      || (statusFilter === '활성' && z.isActive)
      || (statusFilter === '비활성' && !z.isActive)
    return matchLevel && matchStatus
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
              style={{ ...s.navItem, ...(item.key === 'dangerzones' ? s.navItemActive : {}) }}
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
          <h2 style={s.pageTitle}>위험구역 관리</h2>
          <span style={s.dateText}>{formatDate(now)}</span>
        </div>

        {/* KPI 카드 */}
        <div style={s.kpiRow}>
          {[
            { icon: '⚠️', label: '전체 위험구역',  value: stats.total,    unit: '개', color: '#00E676' },
            { icon: '🔴', label: '활성 위험구역',  value: stats.active,   unit: '개', color: '#FF3B3B' },
            { icon: '⭕', label: '비활성 위험구역', value: stats.inactive, unit: '개', color: '#A0AEC0' },
          ].map(item => (
            <div key={item.label} style={s.kpiCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ ...s.kpiIcon, backgroundColor: item.color + '22' }}>
                  <span style={{ fontSize: '24px' }}>{item.icon}</span>
                </div>
                <div>
                  <div style={s.kpiLabel}>{item.label}</div>
                  <div style={{ ...s.kpiValue, color: item.color }}>
                    {item.value !== null ? `${item.value}${item.unit}` : '-'}
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

            {/* 위험구역 현황 범례 */}
            <div style={s.mapLegend}>
              <div style={s.legendTitle}>위험구역 현황</div>
              {[
                { color: '#FF3B3B', label: 'HIGH',   value: stats.high },
                { color: '#FF9500', label: 'MEDIUM',  value: stats.medium },
                { color: '#00E676', label: 'LOW',     value: stats.low },
              ].map(item => (
                <div key={item.label} style={s.legendRow}>
                  <span style={{ ...s.legendDot, backgroundColor: item.color }} />
                  <span style={s.legendLabel}>{item.label}</span>
                  <span style={s.legendValue}>{item.value}개</span>
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

            {/* 내 위치 버튼 */}
            <button style={s.myLocationBtn} onClick={handleMyLocation}>
              <span style={{ fontSize: '18px' }}>🧭</span>
              <span style={{ fontSize: '11px', color: '#A0AEC0' }}>내 위치</span>
            </button>
          </div>

          {/* 우측 패널 */}
          <div style={s.rightPanel}>

            {/* 필터 */}
            <div style={s.filterRow}>
              <select style={s.select} value={levelFilter} onChange={e => setLevelFilter(e.target.value)}>
                <option>전체 위험도</option>
                <option>HIGH</option>
                <option>MEDIUM</option>
                <option>LOW</option>
              </select>
              <select style={s.select} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option>전체 상태</option>
                <option>활성</option>
                <option>비활성</option>
              </select>
            </div>

            {/* 위험구역 목록 */}
            <div style={s.zoneList}>
              {filteredZones.length > 0 ? (
                filteredZones.map(zone => (
                  <div
                    key={zone.dangerZoneId}
                    style={{
                      ...s.zoneItem,
                      ...(selectedZone?.dangerZoneId === zone.dangerZoneId ? s.zoneItemActive : {}),
                    }}
                    onClick={() => handleSelectZone(zone)}
                  >
                    <div style={s.zoneItemLeft}>
                      <div style={s.zoneItemTop}>
                        <span style={s.zoneId}>#DZ-{String(zone.dangerZoneId).padStart(3, '0')}</span>
                        <span style={{
                          ...s.badge,
                          backgroundColor: LEVEL_STYLE[zone.dangerLevel]?.bg,
                          color: LEVEL_STYLE[zone.dangerLevel]?.color,
                        }}>
                          {zone.dangerLevel}
                        </span>
                      </div>
                      <div style={s.zoneCoord}>위도 {zone.centerLatitude}, 경도 {zone.centerLongitude}</div>
                      <div style={s.zoneMeta}>
                        반경 {zone.radius}m &nbsp;·&nbsp; 신고 누적 {zone.reportCount ?? 0}건
                      </div>
                      <div style={s.zoneMeta}>생성일 {zone.createdAt?.slice(0, 10)}</div>
                    </div>
                    <div style={s.zoneItemRight}>
                      <span style={{
                        ...s.badge,
                        backgroundColor: zone.isActive ? 'rgba(0,230,118,0.15)' : 'rgba(160,174,192,0.15)',
                        color: zone.isActive ? '#00E676' : '#A0AEC0',
                      }}>
                        {zone.isActive ? '활성' : '비활성'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={s.emptySmall}>위험구역 데이터가 없습니다.</div>
              )}
            </div>

            {/* 위험구역 상세 */}
            {selectedZone && (
              <div style={s.detailPanel}>
                <div style={s.detailTitle}>위험구역 상세</div>
                <div style={s.detailGrid}>
                  {[
                    { label: '구역 ID',    value: `#DZ-${String(selectedZone.dangerZoneId).padStart(3, '0')}` },
                    { label: '위도 / 경도', value: `${selectedZone.centerLatitude}, ${selectedZone.centerLongitude}` },
                    { label: '반경',       value: `${selectedZone.radius}m` },
                    { label: '신고 누적',  value: `${selectedZone.reportCount ?? 0}건` },
                    { label: '생성일',     value: selectedZone.createdAt?.slice(0, 19) ?? '-' },
                    { label: '만료일',     value: selectedZone.expiredAt?.slice(0, 19) ?? '-' },
                  ].map(item => (
                    <div key={item.label} style={s.detailRow}>
                      <span style={s.detailLabel}>{item.label}</span>
                      <span style={s.detailValue}>{item.value}</span>
                    </div>
                  ))}
                  <div style={s.detailRow}>
                    <span style={s.detailLabel}>위험도</span>
                    <span style={{
                      ...s.badge,
                      backgroundColor: LEVEL_STYLE[selectedZone.dangerLevel]?.bg,
                      color: LEVEL_STYLE[selectedZone.dangerLevel]?.color,
                    }}>
                      {selectedZone.dangerLevel}
                    </span>
                  </div>
                  <div style={s.detailRow}>
                    <span style={s.detailLabel}>상태</span>
                    <span style={{
                      ...s.badge,
                      backgroundColor: selectedZone.isActive ? 'rgba(0,230,118,0.15)' : 'rgba(160,174,192,0.15)',
                      color: selectedZone.isActive ? '#00E676' : '#A0AEC0',
                    }}>
                      {selectedZone.isActive ? '활성' : '비활성'}
                    </span>
                  </div>
                </div>

                {/* 위험도 변경 */}
                <div style={s.changeLevelRow}>
                  <span style={s.detailLabel}>위험도 변경</span>
                  <select
                    style={s.select}
                    value={changingLevel}
                    onChange={e => setChangingLevel(e.target.value)}
                  >
                    <option>HIGH</option>
                    <option>MEDIUM</option>
                    <option>LOW</option>
                  </select>
                  <button style={s.applyBtn} onClick={handleLevelChange}>적용</button>
                </div>

                {/* 액션 버튼 */}
                <button style={s.deactivateBtn} onClick={handleDeactivate}>비활성화</button>
                <button style={s.deleteBtn} onClick={handleDelete}>삭제</button>
              </div>
            )}

            {/* 새 위험구역 추가 */}
            <div style={s.addPanel}>
            <div style={s.detailTitle}>새 위험구역 추가</div>

            {/* 위도 / 경도 — 한 줄 */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <div style={s.addInputGroup}>
                <label style={s.addLabel}>위도</label>
                <input
                    style={s.addInput}
                    placeholder="예) 37.49790"
                    value={newZone.latitude}
                    onChange={e => setNewZone(p => ({ ...p, latitude: e.target.value }))}
                />
                </div>
                <div style={s.addInputGroup}>
                <label style={s.addLabel}>경도</label>
                <input
                    style={s.addInput}
                    placeholder="예) 127.02860"
                    value={newZone.longitude}
                    onChange={e => setNewZone(p => ({ ...p, longitude: e.target.value }))}
                />
                </div>
            </div>

            {/* 반경 — 별도 줄 */}
            <div style={{ marginBottom: '10px' }}>
                <label style={s.addLabel}>반경 (m)</label>
                <input
                style={{ ...s.addInput, width: '100%', boxSizing: 'border-box', marginTop: '4px' }}
                placeholder="예) 100"
                value={newZone.radius}
                onChange={e => setNewZone(p => ({ ...p, radius: e.target.value }))}
                />
            </div>

            <div style={s.levelRow}>
                <span style={s.detailLabel}>위험도</span>
                {['HIGH', 'MEDIUM', 'LOW'].map(level => (
                <button
                    key={level}
                    style={{
                    ...s.levelBtn,
                    backgroundColor: newZone.dangerLevel === level ? LEVEL_STYLE[level].bg : 'transparent',
                    color: newZone.dangerLevel === level ? LEVEL_STYLE[level].color : '#A0AEC0',
                    border: `1px solid ${LEVEL_STYLE[level].bg}`,
                    }}
                    onClick={() => setNewZone(p => ({ ...p, dangerLevel: level }))}
                >
                    {level}
                </button>
                ))}
            </div>
            <button style={s.addBtn} onClick={handleAddZone}>추가하기</button>
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
  kpiRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', padding: '12px 24px', flexShrink: 0 },
  kpiCard: { backgroundColor: '#161B27', borderRadius: '10px', padding: '14px', border: '1px solid #1E2535' },
  kpiIcon: { width: '48px', height: '48px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  kpiLabel: { color: '#A0AEC0', fontSize: '11px', marginBottom: '2px' },
  kpiValue: { fontSize: '24px', fontWeight: '800' },
  contentRow: { flex: 1, display: 'flex', overflow: 'hidden' },
  mapArea: { flex: 1, position: 'relative', overflow: 'hidden' },
  mapLegend: { position: 'absolute', top: '16px', left: '16px', zIndex: 10, backgroundColor: 'rgba(13,17,23,0.92)', borderRadius: '10px', padding: '12px 16px', border: '1px solid #1E2535', minWidth: '150px' },
  legendTitle: { color: '#fff', fontSize: '13px', fontWeight: '700', marginBottom: '10px' },
  legendRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' },
  legendDot: { width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0 },
  legendLabel: { color: '#A0AEC0', fontSize: '12px', flex: 1 },
  legendValue: { color: '#fff', fontSize: '12px', fontWeight: '600' },
  zoomControl: { position: 'absolute', top: '16px', right: '16px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '4px' },
  zoomBtn: { width: '36px', height: '36px', backgroundColor: '#161B27', border: '1px solid #2D3748', borderRadius: '6px', color: '#fff', fontSize: '18px', cursor: 'pointer' },
  myLocationBtn: { position: 'absolute', bottom: '24px', right: '16px', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', backgroundColor: '#161B27', border: '1px solid #2D3748', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer' },
  rightPanel: { width: '400px', flexShrink: 0, height: '100%', backgroundColor: '#0D1117', borderLeft: '1px solid #1E2535', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  filterRow: { display: 'flex', gap: '8px', padding: '12px', flexShrink: 0 },
  select: { flex: 1, backgroundColor: '#161B27', border: '1px solid #1E2535', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '12px', cursor: 'pointer', outline: 'none' },
  zoneList: { flex: 1, overflowY: 'auto', borderBottom: '1px solid #1E2535' },
  zoneItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderBottom: '1px solid #1E2535', cursor: 'pointer', borderLeft: '3px solid transparent' },
  zoneItemActive: { borderLeft: '3px solid #00E676', backgroundColor: 'rgba(0,230,118,0.05)' },
  zoneItemLeft: { flex: 1 },
  zoneItemRight: { flexShrink: 0, marginLeft: '8px' },
  zoneItemTop: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' },
  zoneId: { color: '#fff', fontSize: '13px', fontWeight: '700' },
  zoneCoord: { color: '#A0AEC0', fontSize: '11px', marginBottom: '2px' },
  zoneMeta: { color: '#A0AEC0', fontSize: '11px' },
  badge: { display: 'inline-block', fontSize: '10px', fontWeight: '700', padding: '2px 7px', borderRadius: '4px', whiteSpace: 'nowrap' },
  emptySmall: { color: '#A0AEC0', fontSize: '13px', textAlign: 'center', padding: '40px 0' },
  detailPanel: { backgroundColor: '#161B27', borderTop: '2px solid #1E2535', padding: '14px', flexShrink: 0 },
  detailTitle: { color: '#fff', fontSize: '13px', fontWeight: '700', marginBottom: '10px' },
  detailGrid: { marginBottom: '10px' },
  detailRow: { display: 'flex', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid #1E2535' },
  detailLabel: { color: '#A0AEC0', fontSize: '11px', width: '80px', flexShrink: 0 },
  detailValue: { color: '#fff', fontSize: '12px' },
  changeLevelRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' },
  applyBtn: { backgroundColor: '#00E676', border: 'none', borderRadius: '6px', padding: '7px 14px', color: '#000', fontSize: '12px', fontWeight: '700', cursor: 'pointer' },
  deactivateBtn: { width: '100%', backgroundColor: 'transparent', border: '1px solid #FF3B3B', borderRadius: '8px', padding: '9px', color: '#FF3B3B', fontWeight: '600', fontSize: '13px', cursor: 'pointer', marginBottom: '6px' },
  deleteBtn: { width: '100%', backgroundColor: '#FF3B3B', border: 'none', borderRadius: '8px', padding: '9px', color: '#fff', fontWeight: '700', fontSize: '13px', cursor: 'pointer' },
  addPanel: { backgroundColor: '#161B27', borderTop: '2px solid #1E2535', padding: '14px', flexShrink: 0 },
  addInputRow: { display: 'flex', gap: '8px', marginBottom: '10px' },
  addInputGroup: { flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' },
  addLabel: { color: '#A0AEC0', fontSize: '11px' },
  addInput: { backgroundColor: '#0D1117', border: '1px solid #2D3748', borderRadius: '6px', padding: '7px 10px', color: '#fff', fontSize: '12px', outline: 'none' },
  levelRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' },
  levelBtn: { padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' },
  addBtn: { width: '100%', backgroundColor: '#00E676', border: 'none', borderRadius: '8px', padding: '11px', color: '#000', fontWeight: '700', fontSize: '14px', cursor: 'pointer' },
}