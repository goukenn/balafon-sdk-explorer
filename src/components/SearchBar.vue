<template>
  <div class="search">
    <div class="search__box" :class="{ focused: isOpen }">
      <span class="search__icon">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 6.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0ZM9.06 10.12a5 5 0 1 1 1.06-1.06l3.43 3.44-.7.7L9.07 10.12Z" fill="currentColor"/>
        </svg>
      </span>
      <input
        ref="inputEl"
        v-model="query"
        type="search"
        class="search__input"
        :placeholder="t('search.placeholder', { n: totalCount.toLocaleString() })"
        autocomplete="off"
        spellcheck="false"
        @focus="isOpen = true"
        @keydown="onKeydown"
      />
      <kbd v-if="!isOpen" class="search__kbd">/</kbd>
      <button v-if="query" class="search__clear" title="Clear" @click="clear">✕</button>
    </div>

    <!-- Dropdown results -->
    <div v-if="isOpen && query" class="search__dropdown" role="listbox">
      <template v-if="results.length">
        <div
          v-for="group in results"
          :key="group.type"
          class="search__group"
        >
          <div class="search__group-header">
            <span class="search__group-badge" :class="`badge--${group.type}`">{{ group.typeLabel }}</span>
          </div>
          <RouterLink
            v-for="item in group.items"
            :key="item.fullName"
            :to="`/${item.type}/${item.path}`"
            class="search__result"
            :class="{ active: item.fullName === activeKey }"
            role="option"
            @click="close"
            @mouseenter="activeKey = item.fullName"
          >
            <span class="search__result-name" v-html="highlight(item.shortName, query)" />
            <span v-if="item.namespace" class="search__result-ns">{{ item.namespace }}</span>
          </RouterLink>
        </div>
      </template>

      <div v-else class="search__empty">
        {{ t('search.noResults') }} <strong>{{ query }}</strong>
      </div>

      <div class="search__footer">
        <span><kbd>↑</kbd><kbd>↓</kbd> {{ t('search.navigate') }}</span>
        <span><kbd>↵</kbd> {{ t('search.open') }}</span>
        <span><kbd>Esc</kbd> {{ t('search.close') }}</span>
      </div>
    </div>

    <!-- Backdrop -->
    <div v-if="isOpen" class="search__backdrop" @click="close" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRouter } from 'vue-router'
import { search, TOTAL_COUNT } from '../composables/useSearch.js'

const { t } = useI18n()
const router = useRouter()
const inputEl = ref(null)
const query = ref('')
const isOpen = ref(false)
const activeKey = ref(null)
const totalCount = TOTAL_COUNT

const results = computed(() => search(query.value))

// Flat list of all result items for keyboard navigation
const flatItems = computed(() =>
  results.value.flatMap(g => g.items)
)

// Reset active item when results change
watch(results, () => {
  activeKey.value = flatItems.value[0]?.fullName ?? null
})

function clear() {
  query.value = ''
  activeKey.value = null
  inputEl.value?.focus()
}

function close() {
  isOpen.value = false
  query.value = ''
  activeKey.value = null
}

function onKeydown(e) {
  const flat = flatItems.value
  const currentIdx = flat.findIndex(i => i.fullName === activeKey.value)

  if (e.key === 'Escape') {
    close()
    inputEl.value?.blur()
    return
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    const next = flat[currentIdx + 1] ?? flat[0]
    if (next) activeKey.value = next.fullName
    return
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    const prev = flat[currentIdx - 1] ?? flat[flat.length - 1]
    if (prev) activeKey.value = prev.fullName
    return
  }
  if (e.key === 'Enter' && activeKey.value) {
    const item = flat.find(i => i.fullName === activeKey.value)
    if (item) {
      router.push(`/${item.type}/${item.path}`)
      close()
    }
    return
  }
}

// Highlight matching substring in name
function highlight(text, q) {
  if (!q) return text
  const idx = text.toLowerCase().indexOf(q.toLowerCase())
  if (idx === -1) return text
  return (
    text.slice(0, idx) +
    `<mark>${text.slice(idx, idx + q.length)}</mark>` +
    text.slice(idx + q.length)
  )
}

// Global "/" shortcut to focus search
function onGlobalKey(e) {
  if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
    e.preventDefault()
    inputEl.value?.focus()
    isOpen.value = true
  }
}

onMounted(() => window.addEventListener('keydown', onGlobalKey))
onUnmounted(() => window.removeEventListener('keydown', onGlobalKey))
</script>
