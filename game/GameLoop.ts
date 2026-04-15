import { Application, Graphics, Container } from 'pixi.js'
import {
  type BirdState, createBird, updateBird, flapBird,
  isBirdOutOfBounds, BIRD_X, BIRD_SIZE,
} from './Bird'
import {
  type Pipe, createPipe, updatePipes, checkPipeCollision,
  markScored, PIPE_WIDTH, PIPE_GAP, PIPE_SPAWN_INTERVAL, PIPE_SPEED,
} from './Pipe'

const GROUND_HEIGHT = 60
const BG_SKY = 0x5ec0de
const BG_GROUND = 0xded895
const GROUND_STRIPE = 0xc8a84b
const PIPE_COLOR = 0x74bf2e
const PIPE_BORDER = 0x4a8c1c
const BIRD_COLOR = 0xf5c542
const BIRD_BORDER = 0xc8960a
const BIRD_EYE = 0xffffff
const BIRD_PUPIL = 0x222222
const BIRD_BEAK = 0xe07820

// Bird queue settings
const FOLLOWER_GAP = 32        // horizontal px between each bird in the chain
const SPACING_FRAMES = 11      // how many frames behind each follower trails
const MAX_HISTORY = 280        // max entries in position history ring buffer
const INVINCIBLE_FRAMES = 120  // ~2s of invincibility after a hit

// Dot settings — one dot per pipe gap, placed at the horizontal midpoint
const DOT_RADIUS = 7
const DOT_COLOR = 0xffdd00
const DOT_GLOW = 0xff9900

// Falling bird animation
const FALL_GRAVITY = 0.7        // extra gravity on ejected birds

interface CloudData { x: number; y: number; w: number; speed: number }
interface DotData { id: number; x: number; y: number }
interface FallingBirdData { x: number; y: number; vy: number; rot: number; gfx: Container }

export class GameLoop {
  private app: Application
  private birdGfx!: Container
  private pipeContainer!: Container
  private groundGfx!: Graphics
  private bgGfx!: Graphics
  private pipeGraphics: Map<number, Container> = new Map()
  private clouds: CloudData[] = []
  private cloudGfx!: Container
  private dotContainer!: Container
  private followerContainer!: Container
  private fallingBirdContainer!: Container

  private bird!: BirdState
  private pipes: Pipe[] = []
  private pipeIdCounter = 0
  private lastPipeTime = 0
  private running = false
  private dead = false
  private difficulty: 'easy' | 'hard' = 'easy'
  private score = 0
  private currentSpeed = PIPE_SPEED

  // --- Bird queue ---
  private birdQueue = 1              // total birds alive (leader + followers)
  private posHistory: number[] = []  // y-position history of the leader
  private followerGfxList: Container[] = []

  // --- Falling bird animations ---
  private fallingBirds: FallingBirdData[] = []

  // --- Invincibility ---
  private invincible = false
  private invincibleTimer = 0

  // --- Dots ---
  private dots: DotData[] = []
  private dotGfxMap: Map<number, Graphics> = new Map()
  private dotIdCounter = 0

  private onScore!: () => void
  private onDead!: () => void
  private onHit?: () => void
  private onPickup?: () => void
  private onBirdCountChange?: (n: number) => void
  private onCoinBonus?: () => void

  constructor(
    app: Application,
    onScore: () => void,
    onDead: () => void,
    onHit?: () => void,
    onPickup?: () => void,
    onBirdCountChange?: (n: number) => void,
    onCoinBonus?: () => void,
  ) {
    this.app = app
    this.onScore = () => {
      onScore()
      this.score++
      if (this.score % 5 === 0) {
        this.currentSpeed = Math.min(this.currentSpeed + 1.0, 10)
      }
    }
    this.onDead = onDead
    this.onHit = onHit
    this.onPickup = onPickup
    this.onBirdCountChange = onBirdCountChange
    this.onCoinBonus = onCoinBonus
    this.buildScene()
  }

  private get W() { return this.app.screen.width }
  private get H() { return this.app.screen.height }

