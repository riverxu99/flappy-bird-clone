import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createPipe, updatePipes, checkPipeCollision, markScored,
  PIPE_WIDTH, PIPE_GAP, PIPE_SPEED,
} from '../Pipe'
import { BIRD_X, BIRD_SIZE } from '../Bird'

const CANVAS_W = 400
const CANVAS_H = 540 // play area height (without ground)

// Helper: build a simple stationary pipe
function makePipe(x: number, topHeight: number, yOffset = 0, ySpeed = 0) {
  return { id: 0, x, topHeight, yOffset, ySpeed, scored: false }
}

describe('updatePipes', () => {
  it('moves pipes left by speed each frame (delta=1)', () => {
    const pipe = makePipe(200, 150)
    const [next] = updatePipes([pipe], PIPE_SPEED, 1)
    expect(next.x).toBeCloseTo(200 - PIPE_SPEED)
  })

  it('delta=1 × 60 frames and delta=2 × 30 frames cover the same distance', () => {
    const pipe60 = makePipe(400, 150)
    const pipe30 = makePipe(400, 150)

    let pipes60 = [pipe60]
    for (let i = 0; i < 60; i++) pipes60 = updatePipes(pipes60, PIPE_SPEED, 1)

    let pipes30 = [pipe30]
    for (let i = 0; i < 30; i++) pipes30 = updatePipes(pipes30, PIPE_SPEED, 2)

    // Both should have moved the same total distance
    expect(pipes60[0]?.x ?? 'removed').toBeCloseTo(pipes30[0]?.x as number, 3)
  })

  it('removes pipes that go off the left edge', () => {
    // Filter: p.x + PIPE_WIDTH(60) > -20  →  removed when x <= -80
    const pipe = makePipe(-81, 150)
    const result = updatePipes([pipe], PIPE_SPEED, 1)
    expect(result).toHaveLength(0)
  })

  it('keeps pipes still within view', () => {
    const pipe = makePipe(10, 150)
    const result = updatePipes([pipe], PIPE_SPEED, 1)
    expect(result).toHaveLength(1)
  })

  it('hard mode: yOffset oscillates and stays within ±60px', () => {
    let pipes = [makePipe(200, 150, 0, 2.0)]
    for (let i = 0; i < 200; i++) {
      pipes = updatePipes(pipes, PIPE_SPEED, 1)
    }
    for (const p of pipes) {
      expect(Math.abs(p.yOffset)).toBeLessThanOrEqual(60)
    }
  })

  it('hard mode: ySpeed reverses when boundary is reached', () => {
    let pipes = [makePipe(200, 150, 59, 2.0)]
    pipes = updatePipes(pipes, PIPE_SPEED, 1)
    // Crossed ±60, so ySpeed should have flipped
    expect(pipes[0].ySpeed).toBeLessThan(0)
  })
})

describe('checkPipeCollision', () => {
  // Bird centered at (140, 270), effective hitbox inset by 4px
  const bx = BIRD_X   // 140
  const bSize = BIRD_SIZE // 30

  it('returns false when bird is completely left of pipe', () => {
    const pipe = makePipe(200, 150)
    expect(checkPipeCollision(bx, 270, bSize, pipe)).toBe(false)
  })

  it('returns false when bird is in the gap', () => {
    const pipe = makePipe(120, 100) // gap: y 100–260
    expect(checkPipeCollision(bx, 180, bSize, pipe)).toBe(false)
  })

  it('returns true when bird overlaps top pipe', () => {
    const pipe = makePipe(120, 200) // top pipe: y 0–200, gap: 200–360
    expect(checkPipeCollision(bx, 190, bSize, pipe)).toBe(true)
  })

  it('returns true when bird overlaps bottom pipe', () => {
    const pipe = makePipe(120, 100) // gap: y 100–260, bottom pipe starts at 260
    expect(checkPipeCollision(bx, 270, bSize, pipe)).toBe(true)
  })

  it('accounts for yOffset in hard mode', () => {
    // topHeight=100, yOffset=50 → effectiveTop=150, gap: 150–310
    const pipe = makePipe(120, 100, 50)
    // y=230 is clearly inside the gap (by1=219 > 150, by2=241 < 310)
    expect(checkPipeCollision(bx, 230, bSize, pipe)).toBe(false)
    // y=140 is above effectiveTop=150 → in top pipe
    expect(checkPipeCollision(bx, 140, bSize, pipe)).toBe(true)
  })
})

describe('markScored', () => {
  it('scores when pipe passes bird x', () => {
    const pipe = makePipe(BIRD_X - PIPE_WIDTH - 1, 150) // just past scoring line
    const { scored, pipes } = markScored([pipe], BIRD_X)
    expect(scored).toBe(true)
    expect(pipes[0].scored).toBe(true)
  })

  it('does not score when pipe has not fully passed', () => {
    const pipe = makePipe(BIRD_X - PIPE_WIDTH + 5, 150)
    const { scored } = markScored([pipe], BIRD_X)
    expect(scored).toBe(false)
  })

  it('does not score the same pipe twice', () => {
    const pipe = makePipe(BIRD_X - PIPE_WIDTH - 1, 150, 0, 0)
    const { pipes: first } = markScored([pipe], BIRD_X)
    const { scored: second } = markScored(first, BIRD_X)
    expect(second).toBe(false)
  })

  it('marks all qualifying pipes in a single call', () => {
    const p1 = makePipe(BIRD_X - PIPE_WIDTH - 10, 150)
    const p2 = makePipe(BIRD_X - PIPE_WIDTH - 50, 150)
    const { scored, pipes } = markScored([p1, p2], BIRD_X)
    expect(scored).toBe(true)
    expect(pipes.filter(p => p.scored)).toHaveLength(2)
  })
})

describe('createPipe', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
  })

  it('spawns at right edge of canvas', () => {
    const pipe = createPipe(CANVAS_W, CANVAS_H, 0)
    expect(pipe.x).toBe(CANVAS_W)
  })

  it('easy mode: ySpeed is 0', () => {
    const pipe = createPipe(CANVAS_W, CANVAS_H, 0, false)
    expect(pipe.ySpeed).toBe(0)
  })

  it('hard mode: ySpeed is non-zero', () => {
    const pipe = createPipe(CANVAS_W, CANVAS_H, 0, true)
    expect(Math.abs(pipe.ySpeed)).toBeGreaterThan(0)
  })

  it('gap always fits within canvas bounds', () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0)   // min topHeight
      .mockReturnValueOnce(0.5) // ySpeed fraction
      .mockReturnValueOnce(0)   // direction
    const pipeMin = createPipe(CANVAS_W, CANVAS_H, 0)
    expect(pipeMin.topHeight + PIPE_GAP).toBeLessThanOrEqual(CANVAS_H)

    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0)
    const pipeMax = createPipe(CANVAS_W, CANVAS_H, 0)
    expect(pipeMax.topHeight).toBeGreaterThan(0)
    expect(pipeMax.topHeight + PIPE_GAP).toBeLessThanOrEqual(CANVAS_H)
  })
})
