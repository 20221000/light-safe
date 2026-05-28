import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar/Sidebar'
import SidebarToggleBtn from '../components/Sidebar/SidebarToggleBtn'
import { useNavigation } from '../hooks/useNavigation'
import { useSidebar } from '../hooks/useSidebar'

const CATEGORIES = ['전체', '공지', '정보', '질문', '제보', '팁']

const CATEGORY_STYLE = {
  '공지': { bg: '#4A5568', color: '#fff' },
  '정보': { bg: '#3182CE', color: '#fff' },
  '질문': { bg: '#00E676', color: '#000' },
  '제보': { bg: '#E53E3E', color: '#fff' },
  '팁':   { bg: '#D69E2E', color: '#fff' },
}

export default function CommunityPage({ user, onLogout }) {
  const navigate = useNavigate()
  const handleNavigate = useNavigation()
  const { sidebarOpen, setSidebarOpen } = useSidebar()

  const [activeCategory, setActiveCategory] = useState('전체')
  const [searchInput, setSearchInput] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const posts = []
  const notices = []
  const popularPosts = []
  const stats = { totalPosts: null, todayPosts: null, totalMembers: null }

  const s = styles

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
        activePage="community"
        isOpen={sidebarOpen}
      />
      <SidebarToggleBtn isOpen={sidebarOpen} onClick={() => setSidebarOpen(prev => !prev)} />

      {/* 중앙 콘텐츠 */}
      <main style={s.main}>

        <div style={s.topBar}>
          <h2 style={s.pageTitle}>커뮤니티</h2>
          <div style={s.topRight}>
            <div style={s.searchBox}>
              <span style={{ color: '#A0AEC0', fontSize: '16px' }}>🔍</span>
              <input
                style={s.searchInput}
                placeholder="게시글 검색..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
            </div>
            <button
              style={s.writeBtn}
              onClick={() => {
                if (!user) { alert('로그인이 필요합니다.'); navigate('/login'); return }
                navigate('/community/write')
              }}
            >
              글쓰기
            </button>
          </div>
        </div>

        <div style={s.tabRow}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              style={{ ...s.tab, ...(activeCategory === cat ? s.tabActive : {}) }}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={s.scrollArea}>

          {notices.length > 0 && (
            <>
              <div style={s.sectionLabel}>📌 공지사항</div>
              {notices.map(notice => (
                <div
                  key={notice.postId}
                  style={s.noticeCard}
                  onClick={() => navigate(`/community/${notice.postId}`)}
                >
                  <span style={categoryBadgeStyle('공지')}>공지</span>
                  <span style={s.noticeTitle}>{notice.title}</span>
                  <span style={s.noticeMeta}>{notice.date}</span>
                  <span style={s.noticeMeta}>👁 {notice.viewCount}</span>
                </div>
              ))}
            </>
          )}

          <div style={{ marginTop: '12px' }}>
            {posts.length > 0 ? (
              posts.map(post => (
                <PostCard
                  key={post.postId}
                  post={post}
                  onClick={() => navigate(`/community/${post.postId}`)}
                />
              ))
            ) : (
              <div style={s.emptyState}>아직 게시글이 없습니다.</div>
            )}
          </div>

          {posts.length > 0 && (
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
              <button style={s.pageBtn}>{'...'}</button>
              <button style={s.pageBtn}>{'>'}</button>
            </div>
          )}
        </div>
      </main>

      {/* 우측 패널 */}
      <aside style={s.rightPanel}>
        <div style={s.card}>
          <div style={s.cardTitle}>🔥 인기 게시글</div>
          {popularPosts.length > 0 ? (
            popularPosts.map((post, idx) => (
              <div
                key={post.postId}
                style={s.popularItem}
                onClick={() => navigate(`/community/${post.postId}`)}
              >
                <span style={s.popularRank}>{idx + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={s.popularTitle}>{post.title}</div>
                  <div style={s.popularLike}>❤ {post.likeCount}</div>
                </div>
              </div>
            ))
          ) : (
            <div style={s.emptySmall}>데이터 준비 중입니다.</div>
          )}
        </div>

        <div style={s.card}>
          <div style={s.cardTitle}>📊 커뮤니티 통계</div>
          {[
            { label: '전체 게시글', value: stats.totalPosts },
            { label: '오늘 게시글', value: stats.todayPosts },
            { label: '전체 회원',   value: stats.totalMembers },
          ].map(item => (
            <div key={item.label} style={s.statRow}>
              <span style={s.statLabel}>{item.label}</span>
              <span style={s.statValue}>
                {item.value !== null ? item.value.toLocaleString() : '-'}
              </span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}

function PostCard({ post, onClick }) {
  const s = styles
  return (
    <div style={s.postCard} onClick={onClick}>
      <div style={s.postTop}>
        <span style={categoryBadgeStyle(post.category)}>{post.category}</span>
        <span style={s.postTitle}>{post.title}</span>
      </div>
      <div style={s.postPreview}>{post.preview}</div>
      <div style={s.postBottom}>
        <span style={s.postMeta}>{post.nickname}</span>
        <span style={s.postMeta}>{post.date}</span>
        <span style={s.postMeta}>👁 {post.viewCount}</span>
        <span style={s.postMeta}>❤ {post.likeCount}</span>
        <span style={s.postMeta}>💬 {post.commentCount}</span>
      </div>
    </div>
  )
}

function categoryBadgeStyle(category) {
  return {
    display: 'inline-block',
    backgroundColor: CATEGORY_STYLE[category]?.bg ?? '#4A5568',
    color: CATEGORY_STYLE[category]?.color ?? '#fff',
    fontSize: '11px', fontWeight: '700',
    padding: '3px 8px', borderRadius: '4px',
    whiteSpace: 'nowrap',
  }
}

const styles = {
  main: {
    flex: 1, height: '100vh', display: 'flex',
    flexDirection: 'column', overflow: 'hidden',
    padding: '24px 28px',
  },
  topBar: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: '16px',
  },
  pageTitle: { color: '#fff', fontSize: '24px', fontWeight: '700', margin: 0 },
  topRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  searchBox: {
    display: 'flex', alignItems: 'center', gap: '8px',
    backgroundColor: '#161B27', border: '1px solid #1E2535',
    borderRadius: '8px', padding: '8px 14px',
  },
  searchInput: {
    background: 'none', border: 'none', outline: 'none',
    color: '#fff', fontSize: '13px', width: '180px',
  },
  writeBtn: {
    backgroundColor: '#00E676', border: 'none',
    borderRadius: '8px', padding: '10px 20px',
    color: '#000', fontWeight: '700', fontSize: '14px', cursor: 'pointer',
  },
  tabRow: { display: 'flex', gap: '8px', marginBottom: '20px' },
  tab: {
    padding: '8px 18px', borderRadius: '20px',
    border: '1px solid #1E2535', backgroundColor: '#161B27',
    color: '#A0AEC0', fontSize: '13px', cursor: 'pointer', fontWeight: '500',
  },
  tabActive: {
    backgroundColor: '#00E676', color: '#000',
    border: '1px solid #00E676', fontWeight: '700',
  },
  scrollArea: { flex: 1, overflowY: 'auto' },
  sectionLabel: {
    color: '#00E676', fontSize: '13px', fontWeight: '600', marginBottom: '8px',
  },
  noticeCard: {
    display: 'flex', alignItems: 'center', gap: '12px',
    backgroundColor: '#161B27', borderRadius: '8px',
    padding: '12px 16px', border: '1px solid #1E2535',
    cursor: 'pointer', marginBottom: '6px',
  },
  noticeTitle: { color: '#fff', fontSize: '14px', flex: 1 },
  noticeMeta: { color: '#A0AEC0', fontSize: '12px', whiteSpace: 'nowrap' },
  emptyState: {
    color: '#A0AEC0', fontSize: '14px',
    textAlign: 'center', padding: '60px 0',
  },
  postCard: {
    backgroundColor: '#161B27', borderRadius: '10px',
    padding: '16px', border: '1px solid #1E2535',
    marginBottom: '8px', cursor: 'pointer',
  },
  postTop: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' },
  postTitle: { color: '#fff', fontSize: '15px', fontWeight: '600' },
  postPreview: {
    color: '#A0AEC0', fontSize: '13px', marginBottom: '10px',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  postBottom: { display: 'flex', alignItems: 'center', gap: '12px' },
  postMeta: { color: '#A0AEC0', fontSize: '12px' },
  pagination: {
    display: 'flex', justifyContent: 'center',
    alignItems: 'center', gap: '6px', padding: '24px 0',
  },
  pageBtn: {
    width: '32px', height: '32px', borderRadius: '6px',
    backgroundColor: '#161B27', border: '1px solid #1E2535',
    color: '#A0AEC0', fontSize: '13px', cursor: 'pointer',
  },
  pageBtnActive: {
    backgroundColor: '#00E676', color: '#000',
    border: '1px solid #00E676', fontWeight: '700',
  },
  rightPanel: {
    width: '280px', flexShrink: 0, height: '100vh',
    backgroundColor: '#0D1117', borderLeft: '1px solid #1E2535',
    padding: '24px 16px', overflowY: 'auto',
    display: 'flex', flexDirection: 'column', gap: '12px',
  },
  card: {
    backgroundColor: '#161B27', borderRadius: '12px',
    padding: '16px', border: '1px solid #1E2535',
  },
  cardTitle: { color: '#fff', fontSize: '14px', fontWeight: '700', marginBottom: '14px' },
  emptySmall: { color: '#A0AEC0', fontSize: '12px', textAlign: 'center', padding: '12px 0' },
  popularItem: {
    display: 'flex', alignItems: 'flex-start',
    gap: '10px', marginBottom: '12px', cursor: 'pointer',
  },
  popularRank: {
    width: '22px', height: '22px', borderRadius: '50%',
    backgroundColor: '#00E676', color: '#000',
    fontSize: '11px', fontWeight: '700',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  popularTitle: { color: '#fff', fontSize: '13px', marginBottom: '4px', lineHeight: '1.4' },
  popularLike: { color: '#A0AEC0', fontSize: '11px' },
  statRow: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #1E2535',
  },
  statLabel: { color: '#A0AEC0', fontSize: '13px' },
  statValue: { color: '#fff', fontSize: '18px', fontWeight: '700' },
}