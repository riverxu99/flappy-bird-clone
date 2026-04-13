import { useEffect } from 'react'
import { Howl } from 'howler'
import GameCanvas from './components/GameCanvas'
import ScoreBoard from './components/ScoreBoard'
import AudioToggle from './components/AudioToggle'
import StartScreen from './components/StartScreen'
import GameOverScreen from './components/GameOverScreen'
import { useGameStore } from './store/useGameStore'

const CANVAS_W = 400
const CANVAS_H = 600

const sounds = {
  flap: new Howl({ src: ['data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='], volume: 0.5 }),
}

export default function App() {
  const { state, score, bestScore, muted, isNewBest, startGame, retryGame, goMenu, toggleMute } = useGameStore()

  useEffect(() => {
    sounds.flap.mute(muted)
  }, [muted])

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#1a1a2e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ position: 'relative', width: CANVAS_W, height: CANVAS_H, overflow: 'hidden', borderRadius: 12 }}>
        <GameCanvas width={CANVAS_W} height={CANVAS_H} />

        <ScoreBoard score={score} bestScore={bestScore} visible={state === 'playing'} />

        {state === 'idle' && (
          <StartScreen bestScore={bestScore} onStart={startGame} />
        )}

        {state === 'dead' && (
          <GameOverScreen
            score={score}
            bestScore={bestScore}
            isNewBest={isNewBest}
            onRetry={retryGame}
            onMenu={goMenu}
          />
        )}

        <AudioToggle muted={muted} onToggle={toggleMute} />
      </div>
    </div>
  )
}
