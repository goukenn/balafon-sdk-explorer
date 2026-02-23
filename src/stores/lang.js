import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'balafon-docs-lang'

export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
]

export const useLangStore = defineStore('lang', () => {
  const lang = ref(localStorage.getItem(STORAGE_KEY) || 'en')

  watch(lang, val => {
    localStorage.setItem(STORAGE_KEY, val)
    document.documentElement.setAttribute('lang', val)
  }, { immediate: true })

  function setLang(code) {
    lang.value = code
  }

  return { lang, setLang, LANGUAGES }
})