  private buildScene() {
    this.bgGfx = new Graphics()
    this.drawBg()
    this.app.stage.addChild(this.bgGfx)

    this.cloudGfx = new Container()
    this.app.stage.addChild(this.cloudGfx)
    this.spawnInitialClouds()

    this.pipeContainer = new Container()
    this.app.stage.addChild(this.pipeContainer)

    this.groundGfx = new Graphics()
    this.drawGround()
    this.app.stage.addChild(this.groundGfx)

    this.dotContainer = new Container()
    this.app.stage.addChild(this.dotContainer)

    this.followerContainer = new Container()
    this.app.stage.addChild(this.followerContainer)

    this.birdGfx = this.makeBirdGfx()
    this.birdGfx.visible = false
    this.app.stage.addChild(this.birdGfx)

    // Falling birds render above everything so they fall through ground visually
    this.fallingBirdContainer = new Container()
    this.app.stage.addChild(this.fallingBirdContainer)
  }

  private drawBg() {
    this.bgGfx.clear()
    this.bgGfx.beginFill(BG_SKY)
    this.bgGfx.drawRect(0, 0, this.W, this.H)
    this.bgGfx.endFill()
  }

  private drawGround() {
    this.groundGfx.clear()
    this.groundGfx.beginFill(BG_GROUND)
    this.groundGfx.drawRect(0, this.H - GROUND_HEIGHT, this.W, GROUND_HEIGHT)
    this.groundGfx.endFill()
    this.groundGfx.beginFill(GROUND_STRIPE)
    this.groundGfx.drawRect(0, this.H - GROUND_HEIGHT, this.W, 4)
    this.groundGfx.drawRect(0, this.H - 16, this.W, 4)
    this.groundGfx.endFill()
  }

  private spawnInitialClouds() {
    for (let i = 0; i < 4; i++) {
      this.addCloud(Math.random() * this.W, 30 + Math.random() * 100)
    }
  }

  private addCloud(x: number, y: number) {
    const w = 40 + Math.random() * 50
    const speed = 0.3 + Math.random() * 0.4
    this.clouds.push({ x, y, w, speed })
    const g = new Graphics()
    g.beginFill(0xffffff, 0.85)
    g.drawEllipse(0, 0, w / 2, 10)
    g.drawEllipse(-w * 0.15, -7, w * 0.25, 9)
    g.drawEllipse(w * 0.1, -5, w * 0.2, 8)
    g.endFill()
    g.x = x
    g.y = y
    this.cloudGfx.addChild(g)
  }

  private makeBirdGfx(): Container {
    const c = new Container()
    const body = new Graphics()
    body.lineStyle(2, BIRD_BORDER)
    body.beginFill(BIRD_COLOR)
    body.drawEllipse(0, 0, BIRD_SIZE / 2, BIRD_SIZE / 2 - 2)
    body.endFill()

    const wing = new Graphics()
    wing.beginFill(0xe8b030)
    wing.lineStyle(1, BIRD_BORDER)
    wing.drawEllipse(0, 0, 8, 5)
    wing.endFill()
    wing.x = -4; wing.y = 6

    const eye = new Graphics()
    eye.beginFill(BIRD_EYE)
    eye.drawCircle(0, 0, 4)
    eye.endFill()
    eye.x = 7; eye.y = -5

    const pupil = new Graphics()
    pupil.beginFill(BIRD_PUPIL)
    pupil.drawCircle(0, 0, 2)
    pupil.endFill()
    pupil.x = 9; pupil.y = -5

    const beak = new Graphics()
    beak.beginFill(BIRD_BEAK)
    beak.moveTo(0, 0); beak.lineTo(9, 3); beak.lineTo(0, 6); beak.closePath()
    beak.endFill()
    beak.x = 11; beak.y = -3

    c.addChild(wing, body, eye, pupil, beak)
    c.pivot.set(0, 0)
    return c
  }

