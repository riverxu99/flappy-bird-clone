import { Application, Graphics, Container } from 'pixi.js'
import {
  type BirdState, createBird, updateBird, flapBird,
  isBirdOutOfBounds, BIRD_X, BIRD_SIZE,
} from './Bird'
import {
  type Pipe, createPipe, updatePipes, checkPipeCollision,
  markScored, PIPE_WIDTH, PIPE_GAP, PIPE_SPAWN_INTERVAL,
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

interface CloudData { x: number; y: number; w: number; speed: number }

export class GameLoop {
  private app: Application
  private birdGfx!: Container
  private pipeContainer!: Container
  private groundGfx!: Graphics
  private bgGfx!: Graphics
  private pipeGraphics: Map<number, Container> = new Map()
  private clouds: CloudData[] = []
  private cloudGfx!: Container

  private bird!: BirdState
  private pipes: Pipe[] = []
  private pipeIdCounter = 0
  private lastPipeTime = 0
  private running = false
  private dead = false
  private difficulty: 'easy' | 'hard' = 'easy'

  private onScore!: () => void
  private onDead!: () => void

  constructor(app: Application, onScore: () => void, onDead: () => void) {
    this.app = app
    this.onScore = onScore
    this.onDead = onDead
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

    this.birdGfx = this.makeBirdGfx()
    this.app.stage.addChild(this.birdGfx)
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

  private tick = (_delta: number) => {
    if (!this.running) return
    const now = performance.now()

    this.bird = updateBird(this.bird)

    if (now - this.lastPipeTime > PIPE_SPAWN_INTERVAL) {
      const pipe = createPipe(this.W, this.H - GROUND_HEIGHT, this.pipeIdCounter++, this.difficulty === 'hard')
      this.pipes.push(pipe)
      const g = this.drawPipe(pipe)
      this.pipeGraphics.set(pipe.id, g)
      this.pipeContainer.addChild(g)
      this.lastPipeTime = now
    }

    const removed: number[] = []
    this.pipes = updatePipes(this.pipes)
    this.pipeGraphics.forEach((g, id) => {
      const pipe = this.pipes.find((p) => p.id === id)
      if (!pipe) { this.pipeContainer.removeChild(g); removed.push(id) }
      else { g.x = pipe.x; g.y = pipe.yOffset }
    })
    removed.forEach((id) => this.pipeGraphics.delete(id))

    const { pipes: scoredPipes, scored } = markScored(this.pipes, BIRD_X)
    this.pipes = scoredPipes
    if (scored) this.onScore()

    for (const pipe of this.pipes) {
      if (checkPipeCollision(BIRD_X, this.bird.y, BIRD_SIZE, pipe)) {
        this.triggerDead()
        return
      }
    }
    if (isBirdOutOfBounds(this.bird, this.H - GROUND_HEIGHT)) {
      this.triggerDead()
      return
    }

    this.clouds.forEach((cloud, i) => {
      cloud.x -= cloud.speed
      const gfx = this.cloudGfx.children[i] as Graphics
      if (gfx) gfx.x = cloud.x
      if (cloud.x < -100) {
        cloud.x = this.W + 50
        cloud.y = 30 + Math.random() * 100
      }
    })

    this.birdGfx.x = BIRD_X
    this.birdGfx.y = this.bird.y
    this.birdGfx.rotation = (this.bird.rotation * Math.PI) / 180
  }

  private triggerDead() {
    this.dead = true
    this.running = false
    this.app.ticker.remove(this.tick, this)
    this.onDead()
  }

  destroy() {
    this.app.ticker.remove(this.tick, this)
  }
}
