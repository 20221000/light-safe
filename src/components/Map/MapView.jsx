import { useEffect, useRef } from 'react'

async function fetchMarkerData() {
  return { cctv: [], streetLamp: [], safeZone: [] }
}

export default function MapView({ filters }) {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markersRef = useRef([])
  const locationMarkerRef = useRef(null)

  useEffect(() => {
    const initMap = () => {
      if (!window.kakao || !window.kakao.maps) return

      const container = mapRef.current
      const options = {
        center: new window.kakao.maps.LatLng(37.4979, 127.0276),
        level: 4,
      }
      mapInstance.current = new window.kakao.maps.Map(container, options)

      fetchMarkerData().then(data => addMarkers(data))

      // 현재 위치 가져오기
      navigator.geolocation?.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          const latlng = new window.kakao.maps.LatLng(latitude, longitude)

          // 지도 중심을 현재 위치로 이동
          mapInstance.current.setCenter(latlng)
          mapInstance.current.setLevel(4)

          // 현재 위치 마커 (파란 펄스 효과)
          const content = `
            <div style="position:relative;width:24px;height:24px;">
              <div style="
                position:absolute;
                top:50%;left:50%;
                transform:translate(-50%,-50%);
                width:24px;height:24px;
                border-radius:50%;
                background:rgba(66,133,244,0.2);
                animation:pulse 2s infinite;
              "></div>
              <div style="
                position:absolute;
                top:50%;left:50%;
                transform:translate(-50%,-50%);
                width:14px;height:14px;
                border-radius:50%;
                background:#4285F4;
                border:2px solid #fff;
                box-shadow:0 2px 6px rgba(0,0,0,0.3);
              "></div>
              <style>
                @keyframes pulse {
                  0% { transform:translate(-50%,-50%) scale(1); opacity:1; }
                  100% { transform:translate(-50%,-50%) scale(2.5); opacity:0; }
                }
              </style>
            </div>
          `

          const locationOverlay = new window.kakao.maps.CustomOverlay({
            position: latlng,
            content,
            yAnchor: 0.5,
            xAnchor: 0.5,
          })
          locationOverlay.setMap(mapInstance.current)
          locationMarkerRef.current = locationOverlay
        },
        (error) => {
          console.log('위치 권한 없음 또는 오류:', error)
          // GPS 없거나 권한 거부 시 기본 강남역으로 유지
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      )
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
          <button
            key={btn}
            style={{
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
      <button
        style={{
          position: 'absolute', bottom: '32px', right: '16px', zIndex: 10,
          width: '40px', height: '40px', borderRadius: '50%',
          backgroundColor: '#161B27', border: '1px solid #2D3748',
          color: '#fff', fontSize: '18px', cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        }}
        onClick={() => {
          navigator.geolocation?.getCurrentPosition(pos => {
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