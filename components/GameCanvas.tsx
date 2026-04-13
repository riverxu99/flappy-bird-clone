import { useEffect, useRef } from 'react'
import { Application } from 'pixi.js'
import { GameLoop } from '../game/GameLoop'
import { useGameStore } from '../store/useGameStore'

interface Props {
  width?: number
  height?: number
}

export default function GameCanvas({ width = 400, height = 600 }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<Application | null>(null)
  const loopRef = useRef<GameLoop | null>(null)
  const { state, addScore, endGame, startGame } = useGameStore()
  const stateRef = useRef(state)
  stateRef.current = state

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
    if (state === 'playing') loop.start()
    if (state === 'idle') loop.pause()
  }, [state])

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
    if (s === 'idle') { startGame(); return }
    if (s === 'playing') loopRef.current?.flap()
  }

  return (
    <div
      ref={canvasRef}
      onClick={handleFlap}
      style={{ cursor: 'pointer', userSelect: 'none', lineHeight: 0 }}
    />
  )
}
