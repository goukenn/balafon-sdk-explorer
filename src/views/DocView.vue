<template>
  <div class="content-inner">
    <template v-if="item">
      <div class="doc-header">
        <div class="doc-header__breadcrumb">
          <RouterLink to="/">Home</RouterLink>
          <span class="sep">/</span>
          <span>{{ typeLabel }}</span>
          <template v-if="item.namespace">
            <span class="sep">/</span>
            <span>{{ item.namespace.replace(/\\/g, '::') }}</span>
          </template>
        </div>

        <h1>
          {{ item.shortName }}
          <span class="doc-header__badge" :class="`badge--${type}`">{{ typeLabel }}</span>
          <span v-if="modifier" class="doc-header__badge" :class="`badge--${modifier}`">{{ modifier }}</span>
          <span v-if="isConditional" class="doc-header__badge badge--conditional">conditional</span>
        </h1>

        <div v-if="item.namespace" class="doc-header__ns">
          {{ item.namespace }}\{{ item.shortName }}
        </div>

        <div v-if="fileRefs.length" class="doc-header__files">
          <span v-for="ref in fileRefs" :key="ref" class="doc-header__file">{{ ref }}</span>
        </div>
      </div>

      <DocViewer :type="type" :path="normalizedPath" />
    </template>

    <div v-else class="not-found">
      <h1>404</h1>
      <p>{{ t('doc.notFound') }}</p>
      <RouterLink to="/" class="theme-btn" style="display:inline-flex; align-items:center; gap:0.5rem; padding: 0.5rem 1.25rem; width:auto; border-radius:8px; border:1px solid var(--border);">
        {{ t('doc.backToHome') }}
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import DocViewer from '../components/DocViewer.vue'
import { findItem, getItemFileRefs, getItemModifier, getItemIsConditional } from '../utils/sdk.js'

const { t } = useI18n()

const props = defineProps({
  type: { type: String, required: true },
  // Vue Router passes /:path+ as string[] — accept both
  path: { type: [String, Array], required: true },
})

// Normalize to a plain slash-separated string
const normalizedPath = computed(() =>
  Array.isArray(props.path) ? props.path.join('/') : props.path
)

const typeLabel = computed(() => t(`types.${props.type}`) || props.type)

const item = computed(() => findItem(props.type, normalizedPath.value))
const fileRefs = computed(() => getItemFileRefs(props.type, normalizedPath.value))
const modifier = computed(() => getItemModifier(props.type, normalizedPath.value))
const isConditional = computed(() => getItemIsConditional(props.type, normalizedPath.value))
</script>