  private makeDotGfx(x: number, y: number): Graphics {
    const g = new Graphics()
    // Soft glow ring
    g.beginFill(DOT_GLOW, 0.35)
    g.drawCircle(0, 0, DOT_RADIUS + 4)
    g.endFill()
    // Main body
    g.beginFill(DOT_COLOR)
    g.drawCircle(0, 0, DOT_RADIUS)
    g.endFill()
    // Highlight
    g.beginFill(0xffffff, 0.75)
    g.drawCircle(-2, -2, 3)
    g.endFill()
    g.x = x
    g.y = y
    return g
  }

  private drawPipe(pipe: Pipe): Container {
    const c = new Container()
    const bottomY = pipe.topHeight + PIPE_GAP
    // overflow ensures pipes always fill to canvas edges even when oscillating
    const overflow = this.H

    const topBody = new Graphics()
    topBody.lineStyle(2, PIPE_BORDER)
    topBody.beginFill(PIPE_COLOR)
    topBody.drawRect(0, -overflow, PIPE_WIDTH, overflow + pipe.topHeight - 14)
    topBody.endFill()
    topBody.lineStyle(2, PIPE_BORDER)
    topBody.beginFill(PIPE_COLOR)
    topBody.drawRect(-4, pipe.topHeight - 14, PIPE_WIDTH + 8, 14)
    topBody.endFill()

    const botBody = new Graphics()
    botBody.lineStyle(2, PIPE_BORDER)
    botBody.beginFill(PIPE_COLOR)
    botBody.drawRect(-4, bottomY, PIPE_WIDTH + 8, 14)
    botBody.endFill()
    botBody.lineStyle(2, PIPE_BORDER)
    botBody.beginFill(PIPE_COLOR)
    botBody.drawRect(0, bottomY + 14, PIPE_WIDTH, overflow)
    botBody.endFill()

    c.addChild(topBody, botBody)
    c.x = pipe.x
    return c
  }

  start(difficulty: 'easy' | 'hard' = 'easy') {
    this.difficulty = difficulty
    this.bird = createBird(this.H - GROUND_HEIGHT)
    this.pipes = []
    this.pipeIdCounter = 0
    this.lastPipeTime = performance.now()
    this.running = true
    this.dead = false
    this.score = 0
    this.currentSpeed = PIPE_SPEED

    // Reset bird queue
    this.birdQueue = 1
    this.onBirdCountChange?.(1)
    this.posHistory = []
    this.followerGfxList.forEach(g => this.followerContainer.removeChild(g))
    this.followerGfxList = []
    this.fallingBirds.forEach(fb => this.fallingBirdContainer.removeChild(fb.gfx))
    this.fallingBirds = []
    this.invincible = false
    this.invincibleTimer = 0
    this.birdGfx.visible = true

    // Reset dots
    this.dotGfxMap.forEach(g => this.dotContainer.removeChild(g))
    this.dotGfxMap.clear()
    this.dots = []
    this.dotIdCounter = 0

    this.pipeGraphics.forEach((g) => this.pipeContainer.removeChild(g))
    this.pipeGraphics.clear()
    this.app.ticker.add(this.tick, this)
    this.flap()
  }

  stop() {
    this.running = false
    this.app.ticker.remove(this.tick, this)
  }

  pause() { this.running = false }
  resume() { this.running = true }

  flap() {
    if (!this.dead) {
      this.bird = flapBird(this.bird)
    }
  }

