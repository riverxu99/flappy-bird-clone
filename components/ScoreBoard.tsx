interface Props {
  score: number
  bestScore: number
  visible: boolean
}

export default function ScoreBoard({ score, bestScore, visible }: Props) {
  if (!visible) return null
  return (
    <div style={{
      position: 'absolute',
      top: 16,
      left: 0,
      right: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      pointerEvents: 'none',
      zIndex: 10,
    }}>
      <span style={{
        color: '#fff',
        fontSize: 36,
        fontWeight: 'bold',
        textShadow: '2px 2px 0 #000, -1px -1px 0 #000',
        lineHeight: 1,
      }}>
        {score}
      </span>
      <span style={{
        color: 'rgba(255,255,255,0.75)',
        fontSize: 14,
        textShadow: '1px 1px 0 #000',
        lineHeight: 1,
        marginTop: 4,
      }}>
        BEST {bestScore}
      </span>
    </div>
  )
}
