import GameCanvas from './components/GameCanvas'
import ScoreBoard from './components/ScoreBoard'
import AudioToggle from './components/AudioToggle'
import StartScreen from './components/StartScreen'
import GameOverScreen from './components/GameOverScreen'
import { useGameStore } from './store/useGameStore'

const CANVAS_W = 400
const CANVAS_H = 600

export default function App() {
  const { state, score, bestScore, muted, isNewBest, difficulty, startGame, retryGame, goMenu, toggleMute, setDifficulty } = useGameStore()

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
          <StartScreen bestScore={bestScore} difficulty={difficulty} onDifficulty={setDifficulty} onStart={startGame} />
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
