import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar/Sidebar'
import SidebarToggleBtn from '../components/Sidebar/SidebarToggleBtn'
import { useNavigation } from '../hooks/useNavigation'
import { useSidebar } from '../hooks/useSidebar'

const FAVORITE_PLACES = []

export default function RoutePage({ user, onLogout }) {
  const navigate = useNavigate()
  const handleNavigate = useNavigation()
  const { sidebarOpen, setSidebarOpen } = useSidebar()
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markersRef = useRef([])

  const [startMode, setStartMode] = useState('current')
  const [currentLocation, setCurrentLocation] = useState(null)
  const [startSearch, setStartSearch] = useState('')
  const [startResult, setStartResult] = useState([])
  const [selectedStart, setSelectedStart] = useState(null)

  const [destMode, setDestMode] = useState('favorite')
  const [destSearch, setDestSearch] = useState('')
  const [destResult, setDestResult] = useState([])
  const [selectedDest, setSelectedDest] = useState(null)

  const [routes, setRoutes] = useState([])
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [isSearched, setIsSearched] = useState(false)

  const s = styles

  useEffect(() => {
    const initMap = () => {
      if (!window.kakao || !window.kakao.maps) return
      const container = mapRef.current
      const options = {
        center: new window.kakao.maps.LatLng(37.4979, 127.0276),
        level: 4,
      }
      mapInstance.current = new window.kakao.maps.Map(container, options)
    }

    if (window.kakao && window.kakao.maps) {
      initMap()
    } else {
      const check = setInterval(() => {
        if (window.kakao && window.kakao.maps) {
          clearInterval(check)
          initMap()
        }
      }, 300)
      return () => clearInterval(check)
    }
  }, [])

  useEffect(() => {
    if (startMode === 'current') {
      navigator.geolocation?.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          setCurrentLocation({ lat: latitude, lng: longitude })
          setSelectedStart({ lat: latitude, lng: longitude, name: '현재 위치' })
          if (mapInstance.current) {
            const latlng = new window.kakao.maps.LatLng(latitude, longitude)
            mapInstance.current.setCenter(latlng)
            mapInstance.current.setLevel(3)
            clearMarkers()
            addMarker(latlng, '출발', '#00E676')
          }
        },
        () => setCurrentLocation(null),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      )
    }
  }, [startMode])

  const searchPlace = (keyword, setResult) => {
    if (!keyword.trim() || !window.kakao) return
    const ps = new window.kakao.maps.services.Places()
    ps.keywordSearch(keyword, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setResult(data.slice(0, 4).map(p => ({
          name: p.place_name,
          address: p.road_address_name || p.address_name,
          lat: parseFloat(p.y),
          lng: parseFloat(p.x),
        })))
      }
    })
  }

  const addMarker = (latlng, label, color) => {
    if (!mapInstance.current) return
    const content = `
      <div style="
        background:${color};border-radius:50%;
        width:36px;height:36px;
        display:flex;align-items:center;justify-content:center;
        color:#000;font-size:11px;font-weight:700;
        border:2px solid #fff;
        box-shadow:0 2px 6px rgba(0,0,0,0.3);
      ">${label}</div>
    `
    const overlay = new window.kakao.maps.CustomOverlay({
      position: latlng, content, yAnchor: 1,
    })
    overlay.setMap(mapInstance.current)
    markersRef.current.push(overlay)
  }

  const clearMarkers = () => {
    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []
  }

  const handleSelectStart = (place) => {
    setSelectedStart(place)
    setStartResult([])
    setStartSearch(place.name)
    if (mapInstance.current) {
      clearMarkers()
      const latlng = new window.kakao.maps.LatLng(place.lat, place.lng)
      mapInstance.current.setCenter(latlng)
      addMarker(latlng, '출발', '#00E676')
      if (selectedDest) {
        addMarker(
          new window.kakao.maps.LatLng(selectedDest.lat, selectedDest.lng),
          '도착', '#FF3B3B'
        )
      }
    }
  }

  const handleSelectDest = (place) => {
    setSelectedDest(place)
    setDestResult([])
    setDestSearch(place.name)
    if (mapInstance.current) {
      clearMarkers()
      if (selectedStart) {
        addMarker(
          new window.kakao.maps.LatLng(selectedStart.lat, selectedStart.lng),
          '출발', '#00E676'
        )
      }
      const destLatlng = new window.kakao.maps.LatLng(place.lat, place.lng)
      addMarker(destLatlng, '도착', '#FF3B3B')
      mapInstance.current.setCenter(destLatlng)
    }
  }

  const handleSearchRoute = async () => {
    if (!selectedStart || !selectedDest) {
      alert('출발지와 도착지를 설정해주세요.')
      return
    }
    // 백엔드 연동 시 주석 해제
    // const res = await fetch('/safe-routes', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ start: selectedStart, end: selectedDest }),
    // })
    // const json = await res.json()
    // if (json.success) {
    //   setRoutes(json.data.routes)
    //   setSelectedRoute(json.data.routes[0])
    //   setIsSearched(true)
    // }
    setRoutes([])
    setSelectedRoute(null)
    setIsSearched(true)
  }

  const handleStartGuide = () => {
    if (!selectedRoute) return
    navigate('/', {
      state: {
        routeActive: true,
        start: selectedStart,
        dest: selectedDest,
        route: selectedRoute,
      }
    })
  }

  const scoreColor = (score) => {
    if (score >= 80) return '#00E676'
    if (score >= 60) return '#FFD600'
    return '#FF3B3B'
  }

  return (
    <div style={{
      display: 'flex', height: '100vh', width: '100vw',
      overflow: 'hidden', backgroundColor: '#0D1117', position: 'relative',
    }}>

      <Sidebar
        filters={{ cctv: true, streetLamp: true, safeZone: true }}
        onFilterChange={() => {}}
        user={user}
        onLogout={onLogout}
        onGoLogin={() => navigate('/login')}
        onNavigate={handleNavigate}
        activePage="route"
        isOpen={sidebarOpen}
      />
      <SidebarToggleBtn isOpen={sidebarOpen} onClick={() => setSidebarOpen(prev => !prev)} />

      {/* 좌측 폼 패널 */}
      <div style={s.formPanel}>
        <div style={s.scrollArea}>

          <div style={s.card}>
            <div style={s.cardTitle}>① 출발지</div>
            <div style={s.modeRow}>
              <button
                style={{ ...s.modeBtn, ...(startMode === 'current' ? s.modeBtnActive : {}) }}
                onClick={() => { setStartMode('current'); setStartResult([]) }}
              >
                📍 현재 위치
              </button>
              <button
                style={{ ...s.modeBtn, ...(startMode === 'search' ? s.modeBtnActive : {}) }}
                onClick={() => setStartMode('search')}
              >
                🔍 직접 검색
              </button>
            </div>

            {startMode === 'current' && (
              <div style={s.locationStatus}>
                {currentLocation ? (
                  <>
                    <span style={s.greenDot} />
                    <div>
                      <div style={{ color: '#00E676', fontSize: '13px', fontWeight: '600' }}>
                        현재 위치 확인됨
                      </div>
                      <div style={{ color: '#A0AEC0', fontSize: '11px', marginTop: '2px' }}>
                        위도 {currentLocation.lat.toFixed(4)} · 경도 {currentLocation.lng.toFixed(4)}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <span style={{ ...s.greenDot, backgroundColor: '#FFD600' }} />
                    <div style={{ color: '#A0AEC0', fontSize: '13px' }}>
                      현재 위치를 가져오는 중...
                    </div>
                  </>
                )}
              </div>
            )}

            {startMode === 'search' && (
              <div>
                <input
                  style={s.searchInput}
                  placeholder="출발지 검색..."
                  value={startSearch}
                  onChange={e => { setStartSearch(e.target.value); searchPlace(e.target.value, setStartResult) }}
                />
                {startResult.length > 0 && (
                  <div style={s.resultList}>
                    {startResult.map((place, idx) => (
                      <div key={idx} style={s.resultItem} onClick={() => handleSelectStart(place)}>
                        <span style={{ color: '#00E676', fontSize: '14px' }}>📍</span>
                        <div>
                          <div style={s.resultName}>{place.name}</div>
                          <div style={s.resultAddr}>{place.address}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={s.card}>
            <div style={s.cardTitle}>② 도착지</div>
            <div style={s.tabRow}>
              <button
                style={{ ...s.tab, ...(destMode === 'favorite' ? s.tabActive : {}) }}
                onClick={() => setDestMode('favorite')}
              >
                ⭐ 즐겨찾기
              </button>
              <button
                style={{ ...s.tab, ...(destMode === 'search' ? s.tabActive : {}) }}
                onClick={() => setDestMode('search')}
              >
                🔍 직접 검색
              </button>
            </div>

            {destMode === 'favorite' && (
              <div>
                {FAVORITE_PLACES.length > 0 ? (
                  FAVORITE_PLACES.map(place => (
                    <div
                      key={place.favoritePlaceId}
                      style={{
                        ...s.placeItem,
                        ...(selectedDest?.name === place.placeName ? s.placeItemActive : {}),
                      }}
                      onClick={() => handleSelectDest({
                        name: place.placeName,
                        address: place.address,
                        lat: place.latitude,
                        lng: place.longitude,
                      })}
                    >
                      <span style={{ fontSize: '20px' }}>
                        {place.placeType === 'HOME' ? '🏠'
                          : place.placeType === 'SCHOOL' ? '🏫'
                          : place.placeType === 'WORK' ? '💼' : '📍'}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={s.placeName}>{place.placeName}</div>
                        <div style={s.placeAddr}>{place.address}</div>
                      </div>
                      <span style={{ color: '#A0AEC0' }}>›</span>
                    </div>
                  ))
                ) : (
                  <div style={s.emptySmall}>
                    즐겨찾기 장소가 없습니다.<br />
                    <span
                      style={{ color: '#00E676', cursor: 'pointer', fontSize: '12px' }}
                      onClick={() => navigate('/myinfo')}
                    >
                      내 정보에서 추가하기 →
                    </span>
                  </div>
                )}
              </div>
            )}

            {destMode === 'search' && (
              <div>
                <input
                  style={s.searchInput}
                  placeholder="도착지 검색..."
                  value={destSearch}
                  onChange={e => { setDestSearch(e.target.value); searchPlace(e.target.value, setDestResult) }}
                />
                {destResult.length > 0 && (
                  <div style={s.resultList}>
                    {destResult.map((place, idx) => (
                      <div key={idx} style={s.resultItem} onClick={() => handleSelectDest(place)}>
                        <span style={{ color: '#FF3B3B', fontSize: '14px' }}>📍</span>
                        <div>
                          <div style={s.resultName}>{place.name}</div>
                          <div style={s.resultAddr}>{place.address}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {!isSearched && (
            <button style={s.searchBtn} onClick={handleSearchRoute}>
              🔍 안전 경로 찾기
            </button>
          )}

          {isSearched && (
            <div style={s.card}>
              <div style={s.cardTitle}>③ 추천 경로</div>
              {routes.length > 0 ? (
                <>
                  {routes.map(route => (
                    <div
                      key={route.routeRank}
                      style={{
                        ...s.routeCard,
                        ...(selectedRoute?.routeRank === route.routeRank ? s.routeCardActive : {}),
                      }}
                      onClick={() => setSelectedRoute(route)}
                    >
                      <div style={s.routeTop}>
                        <span style={s.routeName}>{route.routeName}</span>
                        {route.routeRank === 1 && <span style={s.recommendBadge}>추천</span>}
                        <span style={{ ...s.scoreText, color: scoreColor(route.safetyScore) }}>
                          안전도 {route.safetyScore}점
                        </span>
                      </div>
                      <div style={s.routeScoreBar}>
                        <div style={{
                          height: '4px', borderRadius: '2px',
                          backgroundColor: scoreColor(route.safetyScore),
                          width: `${route.safetyScore}%`, transition: 'width 0.4s',
                        }} />
                      </div>
                      <div style={s.routeInfo}>
                        <span style={s.routeMeta}>🚶 {route.time}분 · {route.distance}km</span>
                        <span style={s.routeFeature}>CCTV {route.cctv ? '✅' : '⚠️'}</span>
                        <span style={s.routeFeature}>가로등 {route.streetLamp ? '✅' : '⚠️'}</span>
                        <span style={s.routeFeature}>편의점 {route.convenience ? '✅' : '⚠️'}</span>
                      </div>
                    </div>
                  ))}
                  <button style={s.startBtn} onClick={handleStartGuide}>▶ 안내 시작</button>
                </>
              ) : (
                <div style={s.emptySmall}>백엔드 연동 후 경로가 표시됩니다.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 우측 지도 */}
      <div style={{ flex: 1, position: 'relative' }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

        <div style={s.mapSearchBar}>
          <span style={{ color: '#999' }}>🔍</span>
          <input style={s.mapSearchInput} placeholder="장소 검색..." />
        </div>

        {!selectedStart && <div style={s.mapBubble}>출발지를 설정해주세요</div>}
        {selectedStart && !selectedDest && <div style={s.mapBubble}>출발지가 설정되었습니다</div>}

        {selectedRoute && (
          <div style={s.safetyCard}>
            <div style={s.safetyTitle}>선택 경로 안전도</div>
            <div style={{ ...s.safetyScore, color: scoreColor(selectedRoute.safetyScore) }}>
              {selectedRoute.safetyScore}점
            </div>
            <div style={s.safetyRow}><span style={s.safetyItem}>📷 CCTV</span><span style={{ color: '#00E676', fontSize: '12px' }}>-</span></div>
            <div style={s.safetyRow}><span style={s.safetyItem}>💡 가로등</span><span style={{ color: '#00E676', fontSize: '12px' }}>-</span></div>
            <div style={s.safetyRow}><span style={s.safetyItem}>🏪 편의점</span><span style={{ color: '#00E676', fontSize: '12px' }}>-</span></div>
          </div>
        )}

        <div style={s.zoomControl}>
          {['+', '−'].map(btn => (
            <button
              key={btn} style={s.zoomBtn}
              onClick={() => {
                if (!mapInstance.current) return
                const level = mapInstance.current.getLevel()
                mapInstance.current.setLevel(btn === '+' ? level - 1 : level + 1)
              }}
            >
              {btn}
            </button>
          ))}
        </div>

        <button
          style={s.myLocationBtn}
          onClick={() => {
            if (currentLocation && mapInstance.current) {
              mapInstance.current.setCenter(
                new window.kakao.maps.LatLng(currentLocation.lat, currentLocation.lng)
              )
            }
          }}
        >
          🧭
        </button>
      </div>
    </div>
  )
}

const styles = {
  formPanel: {
    width: '360px', flexShrink: 0, height: '100vh',
    backgroundColor: '#0D1117', borderRight: '1px solid #1E2535',
    display: 'flex', flexDirection: 'column',
  },
  scrollArea: {
    flex: 1, overflowY: 'auto', padding: '16px',
    display: 'flex', flexDirection: 'column', gap: '12px',
  },
  card: {
    backgroundColor: '#161B27', borderRadius: '12px',
    padding: '16px', border: '1px solid #1E2535',
  },
  cardTitle: { color: '#fff', fontSize: '14px', fontWeight: '700', marginBottom: '12px' },
  modeRow: { display: 'flex', gap: '8px', marginBottom: '12px' },
  modeBtn: {
    flex: 1, padding: '10px', borderRadius: '8px',
    backgroundColor: '#0D1117', border: '1px solid #2D3748',
    color: '#A0AEC0', fontSize: '13px', cursor: 'pointer', fontWeight: '500',
  },
  modeBtnActive: {
    backgroundColor: '#00E676', border: '1px solid #00E676',
    color: '#000', fontWeight: '700',
  },
  locationStatus: {
    display: 'flex', alignItems: 'center', gap: '10px',
    backgroundColor: '#0D1117', borderRadius: '8px',
    padding: '10px 12px', border: '1px solid #1E2535',
  },
  greenDot: {
    width: '10px', height: '10px', borderRadius: '50%',
    backgroundColor: '#00E676', flexShrink: 0, boxShadow: '0 0 6px #00E676',
  },
  searchInput: {
    width: '100%', backgroundColor: '#0D1117',
    border: '1px solid #2D3748', borderRadius: '8px',
    padding: '10px 14px', color: '#fff', fontSize: '13px',
    outline: 'none', boxSizing: 'border-box', marginBottom: '4px',
  },
  resultList: {
    backgroundColor: '#0D1117', border: '1px solid #1E2535',
    borderRadius: '8px', overflow: 'hidden',
  },
  resultItem: {
    display: 'flex', alignItems: 'flex-start', gap: '10px',
    padding: '10px 12px', cursor: 'pointer',
    borderBottom: '1px solid #1E2535', borderLeft: '3px solid transparent',
  },
  resultName: { color: '#fff', fontSize: '13px', fontWeight: '600' },
  resultAddr: { color: '#A0AEC0', fontSize: '11px', marginTop: '2px' },
  tabRow: { display: 'flex', marginBottom: '12px', borderBottom: '1px solid #1E2535' },
  tab: {
    flex: 1, padding: '8px', background: 'none', border: 'none',
    color: '#A0AEC0', fontSize: '13px', cursor: 'pointer',
    borderBottom: '2px solid transparent', marginBottom: '-1px',
  },
  tabActive: { color: '#00E676', borderBottom: '2px solid #00E676', fontWeight: '700' },
  placeItem: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 8px', borderRadius: '8px', cursor: 'pointer',
    borderLeft: '3px solid transparent', marginBottom: '4px',
  },
  placeItemActive: { borderLeft: '3px solid #00E676', backgroundColor: 'rgba(0,230,118,0.05)' },
  placeName: { color: '#fff', fontSize: '13px', fontWeight: '600' },
  placeAddr: { color: '#A0AEC0', fontSize: '11px', marginTop: '2px' },
  emptySmall: {
    color: '#A0AEC0', fontSize: '13px',
    textAlign: 'center', padding: '20px 0', lineHeight: '1.8',
  },
  searchBtn: {
    width: '100%', backgroundColor: '#00E676', border: 'none',
    borderRadius: '10px', padding: '14px',
    color: '#000', fontWeight: '700', fontSize: '15px', cursor: 'pointer',
  },
  routeCard: {
    backgroundColor: '#0D1117', borderRadius: '10px',
    padding: '12px', border: '1px solid #1E2535',
    marginBottom: '8px', cursor: 'pointer',
  },
  routeCardActive: { border: '1px solid #00E676', backgroundColor: 'rgba(0,230,118,0.05)' },
  routeTop: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' },
  routeName: { color: '#fff', fontSize: '14px', fontWeight: '700', flex: 1 },
  recommendBadge: {
    backgroundColor: '#00E676', color: '#000',
    fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px',
  },
  scoreText: { fontSize: '13px', fontWeight: '700' },
  routeScoreBar: {
    width: '100%', height: '4px', backgroundColor: '#1E2535',
    borderRadius: '2px', marginBottom: '8px', overflow: 'hidden',
  },
  routeInfo: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  routeMeta: { color: '#A0AEC0', fontSize: '12px', flex: 1 },
  routeFeature: { color: '#A0AEC0', fontSize: '11px' },
  startBtn: {
    width: '100%', backgroundColor: '#00E676', border: 'none',
    borderRadius: '10px', padding: '14px', marginTop: '12px',
    color: '#000', fontWeight: '700', fontSize: '15px', cursor: 'pointer',
  },
  mapSearchBar: {
    position: 'absolute', top: '16px', left: '50%',
    transform: 'translateX(-50%)', zIndex: 10,
    display: 'flex', alignItems: 'center', gap: '8px',
    backgroundColor: '#fff', borderRadius: '24px',
    padding: '10px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.2)', width: '360px',
  },
  mapSearchInput: {
    flex: 1, border: 'none', outline: 'none',
    fontSize: '13px', color: '#333', backgroundColor: 'transparent',
  },
  mapBubble: {
    position: 'absolute', top: '80px', left: '50%',
    transform: 'translateX(-50%)', zIndex: 10,
    backgroundColor: 'rgba(13,17,23,0.9)', color: '#fff',
    fontSize: '13px', padding: '10px 20px',
    borderRadius: '20px', border: '1px solid #1E2535', whiteSpace: 'nowrap',
  },
  safetyCard: {
    position: 'absolute', top: '16px', right: '16px', zIndex: 10,
    backgroundColor: '#161B27', borderRadius: '12px',
    padding: '16px', border: '1px solid #1E2535', minWidth: '160px',
  },
  safetyTitle: { color: '#A0AEC0', fontSize: '11px', marginBottom: '4px' },
  safetyScore: { fontSize: '28px', fontWeight: '800', marginBottom: '10px' },
  safetyRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' },
  safetyItem: { color: '#A0AEC0', fontSize: '12px' },
  zoomControl: {
    position: 'absolute', top: '16px', right: '16px',
    zIndex: 10, display: 'flex', flexDirection: 'column', gap: '4px',
  },
  zoomBtn: {
    width: '36px', height: '36px',
    backgroundColor: '#161B27', border: '1px solid #2D3748',
    borderRadius: '6px', color: '#fff', fontSize: '18px', cursor: 'pointer',
  },
  myLocationBtn: {
    position: 'absolute', bottom: '32px', right: '16px',
    zIndex: 10, width: '44px', height: '44px', borderRadius: '50%',
    backgroundColor: '#161B27', border: '1px solid #2D3748',
    color: '#fff', fontSize: '20px', cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
  },
}