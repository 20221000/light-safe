// src/components/Sidebar/SidebarToggleBtn.jsx
export default function SidebarToggleBtn({ isOpen, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed',
        left: isOpen ? '193px' : '0px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 9999,
        width: '20px',
        height: '48px',
        backgroundColor: '#161B27',
        border: '1px solid #1E2535',
        borderLeft: 'none',
        borderRadius: '0 6px 6px 0',
        color: '#A0AEC0',
        fontSize: '14px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'left 0.3s ease',
        boxShadow: '2px 0 8px rgba(0,0,0,0.3)',
      }}
    >
      {isOpen ? '‹' : '›'}
    </button>
  )
}