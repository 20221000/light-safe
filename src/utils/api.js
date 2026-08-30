// 백엔드 호출 공용 함수.
//
// 예전에는 14개 파일이 fetch 를 직접 부르면서 같은 세 줄을 손으로 반복했다:
//
//   const token = localStorage.getItem('accessToken')          (22곳)
//   const headers = { Authorization: `Bearer ${token}` }       (28곳)
//   const json = await readEnvelope(await fetch(url, { headers }))
//
// 한 곳이라도 빠뜨리면 그 화면만 조용히 401 이 되고, readEnvelope 를 빠뜨리면
// 빈 본문에서 SyntaxError 가 터져 진짜 원인(상태코드)을 가린다.
//
// 관리자 페이지용 apiRequest(adminApi.js)가 이미 있었지만 실패 시 throw 하는 방식이라,
// 봉투의 message 를 화면 상태로 쓰는 나머지 페이지들이 쓸 수 없었다.
// 여기서는 봉투를 그대로 돌려준다 — 기존 호출부의 `if (!json.success)` 분기가 그대로 통한다.

import { readEnvelope } from './apiResponse'

/**
 * 로그인 토큰 헤더. 토큰이 없으면 빈 객체다.
 *
 * 첨부파일 내려받기처럼 봉투가 아니라 원본 Response(res.blob())가 필요한 곳에서 쓴다.
 * 그 외에는 apiFetch 가 알아서 붙이므로 직접 부를 일이 없다.
 */
export const authHeaders = () => {
  const token = localStorage.getItem('accessToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * @returns readEnvelope 결과 그대로 — { success, data, message, status }
 *
 * @param path    '/posts/3' 처럼 vite 프록시가 백엔드로 넘기는 경로
 * @param method  기본 GET
 * @param body    객체면 JSON 으로 보낸다. FormData 면 그대로 보낸다.
 * @param auth    로그인 토큰을 붙일지. 로그인·회원가입만 false 다.
 * @param headers 위에 더 얹을 헤더
 */
export async function apiFetch(path, { method = 'GET', body, auth = true, headers = {} } = {}) {
  const requestHeaders = { ...(auth ? authHeaders() : {}), ...headers }

  let payload = body

  // FormData 는 Content-Type 을 직접 넣으면 안 된다 —
  // 브라우저가 multipart 경계 문자열까지 붙여 줘야 서버가 파일을 갈라낸다.
  if (body !== undefined && !(body instanceof FormData)) {
    requestHeaders['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  return readEnvelope(await fetch(path, { method, headers: requestHeaders, body: payload }))
}
