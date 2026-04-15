import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from '../useGameStore'

beforeEach(() => {
  localStorage.clear()
  // Reset store to initial state before each test
  useGameStore.setState({
    state: 'idle',
    score: 0,
    bestScore: 0,
    muted: false,
    isNewBest: false,
    difficulty: 'easy',
    birdCount: 1,
    coinBonusSeq: 0,
  })
})

describe('startGame', () => {
  it('sets state to playing and resets score', () => {
    useGameStore.setState({ score: 5, state: 'dead' })
    useGameStore.getState().startGame()
    const s = useGameStore.getState()
    expect(s.state).toBe('playing')
    expect(s.score).toBe(0)
    expect(s.birdCount).toBe(1)
  })
})

describe('endGame', () => {
  it('sets state to dead', () => {
    useGameStore.setState({ state: 'playing', score: 3, bestScore: 10 })
    useGameStore.getState().endGame()
    expect(useGameStore.getState().state).toBe('dead')
  })

  it('detects new best score', () => {
    useGameStore.setState({ score: 15, bestScore: 10 })
    useGameStore.getState().endGame()
    const s = useGameStore.getState()
    expect(s.isNewBest).toBe(true)
    expect(s.bestScore).toBe(15)
  })

  it('does not flag isNewBest when score is not higher', () => {
    useGameStore.setState({ score: 5, bestScore: 10 })
    useGameStore.getState().endGame()
    expect(useGameStore.getState().isNewBest).toBe(false)
  })

  it('saves new best score to localStorage', () => {
    useGameStore.setState({ score: 20, bestScore: 10 })
    useGameStore.getState().endGame()
    expect(localStorage.getItem('flappy_best')).toBe('20')
  })

  it('does not overwrite localStorage when score is lower', () => {
    localStorage.setItem('flappy_best', '50')
    useGameStore.setState({ score: 10, bestScore: 50 })
    useGameStore.getState().endGame()
    expect(localStorage.getItem('flappy_best')).toBe('50')
  })
})

describe('addScore', () => {
  it('increments score by 1', () => {
    useGameStore.setState({ score: 3 })
    useGameStore.getState().addScore()
    expect(useGameStore.getState().score).toBe(4)
  })

  it('accumulates across multiple calls', () => {
    for (let i = 0; i < 5; i++) useGameStore.getState().addScore()
    expect(useGameStore.getState().score).toBe(5)
  })
})

describe('retryGame', () => {
  it('resets to playing state with score 0', () => {
    useGameStore.setState({ state: 'dead', score: 8, isNewBest: true, birdCount: 3 })
    useGameStore.getState().retryGame()
    const s = useGameStore.getState()
    expect(s.state).toBe('playing')
    expect(s.score).toBe(0)
    expect(s.isNewBest).toBe(false)
    expect(s.birdCount).toBe(1)
  })
})

describe('goMenu', () => {
  it('returns to idle and clears score', () => {
    useGameStore.setState({ state: 'dead', score: 5, isNewBest: true })
    useGameStore.getState().goMenu()
    const s = useGameStore.getState()
    expect(s.state).toBe('idle')
    expect(s.score).toBe(0)
    expect(s.isNewBest).toBe(false)
  })
})

describe('toggleMute', () => {
  it('toggles muted on and off', () => {
    expect(useGameStore.getState().muted).toBe(false)
    useGameStore.getState().toggleMute()
    expect(useGameStore.getState().muted).toBe(true)
    useGameStore.getState().toggleMute()
    expect(useGameStore.getState().muted).toBe(false)
  })
})

describe('setDifficulty', () => {
  it('updates difficulty', () => {
    useGameStore.getState().setDifficulty('hard')
    expect(useGameStore.getState().difficulty).toBe('hard')
    useGameStore.getState().setDifficulty('easy')
    expect(useGameStore.getState().difficulty).toBe('easy')
  })
})
