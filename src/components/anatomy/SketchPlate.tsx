import { motion } from 'framer-motion'
import { useState, type KeyboardEvent } from 'react'
import { MUSCLE_MAP } from '../../data/muscles'
import { useI18n } from '../../i18n/useI18n'
import type { BodyView, MuscleId, VolumePlan, VolumeStatus } from '../../types'
import {
  CENTER_LINES,
  DETAIL_LINES,
  DRAW_ORDER,
  FACE,
  OUTLINE_HALF,
  SILHOUETTE,
  both,
  mirrorPath,
  shapesFor,
} from './geometry'

interface SketchPlateProps {
  volume: VolumePlan
  status: Record<MuscleId, VolumeStatus>
  selected: MuscleId | null
  onSelect: (m: MuscleId) => void
  /** Play the pencil drawing animation */
  drawIn: boolean
}

const GRAPHITE = '#3b3026'
const SANGUINE = '#9c3d25'

const HATCH_LEVEL: Record<VolumeStatus, number> = { under: 1, effective: 2, optimal: 3, high: 4, over: 4 }

const FIG_X: Record<BodyView, number> = { front: 170, back: 430 }
const FIG_Y = 24

function HatchPatterns() {
  const tones = [
    ['graphite', GRAPHITE],
    ['sanguine', SANGUINE],
  ] as const
  const levels = [
    { level: 1, gap: 7, w: 0.55, cross: false },
    { level: 2, gap: 4.4, w: 0.6, cross: false },
    { level: 3, gap: 4.4, w: 0.55, cross: true },
    { level: 4, gap: 2.8, w: 0.6, cross: true },
  ]
  return (
    <>
      {tones.map(([tone, color]) =>
        levels.map(({ level, gap, w, cross }) => (
          <pattern
            key={`${tone}-${level}`}
            id={`hatch-${tone}-${level}`}
            patternUnits="userSpaceOnUse"
            width={gap}
            height={gap}
            patternTransform="rotate(38)"
          >
            <line x1="0" y1="0" x2="0" y2={gap} stroke={color} strokeWidth={w} strokeOpacity={0.85} />
            {cross && <line x1="0" y1="0" x2={gap} y2="0" stroke={color} strokeWidth={w * 0.8} strokeOpacity={0.6} />}
          </pattern>
        )),
      )}
    </>
  )
}

