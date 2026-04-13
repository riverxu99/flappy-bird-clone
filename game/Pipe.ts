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
  canvasHeight: number,
  groundHeight: number,
): boolean {
  const bx1 = birdX + 4
  const bx2 = birdX + birdSize - 4
  const by1 = birdY + 4
  const by2 = birdY + birdSize - 4
  const px1 = pipe.x
  const px2 = pipe.x + PIPE_WIDTH

  if (bx2 < px1 || bx1 > px2) return false

  const bottomPipeY = pipe.topHeight + PIPE_GAP
  if (by1 < pipe.topHeight || by2 > bottomPipeY) return true

  if (by2 > canvasHeight - groundHeight) return true

  return false
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
