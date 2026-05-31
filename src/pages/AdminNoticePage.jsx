import { useState, useEffect } from 'react'
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

export default function AdminNoticePage({ user }) {
  const navigate = useNavigate()
  const { sidebarOpen, setSidebarOpen } = useSidebar()

  const [notices, setNotices] = useState([])
  const [selectedNotice, setSelectedNotice] = useState(null)
  const [editorMode, setEditorMode] = useState('new') // 'new' | 'edit'
  const [titleInput, setTitleInput] = useState('')
  const [contentInput, setContentInput] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [sortOrder, setSortOrder] = useState('최신순')
  const [currentPage, setCurrentPage] = useState(1)
  const [now, setNow] = useState(new Date())
  const [lastSaved, setLastSaved] = useState(null)

  const stats = {
    total: notices.length,
    thisMonth: notices.filter(n => {
      if (!n.createdAt) return false
      const d = new Date(n.createdAt)
      const now = new Date()
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length,
    totalViews: notices.reduce((acc, n) => acc + (n.viewCount ?? 0), 0),
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

  // 백엔드 연동 시 주석 해제
  // useEffect(() => {
  //   const fetchNotices = async () => {
  //     const res = await fetch('/posts?category=NOTICE&page=0&size=100')
  //     const json = await res.json()
  //     if (json.success) setNotices(json.data.items)
  //   }
  //   fetchNotices()
  // }, [])

  const handleSelectNotice = (notice) => {
    setSelectedNotice(notice)
    setEditorMode('edit')
    setTitleInput(notice.title)
    setContentInput(notice.content ?? '')
  }

  const handleNewNotice = () => {
    setEditorMode('new')
    setSelectedNotice(null)
    setTitleInput('')
    setContentInput('')
  }

  const handleSubmit = async () => {
    if (!titleInput.trim()) { window.alert('제목을 입력해주세요.'); return }
    if (!contentInput.trim()) { window.alert('내용을 입력해주세요.'); return }

    if (editorMode === 'new') {
      // POST /posts/admin/notices
      // await fetch('/posts/admin/notices', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
      //   body: JSON.stringify({ title: titleInput, content: contentInput, adminUserId: user.userId }),
      // })
      window.alert('공지사항이 등록되었습니다.')
    } else {
      // PUT /posts/{postId}
      // await fetch(`/posts/${selectedNotice.postId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
      //   body: JSON.stringify({ title: titleInput, content: contentInput, category: 'NOTICE' }),
      // })
      window.alert('공지사항이 수정되었습니다.')
    }
    setTitleInput('')
    setContentInput('')
    setEditorMode('new')
    setSelectedNotice(null)
  }

  const handleDelete = async () => {
    if (!selectedNotice) return
    if (!window.confirm('정말 삭제하시겠습니까?')) return
    // DELETE /posts/{postId}
    // await fetch(`/posts/${selectedNotice.postId}`, {
    //   method: 'DELETE',
    //   headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
    // })
    window.alert('공지사항이 삭제되었습니다.')
    setSelectedNotice(null)
    setEditorMode('new')
  }

  const handleTempSave = () => {
    const t = new Date()
    setLastSaved(`${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}`)
    window.alert('임시저장 되었습니다.')
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

  const filteredNotices = notices
    .filter(n => !searchInput || n.title?.includes(searchInput))
    .sort((a, b) => {
      if (sortOrder === '최신순') return new Date(b.createdAt) - new Date(a.createdAt)
      if (sortOrder === '오래된순') return new Date(a.createdAt) - new Date(b.createdAt)
      if (sortOrder === '조회수순') return (b.viewCount ?? 0) - (a.viewCount ?? 0)
      return 0
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
              style={{ ...s.navItem, ...(item.key === 'notices' ? s.navItemActive : {}) }}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}>📢</span>
            <h2 style={s.pageTitle}>공지사항 관리</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={s.dateText}>{formatDate(now)}</span>
            <button style={s.bellBtn}>🔔</button>
          </div>
        </div>

        <div style={s.contentArea}>

          {/* 좌측 */}
          <div style={s.leftCol}>

            {/* KPI 카드 */}
            <div style={s.kpiRow}>
              {[
                { icon: '📢', label: '전체 공지',   value: stats.total,      unit: '건', color: '#00E676' },
                { icon: '📅', label: '이번 달 공지', value: stats.thisMonth,  unit: '건', color: '#3182CE' },
                { icon: '👁',  label: '총 조회수',   value: stats.totalViews, unit: '회', color: '#FFD600' },
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

            {/* 검색 + 필터 */}
            <div style={s.filterRow}>
              <div style={s.searchBox}>
                <input
                  style={s.searchInput}
                  placeholder="공지 제목 검색..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                />
                <span style={{ color: '#A0AEC0' }}>🔍</span>
              </div>
              <select
                style={s.select}
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value)}
              >
                <option>최신순</option>
                <option>조회수순</option>
                <option>오래된순</option>
              </select>
              <button style={s.newBtn} onClick={handleNewNotice}>+ 새 공지 작성</button>
            </div>

            {/* 공지 목록 */}
            <div style={s.noticeList}>
              {filteredNotices.length > 0 ? (
                filteredNotices.map((notice, idx) => (
                  <div
                    key={notice.postId}
                    style={{
                      ...s.noticeItem,
                      ...(selectedNotice?.postId === notice.postId ? s.noticeItemActive : {}),
                    }}
                    onClick={() => handleSelectNotice(notice)}
                  >
                    <div style={s.noticeItemLeft}>
                      <span style={s.noticeNum}>#{String(idx + 1).padStart(3, '0')}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={s.noticeTitle}>{notice.title}</div>
                      <div style={s.noticeMeta}>
                        <span>📅 {notice.createdAt?.slice(0, 16)}</span>
                        <span>👁 {(notice.viewCount ?? 0).toLocaleString()}회</span>
                      </div>
                      {notice.content && (
                        <div style={s.noticePreview}>
                          {notice.content.slice(0, 60)}{notice.content.length > 60 ? '...' : ''}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px', color: '#A0AEC0' }}>📌</span>
                      <span style={{ fontSize: '16px', color: '#A0AEC0' }}>›</span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={s.emptySmall}>공지사항이 없습니다.</div>
              )}
            </div>

            {/* 페이지네이션 */}
            <div style={s.pagination}>
              <button style={s.pageBtn}>{'<'}</button>
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  style={{ ...s.pageBtn, ...(currentPage === n ? s.pageBtnActive : {}) }}
                  onClick={() => setCurrentPage(n)}
                >
                  {n}
                </button>
              ))}
              <button style={s.pageBtn}>...</button>
              <button style={s.pageBtn}>{'>'}</button>
            </div>
          </div>

          {/* 우측 */}
          <div style={s.rightCol}>

            {/* 에디터 탭 */}
            <div style={s.editorCard}>
              <div style={s.tabRow}>
                <button
                  style={{ ...s.tab, ...(editorMode === 'new' ? s.tabActive : {}) }}
                  onClick={handleNewNotice}
                >
                  ✏️ 새 공지 작성
                </button>
                <button
                  style={{ ...s.tab, ...(editorMode === 'edit' ? s.tabActive : {}) }}
                  onClick={() => selectedNotice && setEditorMode('edit')}
                >
                  📝 선택된 공지 수정
                </button>
              </div>

              {/* 제목 */}
              <div style={{ marginBottom: '12px' }}>
                <label style={s.editorLabel}>제목</label>
                <div style={s.titleInputWrapper}>
                  <input
                    style={s.titleInput}
                    placeholder="공지 제목을 입력해주세요"
                    value={titleInput}
                    maxLength={100}
                    onChange={e => setTitleInput(e.target.value)}
                  />
                  <span style={s.charCount}>{titleInput.length} / 100</span>
                </div>
              </div>

              {/* 내용 */}
              <div style={{ marginBottom: '8px' }}>
                <label style={s.editorLabel}>내용</label>
                {/* 툴바 */}
                <div style={s.toolbar}>
                  {['B', 'I', 'U', '≡', '•', '←', '→', '🔗', '🖼'].map(tool => (
                    <button key={tool} style={s.toolBtn}>{tool}</button>
                  ))}
                </div>
                <div style={{ position: 'relative' }}>
                  <textarea
                    style={s.textarea}
                    placeholder={'공지 내용을 입력해주세요.\n사용자에게 전달할 중요한 내용을 작성해주세요.'}
                    value={contentInput}
                    maxLength={5000}
                    onChange={e => setContentInput(e.target.value)}
                  />
                  <span style={s.textareaCount}>{contentInput.length} / 5000</span>
                  {lastSaved && (
                    <span style={s.savedText}>✅ 저장됨 {lastSaved}</span>
                  )}
                </div>
              </div>

              {/* 액션 버튼 */}
              <div style={s.editorActions}>
                <button style={s.previewBtn}>👁 미리보기</button>
                <button style={s.tempBtn} onClick={handleTempSave}>💾 임시저장</button>
                <button style={s.submitBtn} onClick={handleSubmit}>
                  {editorMode === 'new' ? '✈ 등록하기' : '✏️ 수정하기'}
                </button>
              </div>
            </div>

            {/* 선택된 공지 상세 */}
            {selectedNotice && (
              <div style={s.detailCard}>
                <div style={s.detailHeader}>
                  <span style={s.detailHeaderTitle}>선택된 공지 상세 정보</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#A0AEC0', fontSize: '12px' }}>📌 공지 표시</span>
                    <div style={s.toggle}>
                      <div style={s.toggleDot} />
                    </div>
                  </div>
                </div>
                <div style={s.detailTitle}>{selectedNotice.title}</div>
                <div style={s.detailMeta}>
                  <span>📅 {selectedNotice.createdAt?.slice(0, 16)}</span>
                  <span>👁 {(selectedNotice.viewCount ?? 0).toLocaleString()}회</span>
                  <span>✏️ 작성자: 관리자</span>
                </div>
                <div style={s.detailContent}>
                  {selectedNotice.content ?? '내용이 없습니다.'}
                </div>
                <div style={s.detailActions}>
                  <button
                    style={s.editBtn}
                    onClick={() => { setEditorMode('edit'); setTitleInput(selectedNotice.title); setContentInput(selectedNotice.content ?? '') }}
                  >
                    ✏️ 수정
                  </button>
                  <button style={s.deleteBtn} onClick={handleDelete}>🗑 삭제</button>
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
  bellBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' },
  contentArea: { flex: 1, display: 'flex', overflow: 'hidden', padding: '16px 20px', gap: '16px' },
  leftCol: { flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'hidden' },
  rightCol: { width: '420px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' },
  kpiRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', flexShrink: 0 },
  kpiCard: { backgroundColor: '#161B27', borderRadius: '10px', padding: '14px', border: '1px solid #1E2535' },
  kpiIcon: { width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  kpiLabel: { color: '#A0AEC0', fontSize: '11px', marginBottom: '2px' },
  kpiValue: { fontSize: '22px', fontWeight: '800' },
  filterRow: { display: 'flex', gap: '8px', flexShrink: 0 },
  searchBox: { flex: 1, display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#161B27', border: '1px solid #1E2535', borderRadius: '8px', padding: '9px 14px' },
  searchInput: { flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: '13px' },
  select: { backgroundColor: '#161B27', border: '1px solid #1E2535', borderRadius: '8px', padding: '9px 12px', color: '#fff', fontSize: '12px', cursor: 'pointer', outline: 'none' },
  newBtn: { backgroundColor: '#00E676', border: 'none', borderRadius: '8px', padding: '9px 16px', color: '#000', fontWeight: '700', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' },
  noticeList: { flex: 1, overflowY: 'auto', backgroundColor: '#161B27', borderRadius: '12px', border: '1px solid #1E2535' },
  noticeItem: { display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px', borderBottom: '1px solid #1E2535', cursor: 'pointer', borderLeft: '3px solid transparent' },
  noticeItemActive: { borderLeft: '3px solid #00E676', backgroundColor: 'rgba(0,230,118,0.05)' },
  noticeItemLeft: { flexShrink: 0, paddingTop: '2px' },
  noticeNum: { color: '#A0AEC0', fontSize: '12px', fontWeight: '600' },
  noticeTitle: { color: '#fff', fontSize: '14px', fontWeight: '700', marginBottom: '4px' },
  noticeMeta: { display: 'flex', gap: '12px', color: '#A0AEC0', fontSize: '12px', marginBottom: '4px' },
  noticePreview: { color: '#A0AEC0', fontSize: '12px', lineHeight: '1.5' },
  emptySmall: { color: '#A0AEC0', fontSize: '13px', textAlign: 'center', padding: '40px 0' },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', flexShrink: 0 },
  pageBtn: { width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#161B27', border: '1px solid #1E2535', color: '#A0AEC0', fontSize: '13px', cursor: 'pointer' },
  pageBtnActive: { backgroundColor: '#00E676', color: '#000', border: '1px solid #00E676', fontWeight: '700' },
  editorCard: { backgroundColor: '#161B27', borderRadius: '12px', padding: '16px', border: '1px solid #1E2535', flexShrink: 0 },
  tabRow: { display: 'flex', borderBottom: '1px solid #1E2535', marginBottom: '14px' },
  tab: { flex: 1, padding: '8px', background: 'none', border: 'none', color: '#A0AEC0', fontSize: '13px', cursor: 'pointer', borderBottom: '2px solid transparent', marginBottom: '-1px' },
  tabActive: { color: '#00E676', borderBottom: '2px solid #00E676', fontWeight: '700' },
  editorLabel: { display: 'block', color: '#A0AEC0', fontSize: '12px', marginBottom: '6px', fontWeight: '500' },
  titleInputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  titleInput: { flex: 1, backgroundColor: '#0D1117', border: '1px solid #2D3748', borderRadius: '8px', padding: '10px 80px 10px 14px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  charCount: { position: 'absolute', right: '12px', color: '#A0AEC0', fontSize: '11px', whiteSpace: 'nowrap' },
  toolbar: { display: 'flex', gap: '4px', backgroundColor: '#0D1117', border: '1px solid #2D3748', borderBottom: 'none', borderRadius: '8px 8px 0 0', padding: '6px 10px' },
  toolBtn: { background: 'none', border: 'none', color: '#A0AEC0', fontSize: '13px', cursor: 'pointer', padding: '3px 6px', borderRadius: '4px' },
  textarea: { width: '100%', height: '180px', backgroundColor: '#0D1117', border: '1px solid #2D3748', borderTop: 'none', borderRadius: '0 0 8px 8px', padding: '12px 14px 28px', color: '#fff', fontSize: '13px', outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: '1.7' },
  textareaCount: { position: 'absolute', bottom: '8px', right: '12px', color: '#A0AEC0', fontSize: '11px' },
  savedText: { position: 'absolute', bottom: '8px', left: '12px', color: '#00E676', fontSize: '11px' },
  editorActions: { display: 'flex', gap: '8px', marginTop: '10px' },
  previewBtn: { flex: 1, backgroundColor: 'transparent', border: '1px solid #2D3748', borderRadius: '8px', padding: '10px', color: '#A0AEC0', fontSize: '13px', cursor: 'pointer' },
  tempBtn: { flex: 1, backgroundColor: 'transparent', border: '1px solid #2D3748', borderRadius: '8px', padding: '10px', color: '#A0AEC0', fontSize: '13px', cursor: 'pointer' },
  submitBtn: { flex: 2, backgroundColor: '#00E676', border: 'none', borderRadius: '8px', padding: '10px', color: '#000', fontWeight: '700', fontSize: '14px', cursor: 'pointer' },
  detailCard: { backgroundColor: '#161B27', borderRadius: '12px', padding: '16px', border: '1px solid #1E2535' },
  detailHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' },
  detailHeaderTitle: { color: '#A0AEC0', fontSize: '12px', fontWeight: '600' },
  toggle: { width: '36px', height: '20px', borderRadius: '10px', backgroundColor: '#00E676', position: 'relative', cursor: 'pointer' },
  toggleDot: { position: 'absolute', top: '2px', right: '2px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#fff' },
  detailTitle: { color: '#fff', fontSize: '18px', fontWeight: '700', marginBottom: '8px' },
  detailMeta: { display: 'flex', gap: '14px', color: '#A0AEC0', fontSize: '12px', marginBottom: '12px' },
  detailContent: { color: '#E2E8F0', fontSize: '13px', lineHeight: '1.7', marginBottom: '14px', whiteSpace: 'pre-wrap' },
  detailActions: { display: 'flex', gap: '8px' },
  editBtn: { flex: 1, backgroundColor: 'transparent', border: '1px solid #00E676', borderRadius: '8px', padding: '10px', color: '#00E676', fontWeight: '600', fontSize: '13px', cursor: 'pointer' },
  deleteBtn: { flex: 1, backgroundColor: 'transparent', border: '1px solid #FF3B3B', borderRadius: '8px', padding: '10px', color: '#FF3B3B', fontWeight: '600', fontSize: '13px', cursor: 'pointer' },
}