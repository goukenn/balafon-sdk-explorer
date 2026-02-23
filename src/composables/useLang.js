import { storeToRefs } from 'pinia'
import { useLangStore, LANGUAGES } from '../stores/lang.js'
import { i18n } from '../i18n/index.js'

export { LANGUAGES }

export function useLang() {
  const store = useLangStore()
  const { lang } = storeToRefs(store)

  function setLang(code) {
    store.setLang(code)
    i18n.global.locale.value = code
  }

  return { lang, setLang, LANGUAGES }
}
