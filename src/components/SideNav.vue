<template>
  <nav class="sidenav">
    <SideNavSection
      v-for="section in sections"
      :key="section.type"
      :section="section"
    />
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import SideNavSection from './SideNavSection.vue'
import { buildNamespaceTree, getCounts } from '../utils/sdk.js'

const { t } = useI18n()
const counts = getCounts()

const sections = computed(() => [
  {
    type: 'class',
    label: t('sidebar.classes'),
    icon: '📦',
    count: counts.class,
    tree: buildNamespaceTree('class'),
  },
  {
    type: 'interface',
    label: t('sidebar.interfaces'),
    icon: '🔌',
    count: counts.interface,
    tree: buildNamespaceTree('interface'),
  },
  {
    type: 'trait',
    label: t('sidebar.traits'),
    icon: '🔧',
    count: counts.trait,
    tree: buildNamespaceTree('trait'),
  },
  {
    type: 'function',
    label: t('sidebar.functions'),
    icon: '⚡',
    count: counts.function,
    tree: buildNamespaceTree('function'),
  },
  {
    type: 'conditional_function',
    label: t('sidebar.conditionalFunctions'),
    icon: '🔀',
    count: counts.conditional_function,
    tree: buildNamespaceTree('conditional_function'),
  },
])
</script>
