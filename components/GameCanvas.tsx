import { useEffect, useRef } from 'react'
import { Application } from 'pixi.js'
import { GameLoop } from '../game/GameLoop'
import { useGameStore } from '../store/useGameStore'
import { playFlap } from '../game/audio'

interface Props {
  width?: number
  height?: number
}

export default function GameCanvas({ width = 400, height = 600 }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<Application | null>(null)
  const loopRef = useRef<GameLoop | null>(null)
  const { state, addScore, endGame, startGame, difficulty, muted } = useGameStore()
  const stateRef = useRef(state)
  stateRef.current = state
  const mutedRef = useRef(muted)
  mutedRef.current = muted

  useEffect(() => {
    const app = new Application({
      width,
      height,
      backgroundColor: 0x5ec0de,
      antialias: false,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    })
    appRef.current = app
    canvasRef.current?.appendChild(app.view as HTMLCanvasElement)

    const loop = new GameLoop(app, addScore, endGame)
    loopRef.current = loop

    return () => {
      loop.destroy()
      app.destroy(true)
    }
  }, [])

  useEffect(() => {
    const loop = loopRef.current
    if (!loop) return
    if (state === 'playing') loop.start(difficulty)
    if (state === 'idle') loop.pause()
  }, [state, difficulty])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') handleFlap()
    }
    const handleTouch = (e: TouchEvent) => { e.preventDefault(); handleFlap() }
    window.addEventListener('keydown', handleKey)
    const el = canvasRef.current
    el?.addEventListener('touchstart', handleTouch, { passive: false })
    return () => {
      window.removeEventListener('keydown', handleKey)
      el?.removeEventListener('touchstart', handleTouch)
    }
  }, [])

  const handleFlap = () => {
    const s = stateRef.current
    if (s === 'idle') { startGame(); playFlap(mutedRef.current); return }
    if (s === 'playing') { loopRef.current?.flap(); playFlap(mutedRef.current) }
  }

  return (
    <div
      ref={canvasRef}
      onClick={handleFlap}
      style={{ cursor: 'pointer', userSelect: 'none', lineHeight: 0 }}
    />
  )
}
