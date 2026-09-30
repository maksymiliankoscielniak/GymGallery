import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import { useEffect } from 'react'

interface IntroOverlayProps {
  onBegin: () => void
}

const CIRCLE = 'M 180 34 A 146 146 0 1 1 179.9 34 Z'
const TORSO =
  'M 170 104 L 168 114 Q 132 116 110 126 C 92 132 90 150 98 164 C 103 173 110 179 118 183 ' +
  'C 128 210 140 240 146 268 L 214 268 C 220 240 232 210 242 183 C 250 179 257 173 262 164 ' +
  'C 270 150 268 132 250 126 Q 228 116 192 114 L 190 104'
const HEAD = 'M 180 66 A 19 19 0 1 1 179.9 66 Z'
const ARMS = 'M 98 164 C 92 194 88 224 86 252 M 262 164 C 268 194 272 224 274 252'

/**
 * Wstęp: pożółkły pergamin, na którym ołówek rysuje konstrukcję witruwiańską
 * i szkielet proporcji V-taper, a potem odręcznie wpisuje tytuł dzieła.
 */
export function IntroOverlay({ onBegin }: IntroOverlayProps) {
  const reduced = useReducedMotion()
  const k = reduced ? 0.15 : 1

  // pozycja ołówka na okręgu witruwiańskim (zsynchronizowana z rysowaniem konturu)
  const t = useMotionValue(0)
  const px = useTransform(t, (v) => 180 + 146 * Math.sin(v * 2 * Math.PI))
  const py = useTransform(t, (v) => 180 - 146 * Math.cos(v * 2 * Math.PI))
  const pencilOpacity = useTransform(t, [0, 0.92, 1], [1, 1, 0])
  useEffect(() => {
    const controls = animate(t, 1, { delay: 0.2, duration: 2, ease: 'easeInOut' })
    return () => controls.stop()
  }, [t])
  const draw = (delay: number, duration: number) => ({
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: { pathLength: { delay: delay * k, duration: duration * k, ease: 'easeInOut' as const }, opacity: { delay: delay * k, duration: 0.1 } },
  })

  return (
    <motion.div
      className="tex-parchment fixed inset-0 z-50 flex items-center justify-center overflow-hidden px-4"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(6px)', transition: { duration: 0.7 } }}
    >
      <div className="relative flex w-full max-w-3xl flex-col items-center text-center">
        <div className="relative w-[min(78vw,360px)]">
          <svg viewBox="0 0 360 330" className="h-auto w-full" aria-hidden>
            <defs>
              <filter id="intro-graphite">
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="2" result="n" />
                <feDisplacementMap in="SourceGraphic" in2="n" scale="1.8" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>
            <g filter="url(#intro-graphite)" fill="none" strokeLinecap="round">
              <motion.path id="intro-circle" d={CIRCLE} stroke="#3b3026" strokeWidth={1.2} {...draw(0.2, 2)} />
              <motion.rect x={52} y={52} width={256} height={256} stroke="#3b3026" strokeWidth={1} {...draw(0.9, 1.6)} />
              <motion.path d="M 180 20 L 180 320 M 30 180 L 330 180" stroke="#8f7d62" strokeWidth={0.7} strokeDasharray="3 5" {...draw(1.4, 1.2)} />
              <motion.path d={HEAD} stroke="#3b3026" strokeWidth={1.1} {...draw(1.9, 0.7)} />
              <motion.path d={TORSO} stroke="#3b3026" strokeWidth={1.3} {...draw(2.2, 1.5)} />
              <motion.path d={ARMS} stroke="#3b3026" strokeWidth={1.1} {...draw(2.9, 0.7)} />
              <motion.path d="M 96 128 L 264 128 L 214 268 L 146 268 Z" stroke="#9c3d25" strokeWidth={1} strokeDasharray="3 3" {...draw(3.2, 1)} />
            </g>
            <motion.text
              x={224}
              y={300}
              className="font-hand"
              fontSize={20}
              fill="#9c3d25"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.5 * k }}
            >
              φ 1.618
            </motion.text>
            <motion.text
              x={70}
              y={112}
              className="font-hand"
              fontSize={14}
              fill="#6b5a45"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ delay: 3.3 * k }}
            >
              latitudo humeri
            </motion.text>
            {/* ołówek wędrujący po okręgu */}
            {!reduced && (
              <motion.g style={{ x: px, y: py, opacity: pencilOpacity }}>
                <g transform="rotate(32)">
                  <path d="M 0 0 L -4.5 -11 L 4.5 -11 Z" fill="#e3c9a0" stroke="#3b3026" strokeWidth={0.8} />
                  <path d="M 0 0 L -1.6 -4 L 1.6 -4 Z" fill="#3b3026" />
                  <rect x={-4.5} y={-54} width={9} height={43} fill="#c99a2e" stroke="#3b3026" strokeWidth={0.8} />
                  <line x1={-1.5} y1={-54} x2={-1.5} y2={-11} stroke="#8a6214" strokeWidth={0.6} />
                  <rect x={-4.5} y={-62} width={9} height={8} fill="#9c3d25" stroke="#3b3026" strokeWidth={0.8} />
                </g>
              </motion.g>
            )}
          </svg>

        </div>

        <motion.h1
          className="mt-2 font-hand text-6xl font-bold text-sketch-lines sm:text-7xl"
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          animate={{ clipPath: 'inset(0 0% 0 0)' }}
          transition={{ delay: 2.4 * k, duration: 1.4 * k, ease: 'easeInOut' }}
        >
          Gym Gallery
        </motion.h1>
        <motion.p
          className="mt-2 max-w-md font-sketch text-lg tracking-wide text-sketch-accent sm:text-xl"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.4 * k, duration: 0.8 }}
        >
          Artystyczny Silnik Architektury Sylwetki i&nbsp;Hipertrofii
        </motion.p>

        <motion.ol
          className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-sketch text-sm text-sketch-accent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.9 * k, duration: 0.8 }}
        >
          <li><span className="text-sketch-sanguine">I.</span> Szkic</li>
          <li aria-hidden>·</li>
          <li><span className="text-sketch-sanguine">II.</span> Płótno olejne</li>
          <li aria-hidden>·</li>
          <li><span className="text-sketch-sanguine">III.</span> Marmurowa rzeźba</li>
        </motion.ol>

        <motion.button
          type="button"
          onClick={onBegin}
          className="group relative mt-8 px-8 py-3 font-hand text-2xl text-sketch-lines focus-visible:outline-sketch-sanguine"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 4.2 * k, duration: 0.6 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 220 60" preserveAspectRatio="none" aria-hidden>
            <path
              d="M 6 8 C 60 3 150 5 214 7 C 217 22 216 40 213 53 C 150 57 70 56 7 54 C 3 40 4 20 6 8 Z"
              fill="rgba(244,235,210,0.55)"
              stroke="#3b3026"
              strokeWidth={1.4}
              vectorEffect="non-scaling-stroke"
            />
            <path
              d="M 9 11 C 70 7 150 9 210 10"
              fill="none"
              stroke="#3b3026"
              strokeWidth={0.7}
              opacity={0.5}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <span className="relative">Rozpocznij szkic</span>
        </motion.button>
      </div>
    </motion.div>
  )
}
