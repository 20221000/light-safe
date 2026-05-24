import { useState, useEffect, useCallback } from 'react'

const fetchSafetyStats = async () => {
  try {
    // 백엔드 연동 시 아래 주석 해제
    // const res = await fetch('/cctvs/count')  // 또는 별도 stats API
    // return await res.json()

    // 백엔드 미연동 상태 — 0으로 고정
    return {
      cctv: 0,
      streetLamp: 0,
      convenience: 0,
      safetyScore: 0,
    }
  } catch (err) {
    console.error('안전 통계 조회 실패:', err)
    return { cctv: 0, streetLamp: 0, convenience: 0, safetyScore: 0 }
  }
}

const fetchDangerZones = async () => {
  try {
    // 백엔드 연동 시 아래 주석 해제
    // const res = await fetch('/danger-zones')
    // const json = await res.json()
    // return json.success ? json.data : []

    // 백엔드 미연동 상태 — 빈 배열
    return []
  } catch (err) {
    console.error('위험구역 조회 실패:', err)
    return []
  }
}

export function useSafetyData() {
  const [safetyStats, setSafetyStats] = useState({
    cctv: 0,
    streetLamp: 0,
    convenience: 0,
    safetyScore: 0,
  })
  const [dangerZones, setDangerZones] = useState([])
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const [stats, zones] = await Promise.all([
        fetchSafetyStats(),
        fetchDangerZones(),
      ])
      setSafetyStats(stats)
      setDangerZones(zones)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('안전 데이터 업데이트 실패:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 최초 로드
  useEffect(() => {
    refresh()
  }, [refresh])

  // 30초마다 자동 갱신
  useEffect(() => {
    const INTERVAL_MS = 30 * 1000
    const timer = setInterval(refresh, INTERVAL_MS)
    return () => clearInterval(timer)
  }, [refresh])

  return { safetyStats, dangerZones, lastUpdated, isLoading, refresh }
}