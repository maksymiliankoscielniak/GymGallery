import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import { useEffect } from 'react'
import { useI18n } from '../../i18n/useI18n'
import { LanguageSwitch } from '../common/LanguageSwitch'

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
 * Intro: yellowed parchment on which a pencil draws the Vitruvian construction
 * and the V-taper skeleton, then hand-writes the title of the work.
 */
export function IntroOverlay({ onBegin }: IntroOverlayProps) {
  const reduced = useReducedMotion()
  const { t: tr } = useI18n()
  const k = reduced ? 0.15 : 1

  // pencil position on the Vitruvian circle (in sync with the outline drawing)
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
      <LanguageSwitch tone="sketch" className="absolute right-4 top-4 z-10" />
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
            {/* pencil travelling around the circle */}
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
          {tr('intro.subtitle')}
        </motion.p>

        <motion.ol
          className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-sketch text-sm text-sketch-accent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.9 * k, duration: 0.8 }}
        >
          <li><span className="text-sketch-sanguine">I.</span> {tr('intro.stage1')}</li>
          <li aria-hidden>·</li>
          <li><span className="text-sketch-sanguine">II.</span> {tr('intro.stage2')}</li>
          <li aria-hidden>·</li>
          <li><span className="text-sketch-sanguine">III.</span> {tr('intro.stage3')}</li>
        </motion.ol>

        <motion.button
          type="button"
          onClick={onBegin}
          className="group relative mt-8 font-hand text-2xl text-sketch-lines focus-visible:outline-sketch-sanguine"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 4.2 * k, duration: 0.6 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97, rotate: -0.6 }}
        >
          {/* idle: a barely-there float, starts once the button has been drawn */}
          <motion.span
            className="relative block px-8 py-3"
            animate={reduced ? undefined : { y: [0, -2.5, 0] }}
            transition={{ delay: 6.2, duration: 3.6, ease: 'easeInOut', repeat: Infinity }}
          >
            <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 220 60" preserveAspectRatio="none" aria-hidden>
              {/* paper fill fades in, then the pencil outline is drawn around it */}
              <motion.path
                d="M 6 8 C 60 3 150 5 214 7 C 217 22 216 40 213 53 C 150 57 70 56 7 54 C 3 40 4 20 6 8 Z"
                fill="rgba(244,235,210,0.55)"
                stroke="none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: (4.2 + 0.5) * k, duration: 0.6 }}
              />
              <motion.path
                d="M 6 8 C 60 3 150 5 214 7 C 217 22 216 40 213 53 C 150 57 70 56 7 54 C 3 40 4 20 6 8 Z"
                fill="none"
                stroke="#3b3026"
                strokeWidth={1.4}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 4.2 * k, duration: 1 * k, ease: 'easeInOut' }}
              />
              <motion.path
                d="M 9 11 C 70 7 150 9 210 10"
                fill="none"
                stroke="#3b3026"
                strokeWidth={0.7}
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.5 }}
                transition={{ delay: (4.2 + 0.9) * k, duration: 0.6 * k, ease: 'easeOut' }}
              />
              {/* hover: a sanguine pencil underline sketches itself under the label */}
              <path
                d="M 34 47 C 70 51 140 43 186 48"
                pathLength={1}
                fill="none"
                stroke="#9c3d25"
                strokeWidth={1.4}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                className="opacity-0 transition-[stroke-dashoffset,opacity] duration-500 ease-out [stroke-dasharray:1] [stroke-dashoffset:1] group-hover:opacity-90 group-hover:[stroke-dashoffset:0] group-focus-visible:opacity-90 group-focus-visible:[stroke-dashoffset:0]"
              />
            </svg>
            <span className="relative inline-flex items-center gap-2">
              {tr('intro.begin')}
              <svg
                viewBox="0 0 24 12"
                className="h-3 w-6 -translate-x-1 text-sketch-sanguine opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M 1 6.5 C 8 5.5 15 6.5 22 6" />
                <path d="M 17 1.5 C 19 3.5 21 5 22.5 6 C 21 7.5 19 9 17 10.5" />
              </svg>
            </span>
          </motion.span>
        </motion.button>
      </div>
    </motion.div>
  )
}
