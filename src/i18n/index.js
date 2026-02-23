import { createI18n } from 'vue-i18n'
import en from './locales/en.js'
import fr from './locales/fr.js'
import nl from './locales/nl.js'

const savedLang = localStorage.getItem('balafon-docs-lang') || 'en'

export const i18n = createI18n({
  legacy: false,
  locale: savedLang,
  fallbackLocale: 'en',
  messages: { en, fr, nl },
})
