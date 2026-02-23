import { storeToRefs } from 'pinia'
import { useThemeStore } from '../stores/theme.js'

export function useTheme() {
  const store = useThemeStore()
  const { theme } = storeToRefs(store)
  return { theme, toggleTheme: store.toggleTheme }
}
