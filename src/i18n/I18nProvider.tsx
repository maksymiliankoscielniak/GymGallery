import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { I18nContext, type I18nContextValue } from './context'
import { DEFAULT_LANG, createI18n, isLang, type Lang } from './createI18n'

export const LANG_STORAGE_KEY = 'gym-gallery/lang'

function loadLang(): Lang {
  try {
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY)
    if (isLang(stored)) return stored
  } catch {
    /* storage unavailable — fall back to the default */
  }
  return DEFAULT_LANG
}

/** English by default; the visitor's choice is remembered in localStorage. */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(loadLang)

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  const i18n = useMemo(() => createI18n(lang), [lang])
  const value = useMemo<I18nContextValue>(() => ({ ...i18n, setLang }), [i18n, setLang])

  // keep <html lang>, the tab title and the meta description in sync
  useEffect(() => {
    document.documentElement.lang = lang
    document.title = i18n.t('meta.title')
    document.querySelector('meta[name="description"]')?.setAttribute('content', i18n.t('meta.description'))
  }, [lang, i18n])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
