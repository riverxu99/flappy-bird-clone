import { create } from 'zustand'

export type GameState = 'idle' | 'playing' | 'dead'
export type Difficulty = 'easy' | 'hard'

interface GameStore {
  state: GameState
  score: number
  bestScore: number
  muted: boolean
  isNewBest: boolean
  difficulty: Difficulty
  birdCount: number
  startGame: () => void
  endGame: () => void
  addScore: () => void
  retryGame: () => void
  goMenu: () => void
  toggleMute: () => void
  setDifficulty: (d: Difficulty) => void
  setBirdCount: (n: number) => void
}

const loadBest = (): number => {
  try { return parseInt(localStorage.getItem('flappy_best') ?? '0', 10) } catch { return 0 }
}
const saveBest = (n: number) => {
  try { localStorage.setItem('flappy_best', String(n)) } catch { /* noop */ }
}

export const useGameStore = create<GameStore>((set, get) => ({
  state: 'idle',
  score: 0,
  bestScore: loadBest(),
  muted: false,
  isNewBest: false,
  difficulty: 'easy',
  birdCount: 1,

  startGame: () => set({ state: 'playing', score: 0, isNewBest: false, birdCount: 1 }),

  endGame: () => {
    const { score, bestScore } = get()
    const isNewBest = score > bestScore
    if (isNewBest) saveBest(score)
    set({ state: 'dead', isNewBest, bestScore: isNewBest ? score : bestScore })
  },

  addScore: () => set((s) => ({ score: s.score + 1 })),

  retryGame: () => set({ state: 'playing', score: 0, isNewBest: false, birdCount: 1 }),

  goMenu: () => set({ state: 'idle', score: 0, isNewBest: false }),

  toggleMute: () => set((s) => ({ muted: !s.muted })),
  setDifficulty: (difficulty) => set({ difficulty }),
  setBirdCount: (birdCount) => set({ birdCount }),
}))
