// Safari requires webkitAudioContext fallback
declare global {
  interface Window { webkitAudioContext?: typeof AudioContext }
}

let ctx: AudioContext | null = null
let unlocked = false

function getCtx(): AudioContext {
  if (!ctx) {
    const AC = window.AudioContext ?? window.webkitAudioContext!
    ctx = new AC()
  }
  return ctx
}

/**
 * iOS/Safari requires a silent buffer to be played synchronously inside
 * the first user gesture before any real audio will work.
 */
function ensureUnlocked(ac: AudioContext): void {
  if (unlocked) return
  unlocked = true
  const buf = ac.createBuffer(1, 1, ac.sampleRate)
  const src = ac.createBufferSource()
  src.buffer = buf
  src.connect(ac.destination)
  src.start(0)
  // Also resume in case the context was auto-suspended (Chrome autoplay policy)
  if (ac.state !== 'running') ac.resume().catch(() => {})
}

function scheduleFlap(ac: AudioContext): void {
  const now = ac.currentTime
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.connect(gain)
  gain.connect(ac.destination)

  osc.type = 'triangle'
  osc.frequency.setValueAtTime(880, now)
  osc.frequency.exponentialRampToValueAtTime(280, now + 0.07)

  gain.gain.setValueAtTime(0.18, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09)

  osc.start(now)
  osc.stop(now + 0.09)
}

export function playFlap(muted: boolean): void {
  if (muted) return
  try {
    const ac = getCtx()
    // ensureUnlocked must run synchronously inside the user gesture
    ensureUnlocked(ac)
    scheduleFlap(ac)
  } catch (e) {
    console.error('[audio] playFlap error', e)
  }
}
