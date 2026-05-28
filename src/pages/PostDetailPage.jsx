import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar/Sidebar'
import SidebarToggleBtn from '../components/Sidebar/SidebarToggleBtn'
import { useNavigation } from '../hooks/useNavigation'
import { useSidebar } from '../hooks/useSidebar'

const CATEGORY_STYLE = {
  '공지': { bg: '#4A5568', color: '#fff' },
  '정보': { bg: '#3182CE', color: '#fff' },
  '질문': { bg: '#00E676', color: '#000' },
  '제보': { bg: '#E53E3E', color: '#fff' },
  '팁':   { bg: '#D69E2E', color: '#fff' },
}

export default function PostDetailPage({ user, onLogout }) {
  const navigate = useNavigate()
  const handleNavigate = useNavigation()
  const { sidebarOpen, setSidebarOpen } = useSidebar()
  const { postId } = useParams()

  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [relatedPosts, setRelatedPosts] = useState([])
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [commentInput, setCommentInput] = useState('')
  const [replyInputId, setReplyInputId] = useState(null)
  const [replyInput, setReplyInput] = useState('')

  // 백엔드 연동 시 주석 해제
  // useEffect(() => {
  //   const fetchPost = async () => {
  //     const res = await fetch(`/posts/${postId}`)
  //     const json = await res.json()
  //     if (json.success) {
  //       setPost(json.data)
  //       setComments(json.data.comments)
  //       setIsLiked(json.data.isLiked)
  //       setLikeCount(json.data.likeCount)
  //     }
  //   }
  //   fetchPost()
  // }, [postId])

  const handleLike = () => {
    if (!user) { alert('로그인이 필요합니다.'); navigate('/login'); return }
    setIsLiked(prev => !prev)
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1)
  }

  const handleCommentSubmit = () => {
    if (!commentInput.trim()) return
    setCommentInput('')
  }

  const handleReplySubmit = (parentId) => {
    if (!replyInput.trim()) return
    setReplyInput('')
    setReplyInputId(null)
  }

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

      <main style={s.main}>
        <button style={s.backBtn} onClick={() => navigate('/community')}>← 목록으로</button>

        <div style={s.scrollArea}>

          {!post ? (
            <div style={s.emptyState}>게시글을 불러오는 중입니다...</div>
          ) : (
            <>
              <div style={s.postHeader}>
                <span style={categoryBadgeStyle(post.category)}>{post.category}</span>
                <h1 style={s.postTitle}>{post.title}</h1>
                <div style={s.postMeta}>
                  <div style={s.authorRow}>
                    <div style={s.authorAvatar}>{post.nickname?.charAt(0)}</div>
                    <span style={s.authorName}>{post.nickname}</span>
                  </div>
                  <span style={s.metaText}>{post.createdAt}</span>
                  <span style={s.metaText}>👁 {post.viewCount}</span>
                  <span style={s.metaText}>❤ {likeCount}</span>
                </div>
                <div style={s.divider} />
              </div>
              <div style={s.postContent}>
                {post.content?.split('\n\n').map((para, idx) => (
                  <p key={idx} style={s.paragraph}>{para}</p>
                ))}
              </div>
            </>
          )}

          <div style={s.actionRow}>
            <button style={{ ...s.actionBtn, ...(isLiked ? s.actionBtnActive : {}) }} onClick={handleLike}>
              ❤ 좋아요 {likeCount}
            </button>
            <button style={s.actionBtn}>🔖 북마크</button>
            <button style={s.actionBtn} onClick={() => { navigator.clipboard.writeText(window.location.href); alert('링크가 복사되었습니다.') }}>
              🔗 공유하기
            </button>
          </div>

          <div style={s.commentSection}>
            <div style={s.commentTitle}>💬 댓글 {comments.length}개</div>

            <div style={s.commentInputRow}>
              <div style={s.commentAvatar}>{user ? user.nickname?.charAt(0) : '?'}</div>
              {user ? (
                <>
                  <input
                    style={s.commentInput}
                    placeholder="댓글을 입력해주세요..."
                    value={commentInput}
                    onChange={e => setCommentInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCommentSubmit()}
                  />
                  <button style={s.submitBtn} onClick={handleCommentSubmit}>등록</button>
                </>
              ) : (
                <div
                  style={{ ...s.commentInput, display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#A0AEC0' }}
                  onClick={() => { alert('로그인이 필요합니다.'); navigate('/login') }}
                >
                  댓글을 작성하려면 로그인이 필요합니다.
                </div>
              )}
            </div>

            {comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment.commentId}>
                  <div style={s.commentItem}>
                    <div style={s.commentAvatar}>{comment.nickname?.charAt(0)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={s.commentHeader}>
                        <span style={s.commentNickname}>{comment.nickname}</span>
                        <span style={s.commentDate}>{comment.createdAt}</span>
                        <span style={s.commentLike}>❤ {comment.likeCount ?? 0}</span>
                      </div>
                      <div style={s.commentContent}>{comment.content}</div>
                      {user && (
                        <button style={s.replyBtn} onClick={() => setReplyInputId(replyInputId === comment.commentId ? null : comment.commentId)}>
                          답글
                        </button>
                      )}
                      {replyInputId === comment.commentId && (
                        <div style={{ ...s.commentInputRow, marginTop: '8px' }}>
                          <input
                            style={s.commentInput}
                            placeholder="답글을 입력해주세요..."
                            value={replyInput}
                            onChange={e => setReplyInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleReplySubmit(comment.commentId)}
                          />
                          <button style={s.submitBtn} onClick={() => handleReplySubmit(comment.commentId)}>등록</button>
                        </div>
                      )}
                    </div>
                  </div>

                  {comment.replies?.map(reply => (
                    <div key={reply.commentId} style={s.replyItem}>
                      <div style={s.replyAvatar}>{reply.nickname?.charAt(0)}</div>
                      <div style={{ flex: 1 }}>
                        <div style={s.commentHeader}>
                          <span style={s.commentNickname}>{reply.nickname}</span>
                          <span style={s.commentDate}>{reply.createdAt}</span>
                          <span style={s.commentLike}>❤ {reply.likeCount ?? 0}</span>
                        </div>
                        <div style={s.commentContent}>{reply.content}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div style={s.emptyComment}>첫 번째 댓글을 작성해보세요!</div>
            )}
          </div>
        </div>
      </main>

      <aside style={s.rightPanel}>
        <div style={s.card}>
          <div style={s.cardTitle}>작성자 정보</div>
          {post ? (
            <>
              <div style={s.authorInfo}>
                <div style={s.authorAvatarLg}>{post.nickname?.charAt(0)}</div>
                <div>
                  <div style={s.authorNameLg}>{post.nickname}</div>
                  <div style={s.authorStat}>게시글 {post.userId}개</div>
                </div>
              </div>
              <button style={s.followBtn}>팔로우</button>
            </>
          ) : (
            <div style={s.emptySmall}>-</div>
          )}
        </div>

        <div style={s.card}>
          <div style={s.cardTitle}>관련 게시글</div>
          {relatedPosts.length > 0 ? (
            relatedPosts.map(related => (
              <div key={related.postId} style={s.relatedItem} onClick={() => navigate(`/community/${related.postId}`)}>
                <span style={categoryBadgeStyle(related.category)}>{related.category}</span>
                <div style={s.relatedTitle}>{related.title}</div>
                <div style={s.relatedMeta}>좋아요 {related.likeCount} · 댓글 {related.commentCount}</div>
              </div>
            ))
          ) : (
            <div style={s.emptySmall}>관련 게시글이 없습니다.</div>
          )}
        </div>

        <div style={s.card}>
          <div style={s.cardTitle}>공유하기</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button style={s.shareBtn} onClick={() => { navigator.clipboard.writeText(window.location.href); alert('링크가 복사되었습니다.') }}>
              🔗 링크 복사
            </button>
            <button style={{ ...s.shareBtn, backgroundColor: '#FEE500', color: '#000' }}>💬 카카오톡 공유</button>
          </div>
        </div>
      </aside>
    </div>
  )
}

function categoryBadgeStyle(category) {
  return {
    display: 'inline-block',
    backgroundColor: CATEGORY_STYLE[category]?.bg ?? '#4A5568',
    color: CATEGORY_STYLE[category]?.color ?? '#fff',
    fontSize: '11px', fontWeight: '700',
    padding: '3px 8px', borderRadius: '4px', whiteSpace: 'nowrap',
  }
}

const styles = {
  main: { flex: 1, height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '20px 28px' },
  backBtn: { background: 'none', border: 'none', color: '#A0AEC0', fontSize: '14px', cursor: 'pointer', padding: '0 0 16px 0', textAlign: 'left' },
  scrollArea: { flex: 1, overflowY: 'auto' },
  emptyState: { color: '#A0AEC0', fontSize: '14px', textAlign: 'center', padding: '60px 0' },
  emptyComment: { color: '#A0AEC0', fontSize: '13px', textAlign: 'center', padding: '30px 0' },
  emptySmall: { color: '#A0AEC0', fontSize: '12px', textAlign: 'center', padding: '12px 0' },
  postHeader: { marginBottom: '16px' },
  postTitle: { color: '#fff', fontSize: '24px', fontWeight: '700', margin: '10px 0 12px 0', lineHeight: '1.4' },
  postMeta: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' },
  authorRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  authorAvatar: { width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#00E676', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700' },
  authorName: { color: '#fff', fontSize: '14px', fontWeight: '600' },
  metaText: { color: '#A0AEC0', fontSize: '13px' },
  divider: { height: '1px', backgroundColor: '#1E2535' },
  postContent: { padding: '20px 0' },
  paragraph: { color: '#E2E8F0', fontSize: '15px', lineHeight: '1.8', marginBottom: '16px' },
  actionRow: { display: 'flex', gap: '12px', padding: '16px 0', borderTop: '1px solid #1E2535', borderBottom: '1px solid #1E2535', marginBottom: '24px' },
  actionBtn: { flex: 1, padding: '12px', backgroundColor: '#161B27', border: '1px solid #1E2535', borderRadius: '8px', color: '#A0AEC0', fontSize: '14px', cursor: 'pointer', fontWeight: '500' },
  actionBtnActive: { backgroundColor: 'rgba(0,230,118,0.1)', border: '1px solid #00E676', color: '#00E676' },
  commentSection: { paddingBottom: '40px' },
  commentTitle: { color: '#fff', fontSize: '16px', fontWeight: '700', marginBottom: '16px' },
  commentInputRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' },
  commentAvatar: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1E2535', border: '1px solid #2D3748', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A0AEC0', fontSize: '13px', fontWeight: '600', flexShrink: 0 },
  commentInput: { flex: 1, backgroundColor: '#161B27', border: '1px solid #1E2535', borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '13px', outline: 'none' },
  submitBtn: { backgroundColor: '#00E676', border: 'none', borderRadius: '8px', padding: '10px 16px', color: '#000', fontWeight: '700', fontSize: '13px', cursor: 'pointer', flexShrink: 0 },
  commentItem: { display: 'flex', gap: '12px', padding: '14px 0', borderBottom: '1px solid #1E2535' },
  replyItem: { display: 'flex', gap: '12px', padding: '12px 0 12px 48px', borderBottom: '1px solid #1E2535', backgroundColor: 'rgba(13,17,23,0.5)' },
  replyAvatar: { width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#1E2535', border: '1px solid #2D3748', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A0AEC0', fontSize: '11px', fontWeight: '600', flexShrink: 0 },
  commentHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' },
  commentNickname: { color: '#fff', fontSize: '13px', fontWeight: '600' },
  commentDate: { color: '#A0AEC0', fontSize: '12px', flex: 1 },
  commentLike: { color: '#A0AEC0', fontSize: '12px' },
  commentContent: { color: '#E2E8F0', fontSize: '14px', lineHeight: '1.6' },
  replyBtn: { background: 'none', border: 'none', color: '#A0AEC0', fontSize: '12px', cursor: 'pointer', padding: '4px 0', marginTop: '4px' },
  rightPanel: { width: '280px', flexShrink: 0, height: '100vh', backgroundColor: '#0D1117', borderLeft: '1px solid #1E2535', padding: '20px 16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' },
  card: { backgroundColor: '#161B27', borderRadius: '12px', padding: '16px', border: '1px solid #1E2535' },
  cardTitle: { color: '#fff', fontSize: '14px', fontWeight: '700', marginBottom: '14px' },
  authorInfo: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
  authorAvatarLg: { width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#00E676', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', flexShrink: 0 },
  authorNameLg: { color: '#fff', fontSize: '15px', fontWeight: '700' },
  authorStat: { color: '#A0AEC0', fontSize: '12px', marginTop: '2px' },
  followBtn: { width: '100%', backgroundColor: 'transparent', border: '1px solid #00E676', borderRadius: '8px', padding: '10px 0', color: '#00E676', fontWeight: '600', fontSize: '14px', cursor: 'pointer' },
  relatedItem: { padding: '10px 0', borderBottom: '1px solid #1E2535', cursor: 'pointer' },
  relatedTitle: { color: '#fff', fontSize: '13px', marginTop: '6px', marginBottom: '4px', lineHeight: '1.4' },
  relatedMeta: { color: '#A0AEC0', fontSize: '11px' },
  shareBtn: { width: '100%', backgroundColor: '#161B27', border: '1px solid #1E2535', borderRadius: '8px', padding: '10px 0', color: '#fff', fontSize: '13px', cursor: 'pointer', fontWeight: '500' },
}