import { Globe } from 'lucide-react'
import { cn } from '../../lib/cn'
import { LANGS } from '../../i18n/createI18n'
import { useI18n } from '../../i18n/useI18n'
import type { StageId } from '../../types'

const TONE: Record<StageId, { wrap: string; on: string; off: string }> = {
  sketch: {
    wrap: 'border-sketch-lines/40 text-sketch-accent',
    on: 'bg-sketch-lines/85 text-sketch-paper',
    off: 'text-sketch-accent hover:text-sketch-sanguine',
  },
  oil: {
    wrap: 'border-oil-gold/30 text-oil-cream/60',
    on: 'bg-oil-gold/25 text-oil-ochre',
    off: 'text-oil-cream/60 hover:text-oil-cream',
  },
  marble: {
    wrap: 'border-marble-chisel/15 text-marble-chisel/55',
    on: 'bg-marble-chisel/15 text-marble-kintsugi',
    off: 'text-marble-chisel/55 hover:text-marble-white',
  },
}

/** EN | PL toggle — the choice is stored in localStorage by the I18nProvider. */
export function LanguageSwitch({ tone, className }: { tone: StageId; className?: string }) {
  const { lang, setLang, t } = useI18n()
  const c = TONE[tone]
  return (
    <div
      role="group"
      aria-label={t('lang.group')}
      className={cn('inline-flex items-center gap-1 rounded-full border py-0.5 pl-2 pr-0.5 text-xs', c.wrap, className)}
    >
      <Globe className="h-3.5 w-3.5 shrink-0" aria-hidden />
      {LANGS.map((l) => {
        const active = l.code === lang
        return (
          <button
            key={l.code}
            type="button"
            lang={l.code}
            aria-pressed={active}
            aria-label={l.name}
            title={l.name}
            onClick={() => setLang(l.code)}
            className={cn(
              'rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider transition-colors',
              active ? c.on : c.off,
            )}
          >
            {l.code}
          </button>
        )
      })}
    </div>
  )
}
