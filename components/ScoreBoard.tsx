import { useEffect, useRef, useState } from 'react'

interface Props {
  score: number
  bestScore: number
  visible: boolean
  coinBonusSeq: number
}

interface Popup { id: number }
let popupId = 0

const ANIM_MS = 1100

export default function ScoreBoard({ score, bestScore, visible, coinBonusSeq }: Props) {
  const [popups, setPopups] = useState<Popup[]>([])
  const styleInjected = useRef(false)

  useEffect(() => {
    if (styleInjected.current) return
    styleInjected.current = true
    const style = document.createElement('style')
    style.textContent = `
      @keyframes coinFloat {
        0%   { opacity: 0; transform: translateY(0); }
        15%  { opacity: 1; }
        80%  { opacity: 1; transform: translateY(-26px); }
        100% { opacity: 0; transform: translateY(-34px); }
      }
    `
    document.head.appendChild(style)
  }, [])

  useEffect(() => {
    if (coinBonusSeq === 0) return
    const id = popupId++
    setPopups(prev => [...prev, { id }])
    setTimeout(() => setPopups(prev => prev.filter(p => p.id !== id)), ANIM_MS)
  }, [coinBonusSeq])

  if (!visible) return null
  return (
    <div style={{
      position: 'absolute',
      top: 16,
      left: 0,
      right: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      pointerEvents: 'none',
      zIndex: 10,
    }}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <span style={{
          color: '#fff',
          fontSize: 36,
          fontWeight: 'bold',
          textShadow: '2px 2px 0 #000, -1px -1px 0 #000',
          lineHeight: 1,
        }}>
          {score}
        </span>
        {popups.map(p => (
          <span
            key={p.id}
            style={{
              position: 'absolute',
              left: '100%',
              bottom: 0,
              marginLeft: 7,
              whiteSpace: 'nowrap',
              color: '#FFD700',
              fontSize: 13,
              fontWeight: 700,
              fontFamily: 'system-ui, sans-serif',
              textShadow: '1px 1px 0 #000',
              animation: `coinFloat ${ANIM_MS}ms ease-out forwards`,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 22 22" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }}>
              <circle cx="11" cy="11" r="11" fill="#ff9900" opacity="0.35" />
              <circle cx="11" cy="11" r="7" fill="#ffdd00" />
              <circle cx="9" cy="9" r="3" fill="white" opacity="0.75" />
            </svg>
            +1
          </span>
        ))}
      </div>
      <span style={{
        color: 'rgba(255,255,255,0.75)',
        fontSize: 14,
        textShadow: '1px 1px 0 #000',
        lineHeight: 1,
        marginTop: 4,
      }}>
        BEST {bestScore}
      </span>
    </div>
  )
}
