import { describe, it, expect } from 'vitest'
import {
  createBird, updateBird, flapBird, isBirdOutOfBounds,
  GRAVITY, FLAP_FORCE, BIRD_SIZE,
} from '../Bird'

const CANVAS_H = 600
const GROUND_H = 60
const PLAY_H = CANVAS_H - GROUND_H // 540

describe('createBird', () => {
  it('starts at vertical center of play area', () => {
    const bird = createBird(PLAY_H)
    expect(bird.y).toBe(PLAY_H / 2)
    expect(bird.vy).toBe(0)
    expect(bird.rotation).toBe(0)
  })
})

describe('updateBird', () => {
  it('applies gravity each frame (delta=1)', () => {
    const bird = createBird(PLAY_H)
    const next = updateBird(bird, 1)
    expect(next.vy).toBeCloseTo(GRAVITY)
  })

  it('scales gravity by delta', () => {
    const bird = createBird(PLAY_H)
    const at1x = updateBird(bird, 1)
    const at2x = updateBird(bird, 2)
    // vy should be proportional to delta
    expect(at2x.vy).toBeCloseTo(at1x.vy * 2, 5)
  })

  it('delta=1 × 60 frames and delta=2 × 30 frames produce the same trajectory', () => {
    let bird60 = createBird(PLAY_H)
    for (let i = 0; i < 60; i++) bird60 = updateBird(bird60, 1)

    let bird30 = createBird(PLAY_H)
    for (let i = 0; i < 30; i++) bird30 = updateBird(bird30, 2)

    expect(bird60.y).toBeCloseTo(bird30.y, 3)
    expect(bird60.vy).toBeCloseTo(bird30.vy, 3)
  })

  it('bird falls further over more frames', () => {
    let bird = createBird(PLAY_H)
    const y0 = bird.y
    for (let i = 0; i < 10; i++) bird = updateBird(bird, 1)
    expect(bird.y).toBeGreaterThan(y0)
  })

  it('rotation clamps to -25 at high upward velocity', () => {
    const bird = { y: 300, vy: -20, rotation: 0 }
    const next = updateBird(bird, 1)
    expect(next.rotation).toBe(-25)
  })

  it('rotation clamps to 70 at high downward velocity', () => {
    const bird = { y: 300, vy: 30, rotation: 0 }
    const next = updateBird(bird, 1)
    expect(next.rotation).toBe(70)
  })
})

describe('flapBird', () => {
  it('sets vy to -FLAP_FORCE regardless of current vy', () => {
    const falling = { y: 300, vy: 15, rotation: 60 }
    expect(flapBird(falling).vy).toBe(-FLAP_FORCE)

    const rising = { y: 300, vy: -5, rotation: -20 }
    expect(flapBird(rising).vy).toBe(-FLAP_FORCE)
  })

  it('does not change y position', () => {
    const bird = { y: 250, vy: 5, rotation: 10 }
    expect(flapBird(bird).y).toBe(250)
  })
})

describe('isBirdOutOfBounds', () => {
  const ry = BIRD_SIZE / 2 - 2 // 13

  it('returns false when bird is safely inside', () => {
    const bird = { y: PLAY_H / 2, vy: 0, rotation: 0 }
    expect(isBirdOutOfBounds(bird, PLAY_H)).toBe(false)
  })

  it('returns true when bird goes above the top', () => {
    const bird = { y: ry - 1, vy: -5, rotation: -25 }
    expect(isBirdOutOfBounds(bird, PLAY_H)).toBe(true)
  })

  it('returns true when bird hits the ground', () => {
    const bird = { y: PLAY_H - ry + 1, vy: 5, rotation: 70 }
    expect(isBirdOutOfBounds(bird, PLAY_H)).toBe(true)
  })

  it('returns false when bird is exactly at boundary', () => {
    const atTop    = { y: ry,          vy: 0, rotation: 0 }
    const atBottom = { y: PLAY_H - ry, vy: 0, rotation: 0 }
    expect(isBirdOutOfBounds(atTop, PLAY_H)).toBe(false)
    expect(isBirdOutOfBounds(atBottom, PLAY_H)).toBe(false)
  })
})
