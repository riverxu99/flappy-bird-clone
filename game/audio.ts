import { Howl, Howler } from 'howler'

type SoundKey = 'flap' | 'hit' | 'dead' | 'pickup' | 'select'

const configs: Record<SoundKey, { src: string; volume: number }> = {
  flap:   { src: 'sound-effects/jump.wav',       volume: 0.5 },
  hit:    { src: 'sound-effects/hitHurt.wav',    volume: 0.6 },
  dead:   { src: 'sound-effects/lose.wav',        volume: 0.7 },
  pickup: { src: 'sound-effects/pickupCoin.wav',  volume: 0.5 },
  select: { src: 'sound-effects/select.wav',      volume: 0.4 },
}

const cache: Partial<Record<SoundKey, Howl>> = {}

function getSound(key: SoundKey): Howl {
  if (!cache[key]) {
    const c = configs[key]
    cache[key] = new Howl({
      src: [`${import.meta.env.BASE_URL}${c.src}`],
      volume: c.volume,
    })
  }
  return cache[key]!
}

export function setMuted(m: boolean): void { Howler.mute(m) }
export function playFlap():   void { getSound('flap').play() }
export function playHit():    void { getSound('hit').play() }
export function playDead():   void { getSound('dead').play() }
export function playPickup(): void { getSound('pickup').play() }
export function playSelect(): void { getSound('select').play() }
