export const GRAVITY = 0.5
export const FLAP_FORCE = 9
export const BIRD_X = 140
export const BIRD_SIZE = 30

export interface BirdState {
  y: number
  vy: number
  rotation: number
}

export function createBird(canvasHeight: number): BirdState {
  return { y: canvasHeight / 2, vy: 0, rotation: 0 }
}

export function updateBird(bird: BirdState): BirdState {
  const vy = bird.vy + GRAVITY
  const y = bird.y + vy
  const rotation = Math.min(Math.max(vy * 3, -25), 70)
  return { y, vy, rotation }
}

export function flapBird(bird: BirdState): BirdState {
  return { ...bird, vy: -FLAP_FORCE }
}

export function isBirdOutOfBounds(bird: BirdState, canvasHeight: number): boolean {
  const r = BIRD_SIZE / 2
  return bird.y - r < 0 || bird.y + r > canvasHeight
}
