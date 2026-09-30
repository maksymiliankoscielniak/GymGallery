import { motion } from 'framer-motion'
import { ClipboardCheck, ClipboardCopy, Printer } from 'lucide-react'
import { useMemo, useState } from 'react'
import { EXERCISE_MAP } from '../../data/exercises'
import { buildWeekSchedule } from '../../lib/schedule'
import { loadForWeek } from '../../lib/progression'
import { useGallery } from '../../state/GalleryContext'

const roundLoad = (v: number) => Math.round(v * 2) / 2

/** Gotowy plan tygodnia regeneracyjnego wygenerowany przez dłuto. */
export function DeloadPlan() {
  const { state, meso } = useGallery()
  const [copied, setCopied] = useState(false)
  const deloadWeek = meso.weeks.find((w) => w.deload)

  const plan = useMemo(() => {
    if (!deloadWeek) return []
    const peakWeekIndex = deloadWeek.index - 1
    const peak = buildWeekSchedule(state.split, meso.peakVolume, state.pigments)
    const light = buildWeekSchedule(state.split, deloadWeek.volume, state.pigments)
    return light.map((d, di) => ({
      day: d.day,
      total: d.totalSets,
      peakTotal: peak[di]?.totalSets ?? 0,
      items: d.items.map((it) => {
        const lift = state.lifts[it.exerciseId] ?? EXERCISE_MAP[it.exerciseId].baseline
        const before = peak[di]?.items.find((p) => p.exerciseId === it.exerciseId)?.sets ?? 0
        return {
          ...it,
          before,
          reps: lift.reps,
          load: roundLoad(loadForWeek(it.exerciseId, lift.weight, peakWeekIndex)),
        }
      }),
    }))
  }, [deloadWeek, meso.peakVolume, state.split, state.pigments, state.lifts])

  if (!state.deload || !deloadWeek) return null

  const asText = () =>
    [
      `GYM GALLERY — TYDZIEŃ REGENERACYJNY (T${deloadWeek.index})`,
      'Objętość −40%, ciężar bez zmian, RIR 3–4.',
      '',
      ...plan.flatMap((d) => [
        `${d.day.name.toUpperCase()} — ${d.total} serii (było ${d.peakTotal})`,
        ...d.items.map((i) => `  • ${EXERCISE_MAP[i.exerciseId].name}: ${i.sets}×${i.reps} @ ${i.load} kg`),
        '',
      ]),
    ].join('\n')

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(asText())
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <motion.section
      className="slab p-4 sm:p-6"
      aria-labelledby="deload-title"
      data-print-area
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="deload-title" className="font-marble text-xl tracking-[0.12em] text-marble-white engraved">
            Plan tygodnia regeneracyjnego · T{deloadWeek.index}
          </h2>
          <p className="font-body text-base italic text-marble-chisel/55">
            Serie −40% względem tygodnia szczytowego, ciężar bez zmian, każda seria z zapasem 3–4 powtórzeń (RIR 3–4).
          </p>
        </div>
        <div className="flex gap-2 print:hidden">
          <button
            type="button"
            onClick={copy}
            className="flex items-center gap-1.5 rounded-sm border border-marble-chisel/20 px-3 py-1.5 font-body text-sm text-marble-chisel/80 transition-colors hover:border-marble-kintsugi hover:text-marble-kintsugi"
          >
            {copied ? <ClipboardCheck className="h-4 w-4" aria-hidden /> : <ClipboardCopy className="h-4 w-4" aria-hidden />}
            {copied ? 'Skopiowano' : 'Kopiuj plan'}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-sm border border-marble-chisel/20 px-3 py-1.5 font-body text-sm text-marble-chisel/80 transition-colors hover:border-marble-kintsugi hover:text-marble-kintsugi"
          >
            <Printer className="h-4 w-4" aria-hidden /> Drukuj
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {plan.map((d, i) => (
          <motion.article
            key={d.day.id}
            className="rounded-sm border border-marble-chisel/10 bg-black/25 p-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06 }}
          >
            <header className="flex items-baseline justify-between border-b border-marble-chisel/10 pb-1.5">
              <h3 className="font-marble text-base tracking-[0.1em] text-marble-white">{d.day.name}</h3>
              <span className="font-mono text-[11px] text-marble-chisel/55">
                {d.total} <span className="text-marble-chisel/35">/ {d.peakTotal}</span> serii
              </span>
            </header>
            <table className="mt-2 w-full text-sm">
              <thead className="sr-only">
                <tr>
                  <th>Ćwiczenie</th>
                  <th>Serie</th>
                  <th>Powtórzenia i ciężar</th>
                </tr>
              </thead>
              <tbody>
                {d.items.map((it) => (
                  <tr key={it.exerciseId} className="align-baseline">
                    <td className="py-0.5 pr-2 font-body text-[15px] leading-tight text-marble-chisel/85">{EXERCISE_MAP[it.exerciseId].name}</td>
                    <td className="whitespace-nowrap py-0.5 text-right font-mono text-xs text-marble-chisel/45 line-through decoration-marble-kintsugi/60">
                      {it.before > 0 ? it.before : ''}
                    </td>
                    <td className="whitespace-nowrap py-0.5 pl-2 text-right font-mono text-xs text-marble-white">
                      {it.sets}×{it.reps} <span className="text-marble-chisel/55">@ {it.load} kg</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.article>
        ))}
      </div>
    </motion.section>
  )
}
