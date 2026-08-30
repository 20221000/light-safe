// 관리자 페이지 공용 API 헬퍼
// 모든 백엔드 응답은 { success, data, message, error } 형태이며, Authorization 헤더로 JWT를 전달한다.
// 실패 문구는 readEnvelope 가 error.message 를 message 로 올려주므로 여기서는 message 만 보면 된다.

import { apiFetch } from './api'

/**
 * 관리자 화면용. 실패를 throw 로 올리고 성공하면 data 만 준다 —
 * 호출부가 전부 try/catch 로 문구를 잡고 있어서 이 모양을 유지한다.
 * 요청 자체는 apiFetch 가 맡는다(헤더·봉투 처리가 한 곳에만 있게).
 */
export async function apiRequest(path, { method = 'GET', body } = {}) {
  const json = await apiFetch(path, { method, body })

  if (!json.success) {
    throw new Error(json.message || '요청에 실패했습니다.')
  }
  return json.data
}

export const apiGet = (path) => apiRequest(path)
export const apiSend = (path, method, body) => apiRequest(path, { method, body })
