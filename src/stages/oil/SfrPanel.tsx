import { AnimatePresence, motion } from 'framer-motion'
import { Check, Hammer, X } from 'lucide-react'
import { MUSCLES } from '../../data/muscles'
import { cn } from '../../lib/cn'
import { AXIAL_BUDGET, JOINT_BUDGET, SFR_GRADE_LABEL, SFR_TARGET } from '../../lib/sfr'
import { isBalancedStatus, volumeStatus } from '../../lib/volume'
import { useGallery } from '../../state/GalleryContext'

const SFR_MAX = 3
const GRADE_COLOR = { costly: '#e0786c', balanced: '#d9a441', efficient: '#86b5a8' } as const

function polar(cx: number, cy: number, r: number, v: number) {
  const a = Math.PI * (1 - Math.min(SFR_MAX, Math.max(0, v)) / SFR_MAX)
  return [cx + Math.cos(a) * r, cy - Math.sin(a) * r] as const
}

function arc(from: number, to: number, r: number) {
  const [x1, y1] = polar(100, 100, r, from)
  const [x2, y2] = polar(100, 100, r, to)
  return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`
}

function BudgetBar({ label, value, budget }: { label: string; value: number; budget: number }) {
  const ratio = value / budget
  const over = ratio > 1
  return (
    <div>
      <div className="flex items-baseline justify-between font-body text-sm">
        <span className="text-oil-cream/70">{label}</span>
        <span className={cn('font-mono text-xs tabular', over ? 'text-[#e0786c]' : 'text-oil-cream/60')}>
          {Math.round(value)} / {budget}
          {over && ' — ponad budżet'}
        </span>
      </div>
      <div className="relative mt-1 h-2 overflow-hidden rounded-full bg-oil-cream/8">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: over ? 'linear-gradient(90deg,#8a0f0f,#e0786c)' : 'linear-gradient(90deg,#6f4c12,#d9a441)' }}
          initial={false}
          animate={{ width: `${Math.min(100, ratio * 100)}%` }}
          transition={{ type: 'spring', stiffness: 200, damping: 30 }}
        />
      </div>
    </div>
  )
}

/** Wskaźnik SFR i budżety zmęczenia + wyzwalacz przejścia do rzeźby. */
export function SfrPanel({ onAdvance }: { onAdvance: () => void }) {
  const { state, canvas } = useGallery()
  const sfr = canvas.globalSfr
  const angle = -90 + (Math.min(SFR_MAX, sfr) / SFR_MAX) * 180

  const varietyOk = MUSCLES.every((m) => canvas.perMuscle[m.id].hasStretch && canvas.perMuscle[m.id].hasPeak)
  const volumeOk = MUSCLES.every((m) => isBalancedStatus(volumeStatus(m.id, state.volume[m.id])))
  const checks = [
    { ok: varietyOk, label: 'Każda partia ma pigment rozciągnięcia i skurczu' },
    { ok: volumeOk, label: 'Objętość każdej partii w strefie MEV–MAV' },
    { ok: sfr >= SFR_TARGET, label: `Globalny SFR ≥ ${SFR_TARGET.toFixed(1)}` },
    { ok: canvas.axialLoad <= AXIAL_BUDGET, label: 'Obciążenie osiowe w budżecie' },
    { ok: canvas.jointLoad <= JOINT_BUDGET, label: 'Obciążenie stawowe w budżecie' },
  ]

  return (
    <section className="oil-card flex flex-col p-4 sm:p-5" aria-labelledby="sfr-title">
      <h2 id="sfr-title" className="font-oil text-2xl text-oil-cream">
        Wskaźnik SFR
      </h2>
      <p className="font-body text-base italic text-oil-cream/55">Stimulus-to-Fatigue — bodziec hipertroficzny względem kosztu zmęczenia.</p>

      <div className="mt-2 flex flex-col items-center gap-4 sm:flex-row sm:items-end">
        <svg viewBox="0 0 200 118" className="w-full max-w-[15rem]" role="img" aria-label={`Globalny SFR ${sfr.toFixed(2)} — ${SFR_GRADE_LABEL[canvas.grade]}`}>
          <path d={arc(0, SFR_MAX, 80)} stroke="rgba(239,226,196,0.08)" strokeWidth={16} fill="none" />
          <path d={arc(0, SFR_TARGET, 80)} stroke={GRADE_COLOR.costly} strokeOpacity={0.55} strokeWidth={14} fill="none" />
          <path d={arc(SFR_TARGET + 0.02, 2.2, 80)} stroke={GRADE_COLOR.balanced} strokeOpacity={0.6} strokeWidth={14} fill="none" />
          <path d={arc(2.22, SFR_MAX, 80)} stroke={GRADE_COLOR.efficient} strokeOpacity={0.55} strokeWidth={14} fill="none" />
          {[0, 1, 2, 3].map((v) => {
            const [x, y] = polar(100, 100, 62, v)
            return (
              <text key={v} x={x} y={y + 3} textAnchor="middle" className="font-mono" fontSize={8} fill="rgba(239,226,196,0.45)">
                {v}
              </text>
            )
          })}
          <motion.g initial={false} animate={{ rotate: angle }} transition={{ type: 'spring', stiffness: 90, damping: 14 }} style={{ originX: 0.5, originY: 1 }}>
            <path d="M 98 100 L 100 30 L 102 100 Z" fill="#efe2c4" />
          </motion.g>
          <circle cx={100} cy={100} r={6} fill="#c99a2e" />
        </svg>
        <div className="text-center sm:text-left">
          <p className="font-oil text-5xl leading-none text-oil-cream tabular">{sfr.toFixed(2)}</p>
          <p className="mt-1 font-body text-lg italic" style={{ color: GRADE_COLOR[canvas.grade] }}>
            {SFR_GRADE_LABEL[canvas.grade]}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <BudgetBar label="Zmęczenie osiowe (kręgosłup, CUN)" value={canvas.axialLoad} budget={AXIAL_BUDGET} />
        <BudgetBar label="Zmęczenie stawowe" value={canvas.jointLoad} budget={JOINT_BUDGET} />
      </div>

      <ul className="mt-5 space-y-1.5 font-body text-[15px]">
        {checks.map((c) => (
          <li key={c.label} className={cn('flex items-center gap-2', c.ok ? 'text-oil-cream/75' : 'text-[#e0786c]')}>
            {c.ok ? <Check className="h-4 w-4 shrink-0 text-oil-ochre" aria-hidden /> : <X className="h-4 w-4 shrink-0" aria-hidden />}
            <span>{c.label}</span>
            <span className="sr-only">{c.ok ? '— spełnione' : '— niespełnione'}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex min-h-[5.5rem] items-center justify-center">
        <AnimatePresence mode="wait">
          {canvas.balanced ? (
            <motion.button
              key="go"
              type="button"
              onClick={onAdvance}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              className="gilded-frame group flex items-center gap-3 rounded-sm !p-[5px] focus-visible:outline-oil-ochre"
            >
              <span className="flex items-center gap-3 rounded-[1px] bg-[#1a120d] px-5 py-3">
                <motion.span
                  animate={{ rotate: [0, -24, 8, 0] }}
                  transition={{ duration: 1.1, repeat: Infinity, repeatDelay: 1.6 }}
                  className="text-oil-ochre"
                >
                  <Hammer className="h-6 w-6" aria-hidden />
                </motion.span>
                <span className="text-left">
                  <span className="block font-oil text-lg text-oil-cream">Przekaż rzeźbiarzowi</span>
                  <span className="block font-body text-sm italic text-oil-cream/55">uderz dłutem w marmur — Etap III</span>
                </span>
              </span>
            </motion.button>
          ) : (
            <motion.p
              key="wait"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center font-body text-base italic text-oil-cream/45"
            >
              Wyzwalacz dłuta pojawi się, gdy profil biomechaniczny będzie zbalansowany.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