  private tick = (delta: number) => {
    if (!this.running) return
    const now = performance.now()

    this.bird = updateBird(this.bird, delta)

    // Record leader y in history
    this.posHistory.push(this.bird.y)
    if (this.posHistory.length > MAX_HISTORY) this.posHistory.shift()

    // --- Spawn pipes ---
    if (now - this.lastPipeTime > PIPE_SPAWN_INTERVAL) {
      const pipe = createPipe(this.W, this.H - GROUND_HEIGHT, this.pipeIdCounter++, this.difficulty === 'hard')
      this.pipes.push(pipe)
      const g = this.drawPipe(pipe)
      this.pipeGraphics.set(pipe.id, g)
      this.pipeContainer.addChild(g)
      this.lastPipeTime = now
      this.spawnDotAt(this.W + PIPE_WIDTH / 2, pipe)
    }

    // --- Update pipes ---
    const removed: number[] = []
    this.pipes = updatePipes(this.pipes, this.currentSpeed, delta)
    this.pipeGraphics.forEach((g, id) => {
      const pipe = this.pipes.find((p) => p.id === id)
      if (!pipe) { this.pipeContainer.removeChild(g); removed.push(id) }
      else { g.x = pipe.x; g.y = pipe.yOffset }
    })
    removed.forEach((id) => this.pipeGraphics.delete(id))

    // --- Score ---
    const { pipes: scoredPipes, scored } = markScored(this.pipes, BIRD_X)
    this.pipes = scoredPipes
    if (scored) this.onScore()

    // --- Collision detection (skipped during invincibility) ---
    if (!this.invincible) {
      let hit = false
      for (const pipe of this.pipes) {
        if (checkPipeCollision(BIRD_X, this.bird.y, BIRD_SIZE, pipe)) {
          hit = true
          break
        }
      }
      if (!hit && isBirdOutOfBounds(this.bird, this.H - GROUND_HEIGHT)) {
        hit = true
      }
      if (hit) {
        // Clamp bird to play area boundaries before freezing,
        // so high-velocity impacts don't visually penetrate the ground/ceiling.
        const ry = BIRD_SIZE / 2 - 2
        const clampedY = Math.max(ry, Math.min(this.bird.y, (this.H - GROUND_HEIGHT) - ry))
        this.birdGfx.x = BIRD_X
        this.birdGfx.y = clampedY
        this.birdGfx.rotation = (this.bird.rotation * Math.PI) / 180
        this.handleHit()
        return
      }
    } else {
      this.invincibleTimer += delta
      const groundY = (this.H - GROUND_HEIGHT) - BIRD_SIZE / 2
      if (this.invincibleTimer >= INVINCIBLE_FRAMES) {
        this.invincible = false
        this.birdGfx.visible = true
        // If the bird is still on the ground when invincibility ends, push it upward
        // so the normal collision check doesn't immediately re-trigger next frame.
        if (this.bird.y >= groundY - 1) {
          this.bird = { ...this.bird, y: groundY - 2, vy: -3 }
        }
      }
      // Clamp bird to play area during invincibility so it can't fall through the ground
      if (this.bird.y > groundY) {
        this.bird = { ...this.bird, y: groundY, vy: 0 }
      }
    }

    // --- Update and collect dots ---
    const toRemove: number[] = []
    for (const dot of this.dots) {
      dot.x -= this.currentSpeed * delta
      const gfx = this.dotGfxMap.get(dot.id)
      if (gfx) gfx.x = dot.x

      // Collection check: circle vs circle
      const dx = dot.x - BIRD_X
      const dy = dot.y - this.bird.y
      if (Math.sqrt(dx * dx + dy * dy) < DOT_RADIUS + BIRD_SIZE / 2) {
        toRemove.push(dot.id)
        this.onPickup?.()
        if (this.birdQueue >= 5) {
          this.onScore()
          this.onCoinBonus?.()
        } else {
          this.addFollower()
        }
      } else if (dot.x < -20) {
        toRemove.push(dot.id)
      }
    }
    for (const id of toRemove) {
      const gfx = this.dotGfxMap.get(id)
      if (gfx) this.dotContainer.removeChild(gfx)
      this.dotGfxMap.delete(id)
    }
    this.dots = this.dots.filter(d => !toRemove.includes(d.id))

    // --- Update clouds ---
    this.clouds.forEach((cloud, i) => {
      cloud.x -= cloud.speed * delta
      const gfx = this.cloudGfx.children[i] as Graphics
      if (gfx) gfx.x = cloud.x
      if (cloud.x < -100) {
        cloud.x = this.W + 50
        cloud.y = 30 + Math.random() * 100
      }
    })

    // --- Animate falling ejected birds ---
    const groundLine = this.H - GROUND_HEIGHT
    this.fallingBirds = this.fallingBirds.filter(fb => {
      fb.vy += FALL_GRAVITY * delta
      fb.y += fb.vy * delta
      fb.rot += 0.12 * delta
      fb.gfx.y = fb.y
      fb.gfx.rotation = fb.rot
      if (fb.y + BIRD_SIZE / 2 > groundLine || fb.y > this.H + 60) {
        this.fallingBirdContainer.removeChild(fb.gfx)
        return false
      }
      return true
    })

    // --- Render main bird ---
    this.birdGfx.x = BIRD_X
    this.birdGfx.y = this.bird.y
    this.birdGfx.rotation = (this.bird.rotation * Math.PI) / 180
    // Flicker during invincibility
    if (this.invincible) {
      this.birdGfx.visible = Math.floor(this.invincibleTimer / 5) % 2 === 0
    }

    // --- Render follower birds (max 4 shown; extras hidden) ---
    for (let i = 0; i < this.followerGfxList.length; i++) {
      if (i >= 4) {
        this.followerGfxList[i].visible = false
        continue
      }
      const delay = (i + 1) * SPACING_FRAMES
      const histIdx = this.posHistory.length - 1 - delay
      const followerY = histIdx >= 0 ? this.posHistory[histIdx] : this.bird.y
      this.followerGfxList[i].visible = true
      this.followerGfxList[i].x = BIRD_X - (i + 1) * FOLLOWER_GAP
      this.followerGfxList[i].y = followerY
      this.followerGfxList[i].rotation = 0
    }
  }

