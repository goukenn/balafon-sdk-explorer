import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'balafon-docs-theme'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref(localStorage.getItem(STORAGE_KEY) || 'light')

  watch(theme, val => {
    document.documentElement.setAttribute('data-theme', val)
    localStorage.setItem(STORAGE_KEY, val)
  }, { immediate: true })

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  return { theme, toggleTheme }
})
