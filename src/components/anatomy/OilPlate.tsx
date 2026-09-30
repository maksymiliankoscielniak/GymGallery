import { AnimatePresence, motion } from 'framer-motion'
import { useState, type KeyboardEvent } from 'react'
import { MUSCLE_MAP } from '../../data/muscles'
import type { BodyView, MuscleId, VolumePlan } from '../../types'
import { PIGMENT_LAYERS, paintStateFor } from './paint'
import { DETAIL_LINES, OUTLINE_HALF, SILHOUETTE, both, mirrorPath, shapesFor } from './geometry'

interface OilPlateProps {
  volume: VolumePlan
  selected: MuscleId | null
  onSelect: (m: MuscleId) => void
}

const FIG_X: Record<BodyView, number> = { front: 170, back: 430 }
const FIG_Y = 24

export function OilPlate({ volume, selected, onSelect }: OilPlateProps) {
  const [hovered, setHovered] = useState<MuscleId | null>(null)
  const focus = hovered ?? selected

  const onKey = (e: KeyboardEvent, m: MuscleId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect(m)
    }
  }

  const renderFigure = (view: BodyView) => {
    const shapes = shapesFor(view)
    return (
      <g transform={`translate(${FIG_X[view]} ${FIG_Y})`}>
        {/* imprimatura — ciemna podmalówka */}
        <path d={SILHOUETTE} fill="#2d2119" filter="url(#oil-ground)" />
        <path d={SILHOUETTE} fill="url(#oil-flesh)" opacity={0.9} />

        {/* warstwy farby */}
        {shapes.map((s) => {
          const def = MUSCLE_MAP[s.muscle]
          const paint = paintStateFor(s.muscle, volume[s.muscle])
          const colors = PIGMENT_LAYERS[def.hue]
          const d = both(s.d)
          return (
            <g key={`paint-${s.muscle}`} style={{ pointerEvents: 'none' }}>
              {[0, 1, 2].map((i) => (
                <motion.path
                  key={i}
                  d={d}
                  fill={colors[i]}
                  filter={`url(#oil-brush-${i})`}
                  initial={false}
                  animate={{ opacity: i < paint.layers ? (i === 0 ? paint.wash : i === 1 ? 0.85 : 0.55) : 0 }}
                  transition={{ duration: 0.7, delay: i * 0.08, ease: 'easeOut' }}
                />
              ))}
              {/* przyciemnienie — przetrenowane partie ciemnieją jak spalony werniks */}
              <motion.path
                d={d}
                fill="#140a06"
                filter="url(#oil-brush-2)"
                initial={false}
                animate={{ opacity: paint.darken }}
                transition={{ duration: 0.7 }}
              />
            </g>
          )
        })}

        {/* światłocień: światło z lewej góry */}
        <path d={SILHOUETTE} fill="url(#oil-light)" style={{ pointerEvents: 'none', mixBlendMode: 'soft-light' }} />

        {/* kontur umbrą i złote refleksy */}
        <g fill="none" strokeLinecap="round" style={{ pointerEvents: 'none' }}>
          <path d={OUTLINE_HALF} stroke="#0e0906" strokeWidth={2.2} />
          <path d={mirrorPath(OUTLINE_HALF)} stroke="#0e0906" strokeWidth={2.2} />
          <path d={mirrorPath(OUTLINE_HALF)} stroke="#e8c46a" strokeWidth={0.7} strokeOpacity={0.35} transform="translate(0.8 0.4)" />
          {DETAIL_LINES[view].map((d, i) => (
            <path key={i} d={both(d)} stroke="#0e0906" strokeWidth={0.8} strokeOpacity={0.55} />
          ))}
          {shapes.map((s) => (
            <path
              key={`edge-${s.muscle}`}
              d={both(s.d)}
              stroke={s.muscle === focus ? '#f1d27a' : '#0e0906'}
              strokeWidth={s.muscle === focus ? 1.8 : 0.9}
              strokeOpacity={s.muscle === focus ? 1 : 0.7}
              strokeLinejoin="round"
            />
          ))}
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
              aria-label={`${def.name}: ${volume[s.muscle]} serii — wybierz, by dobrać pigmenty`}
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

        <AnimatePresence>
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
                  <motion.g
                    key={`label-${s.muscle}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ pointerEvents: 'none' }}
                  >
                    <line x1={x0} y1={ay} x2={xe} y2={ay - 8} stroke="#e8c46a" strokeWidth={0.8} />
                    <circle cx={x0} cy={ay} r={2.2} fill="#e8c46a" />
                    <text
                      x={xe + (left ? -4 : 4)}
                      y={ay - 12}
                      textAnchor={left ? 'end' : 'start'}
                      className="font-oil"
                      fontStyle="italic"
                      fontSize={13}
                      fill="#efe2c4"
                    >
                      {def.short}
                    </text>
                    <text
                      x={xe + (left ? -4 : 4)}
                      y={ay + 3}
                      textAnchor={left ? 'end' : 'start'}
                      className="font-mono"
                      fontSize={10}
                      fill="#d9a441"
                    >
                      {volume[s.muscle]} serii
                    </text>
                  </motion.g>
                )
              })}
        </AnimatePresence>
      </g>
    )
  }

  return (
    <svg viewBox="0 0 600 530" className="h-auto w-full select-none" role="group" aria-label="Płótno z mapą nasycenia objętością">
      <defs>
        <filter id="oil-ground" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="2" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        {[0, 1, 2].map((i) => (
          <filter key={i} id={`oil-brush-${i}`} x="-12%" y="-12%" width="124%" height="124%">
            <feTurbulence type="fractalNoise" baseFrequency={0.03 + i * 0.012} numOctaves="3" seed={5 + i * 7} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={9 - i * 2} xChannelSelector="R" yChannelSelector="G" result="shape" />
            <feTurbulence type="fractalNoise" baseFrequency="0.9 0.06" numOctaves="2" seed={11 + i} result="streaks" />
            <feSpecularLighting in="streaks" surfaceScale="2.4" specularConstant="0.75" specularExponent="16" lightingColor="#fff1d0" result="spec">
              <feDistantLight azimuth="225" elevation="48" />
            </feSpecularLighting>
            <feComposite in="spec" in2="shape" operator="in" result="specIn" />
            <feComposite in="shape" in2="specIn" operator="arithmetic" k1="0" k2="1" k3="0.28" k4="0" />
          </filter>
        ))}
        <linearGradient id="oil-flesh" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5a4230" stopOpacity={0.55} />
          <stop offset="0.6" stopColor="#2a1d15" stopOpacity={0.2} />
          <stop offset="1" stopColor="#0d0806" stopOpacity={0.6} />
        </linearGradient>
        <linearGradient id="oil-light" x1="0" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#fff0cc" stopOpacity={0.55} />
          <stop offset="0.45" stopColor="#fff0cc" stopOpacity={0.05} />
          <stop offset="1" stopColor="#000" stopOpacity={0.55} />
        </linearGradient>
        <radialGradient id="oil-halo" cx="0.5" cy="0.45" r="0.55">
          <stop offset="0" stopColor="#6b4a26" stopOpacity={0.45} />
          <stop offset="1" stopColor="#6b4a26" stopOpacity={0} />
        </radialGradient>
      </defs>

      <ellipse cx={300} cy={262} rx={290} ry={250} fill="url(#oil-halo)" />
      {renderFigure('front')}
      {renderFigure('back')}

      <g className="font-oil" fill="#c99a2e" fontSize={10} letterSpacing={4} opacity={0.75}>
        <text x={FIG_X.front} y={522} textAnchor="middle">
          ANTERIOR
        </text>
        <text x={FIG_X.back} y={522} textAnchor="middle">
          POSTERIOR
        </text>
      </g>
    </svg>
  )
}
