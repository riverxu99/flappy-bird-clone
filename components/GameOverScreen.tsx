import { playSelect } from '../game/audio'

interface Props {
  score: number
  bestScore: number
  isNewBest: boolean
  onRetry: () => void
  onMenu: () => void
}

export default function GameOverScreen({ score, bestScore, isNewBest, onRetry, onMenu }: Props) {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.55)',
      zIndex: 10,
    }}>
      <h2 style={{
        color: '#fff',
        fontSize: 34,
        margin: 0,
        fontFamily: 'system-ui, sans-serif',
        fontWeight: 900,
        textShadow: '2px 2px 0 #000',
        letterSpacing: 1,
      }}>
        GAME OVER
      </h2>

      <div style={{
        marginTop: 24,
        background: 'rgba(0,0,0,0.5)',
        borderRadius: 12,
        padding: '16px 40px',
        textAlign: 'center',
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, letterSpacing: 2 }}>SCORE</div>
        <div style={{
          color: '#f5c542',
          fontSize: 48,
          fontWeight: 900,
          lineHeight: 1.1,
          textShadow: '2px 2px 0 #c8960a',
        }}>
          {score}
        </div>
        {isNewBest && (
          <div style={{
            color: '#74bf2e',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 1,
            marginTop: 2,
          }}>
            NEW BEST!
          </div>
        )}
        <div style={{
          color: 'rgba(255,255,255,0.45)',
          fontSize: 13,
          marginTop: 6,
        }}>
          BEST {bestScore}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
        <button
          onClick={() => { playSelect(); onRetry() }}
          style={{
            padding: '11px 32px',
            fontSize: 16,
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
          RETRY
        </button>
        <button
          onClick={() => { playSelect(); onMenu() }}
          style={{
            padding: '11px 32px',
            fontSize: 16,
            fontWeight: 800,
            letterSpacing: 2,
            color: '#fff',
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 10,
            cursor: 'pointer',
            boxShadow: '0 4px 0 rgba(0,0,0,0.3)',
            userSelect: 'none',
          }}
        >
          MENU
        </button>
      </div>
    </div>
  )
}
