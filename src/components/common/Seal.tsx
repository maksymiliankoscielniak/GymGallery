import { motion, useReducedMotion } from 'framer-motion'

interface SealProps {
  onActivate: () => void
  label?: string
}

/**
 * Pieczęć sangwiną — pojawia się na pergaminie, gdy szkic jest zbilansowany.
 * Kliknięcie uruchamia przejście do Etapu II.
 */
export function Seal({ onActivate, label = 'Zatwierdź szkic i przejdź do płótna olejnego' }: SealProps) {
  const reduced = useReducedMotion()
  return (
    <motion.button
      type="button"
      onClick={onActivate}
      aria-label={label}
      className="group relative block h-36 w-36 cursor-pointer rounded-full focus-visible:outline-[#9c3d25] sm:h-40 sm:w-40"
      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 1.9, rotate: -28 }}
      animate={{ opacity: 1, scale: 1, rotate: -8 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.25 } }}
      transition={{ type: 'spring', stiffness: 260, damping: 16, mass: 0.9 }}
      whileHover={{ rotate: -3, scale: 1.05 }}
      whileTap={{ scale: 0.94 }}
    >
      <svg viewBox="0 0 160 160" className="h-full w-full overflow-visible">
        <defs>
          <filter id="seal-ink" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" seed="9" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G" result="d" />
            <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="3" result="speck" />
            <feColorMatrix in="speck" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3 2.3" result="mask" />
            <feComposite in="d" in2="mask" operator="in" />
          </filter>
          <filter id="seal-soft" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="1" seed="4" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="1.4" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <path id="seal-ring" d="M 80 80 m -56 0 a 56 56 0 1 1 112 0 a 56 56 0 1 1 -112 0" />
        </defs>

        {/* rozprysk tuszu przy odbiciu pieczęci */}
        {!reduced && (
          <motion.circle
            cx={80}
            cy={80}
            r={70}
            fill="none"
            stroke="#9c3d25"
            strokeWidth={1}
            initial={{ opacity: 0.6, scale: 0.9 }}
            animate={{ opacity: 0, scale: 1.45 }}
            transition={{ duration: 0.9, delay: 0.15 }}
          />
        )}

        <g filter="url(#seal-ink)" fill="#9c3d25" stroke="#9c3d25">
          <circle cx={80} cy={80} r={72} fill="none" strokeWidth={4} />
          <circle cx={80} cy={80} r={66} fill="none" strokeWidth={1.2} />
          <circle cx={80} cy={80} r={44} fill="none" strokeWidth={1.2} strokeDasharray="2.5 3" />
          <text className="font-sketch" fontSize={11} stroke="none">
            <textPath href="#seal-ring" startOffset="0" textLength={346} lengthAdjust="spacing">
              GYM GALLERY · SCHIZZO APPROVATO · MMXXVI ·
            </textPath>
          </text>
        </g>
        <g filter="url(#seal-soft)" fill="#9c3d25" stroke="none">
          <text x={80} y={86} textAnchor="middle" className="font-sketch" fontSize={40} fontWeight={500}>
            I
          </text>
          <path d="M 62 72 l 3 3 l -3 3 l -3 -3 Z M 98 72 l 3 3 l -3 3 l -3 -3 Z" />
          <text x={80} y={106} textAnchor="middle" className="font-hand" fontSize={17} fontWeight={700}>
            zatwierdź
          </text>
        </g>
      </svg>
      <span className="pointer-events-none absolute -bottom-7 left-1/2 w-max -translate-x-1/2 font-hand text-lg text-[#9c3d25] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        przyłóż pieczęć →
      </span>
    </motion.button>
  )
}
