export const PIPE_WIDTH = 60
export const PIPE_GAP = 160
export const PIPE_SPEED = 3
export const PIPE_SPAWN_INTERVAL = 1600

export interface Pipe {
  id: number
  x: number
  topHeight: number
  scored: boolean
}

export function createPipe(canvasWidth: number, canvasHeight: number, id: number): Pipe {
  const minTop = 60
  const maxTop = canvasHeight - PIPE_GAP - 60
  const topHeight = Math.floor(Math.random() * (maxTop - minTop + 1)) + minTop
  return { id, x: canvasWidth, topHeight, scored: false }
}

export function updatePipes(pipes: Pipe[]): Pipe[] {
  return pipes
    .map((p) => ({ ...p, x: p.x - PIPE_SPEED }))
    .filter((p) => p.x + PIPE_WIDTH > -20)
}

export function checkPipeCollision(
  birdX: number,
  birdY: number,
  birdSize: number,
  pipe: Pipe,
): boolean {
  // birdX/birdY are the visual center of the bird.
  // Use an inset circle so the hitbox is slightly smaller than the sprite,
  // which feels fair without letting the bird visually clip through pipes.
  const r = birdSize / 2   // 15
  const inset = 4
  const bx1 = birdX - r + inset   // center − 11
  const bx2 = birdX + r - inset   // center + 11
  const by1 = birdY - r + inset
  const by2 = birdY + r - inset

  // no horizontal overlap → no collision
  if (bx2 <= pipe.x || bx1 >= pipe.x + PIPE_WIDTH) return false

  // inside the gap → safe
  const bottomPipeY = pipe.topHeight + PIPE_GAP
  return by1 < pipe.topHeight || by2 > bottomPipeY
}

export function markScored(pipes: Pipe[], birdX: number): { pipes: Pipe[]; scored: boolean } {
  let scored = false
  const next = pipes.map((p) => {
    if (!p.scored && p.x + PIPE_WIDTH < birdX) {
      scored = true
      return { ...p, scored: true }
    }
    return p
  })
  return { pipes: next, scored }
}
