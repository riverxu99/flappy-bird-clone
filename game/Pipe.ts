export const PIPE_WIDTH = 60
export const PIPE_GAP = 160
export const PIPE_SPEED = 3
export const PIPE_SPAWN_INTERVAL = 1600

export interface Pipe {
  id: number
  x: number
  topHeight: number
  yOffset: number  // current vertical offset (hard mode oscillation)
  ySpeed: number   // pixels per frame; 0 in easy mode
  scored: boolean
}

export function createPipe(
  canvasWidth: number,
  canvasHeight: number,
  id: number,
  hard = false,
): Pipe {
  // In hard mode, use extra margin so the ±60px oscillation stays in bounds
  const margin = hard ? 120 : 60
  const minTop = margin
  const maxTop = canvasHeight - PIPE_GAP - margin
  const topHeight = Math.floor(Math.random() * (maxTop - minTop + 1)) + minTop
  const speed = hard ? 1.2 + Math.random() * 1.0 : 0
  const ySpeed = hard ? speed * (Math.random() < 0.5 ? 1 : -1) : 0
  return { id, x: canvasWidth, topHeight, yOffset: 0, ySpeed, scored: false }
}

export function updatePipes(pipes: Pipe[]): Pipe[] {
  return pipes
    .map((p) => {
      const x = p.x - PIPE_SPEED
      let { yOffset, ySpeed } = p
      if (ySpeed !== 0) {
        yOffset += ySpeed
        const maxOffset = 60
        if (Math.abs(yOffset) >= maxOffset) {
          ySpeed = -ySpeed
          yOffset = Math.sign(yOffset) * maxOffset
        }
      }
      return { ...p, x, yOffset, ySpeed }
    })
    .filter((p) => p.x + PIPE_WIDTH > -20)
}

export function checkPipeCollision(
  birdX: number,
  birdY: number,
  birdSize: number,
  pipe: Pipe,
): boolean {
  // birdX/birdY are the visual center of the bird.
  const r = birdSize / 2
  const inset = 4
  const bx1 = birdX - r + inset
  const bx2 = birdX + r - inset
  const by1 = birdY - r + inset
  const by2 = birdY + r - inset

  if (bx2 <= pipe.x || bx1 >= pipe.x + PIPE_WIDTH) return false

  const effectiveTop = pipe.topHeight + pipe.yOffset
  const bottomPipeY = effectiveTop + PIPE_GAP
  return by1 < effectiveTop || by2 > bottomPipeY
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
