import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar/Sidebar'
import SidebarToggleBtn from '../components/Sidebar/SidebarToggleBtn'
import { useNavigation } from '../hooks/useNavigation'
import { useSidebar } from '../hooks/useSidebar'

const EMPTY_STATE = {
  profile: null,
  friends: [],
  friendRequests: [],
  favoritePlaces: [],
  recentRoutes: [],
  reportStats: null,
}

const PLACE_ICONS = {
  HOME: '🏠', SCHOOL: '🏫', WORK: '💼', ETC: '📍',
}

export default function MyInfoPage({ user, onLogout }) {
  const navigate = useNavigate()
  const handleNavigate = useNavigation()
  const { sidebarOpen, setSidebarOpen } = useSidebar()

  const [nicknameInput, setNicknameInput] = useState('')
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [friendSearch, setFriendSearch] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { profile, friends, friendRequests, favoritePlaces, recentRoutes, reportStats } = EMPTY_STATE

  const handleNicknameChange = async () => {
    if (!nicknameInput.trim()) { alert('닉네임을 입력해주세요.'); return }
    // PUT /users/{userId} 연동 시 주석 해제
    // await fetch(`/users/${user.userId}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
    //   body: JSON.stringify({ nickname: nicknameInput }),
    // })
    alert('닉네임이 변경되었습니다.')
    setNicknameInput('')
  }

  const handlePasswordChange = async () => {
    if (!currentPw || !newPw) { alert('비밀번호를 입력해주세요.'); return }
    if (newPw.length < 6) { alert('비밀번호는 6자 이상이어야 합니다.'); return }
    // PUT /users/{userId} 연동 시 주석 해제
    alert('비밀번호가 변경되었습니다.')
    setCurrentPw(''); setNewPw('')
  }

  const handleDeleteAccount = async () => {
    // DELETE /users/{userId} 연동 시 주석 해제
    alert('회원 탈퇴가 완료되었습니다.')
    onLogout()
    navigate('/')
  }

  const handleEmergencyToggle = (friendId) => {
    // PUT /friends/{friendId}/emergency-allow 연동 시 구현
  }

  const handleFriendAccept = (requestId) => {
    // PUT /friends/requests/{requestId}/accept 연동 시 구현
  }

  const handleFriendReject = (requestId) => {
    // PUT /friends/requests/{requestId}/reject 연동 시 구현
  }

  const handleDeletePlace = (placeId) => {
    // DELETE /favorite-places/{placeId} 연동 시 구현
  }

  const handleDeleteAllRoutes = () => {
    // DELETE /route-history 연동 시 구현
  }

  const handleRouteAgain = (route) => {
    navigate('/')
  }

  const s = styles
  const avatarChar = user?.nickname?.charAt(0) ?? profile?.nickname?.charAt(0) ?? '?'

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
        activePage="myinfo"
        isOpen={sidebarOpen}
      />
      <SidebarToggleBtn isOpen={sidebarOpen} onClick={() => setSidebarOpen(prev => !prev)} />

      <main style={s.main}>
        <h2 style={s.pageTitle}>내 정보</h2>
        <div style={s.divider} />

        <div style={s.scrollArea}>
          <div style={s.grid}>

            {/* 좌측 컬럼 */}
            <div style={s.leftCol}>

              <div style={s.card}>
                <div style={s.cardTitle}>프로필 정보</div>
                <div style={s.profileRow}>
                  <div style={s.avatarLg}>{avatarChar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={s.profileName}>
                      {user?.nickname ?? profile?.nickname ?? '로그인이 필요합니다'}
                    </div>
                    <div style={s.profileSub}>@{user?.username ?? profile?.username ?? '-'}</div>
                    <div style={s.profileSub}>{profile?.email ?? '-'}</div>
                  </div>
                  <button style={s.outlineBtn}>프로필 수정</button>
                </div>
              </div>

              <div style={s.card}>
                <div style={s.cardTitle}>계정 설정</div>

                <div style={s.settingSection}>
                  <div style={s.settingLabel}>닉네임 변경</div>
                  <div style={s.settingRow}>
                    <span style={s.settingCurrent}>
                      현재 닉네임 &nbsp;
                      <span style={{ color: '#fff' }}>{user?.nickname ?? '-'}</span>
                    </span>
                    <input
                      style={s.settingInput}
                      placeholder="새 닉네임을 입력해주세요"
                      value={nicknameInput}
                      onChange={e => setNicknameInput(e.target.value)}
                    />
                    <button style={s.mintBtn} onClick={handleNicknameChange}>변경</button>
                  </div>
                </div>

                <div style={s.sectionDivider} />

                <div style={s.settingSection}>
                  <div style={s.settingLabel}>비밀번호 변경</div>
                  <div style={s.settingRow}>
                    <span style={s.settingCurrent}>현재 비밀번호</span>
                    <div style={s.pwInputWrapper}>
                      <input
                        style={s.settingInput}
                        type={showCurrentPw ? 'text' : 'password'}
                        placeholder="현재 비밀번호 입력"
                        value={currentPw}
                        onChange={e => setCurrentPw(e.target.value)}
                      />
                      <button style={s.eyeBtn} onClick={() => setShowCurrentPw(p => !p)}>
                        {showCurrentPw ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                  <div style={{ ...s.settingRow, marginTop: '8px' }}>
                    <span style={s.settingCurrent}>새 비밀번호</span>
                    <div style={s.pwInputWrapper}>
                      <input
                        style={s.settingInput}
                        type={showNewPw ? 'text' : 'password'}
                        placeholder="새 비밀번호 입력"
                        value={newPw}
                        onChange={e => setNewPw(e.target.value)}
                      />
                      <button style={s.eyeBtn} onClick={() => setShowNewPw(p => !p)}>
                        {showNewPw ? '🙈' : '👁️'}
                      </button>
                    </div>
                    <button style={s.mintBtn} onClick={handlePasswordChange}>변경</button>
                  </div>
                </div>

                <div style={s.sectionDivider} />

                <div style={s.settingSection}>
                  <div style={s.settingLabel}>회원 탈퇴</div>
                  <div style={s.settingRow}>
                    <span style={{ color: '#FF3B3B', fontSize: '13px', flex: 1 }}>
                      탈퇴 시 모든 정보가 삭제되며 복구할 수 없습니다.
                    </span>
                    <button style={s.dangerBtn} onClick={() => setShowDeleteConfirm(true)}>
                      탈퇴하기
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 우측 컬럼 */}
            <div style={s.rightCol}>

              <div style={s.card}>
                <div style={s.cardHeaderRow}>
                  <div style={s.cardTitle}>친구 관리</div>
                  <span style={s.countBadge}>{friends.length}명</span>
                  <div style={{ flex: 1 }} />
                  <div style={s.friendSearchBox}>
                    <input
                      style={s.friendSearchInput}
                      placeholder="친구 검색"
                      value={friendSearch}
                      onChange={e => setFriendSearch(e.target.value)}
                    />
                    <span style={{ color: '#A0AEC0', fontSize: '14px' }}>🔍</span>
                  </div>
                </div>

                {friends.length > 0 ? (
                  friends.filter(f => f.nickname.includes(friendSearch)).map(friend => (
                    <div key={friend.friendId} style={s.friendItem}>
                      <div style={{ ...s.friendAvatar }}>
                        {friend.nickname.charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <span style={s.friendName}>{friend.nickname}</span>
                        <span style={s.friendUsername}>@{friend.username}</span>
                      </div>
                      <span style={{
                        fontSize: '11px',
                        color: friend.isEmergencyAllowed ? '#00E676' : '#A0AEC0',
                        marginRight: '8px',
                      }}>
                        긴급공유 {friend.isEmergencyAllowed ? 'ON' : 'OFF'}
                      </span>
                      <Toggle
                        checked={friend.isEmergencyAllowed}
                        onChange={() => handleEmergencyToggle(friend.friendId)}
                      />
                    </div>
                  ))
                ) : (
                  <div style={s.emptySmall}>친구 목록이 없습니다.</div>
                )}

                {friendRequests.length > 0 && (
                  <>
                    <div style={{ ...s.sectionDivider, margin: '12px 0' }} />
                    <div style={s.cardHeaderRow}>
                      <span style={s.settingLabel}>친구 요청</span>
                      <span style={s.countBadge}>{friendRequests.length}</span>
                    </div>
                    {friendRequests.map(req => (
                      <div key={req.requestId} style={s.friendItem}>
                        <div style={s.friendAvatar}>{req.nickname.charAt(0)}</div>
                        <div style={{ flex: 1 }}>
                          <span style={s.friendName}>{req.nickname}</span>
                        </div>
                        <button style={s.mintBtn} onClick={() => handleFriendAccept(req.requestId)}>수락</button>
                        <button style={{ ...s.grayBtn, marginLeft: '6px' }} onClick={() => handleFriendReject(req.requestId)}>거절</button>
                      </div>
                    ))}
                  </>
                )}
              </div>

              <div style={s.twoColRow}>

                <div style={s.card}>
                  <div style={s.cardHeaderRow}>
                    <div style={s.cardTitle}>즐겨찾기 장소</div>
                    <button style={s.smallMintBtn}>추가</button>
                  </div>
                  {favoritePlaces.length > 0 ? (
                    favoritePlaces.map(place => (
                      <div key={place.favoritePlaceId} style={s.placeItem}>
                        <span style={{ fontSize: '18px' }}>{PLACE_ICONS[place.placeType] ?? '📍'}</span>
                        <div style={{ flex: 1 }}>
                          <div style={s.placeName}>{place.placeName}</div>
                          <div style={s.placeAddr}>{place.address}</div>
                        </div>
                        <button style={s.removeBtn} onClick={() => handleDeletePlace(place.favoritePlaceId)}>✕</button>
                      </div>
                    ))
                  ) : (
                    <div style={s.emptySmall}>즐겨찾기 장소가 없습니다.</div>
                  )}
                </div>

                <div style={s.card}>
                  <div style={s.cardHeaderRow}>
                    <div style={s.cardTitle}>최근 경로</div>
                    {recentRoutes.length > 0 && (
                      <button style={s.dangerTextBtn} onClick={handleDeleteAllRoutes}>전체 삭제</button>
                    )}
                  </div>
                  {recentRoutes.length > 0 ? (
                    recentRoutes.map(route => (
                      <div key={route.routeHistoryId} style={s.routeItem}>
                        <div style={{ flex: 1 }}>
                          <div style={s.routeName}>{route.routeName}</div>
                          <div style={s.routeDate}>{route.searchedAt}</div>
                        </div>
                        <button style={s.smallMintBtn} onClick={() => handleRouteAgain(route)}>
                          다시 찾기
                        </button>
                      </div>
                    ))
                  ) : (
                    <div style={s.emptySmall}>최근 경로가 없습니다.</div>
                  )}
                </div>
              </div>

              <div style={s.card}>
                <div style={s.cardTitle}>내 신고 내역</div>
                <div style={s.reportRow}>
                  <div style={s.reportBox}>
                    <div style={s.reportLabel}>총 신고 횟수</div>
                    <div style={s.reportValue}>{reportStats?.totalReports ?? '-'}회</div>
                  </div>
                  <div style={s.reportBox}>
                    <div style={s.reportLabel}>허위신고 횟수</div>
                    <div style={{
                      ...s.reportValue,
                      color: reportStats?.fakeReports > 0 ? '#FF3B3B' : '#fff',
                    }}>
                      {reportStats?.fakeReports ?? '-'}회
                    </div>
                  </div>
                </div>
                {reportStats?.fakeReports >= 2 && (
                  <div style={s.warningBox}>
                    ⚠️ 허위신고가 2회 이상일 경우 서비스 이용에 제한이 발생할 수 있습니다.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {showDeleteConfirm && (
        <div style={s.modalBg}>
          <div style={s.modal}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>⚠️</div>
            <div style={s.modalTitle}>정말 탈퇴하시겠습니까?</div>
            <div style={s.modalDesc}>탈퇴 시 모든 정보가 삭제되며<br />복구할 수 없습니다.</div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                style={{ ...s.grayBtn, flex: 1, padding: '12px' }}
                onClick={() => setShowDeleteConfirm(false)}
              >
                취소
              </button>
              <button
                style={{ ...s.dangerBtn, flex: 1, padding: '12px' }}
                onClick={handleDeleteAccount}
              >
                탈퇴하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Toggle({ checked, onChange }) {
  return (
    <div onClick={onChange} style={{
      width: '36px', height: '20px', borderRadius: '10px',
      backgroundColor: checked ? '#00E676' : '#374151',
      cursor: 'pointer', position: 'relative',
      transition: 'background-color 0.2s', flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', top: '2px',
        left: checked ? '18px' : '2px',
        width: '16px', height: '16px', borderRadius: '50%',
        backgroundColor: '#fff', transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }} />
    </div>
  )
}

const styles = {
  main: { flex: 1, height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '24px 28px' },
  pageTitle: { color: '#fff', fontSize: '24px', fontWeight: '700', margin: '0 0 12px 0' },
  divider: { height: '1px', backgroundColor: '#1E2535', marginBottom: '20px' },
  scrollArea: { flex: 1, overflowY: 'auto' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', paddingBottom: '24px' },
  leftCol: { display: 'flex', flexDirection: 'column', gap: '16px' },
  rightCol: { display: 'flex', flexDirection: 'column', gap: '16px' },
  card: { backgroundColor: '#161B27', borderRadius: '12px', padding: '20px', border: '1px solid #1E2535' },
  cardTitle: { color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '16px' },
  cardHeaderRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' },
  profileRow: { display: 'flex', alignItems: 'center', gap: '16px' },
  avatarLg: { width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#00E676', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '700', flexShrink: 0 },
  profileName: { color: '#fff', fontSize: '20px', fontWeight: '700' },
  profileSub: { color: '#A0AEC0', fontSize: '13px', marginTop: '3px' },
  settingSection: { marginBottom: '4px' },
  settingLabel: { color: '#A0AEC0', fontSize: '13px', fontWeight: '600', marginBottom: '10px' },
  settingRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  settingCurrent: { color: '#A0AEC0', fontSize: '13px', whiteSpace: 'nowrap' },
  settingInput: { flex: 1, backgroundColor: '#0D1117', border: '1px solid #2D3748', borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '13px', outline: 'none' },
  pwInputWrapper: { flex: 1, position: 'relative', display: 'flex', alignItems: 'center' },
  eyeBtn: { position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' },
  sectionDivider: { height: '1px', backgroundColor: '#1E2535', margin: '16px 0' },
  mintBtn: { backgroundColor: '#00E676', border: 'none', borderRadius: '8px', padding: '10px 16px', color: '#000', fontWeight: '700', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' },
  smallMintBtn: { backgroundColor: '#00E676', border: 'none', borderRadius: '6px', padding: '6px 12px', color: '#000', fontWeight: '700', fontSize: '12px', cursor: 'pointer' },
  outlineBtn: { backgroundColor: 'transparent', border: '1px solid #00E676', borderRadius: '8px', padding: '10px 16px', color: '#00E676', fontWeight: '600', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' },
  grayBtn: { backgroundColor: 'transparent', border: '1px solid #2D3748', borderRadius: '8px', padding: '8px 14px', color: '#A0AEC0', fontSize: '13px', cursor: 'pointer' },
  dangerBtn: { backgroundColor: 'transparent', border: '1px solid #FF3B3B', borderRadius: '8px', padding: '10px 16px', color: '#FF3B3B', fontWeight: '600', fontSize: '13px', cursor: 'pointer' },
  dangerTextBtn: { background: 'none', border: 'none', color: '#FF3B3B', fontSize: '12px', cursor: 'pointer' },
  countBadge: { backgroundColor: '#00E676', color: '#000', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px' },
  friendSearchBox: { display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#0D1117', border: '1px solid #2D3748', borderRadius: '8px', padding: '6px 10px' },
  friendSearchInput: { background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: '12px', width: '100px' },
  friendItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid #1E2535' },
  friendAvatar: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1E2535', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', flexShrink: 0 },
  friendName: { color: '#fff', fontSize: '14px', fontWeight: '600' },
  friendUsername: { color: '#A0AEC0', fontSize: '12px', marginLeft: '6px' },
  emptySmall: { color: '#A0AEC0', fontSize: '12px', textAlign: 'center', padding: '20px 0' },
  twoColRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  placeItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid #1E2535' },
  placeName: { color: '#fff', fontSize: '13px', fontWeight: '600' },
  placeAddr: { color: '#A0AEC0', fontSize: '11px', marginTop: '2px' },
  removeBtn: { background: 'none', border: 'none', color: '#A0AEC0', fontSize: '14px', cursor: 'pointer' },
  routeItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid #1E2535' },
  routeName: { color: '#fff', fontSize: '13px', fontWeight: '600' },
  routeDate: { color: '#A0AEC0', fontSize: '11px', marginTop: '2px' },
  reportRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  reportBox: { backgroundColor: '#0D1117', borderRadius: '8px', padding: '16px', textAlign: 'center', border: '1px solid #1E2535' },
  reportLabel: { color: '#A0AEC0', fontSize: '12px', marginBottom: '8px' },
  reportValue: { color: '#fff', fontSize: '24px', fontWeight: '700' },
  warningBox: { marginTop: '12px', backgroundColor: 'rgba(255,59,59,0.1)', border: '1px solid rgba(255,59,59,0.3)', borderRadius: '8px', padding: '12px', color: '#FF3B3B', fontSize: '13px' },
  modalBg: { position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: { backgroundColor: '#161B27', borderRadius: '16px', padding: '32px 28px', textAlign: 'center', border: '1px solid #FF3B3B', maxWidth: '320px', width: '90%' },
  modalTitle: { color: '#fff', fontSize: '18px', fontWeight: '700', marginBottom: '8px' },
  modalDesc: { color: '#A0AEC0', fontSize: '13px', lineHeight: '1.6' },
}