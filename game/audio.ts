import { Howl, Howler } from 'howler'

const flap   = new Howl({ src: [`${import.meta.env.BASE_URL}sound-effects/jump.wav`],       volume: 0.5 })
const hit    = new Howl({ src: [`${import.meta.env.BASE_URL}sound-effects/hitHurt.wav`],    volume: 0.6 })
const dead   = new Howl({ src: [`${import.meta.env.BASE_URL}sound-effects/lose.wav`],       volume: 0.7 })
const pickup = new Howl({ src: [`${import.meta.env.BASE_URL}sound-effects/pickupCoin.wav`], volume: 0.5 })
const select = new Howl({ src: [`${import.meta.env.BASE_URL}sound-effects/select.wav`],     volume: 0.4 })

export function setMuted(m: boolean): void {
  Howler.mute(m)
}

export function playFlap():   void { flap.play() }
export function playHit():    void { hit.play() }
export function playDead():   void { dead.play() }
export function playPickup(): void { pickup.play() }
export function playSelect(): void { select.play() }
