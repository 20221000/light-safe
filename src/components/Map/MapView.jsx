import { useEffect, useRef } from 'react'

// 더미 데이터 제거 — 실제 데이터는 아래 fetchMarkerData()에서 받아옴
// CSV 또는 API 연결 시 이 함수만 수정하면 됩니다
async function fetchMarkerData() {
  // ── API 연결 시 ──────────────────────────────────────────
  // const [cctvRes, lampRes, placeRes] = await Promise.all([
  //   fetch('/api/cctvs'),
  //   fetch('/api/street-lamps'),
  //   fetch('/api/safe-places'),
  // ])
  // const cctv      = await cctvRes.json()   // [{ lat, lng }, ...]
  // const streetLamp = await lampRes.json()
  // const safeZone  = await placeRes.json()
  // return { cctv, streetLamp, safeZone }

  // ── CSV 연결 시 ──────────────────────────────────────────
  // const text = await fetch('/data/cctv.csv').then(r => r.text())
  // const rows = text.split('\n').slice(1).map(row => {
  //   const [lat, lng] = row.split(',')
  //   return { lat: parseFloat(lat), lng: parseFloat(lng) }
  // })
  // return { cctv: rows, streetLamp: [], safeZone: [] }

  // 현재는 빈 배열 반환 (마커 없음)
  return { cctv: [], streetLamp: [], safeZone: [] }
}

export default function MapView({ filters }) {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markersRef = useRef([])

  useEffect(() => {
    const initMap = () => {
      if (!window.kakao || !window.kakao.maps) return
      const container = mapRef.current
      const options = {
        center: new window.kakao.maps.LatLng(37.4979, 127.0276),
        level: 4,
      }
      mapInstance.current = new window.kakao.maps.Map(container, options)

      // 데이터 불러와서 마커 추가
      fetchMarkerData().then(data => addMarkers(data))
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

  // 필터 토글 시 마커 표시/숨김
  useEffect(() => {
    if (!mapInstance.current) return
    markersRef.current.forEach(({ marker, type }) => {
      marker.setMap(filters[type] ? mapInstance.current : null)
    })
  }, [filters])

  const addMarkers = (data) => {
    if (!window.kakao || !mapInstance.current) return

    const markerConfigs = [
      { type: 'cctv',       data: data.cctv,       color: '#00E676', icon: '📷' },
      { type: 'streetLamp', data: data.streetLamp, color: '#FFD600', icon: '💡' },
      { type: 'safeZone',   data: data.safeZone,   color: '#00C853', icon: '🏪' },
    ]

    markerConfigs.forEach(({ type, data, color, icon }) => {
      data.forEach(pos => {
        const content = `
          <div style="
            background:${color};border-radius:50%;
            width:32px;height:32px;
            display:flex;align-items:center;justify-content:center;
            font-size:14px;border:2px solid #fff;
            box-shadow:0 2px 6px rgba(0,0,0,0.3);cursor:pointer;
          ">${icon}</div>
        `
        const customOverlay = new window.kakao.maps.CustomOverlay({
          position: new window.kakao.maps.LatLng(pos.lat, pos.lng),
          content,
          yAnchor: 1,
        })
        customOverlay.setMap(mapInstance.current)
        markersRef.current.push({ marker: customOverlay, type })
      })
    })
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {/* 상단 검색바 */}
      <div style={{
        position: 'absolute', top: '16px', left: '50%',
        transform: 'translateX(-50%)', zIndex: 10, width: '400px',
      }}>
        <div style={{
          backgroundColor: '#fff', borderRadius: '24px',
          padding: '10px 16px',
          display: 'flex', alignItems: 'center', gap: '8px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
        }}>
          <span style={{ color: '#999', fontSize: '16px' }}>🔍</span>
          <input
            style={{
              flex: 1, border: 'none', outline: 'none',
              fontSize: '13px', color: '#333', backgroundColor: 'transparent',
            }}
            placeholder="위치, 장소 검색..."
          />
        </div>
      </div>

      {/* 범례 */}
      <div style={{
        position: 'absolute', top: '16px', left: '16px', zIndex: 10,
        backgroundColor: 'rgba(13,17,23,0.9)',
        borderRadius: '8px', padding: '10px 12px', border: '1px solid #1E2535',
      }}>
        {[
          { color: '#00E676', icon: '📷', label: 'CCTV' },
          { color: '#FFD600', icon: '💡', label: '가로등' },
          { color: '#00C853', icon: '🏪', label: '편의점' },
        ].map(item => (
          <div key={item.label} style={{
            display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px',
          }}>
            <span style={{
              width: '16px', height: '16px', borderRadius: '50%',
              backgroundColor: item.color, fontSize: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {item.icon}
            </span>
            <span style={{ color: '#fff', fontSize: '11px' }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* 줌 컨트롤 */}
      <div style={{
        position: 'absolute', top: '16px', right: '16px', zIndex: 10,
        display: 'flex', flexDirection: 'column', gap: '4px',
      }}>
        {['+', '−'].map(btn => (
          <button key={btn} style={{
            width: '36px', height: '36px',
            backgroundColor: '#161B27', border: '1px solid #2D3748',
            borderRadius: '6px', color: '#fff', fontSize: '18px', cursor: 'pointer',
          }}
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

      {/* 현재 위치 버튼 */}
      <button style={{
        position: 'absolute', bottom: '32px', right: '16px', zIndex: 10,
        width: '40px', height: '40px', borderRadius: '50%',
        backgroundColor: '#161B27', border: '1px solid #2D3748',
        color: '#fff', fontSize: '18px', cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
      }}
        onClick={() => {
          navigator.geolocation.getCurrentPosition(pos => {
            if (!mapInstance.current) return
            const latlng = new window.kakao.maps.LatLng(
              pos.coords.latitude, pos.coords.longitude
            )
            mapInstance.current.setCenter(latlng)
          })
        }}
      >
        🎯
      </button>
    </div>
  )
}