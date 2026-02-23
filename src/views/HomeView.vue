<template>
  <div class="content-inner">
    <div class="home-hero">
      <h1>{{ t('home.title') }}</h1>
      <p>{{ t('home.subtitle') }}</p>
    </div>

    <div class="home-cards">
      <RouterLink
        v-for="card in cards"
        :key="card.type"
        :to="`/${card.type}/${card.firstPath}`"
        class="home-card"
      >
        <span class="home-card__icon">{{ card.icon }}</span>
        <span class="home-card__count">{{ card.count }}</span>
        <span class="home-card__title">{{ card.label }}</span>
        <span class="home-card__label">{{ card.description }}</span>
      </RouterLink>
    </div>

    <div style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid var(--border);">
      <h2 style="font-size: 1.125rem; font-weight: 700; margin-bottom: 1rem; color: var(--text);">
        {{ t('home.gettingStarted.title') }}
      </h2>
      <p style="color: var(--text-muted); font-size: 0.9375rem; line-height: 1.75;">
        {{ t('home.gettingStarted.text') }}
        <code style="background: var(--code-bg); padding: 0.1em 0.35em; border-radius: 4px; font-size: 0.875em; color: var(--accent);">public/docs/{type}/{path}.md</code>
        or
        <code style="background: var(--code-bg); padding: 0.1em 0.35em; border-radius: 4px; font-size: 0.875em; color: var(--accent);">.html</code>.
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { getCounts, getItems } from '../utils/sdk.js'

const { t } = useI18n()
const counts = getCounts()

function firstItem(type) {
  const items = getItems(type)
  return items.length > 0 ? items[0].path : ''
}

const cards = computed(() => [
  {
    type: 'class',
    label: t('home.cards.classes.label'),
    icon: '📦',
    count: counts.class,
    description: t('home.cards.classes.desc'),
    firstPath: firstItem('class'),
  },
  {
    type: 'interface',
    label: t('home.cards.interfaces.label'),
    icon: '🔌',
    count: counts.interface,
    description: t('home.cards.interfaces.desc'),
    firstPath: firstItem('interface'),
  },
  {
    type: 'trait',
    label: t('home.cards.traits.label'),
    icon: '🔧',
    count: counts.trait,
    description: t('home.cards.traits.desc'),
    firstPath: firstItem('trait'),
  },
  {
    type: 'function',
    label: t('home.cards.functions.label'),
    icon: '⚡',
    count: counts.function,
    description: t('home.cards.functions.desc'),
    firstPath: firstItem('function'),
  },
  {
    type: 'conditional_function',
    label: t('home.cards.conditionalFunctions.label'),
    icon: '🔀',
    count: counts.conditional_function,
    description: t('home.cards.conditionalFunctions.desc'),
    firstPath: firstItem('conditional_function'),
  },
])
</script>
