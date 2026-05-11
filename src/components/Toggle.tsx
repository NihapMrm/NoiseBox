interface ToggleProps {
  checked: boolean
  onChange: () => void
}

export function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onChange() }}
      style={{
        width: '28px',
        height: '16px',
        borderRadius: '8px',
        backgroundColor: checked ? '#7c6af7' : '#333',
        position: 'relative',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: checked ? '#fff' : '#555',
          position: 'absolute',
          top: '2px',
          left: checked ? '14px' : '2px',
          transition: 'left 0.2s ease, background-color 0.2s ease',
        }}
      />
    </button>
  )
}