  // Called when a collision happens. Ejects the frontmost bird with a falling
  // animation. If more birds remain, the first follower becomes the new leader.
  // Game ends only when the last bird is ejected.
  private handleHit() {
    // Only create falling animation for pipe hits (bird is above ground).
    // Ground hits: bird is already at floor level — skip to avoid a one-frame ghost overlap.
    const atGround = this.bird.y + BIRD_SIZE / 2 > this.H - GROUND_HEIGHT
    if (!atGround) {
      const fallingGfx = this.makeBirdGfx()
      fallingGfx.x = BIRD_X
      fallingGfx.y = this.bird.y
      fallingGfx.rotation = (this.bird.rotation * Math.PI) / 180
      this.fallingBirdContainer.addChild(fallingGfx)
      this.fallingBirds.push({
        x: BIRD_X,
        y: this.bird.y,
        vy: Math.max(this.bird.vy, 4),
        rot: fallingGfx.rotation,
        gfx: fallingGfx,
      })
    }

    if (this.birdQueue > 1) {
      this.onHit?.()
      this.birdQueue--
      this.onBirdCountChange?.(this.birdQueue)

      // Remove the promoted follower's graphic (it is now the main bird)
      // Bird state (y, vy) is preserved so motion continues naturally
      const promoted = this.followerGfxList.shift()!
      this.followerContainer.removeChild(promoted)

      // Grant invincibility so the player has time to recover
      this.invincible = true
      this.invincibleTimer = 0
    } else {
      // Last bird — real game over
      this.dead = true
      this.running = false
      this.app.ticker.remove(this.tick, this)
      this.onDead()
    }
  }

  private addFollower() {
    this.birdQueue++
    this.onBirdCountChange?.(this.birdQueue)
    const gfx = this.makeBirdGfx()
    this.followerContainer.addChild(gfx)
    this.followerGfxList.push(gfx)
  }

  private spawnDotAt(x: number, nearPipe: Pick<Pipe, 'topHeight' | 'yOffset'>) {
    const inset = 20  // keep dot away from pipe rim edges
    const gapTop = nearPipe.topHeight + nearPipe.yOffset + inset
    const gapBottom = nearPipe.topHeight + nearPipe.yOffset + PIPE_GAP - inset
    const y = gapTop + Math.random() * (gapBottom - gapTop)
    const id = this.dotIdCounter++
    this.dots.push({ id, x, y })
    const gfx = this.makeDotGfx(x, y)
    this.dotContainer.addChild(gfx)
    this.dotGfxMap.set(id, gfx)
  }

  destroy() {
    this.app.ticker.remove(this.tick, this)
  }
}
