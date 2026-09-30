import { createContext } from 'react'
import type { I18n, Lang } from './createI18n'

export interface I18nContextValue extends I18n {
  setLang: (lang: Lang) => void
}

export const I18nContext = createContext<I18nContextValue | null>(null)
