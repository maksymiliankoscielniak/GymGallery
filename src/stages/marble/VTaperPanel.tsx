import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { Stepper } from '../../components/common/Stepper'
import { cn } from '../../lib/cn'
import { GOLDEN_RATIO, analyzeVTaper } from '../../lib/vtaper'
import { useGallery } from '../../state/GalleryContext'

/** Kalkulator proporcji V-taper — obręcz barkowa względem talii. */
export function VTaperPanel() {
  const { state, dispatch, meso } = useGallery()
  const { measurements } = state
  const v = useMemo(() => analyzeVTaper(measurements, meso.weeks), [measurements, meso.weeks])

  // geometria diagramu: szerokości proporcjonalne do obwodów
  const widest = Math.max(v.targetShoulders, measurements.shoulders, v.projections[3].shoulders)
  const scale = Math.min(1.35, 270 / widest)
  const shW = measurements.shoulders * scale
  const waistW = measurements.waist * scale
  const goldW = v.targetShoulders * scale
  const projW = v.projections[3].shoulders * scale
  const cx = 150
  const gap = (v.targetShoulders - measurements.shoulders).toFixed(1)

  return (
    <section className="slab p-4 sm:p-6" aria-labelledby="vtaper-title">
      <h2 id="vtaper-title" className="font-marble text-xl tracking-[0.12em] text-marble-white engraved">
        Wskaźnik V-Taper
      </h2>
      <p className="font-body text-base italic text-marble-chisel/55">
        Obręcz barkowa i skrzydła najszerszego względem talii — klasyczny kanon φ ≈ {GOLDEN_RATIO}.
      </p>

      <div className="mt-4 grid grid-cols-1 items-center gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <svg viewBox="0 0 300 250" className="w-full" role="img" aria-label={`Proporcja barki do talii ${v.ratio.toFixed(2)}, cel ${GOLDEN_RATIO}`}>
          <defs>
            <linearGradient id="vt-marble" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f3f1ec" />
              <stop offset="0.6" stopColor="#c9c6bf" />
              <stop offset="1" stopColor="#8d8a84" />
            </linearGradient>
          </defs>
          {/* cel: złota proporcja */}
          <line x1={cx - goldW / 2} x2={cx + goldW / 2} y1={40} y2={40} stroke="#d4a843" strokeDasharray="4 4" strokeWidth={1.2} />
          <text x={cx} y={30} textAnchor="middle" className="font-mono" fontSize={10} fill="#d4a843">
            φ {v.targetShoulders.toFixed(0)} cm
          </text>
          {/* projekcja po 12 miesiącach */}
          <line x1={cx - projW / 2} x2={cx + projW / 2} y1={52} y2={52} stroke="#8fa2c0" strokeWidth={1.2} />
          <text x={cx + projW / 2 + 4} y={55} className="font-mono" fontSize={8} fill="#8fa2c0">
            12 mies.
          </text>
          {/* tors */}
          <motion.path
            initial={false}
            animate={{
              d: `M ${cx - shW / 2} 62 L ${cx + shW / 2} 62 L ${cx + waistW / 2} 210 L ${cx - waistW / 2} 210 Z`,
            }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            fill="url(#vt-marble)"
            stroke="#f3f1ec"
            strokeOpacity={0.5}
          />
          <text x={cx} y={80} textAnchor="middle" className="font-mono" fontSize={11} fill="#1b1d22">
            {measurements.shoulders} cm
          </text>
          <text x={cx} y={200} textAnchor="middle" className="font-mono" fontSize={11} fill="#1b1d22">
            {measurements.waist} cm
          </text>
          <text x={cx} y={238} textAnchor="middle" className="font-marble" fontSize={10} letterSpacing={2} fill="#aab2c0">
            BARKI : TALIA
          </text>
        </svg>

        <div>
          <p className="font-marble text-6xl leading-none text-marble-white tabular engraved">{v.ratio.toFixed(2)}</p>
          <p className="mt-1 font-body text-lg text-marble-chisel/70">
            {v.ratio >= GOLDEN_RATIO ? (
              <span className="text-marble-kintsugi">Kanon osiągnięty.</span>
            ) : (
              <>
                do φ brakuje <span className="font-mono text-marble-white">{gap} cm</span> obwodu barków
              </>
            )}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-marble-chisel/50">Barki (cm)</span>
              <Stepper
                value={measurements.shoulders}
                min={60}
                max={180}
                onChange={(d) => dispatch({ type: 'setMeasurements', measurements: { shoulders: measurements.shoulders + d } })}
                label="Obwód barków w centymetrach"
                size="sm"
                buttonClassName="border-marble-chisel/20 text-marble-chisel hover:border-marble-kintsugi hover:text-marble-kintsugi"
                valueClassName="font-mono text-lg text-marble-white"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-marble-chisel/50">Talia (cm)</span>
              <Stepper
                value={measurements.waist}
                min={50}
                max={160}
                onChange={(d) => dispatch({ type: 'setMeasurements', measurements: { waist: measurements.waist + d } })}
                label="Obwód talii w centymetrach"
                size="sm"
                buttonClassName="border-marble-chisel/20 text-marble-chisel hover:border-marble-kintsugi hover:text-marble-kintsugi"
                valueClassName="font-mono text-lg text-marble-white"
              />
            </label>
          </div>
        </div>
      </div>

      <ol className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {v.projections.map((p, i) => (
          <li key={p.label} className={cn('rounded border px-3 py-2', i === 0 ? 'border-marble-chisel/25' : 'border-marble-chisel/10')}>
            <p className="font-mono text-[10px] uppercase tracking-wider text-marble-chisel/50">{p.label}</p>
            <p className="font-marble text-2xl text-marble-white tabular">{p.ratio.toFixed(3)}</p>
            <p className="font-mono text-xs text-marble-chisel/60">{p.shoulders.toFixed(1)} cm</p>
          </li>
        ))}
      </ol>

      <dl className="mt-5 grid grid-cols-1 gap-3 font-body text-[15px] text-marble-chisel/75 sm:grid-cols-3">
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-wider text-marble-chisel/45">Udział szerokości w planie</dt>
          <dd>
            <span className="font-mono text-marble-white">{(v.widthShare * 100).toFixed(0)}%</span> serii to barki + najszerszy
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-wider text-marble-chisel/45">Jakość bodźca szerokości</dt>
          <dd>
            <span className="font-mono text-marble-white">{(v.stimulusIndex * 100).toFixed(0)}%</span> · barki{' '}
            {v.perMuscle.shoulders.avgSets.toFixed(0)} / najszerszy {v.perMuscle.lats.avgSets.toFixed(0)} serii śr.
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-wider text-marble-chisel/45">Szacunek do kanonu</dt>
          <dd>
            {v.monthsToGolden === 0
              ? 'osiągnięty'
              : v.monthsToGolden
                ? `ok. ${v.monthsToGolden} mies. przy stałej talii`
                : 'ponad 6 lat — kluczowa będzie talia'}
          </dd>
        </div>
      </dl>
      <p className="mt-4 font-body text-sm italic text-marble-chisel/45">
        Model szacunkowy: przyrost obwodu barków zależy od średniej objętości bocznych aktonów i najszerszego względem MEV–MAV,
        z malejącymi zwrotami. Talia zależy przede wszystkim od bilansu energetycznego — seria brzuszków jej nie „wyrzeźbi”.
      </p>
    </section>
  )
}
