<template>
  <header class="topnav">
    <RouterLink to="/" class="topnav__logo">
      <span class="topnav__logo-icon">B</span>
      <span>{{ t('nav.logo') }}</span>
    </RouterLink>
    <div class="nav-section">
    <!-- Search bar (takes remaining space) -->
    <SearchBar />

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
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { useTheme } from '../composables/useTheme.js'
import { useLang } from '../composables/useLang.js'
import { getMeta } from '../utils/sdk.js'
import SearchBar from './SearchBar.vue'

const { t } = useI18n()
const { theme, toggleTheme } = useTheme()
const { lang, setLang, LANGUAGES } = useLang()

const meta = getMeta()
const versions = meta.versions || ['1.0']
const selectedVersion = ref(versions[versions.length - 1])
</script>
