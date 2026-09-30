import { AnimatePresence, motion } from 'framer-motion'
import { useState, type KeyboardEvent } from 'react'
import { MUSCLE_MAP } from '../../data/muscles'
import { hashString } from '../../lib/random'
import type { BodyView, MuscleId } from '../../types'
import { crackPath } from './crack'
import { CENTER_LINES, DETAIL_LINES, FACE, OUTLINE_HALF, SILHOUETTE, both, mirrorPath, shapesFor } from './geometry'

interface MarblePlateProps {
  /** Partie przekraczające MRV — pęknięcia w strukturze marmuru */
  cracked: MuscleId[]
  /** Pęknięcie zmęczenia centralnego (wzdłuż kręgosłupa) */
  centralCrack: boolean
  /** Deload wykuty: pęknięcia zamieniają się w złote spoiny (kintsugi) */
  healed: boolean
  selected: MuscleId | null
  onSelect: (m: MuscleId) => void
  label?: (m: MuscleId) => string
}

const FIG_X: Record<BodyView, number> = { front: 170, back: 430 }
const FIG_Y = 18

export function MarblePlate({ cracked, centralCrack, healed, selected, onSelect, label }: MarblePlateProps) {
  const [hovered, setHovered] = useState<MuscleId | null>(null)
  const focus = hovered ?? selected

  const onKey = (e: KeyboardEvent, m: MuscleId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect(m)
    }
  }

  const crackColor = healed ? '#d4a843' : '#15171b'

  const renderFigure = (view: BodyView) => {
    const shapes = shapesFor(view)
    return (
      <g transform={`translate(${FIG_X[view]} ${FIG_Y})`}>
        {/* cień rzucany na cokół */}
        <ellipse cx={14} cy={470} rx={46} ry={6} fill="#000" opacity={0.55} filter="url(#soft-shadow)" />
        {/* bryła marmuru */}
        <path d={SILHOUETTE} fill="#ebe8e1" filter="url(#marble-body)" />

        {/* ryte kontury mięśni */}
        <g fill="none" strokeLinejoin="round" style={{ pointerEvents: 'none' }}>
          {shapes.map((s) => (
            <g key={`carve-${s.muscle}`}>
              <path d={both(s.d)} stroke="#fff" strokeOpacity={0.55} strokeWidth={0.9} transform="translate(0.7 0.7)" />
              <path
                d={both(s.d)}
                stroke={s.muscle === focus ? '#d4a843' : '#5b6170'}
                strokeOpacity={s.muscle === focus ? 0.95 : 0.45}
                strokeWidth={s.muscle === focus ? 1.5 : 0.8}
                fill={s.muscle === focus ? 'rgba(212,168,67,0.10)' : 'none'}
              />
            </g>
          ))}
          {DETAIL_LINES[view].map((d, i) => (
            <path key={i} d={both(d)} stroke="#5b6170" strokeOpacity={0.3} strokeWidth={0.7} />
          ))}
          <path d={FACE[view]} stroke="#5b6170" strokeOpacity={0.45} strokeWidth={0.8} strokeLinecap="round" />
          <path d={FACE[view]} stroke="#fff" strokeOpacity={0.5} strokeWidth={0.7} transform="translate(0.6 0.6)" />
          <path d={CENTER_LINES[view]} stroke="#5b6170" strokeOpacity={0.3} strokeWidth={0.7} />
          <path d={OUTLINE_HALF} stroke="#3c414c" strokeOpacity={0.5} strokeWidth={0.8} />
          <path d={mirrorPath(OUTLINE_HALF)} stroke="#3c414c" strokeOpacity={0.5} strokeWidth={0.8} />
        </g>

        {/* pęknięcia — sygnał przekroczenia MRV */}
        <g style={{ pointerEvents: 'none' }}>
          <AnimatePresence>
            {shapes
              .filter((s) => cracked.includes(s.muscle))
              .map((s) => {
                const [x1, y1, x2, y2] = s.crack
                const flip = view === 'back' ? -1 : 1
                const d = crackPath(x1 * flip, y1, x2 * flip, y2, hashString(`${s.muscle}-${view}`), 1)
                return (
                  <motion.g key={`crack-${s.muscle}`} exit={{ opacity: 0, transition: { duration: 0.6 } }}>
                    {!healed && (
                      <motion.path
                        d={d}
                        fill="none"
                        stroke="#ffffff"
                        strokeOpacity={0.5}
                        strokeWidth={1.1}
                        transform="translate(0.8 0.6)"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.9, ease: 'easeOut' }}
                      />
                    )}
                    <motion.path
                      d={d}
                      fill="none"
                      stroke={crackColor}
                      strokeWidth={healed ? 1.5 : 1.3}
                      strokeLinecap="round"
                      filter={healed ? 'url(#gold-glow)' : undefined}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1, stroke: crackColor }}
                      transition={{ duration: 0.9, ease: 'easeOut' }}
                    />
                  </motion.g>
                )
              })}
            {view === 'back' && centralCrack && (
              <motion.path
                key="central"
                d={crackPath(2, 70, -4, 290, 77, 1.6)}
                fill="none"
                stroke={crackColor}
                strokeWidth={1.6}
                strokeLinecap="round"
                filter={healed ? 'url(#gold-glow)' : undefined}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1, stroke: crackColor }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            )}
          </AnimatePresence>
        </g>

        {shapes.map((s) => {
          const def = MUSCLE_MAP[s.muscle]
          return (
            <path
              key={`hit-${s.muscle}`}
              d={both(s.d)}
              fill="transparent"
              stroke="transparent"
              strokeWidth={6}
              role="button"
              tabIndex={0}
              aria-label={`${def.name}${cracked.includes(s.muscle) ? ' — pęknięcie: przekroczone MRV' : ''}`}
              aria-pressed={selected === s.muscle}
              className="cursor-pointer"
              onClick={() => onSelect(s.muscle)}
              onKeyDown={(e) => onKey(e, s.muscle)}
              onMouseEnter={() => setHovered(s.muscle)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(s.muscle)}
              onBlur={() => setHovered(null)}
            />
          )
        })}

        {focus &&
          shapes
            .filter((s) => s.muscle === focus)
            .map((s) => {
              const def = MUSCLE_MAP[s.muscle]
              const left = view === 'front'
              const [ax, ay] = s.anchor
              const x0 = left ? -ax : ax
              const xe = left ? -86 : 86
              return (
                <g key={`label-${s.muscle}`} style={{ pointerEvents: 'none' }}>
                  <line x1={x0} y1={ay} x2={xe} y2={ay - 8} stroke="#d4a843" strokeWidth={0.7} />
                  <text
                    x={xe + (left ? -4 : 4)}
                    y={ay - 11}
                    textAnchor={left ? 'end' : 'start'}
                    className="font-marble"
                    fontSize={10}
                    letterSpacing={1.5}
                    fill="#f3f1ec"
                  >
                    {def.short.toUpperCase()}
                  </text>
                  {label && (
                    <text x={xe + (left ? -4 : 4)} y={ay + 3} textAnchor={left ? 'end' : 'start'} className="font-mono" fontSize={9} fill="#aab2c0">
                      {label(s.muscle)}
                    </text>
                  )}
                </g>
              )
            })}
      </g>
    )
  }

  return (
    <svg viewBox="0 0 600 540" className="h-auto w-full select-none" role="group" aria-label="Marmurowa rzeźba sylwetki z sygnalizacją przekroczenia MRV">
      <defs>
        <filter id="marble-body" x="-8%" y="-4%" width="116%" height="108%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blur" />
          <feDiffuseLighting in="blur" surfaceScale="10" diffuseConstant="1.08" lightingColor="#f4f2ed" result="diffuse">
            <feDistantLight azimuth="235" elevation="40" />
          </feDiffuseLighting>
          <feSpecularLighting in="blur" surfaceScale="10" specularConstant="0.55" specularExponent="22" lightingColor="#ffffff" result="spec">
            <feDistantLight azimuth="235" elevation="48" />
          </feSpecularLighting>
          <feComposite in="diffuse" in2="SourceGraphic" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" result="lit" />
          <feComposite in="lit" in2="spec" operator="arithmetic" k1="0" k2="1" k3="0.45" k4="0" result="shiny" />
          <feTurbulence type="fractalNoise" baseFrequency="0.011 0.042" numOctaves="4" seed="7" result="noise" />
          <feComponentTransfer in="noise" result="veinMask">
            <feFuncA type="table" tableValues="0 0 0 0 0 0.85 0 0 0 0 0" />
          </feComponentTransfer>
          <feColorMatrix in="veinMask" type="matrix" values="0 0 0 0 0.40  0 0 0 0 0.42  0 0 0 0 0.47  0 0 0 0.55 0" result="veins" />
          <feComposite in="veins" in2="shiny" operator="over" result="veined" />
          <feComposite in="veined" in2="SourceAlpha" operator="in" />
        </filter>
        <filter id="soft-shadow" x="-50%" y="-200%" width="200%" height="500%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <filter id="gold-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="plinth" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9d6cf" />
          <stop offset="0.12" stopColor="#bdb9b1" />
          <stop offset="1" stopColor="#5c5a56" />
        </linearGradient>
        <radialGradient id="spot" cx="0.3" cy="0.1" r="0.8">
          <stop offset="0" stopColor="#c9d6ea" stopOpacity={0.22} />
          <stop offset="0.5" stopColor="#8fa2c0" stopOpacity={0.06} />
          <stop offset="1" stopColor="#000" stopOpacity={0} />
        </radialGradient>
      </defs>

      <rect x={0} y={0} width={600} height={540} fill="url(#spot)" />

      {/* cokoły */}
      {(['front', 'back'] as const).map((v) => (
        <g key={v}>
          <rect x={FIG_X[v] - 70} y={490} width={140} height={34} rx={2} fill="url(#plinth)" />
          <rect x={FIG_X[v] - 76} y={486} width={152} height={6} rx={1.5} fill="#e6e3dc" />
          <text x={FIG_X[v]} y={512} textAnchor="middle" className="font-marble" fontSize={9} letterSpacing={3} fill="#3a3a3a" opacity={0.75}>
            {v === 'front' ? 'ANTERIOR' : 'POSTERIOR'}
          </text>
        </g>
      ))}

      {renderFigure('front')}
      {renderFigure('back')}
    </svg>
  )
}
