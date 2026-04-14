interface Props {
  count: number
  visible: boolean
}

function BirdIcon() {
  return (
    <svg width="22" height="18" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* wing */}
      <ellipse cx="8" cy="12" rx="6" ry="3.5" fill="#e8b030" stroke="#c8960a" strokeWidth="1" />
      {/* body */}
      <ellipse cx="11" cy="9" rx="8" ry="7" fill="#f5c542" stroke="#c8960a" strokeWidth="1.5" />
      {/* eye white */}
      <circle cx="15" cy="6" r="2.5" fill="white" />
      {/* pupil */}
      <circle cx="16" cy="6" r="1.3" fill="#222" />
      {/* beak */}
      <polygon points="19,7 22,9 19,11" fill="#e07820" />
    </svg>
  )
}

export default function BirdCounter({ count, visible }: Props) {
  if (!visible) return null
  return (
    <div style={{
      position: 'absolute',
      top: 10,
      left: 10,
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      background: 'rgba(0,0,0,0.35)',
      borderRadius: 8,
      padding: '4px 10px 4px 8px',
      zIndex: 5,
      userSelect: 'none',
    }}>
      <BirdIcon />
      <span style={{
        color: '#fff',
        fontWeight: 700,
        fontSize: 15,
        fontFamily: 'system-ui, sans-serif',
        lineHeight: 1,
        textShadow: '1px 1px 0 #000',
      }}>
        x{count}
      </span>
    </div>
  )
}