export function SketchPlate({ volume, status, selected, onSelect, drawIn }: SketchPlateProps) {
  const [hovered, setHovered] = useState<MuscleId | null>(null)
  const focus = hovered ?? selected
  const i18n = useI18n()
  const { t } = i18n

  const draw = (delay: number, duration = 1.4) =>
    drawIn
      ? {
          initial: { pathLength: 0, opacity: 0 },
          animate: { pathLength: 1, opacity: 1 },
          transition: {
            pathLength: { delay, duration, ease: [0.45, 0.05, 0.3, 1] as const },
            opacity: { delay, duration: 0.2 },
          },
        }
      : { initial: false as const }

  const fade = (delay: number) =>
    drawIn
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay, duration: 0.9 } }
      : { initial: false as const }

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
        {/* underpainting of the silhouette */}
        <motion.path d={SILHOUETTE} fill="#f3e9cf" fillOpacity={0.55} {...fade(0.6)} />

        {/* hatch shading according to volume */}
        {shapes.map((s) => {
          const sets = volume[s.muscle]
          const level = HATCH_LEVEL[status[s.muscle]]
          const tone = s.muscle === selected || status[s.muscle] === 'over' ? 'sanguine' : 'graphite'
          return (
            <motion.path
              key={`fill-${s.muscle}`}
              d={both(s.d)}
              fill={sets > 0 ? `url(#hatch-${tone}-${level})` : 'none'}
              style={{ pointerEvents: 'none' }}
              {...fade(2.4 + DRAW_ORDER.indexOf(s.muscle) * 0.08)}
            />
          )
        })}

        <g filter="url(#graphite)">
          {/* outline */}
          <motion.path d={OUTLINE_HALF} fill="none" stroke={GRAPHITE} strokeWidth={1.35} strokeLinecap="round" {...draw(0.25, 2)} />
          <motion.path
            d={mirrorPath(OUTLINE_HALF)}
            fill="none"
            stroke={GRAPHITE}
            strokeWidth={1.35}
            strokeLinecap="round"
            {...draw(0.25, 2)}
          />
          {/* anatomical details */}
          {DETAIL_LINES[view].map((d, i) => (
            <motion.path
              key={`det-${i}`}
              d={both(d)}
              fill="none"
              stroke="#6b5a45"
              strokeWidth={0.7}
              strokeLinecap="round"
              {...draw(1.6 + i * 0.07, 0.9)}
            />
          ))}
          <motion.path d={CENTER_LINES[view]} stroke="#6b5a45" strokeWidth={0.7} {...draw(1.5, 0.8)} />
          <motion.path d={FACE[view]} fill="none" stroke="#6b5a45" strokeWidth={0.7} strokeLinecap="round" {...draw(1.9, 0.8)} />
          {/* muscle contours */}
          {shapes.map((s) => (
            <motion.path
              key={`line-${s.muscle}`}
              d={both(s.d)}
              fill="none"
              stroke={s.muscle === focus ? SANGUINE : GRAPHITE}
              strokeWidth={s.muscle === focus ? 1.5 : 0.85}
              strokeOpacity={s.muscle === focus ? 1 : 0.8}
              strokeLinejoin="round"
              {...draw(1.1 + DRAW_ORDER.indexOf(s.muscle) * 0.12, 1.1)}
            />
          ))}
        </g>

        {/* clickable zones */}
        {shapes.map((s) => {
          return (
            <path
              key={`hit-${s.muscle}`}
              d={both(s.d)}
              fill="transparent"
              stroke="transparent"
              strokeWidth={6}
              role="button"
              tabIndex={0}
              aria-label={t('sketch.plateHit', { name: i18n.muscle(s.muscle), sets: volume[s.muscle] })}
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

        {/* hand-written annotation for the focused muscle group */}
        {focus &&
          shapes
            .filter((s) => s.muscle === focus)
            .map((s) => {
              const def = MUSCLE_MAP[s.muscle]
              const left = view === 'front'
              const [ax, ay] = s.anchor
              const x0 = left ? -ax : ax
              const xe = left ? -84 : 84
              return (
                <g key={`label-${s.muscle}`} style={{ pointerEvents: 'none' }}>
                  <path
                    d={`M ${x0} ${ay} Q ${(x0 + xe) / 2} ${ay - 14} ${xe} ${ay - 10}`}
                    fill="none"
                    stroke={SANGUINE}
                    strokeWidth={0.9}
                    strokeDasharray="2 2"
                  />
                  <circle cx={x0} cy={ay} r={1.8} fill={SANGUINE} />
                  <text
                    x={xe + (left ? -3 : 3)}
                    y={ay - 14}
                    textAnchor={left ? 'end' : 'start'}
                    className="font-hand"
                    fontSize={15}
                    fill={SANGUINE}
                  >
                    {def.latin.split(' ')[0].toLowerCase()}
                  </text>
                  <text
                    x={xe + (left ? -3 : 3)}
                    y={ay + 1}
                    textAnchor={left ? 'end' : 'start'}
                    className="font-hand"
                    fontSize={13}
                    fill={GRAPHITE}
                  >
                    {t('plate.sets', { n: volume[s.muscle] })}
                  </text>
                </g>
              )
            })}
      </g>
    )
  }

  return (
    <svg
      viewBox="0 0 600 530"
      className="h-auto w-full select-none"
      role="group"
      aria-label={t('sketch.plateAria')}
    >
      <defs>
        <filter id="graphite" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="1" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.7" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <HatchPatterns />
      </defs>

      {/* Vitruvian construction */}
      <g stroke="#8f7d62" fill="none" strokeWidth={0.6} opacity={0.55}>
        <motion.circle cx={300} cy={262} r={236} {...draw(0, 2.4)} />
        <motion.rect x={64} y={30} width={472} height={466} {...draw(0.2, 2.4)} />
        <motion.path d="M 300 20 L 300 392 M 40 262 L 560 262" strokeDasharray="3 5" {...draw(0.4, 1.8)} />
      </g>

      {/* proportion scale: head units */}
      <motion.g {...fade(1)} fill="#6b5a45" className="font-sketch" fontSize={8}>
        {Array.from({ length: 9 }, (_, i) => {
          const y = FIG_Y + 8 + i * 57.2
          return (
            <g key={i}>
              <line x1={20} x2={30} y1={y} y2={y} stroke="#6b5a45" strokeWidth={0.6} />
              {i > 0 && (
                <text x={34} y={y - 24} opacity={0.8}>
                  {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'][i - 1]}
                </text>
              )}
            </g>
          )
        })}
        <line x1={25} x2={25} y1={FIG_Y + 8} y2={FIG_Y + 8 + 8 * 57.2} stroke="#6b5a45" strokeWidth={0.6} />
      </motion.g>

      {/* mirror-writing notes — a nod to Leonardo */}
      <motion.g {...fade(1.4)} className="font-hand" fill="#6b5a45" opacity={0.55}>
        <text transform="translate(300 420) scale(-1 1)" fontSize={13} textAnchor="middle">
          la proporzione
        </text>
        <text transform="translate(300 436) scale(-1 1)" fontSize={13} textAnchor="middle">
          è la bellezza
        </text>
        <text transform="translate(300 462) scale(-1 1)" fontSize={11} textAnchor="middle">
          moto · forza · misura
        </text>
      </motion.g>

      {renderFigure('front')}
      {renderFigure('back')}

      <motion.g {...fade(2)} className="font-sketch" fill="#6b5a45" fontSize={10} letterSpacing={3}>
        <text x={FIG_X.front} y={522} textAnchor="middle">
          ANTERIOR
        </text>
        <text x={FIG_X.back} y={522} textAnchor="middle">
          POSTERIOR
        </text>
      </motion.g>
    </svg>
  )
}
