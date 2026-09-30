import { useMemo } from 'react'
import { EXERCISE_MAP } from '../../data/exercises'
import { MUSCLE_MAP } from '../../data/muscles'
import { BarChart, type BarMark } from '../../components/charts/BarChart'
import { LineChart } from '../../components/charts/LineChart'
import { SERIES_COLORS } from '../../components/charts/chartUtils'
import { brzycki } from '../../lib/progression'
import { useGallery } from '../../state/GalleryContext'

const kg = (v: number) => `${Math.round(v)} kg`
const tons = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)} t` : `${Math.round(v)} kg`)

function NumberField({ value, onChange, label, step = 1, min = 0, max = 999 }: { value: number; onChange: (v: number) => void; label: string; step?: number; min?: number; max?: number }) {
  return (
    <input
      type="number"
      inputMode="decimal"
      value={value}
      min={min}
      max={max}
      step={step}
      aria-label={label}
      onChange={(e) => {
        const v = parseFloat(e.target.value)
        if (Number.isFinite(v)) onChange(v)
      }}
      className="w-16 rounded border border-marble-chisel/15 bg-black/30 px-1.5 py-1 text-right font-mono text-sm text-marble-white tabular focus-visible:border-marble-kintsugi focus-visible:outline-none"
    />
  )
}

/** Analityka progresji: e1RM (Brzycki) kluczowych bojów i tonaż tygodniowy. */
export function ProgressionPanel() {
  const { state, dispatch, meso } = useGallery()
  const { weeks, keyLifts } = meso
  const labels = weeks.map((w) => w.label)

  const series = useMemo(
    () =>
      keyLifts.map((id, i) => ({
        id,
        name: MUSCLE_MAP[EXERCISE_MAP[id].muscle].short,
        color: SERIES_COLORS[i % SERIES_COLORS.length],
        values: weeks.map((w) => w.e1rm[id]),
      })),
    [keyLifts, weeks],
  )

  const marks: BarMark[] = weeks.map((w) => (w.deload ? 'deload' : w.overMrv.length > 0 || w.centralFatigue > 1 ? 'breach' : 'normal'))
  const deloadIdx = weeks.findIndex((w) => w.deload)
  const first = weeks[0]
  const lastAcc = [...weeks].reverse().find((w) => !w.deload) ?? first
  const tonnageGain = first ? ((lastAcc.tonnage - first.tonnage) / first.tonnage) * 100 : 0

  return (
    <section className="slab p-4 sm:p-6" aria-labelledby="progress-title">
      <h2 id="progress-title" className="font-marble text-xl tracking-[0.12em] text-marble-white engraved">
        Analityka progresji
      </h2>
      <p className="font-body text-base italic text-marble-chisel/55">
        e1RM ze wzoru Brzyckiego (ciężar × 36 / (37 − powt.)) przy tygodniowym wzroście obciążenia 2,5% w ćwiczeniach złożonych i 1,5% w izolowanych.
      </p>

      <h3 className="mt-5 font-marble text-xs tracking-[0.25em] text-marble-chisel/60">SZACOWANY CIĘŻAR MAKSYMALNY · e1RM</h3>
      <div className="mt-2 grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
        {series.map((s) => {
          const firstV = s.values[0]
          const peakV = Math.max(...s.values)
          return (
            <figure key={s.id} className="min-w-0">
              <figcaption className="flex items-baseline justify-between gap-2">
                <span className="min-w-0 truncate font-body text-[15px] text-marble-chisel/85" title={EXERCISE_MAP[s.id].name}>
                  <span className="mr-1.5 inline-block h-[2px] w-3 align-middle" style={{ background: s.color }} aria-hidden />
                  {s.name} <span className="text-marble-chisel/45">· {EXERCISE_MAP[s.id].name}</span>
                </span>
                <span className="shrink-0 font-mono text-xs text-marble-white tabular">
                  {Math.round(firstV)}→{Math.round(peakV)} kg <span className="text-marble-chisel/55">+{(((peakV - firstV) / firstV) * 100).toFixed(0)}%</span>
                </span>
              </figcaption>
              <LineChart
                labels={labels}
                series={[s]}
                format={kg}
                height={130}
                shaded={deloadIdx >= 0 ? [deloadIdx] : []}
                ariaLabel={`e1RM — ${EXERCISE_MAP[s.id].name}: od ${Math.round(firstV)} do ${Math.round(peakV)} kg`}
              />
            </figure>
          )
        })}
      </div>

      <h3 className="mt-6 font-marble text-xs tracking-[0.25em] text-marble-chisel/60">
        TONAŻ TYGODNIOWY · <span className="text-marble-chisel/80">{tonnageGain >= 0 ? '+' : ''}{tonnageGain.toFixed(0)}% do szczytu</span>
      </h3>
      <div className="mt-2">
        <BarChart
          labels={labels}
          values={weeks.map((w) => w.tonnage)}
          marks={marks}
          color="#8fa2c0"
          format={tons}
          ariaLabel="Tonaż tygodniowy w kolejnych tygodniach mezocyklu"
        />
      </div>

      <details className="group mt-5 rounded border border-marble-chisel/10 bg-black/20 p-3">
        <summary className="cursor-pointer font-body text-base text-marble-chisel/75 marker:text-marble-kintsugi">
          Ciężary bazowe kluczowych bojów (tydzień 1)
        </summary>
        <table className="mt-3 w-full text-left text-sm">
          <thead className="font-mono text-[10px] uppercase tracking-wider text-marble-chisel/45">
            <tr>
              <th className="pb-2 font-normal">Bój</th>
              <th className="pb-2 text-right font-normal">kg</th>
              <th className="pb-2 text-right font-normal">powt.</th>
              <th className="pb-2 text-right font-normal">e1RM</th>
            </tr>
          </thead>
          <tbody>
            {keyLifts.map((id) => {
              const lift = state.lifts[id] ?? EXERCISE_MAP[id].baseline
              return (
                <tr key={id} className="border-t border-marble-chisel/8">
                  <td className="py-1.5 pr-2 font-body text-[15px] text-marble-chisel/85">{EXERCISE_MAP[id].name}</td>
                  <td className="py-1.5 text-right">
                    <NumberField value={lift.weight} step={0.5} max={500} label={`${EXERCISE_MAP[id].name} — ciężar`} onChange={(v) => dispatch({ type: 'setLift', exerciseId: id, lift: { weight: v } })} />
                  </td>
                  <td className="py-1.5 text-right">
                    <NumberField value={lift.reps} min={1} max={30} label={`${EXERCISE_MAP[id].name} — powtórzenia`} onChange={(v) => dispatch({ type: 'setLift', exerciseId: id, lift: { reps: v } })} />
                  </td>
                  <td className="py-1.5 text-right font-mono text-marble-white tabular">{kg(brzycki(lift.weight, lift.reps))}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <table className="mt-4 w-full text-left text-xs">
          <caption className="mb-1 text-left font-mono text-[10px] uppercase tracking-wider text-marble-chisel/45">Dane wykresów</caption>
          <thead className="font-mono text-marble-chisel/45">
            <tr>
              <th className="font-normal">Tydzień</th>
              {series.map((s) => (
                <th key={s.id} className="text-right font-normal">
                  {s.name}
                </th>
              ))}
              <th className="text-right font-normal">Tonaż</th>
            </tr>
          </thead>
          <tbody className="font-mono text-marble-chisel/80">
            {weeks.map((w) => (
              <tr key={w.label}>
                <td>{w.label}</td>
                {series.map((s) => (
                  <td key={s.id} className="text-right tabular">
                    {Math.round(w.e1rm[s.id])}
                  </td>
                ))}
                <td className="text-right tabular">{tons(w.tonnage)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  )
}
