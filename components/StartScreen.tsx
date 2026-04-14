import type { Difficulty } from '../store/useGameStore'
import { playSelect } from '../game/audio'

interface Props {
  bestScore: number
  difficulty: Difficulty
  onDifficulty: (d: Difficulty) => void
  onStart: () => void
}

export default function StartScreen({ bestScore, difficulty, onDifficulty, onStart }: Props) {
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

      {/* Difficulty toggle */}
      <div style={{ display: 'flex', gap: 8, marginTop: 28 }}>
        {(['easy', 'hard'] as Difficulty[]).map((d) => {
          const active = difficulty === d
          return (
            <button
              key={d}
              onClick={() => { playSelect(); onDifficulty(d) }}
              style={{
                padding: '7px 22px',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 1.5,
                borderRadius: 8,
                border: active ? 'none' : '1px solid rgba(255,255,255,0.25)',
                cursor: 'pointer',
                userSelect: 'none',
                color: active ? '#1a1a2e' : 'rgba(255,255,255,0.55)',
                background: active
                  ? (d === 'hard' ? '#e05555' : '#f5c542')
                  : 'rgba(255,255,255,0.08)',
                boxShadow: active
                  ? `0 3px 0 ${d === 'hard' ? '#a03030' : '#c8960a'}`
                  : 'none',
              }}
            >
              {d.toUpperCase()}
            </button>
          )
        })}
      </div>

      <button
        onClick={() => { playSelect(); onStart() }}
        style={{
          marginTop: 20,
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
