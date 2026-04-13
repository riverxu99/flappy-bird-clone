interface Props {
  bestScore: number
  onStart: () => void
}

export default function StartScreen({ bestScore, onStart }: Props) {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.45)',
      zIndex: 10,
    }}>
      <h1 style={{
        color: '#f5c542',
        fontSize: 42,
        margin: 0,
        fontFamily: 'system-ui, sans-serif',
        fontWeight: 900,
        textShadow: '3px 3px 0 #c8960a, -1px -1px 0 #c8960a',
        letterSpacing: 1,
      }}>
        Flappy Bird
      </h1>

      {bestScore > 0 && (
        <p style={{
          color: 'rgba(255,255,255,0.65)',
          fontSize: 14,
          margin: '10px 0 0',
          textShadow: '1px 1px 0 #000',
        }}>
          BEST {bestScore}
        </p>
      )}

      <button
        onClick={onStart}
        style={{
          marginTop: 32,
          padding: '12px 40px',
          fontSize: 20,
          fontWeight: 800,
          letterSpacing: 2,
          color: '#1a1a2e',
          background: '#f5c542',
          border: 'none',
          borderRadius: 10,
          cursor: 'pointer',
          boxShadow: '0 4px 0 #c8960a',
          userSelect: 'none',
        }}
      >
        PLAY
      </button>

      <p style={{
        color: 'rgba(255,255,255,0.45)',
        fontSize: 13,
        marginTop: 20,
        textShadow: '1px 1px 0 #000',
      }}>
        Space / Tap to flap
      </p>
    </div>
  )
}
