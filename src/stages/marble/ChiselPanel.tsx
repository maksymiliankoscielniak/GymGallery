import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Undo2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { MUSCLE_IDS, MUSCLE_MAP } from '../../data/muscles'
import { Stepper } from '../../components/common/Stepper'
import { cn } from '../../lib/cn'
import { DELOAD_CUT, deloadVolume, rampVolume } from '../../lib/progression'
import { seededRandom } from '../../lib/random'
import { useI18n } from '../../i18n/useI18n'
import { useGallery } from '../../state/GalleryContext'

function ChiselGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 64" className={className} aria-hidden>
      <defs>
        <linearGradient id="chisel-steel" x1="0" x2="1">
          <stop offset="0" stopColor="#6f7682" />
          <stop offset="0.45" stopColor="#eef2f7" />
          <stop offset="1" stopColor="#555b65" />
        </linearGradient>
      </defs>
      <ellipse cx={12} cy={4} rx={7} ry={3} fill="#8a919c" />
      <rect x={7} y={4} width={10} height={38} fill="url(#chisel-steel)" />
      <path d="M 7 42 L 17 42 L 13.5 63 L 10.5 63 Z" fill="url(#chisel-steel)" />
    </svg>
  )
}

/** The “Chisel” deload engine: detects MRV breaches and carves a recovery week. */
export function ChiselPanel() {
  const { state, dispatch, meso } = useGallery()
  const i18n = useI18n()
  const { t } = i18n
  const cutPct = Math.round(DELOAD_CUT * 100)
  const reduced = useReducedMotion()
  const [striking, setStriking] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const carved = Boolean(state.deload)
  const peakTotal = MUSCLE_IDS.reduce((a, m) => a + meso.peakVolume[m], 0)
  const deloadVol = deloadVolume(meso.peakVolume)
  const deloadTotal = MUSCLE_IDS.reduce((a, m) => a + deloadVol[m], 0)
  const accumulationWeeks = meso.weeks.filter((w) => !w.deload).length

  // first week above MRV for every cracking muscle group
  const firstBreach = useMemo(() => {
    const out: Array<{ muscle: (typeof MUSCLE_IDS)[number]; week: number; sets: number }> = []
    for (const m of meso.crackedMuscles) {
      for (let w = 1; w <= state.meso.weeks; w++) {
        const v = rampVolume(state.volume, state.meso.rampSets, w)[m]
        if (v > MUSCLE_MAP[m].landmarks.mrv) {
          out.push({ muscle: m, week: w, sets: v })
          break
        }
      }
    }
    return out
  }, [meso.crackedMuscles, state.meso, state.volume])

  const shards = useMemo(() => {
    const rnd = seededRandom(99)
    return Array.from({ length: 14 }, (_, i) => ({
      left: 60 + rnd() * 38,
      top: rnd() * 70,
      size: 6 + rnd() * 14,
      x: 20 + rnd() * 120,
      y: 50 + rnd() * 90,
      rot: (rnd() - 0.5) * 540,
      delay: 0.32 + i * 0.012,
      clip: `polygon(${rnd() * 30}% 0, 100% ${rnd() * 40}%, ${70 + rnd() * 30}% 100%, 0 ${60 + rnd() * 40}%)`,
    }))
  }, [])

  const carve = () => {
    if (striking || carved) return
    setStriking(true)
    timer.current = window.setTimeout(
      () => {
        dispatch({ type: 'carveDeload' })
        setStriking(false)
      },
      reduced ? 50 : 1100,
    )
  }

  const hasCracks = meso.breachWeek !== null

  return (
    <section className="slab flex flex-col p-4 sm:p-6" aria-labelledby="chisel-title">
      <h2 id="chisel-title" className="font-marble text-xl tracking-[0.12em] text-marble-white engraved">
        {t('chisel.title')}
      </h2>
      <p className="font-body text-base italic text-marble-chisel/55">
        {t('chisel.hint')}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-marble-chisel/50">{t('chisel.weeks')}</p>
          <Stepper
            value={state.meso.weeks}
            min={3}
            max={8}
            onChange={(d) => dispatch({ type: 'setMeso', meso: { weeks: state.meso.weeks + d } })}
            label={t('chisel.weeksAria')}
            size="sm"
            className="mt-1"
            buttonClassName="border-marble-chisel/20 text-marble-chisel hover:border-marble-kintsugi hover:text-marble-kintsugi"
            valueClassName="font-marble text-2xl text-marble-white"
          />
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-marble-chisel/50">{t('chisel.ramp')}</p>
          <div className="mt-1 inline-flex overflow-hidden rounded border border-marble-chisel/20" role="radiogroup" aria-label={t('chisel.rampAria')}>
            {[0, 1, 2, 3].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={state.meso.rampSets === n}
                onClick={() => dispatch({ type: 'setMeso', meso: { rampSets: n } })}
                className={cn(
                  'px-3 py-1.5 font-mono text-sm transition-colors',
                  state.meso.rampSets === n ? 'bg-marble-chisel/15 text-marble-white' : 'text-marble-chisel/55 hover:text-marble-white',
                )}
              >
                +{n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* diagnosis */}
      <div
        className={cn(
          'mt-5 rounded border p-3 font-body text-[15px] leading-snug',
          hasCracks && !carved
            ? 'border-[#d03b3b]/40 bg-[rgba(208,59,59,0.08)] text-marble-chisel/85'
            : carved
              ? 'border-marble-kintsugi/35 bg-[rgba(212,168,67,0.06)] text-marble-chisel/85'
              : 'border-marble-chisel/12 text-marble-chisel/75',
        )}
        aria-live="polite"
      >
        {!hasCracks && !carved && (
          <>{t('chisel.ok', { weeks: state.meso.weeks })}</>
        )}
        {hasCracks && !carved && (
          <>
            <span className="font-marble text-sm tracking-widest text-[#ff8a80]">{t('chisel.crackTag', { week: i18n.weekLabel(meso.breachWeek ?? 1) })}</span>
            <ul className="mt-1 space-y-0.5">
              {firstBreach.map((b) => (
                <li key={b.muscle}>
                  {t('chisel.breachRow', { name: i18n.muscle(b.muscle), sets: b.sets, week: i18n.weekLabel(b.week), mrv: MUSCLE_MAP[b.muscle].landmarks.mrv })}
                </li>
              ))}
              {meso.centralCrack && <li>{t('chisel.central')}</li>}
            </ul>
          </>
        )}
        {carved && (
          <>
            <span className="font-marble text-sm tracking-widest text-marble-kintsugi">{t('chisel.kintsugiTag', { week: i18n.weekLabel(meso.deloadWeek ?? 1) })}</span>
            <p className="mt-1">
              {t('chisel.carvedNote', { weeks: accumulationWeeks, cut: cutPct })}
            </p>
          </>
        )}
      </div>

      {/* volume block and the chisel strike */}
      <div className="relative mt-8 select-none" aria-hidden>
        <div className="mb-1 flex justify-between font-mono text-[10px] uppercase tracking-wider text-marble-chisel/45">
          <span>{t('chisel.peakVolume')}</span>
          <span>{carved ? t('chisel.setsOf', { a: deloadTotal, b: peakTotal }) : t('chisel.setsN', { n: peakTotal })}</span>
        </div>
        <div className="relative h-12 w-full">
          <motion.div
            className="marble-surface absolute inset-y-0 left-0 rounded-sm shadow-[inset_0_-6px_12px_rgba(0,0,0,0.25),0_8px_20px_-10px_rgba(0,0,0,0.9)]"
            initial={false}
            animate={{ width: carved || striking ? '60%' : '100%' }}
            transition={{ delay: striking ? 0.34 : 0, duration: 0.35, ease: 'easeOut' }}
          />
          <div className="absolute inset-y-0 left-[60%] w-px border-l border-dashed border-marble-kintsugi/60" />
          <AnimatePresence>
            {striking &&
              shards.map((s, i) => (
                <motion.span
                  key={i}
                  className="marble-surface absolute block"
                  style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, clipPath: s.clip }}
                  initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                  animate={{ x: s.x, y: s.y, rotate: s.rot, opacity: 0 }}
                  transition={{ delay: s.delay, duration: 0.8, ease: [0.3, 0, 0.7, 1] }}
                />
              ))}
          </AnimatePresence>
          <AnimatePresence>
            {striking && (
              <motion.div
                className="absolute -top-14 left-[60%] w-5 -translate-x-1/2"
                initial={{ y: -30, rotate: -25, opacity: 0 }}
                animate={{ y: [-30, -30, 6, -6], rotate: [-25, -25, 0, -6], opacity: [0, 1, 1, 1] }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, times: [0, 0.4, 0.7, 1] }}
              >
                <ChiselGlyph className="h-16 w-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="mt-1 flex justify-between font-mono text-[10px] text-marble-chisel/40">
          <span>0</span>
          <span className="text-marble-kintsugi/80">−{cutPct}%</span>
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
        {!carved ? (
          <motion.button
            type="button"
            onClick={carve}
            disabled={striking}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            animate={hasCracks && !striking ? { boxShadow: ['0 0 0 0 rgba(212,168,67,0)', '0 0 0 6px rgba(212,168,67,0.18)', '0 0 0 0 rgba(212,168,67,0)'] } : {}}
            transition={{ duration: 2, repeat: hasCracks ? Infinity : 0 }}
            className="marble-surface flex items-center gap-3 rounded-sm px-5 py-3 text-left text-[#1b1d22] focus-visible:outline-marble-kintsugi disabled:opacity-70"
          >
            <ChiselGlyph className="h-9 w-3" />
            <span>
              <span className="block font-marble text-base font-semibold tracking-[0.15em]">CARVE DELOAD</span>
              <span className="block font-body text-sm italic text-[#3a3d44]">{t('chisel.oneStrike', { cut: cutPct })}</span>
            </span>
          </motion.button>
        ) : (
          <button
            type="button"
            onClick={() => dispatch({ type: 'restoreDeload' })}
            className="flex items-center gap-2 rounded-sm border border-marble-chisel/20 px-4 py-2 font-body text-base text-marble-chisel/75 transition-colors hover:border-marble-kintsugi hover:text-marble-kintsugi"
          >
            <Undo2 className="h-4 w-4" aria-hidden /> {t('chisel.undo')}
          </button>
        )}
      </div>
    </section>
  )
}
