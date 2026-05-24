import { useState } from 'react'

export default function SosButton() {
  const [pressed, setPressed] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const handleClick = () => {
    if (confirmed) return
    setPressed(true)
  }

  const handleConfirm = () => {
    setConfirmed(true)
    setPressed(false)
    // TODO: POST /emergency-reports API 호출
    alert('긴급 신고가 접수되었습니다. 주변 친구와 관계기관에 위치가 공유됩니다.')
    setTimeout(() => setConfirmed(false), 5000)
  }

  return (
    <>
      <div style={{
        position: 'absolute', bottom: '32px', left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '6px', zIndex: 100,
      }}>
        <button
          onClick={handleClick}
          style={{
            width: '72px', height: '72px', borderRadius: '50%',
            backgroundColor: confirmed ? '#00E676' : '#FF3B3B',
            border: 'none', cursor: 'pointer',
            fontSize: '15px', fontWeight: '800', color: 'white',
            boxShadow: confirmed
              ? '0 0 20px rgba(0,230,118,0.7), 0 0 40px rgba(0,230,118,0.3)'
              : '0 0 20px rgba(255,59,59,0.7), 0 0 40px rgba(255,59,59,0.3)',
            transition: 'all 0.2s', letterSpacing: '1px',
          }}
        >
          {confirmed ? '✓' : 'SOS'}
        </button>
        <span style={{
          color: '#fff', fontSize: '12px', fontWeight: '600',
          textShadow: '0 1px 4px rgba(0,0,0,0.8)',
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: '2px 8px', borderRadius: '4px',
        }}>
          {confirmed ? '신고 완료' : '긴급 신고'}
        </span>
      </div>

      {pressed && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 200,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            backgroundColor: '#161B27', borderRadius: '16px',
            padding: '32px 28px', textAlign: 'center',
            border: '1px solid #FF3B3B', maxWidth: '320px', width: '90%',
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🚨</div>
            <div style={{ color: '#fff', fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
              긴급 신고를 접수할까요?
            </div>
            <div style={{ color: '#A0AEC0', fontSize: '13px', marginBottom: '24px', lineHeight: '1.6' }}>
              현재 위치가 허용된 친구 및<br />관계기관에 공유됩니다.
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setPressed(false)}
                style={{
                  flex: 1, padding: '12px', borderRadius: '8px',
                  backgroundColor: '#1E2535', border: '1px solid #2D3748',
                  color: '#A0AEC0', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                }}
              >
                취소
              </button>
              <button
                onClick={handleConfirm}
                style={{
                  flex: 1, padding: '12px', borderRadius: '8px',
                  backgroundColor: '#FF3B3B', border: 'none',
                  color: '#fff', fontSize: '14px', fontWeight: '700', cursor: 'pointer',
                }}
              >
                신고하기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}