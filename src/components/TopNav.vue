<template>
  <header class="topnav">
    <RouterLink to="/" class="topnav__logo">
      <span class="topnav__logo-icon">B</span>
      <span>{{ sdkName }} SDK</span>
    </RouterLink>
    <div class="nav-section">
    <!-- Search bar (takes remaining space) -->
    <SearchBar />

    <!-- SDK selector (hidden when only one SDK is available) -->
    <div v-if="availableSdks.length > 1" class="topnav__sdk">
      <select :value="currentSdkId" @change="onSdkChange($event.target.value)" title="Active SDK">
        <option v-for="sdk in availableSdks" :key="sdk.id" :value="sdk.id">{{ sdk.label }}</option>
      </select>
    </div>

    <div class="topnav__version">
      <span>v</span>
      <select v-model="selectedVersion" :title="`Version ${selectedVersion}`">
        <option v-for="v in versions" :key="v" :value="v">{{ v }}</option>
      </select>
    </div>

    <!-- Language selector -->
    <div class="topnav__lang">
      <select :value="lang" @change="setLang($event.target.value)">
        <option v-for="l in LANGUAGES" :key="l.code" :value="l.code">
          {{ l.flag }} {{ l.label }}
        </option>
      </select>
    </div>

    <button
      class="theme-btn"
      :title="theme === 'light' ? t('nav.switchToDark') : t('nav.switchToLight')"
      @click="toggleTheme"
    >
      <span v-if="theme === 'light'">🌙</span>
      <span v-else>☀️</span>
    </button>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useTheme } from '../composables/useTheme.js'
import { useLang } from '../composables/useLang.js'
import { useSdk } from '../composables/useSdk.js'
import { getMeta } from '../utils/sdk.js'
import SearchBar from './SearchBar.vue'

const { t } = useI18n()
const { theme, toggleTheme } = useTheme()
const { lang, setLang, LANGUAGES } = useLang()
const { availableSdks, currentSdkId, setActiveSdk } = useSdk()
const router = useRouter()
const route = useRoute()

// Recompute whenever the active SDK changes
const meta = computed(() => getMeta())
const sdkName = computed(() => meta.value.title ?? meta.value.framework ?? 'SDK')
const versions = computed(() => meta.value.versions || ['1.0'])
const selectedVersion = ref(versions.value[versions.value.length - 1])
watch(versions, vs => { selectedVersion.value = vs[vs.length - 1] })

// Keep document.title in sync
watch(sdkName, name => { document.title = name + ' SDK' }, { immediate: true })

// On SDK switch: update the data then navigate home so stale doc routes don't linger
function onSdkChange(id) {
  setActiveSdk(id)
  if (route.path !== '/') router.push('/')
}
</script>
