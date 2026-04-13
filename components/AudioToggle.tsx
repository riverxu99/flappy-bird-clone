interface Props {
  muted: boolean
  onToggle: () => void
}

export default function AudioToggle({ muted, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      title={muted ? 'Unmute' : 'Mute'}
      style={{
        position: 'absolute',
        bottom: 12,
        right: 12,
        width: 34,
        height: 34,
        background: 'rgba(0,0,0,0.45)',
        border: '1px solid rgba(255,255,255,0.25)',
        borderRadius: 8,
        color: muted ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.9)',
        fontSize: 16,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
        lineHeight: 1,
        userSelect: 'none',
      }}
    >
      {muted ? '✕♪' : '♪'}
    </button>
  )
}
