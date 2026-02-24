<template>
  <!-- Root items (no namespace) -->
  <template v-if="depth === 0">
    <RouterLink
      v-for="item in node._items"
      :key="item.fullName"
      :to="`/${type}/${item.path}`"
      class="sidenav__item"
      :style="{ '--depth': 0 }"
    >{{ item.shortName }}</RouterLink>
  </template>

  <!-- Nested namespace groups -->
  <template v-if="childKeys.length > 0">
    <div v-for="nsKey in childKeys" :key="nsKey" class="sidenav__ns-group">
      <button
        class="sidenav__ns"
        :style="{ '--depth': depth }"
        @click="toggleNs(nsKey)"
      >
        <span class="toggle-icon" :class="{ open: openNs[nsKey] }">▶</span>
        {{ nsKey }}
      </button>

      <div v-if="openNs[nsKey]" class="sidenav__ns-children">
        <!-- Items directly in this namespace -->
        <RouterLink
          v-for="item in node[nsKey]._items"
          :key="item.fullName"
          :to="`/${type}/${item.path}`"
          class="sidenav__item"
          :style="{ '--depth': depth + 1 }"
        >{{ item.shortName }}</RouterLink>

        <!-- Recurse into deeper namespaces -->
        <SideNavTree
          :node="node[nsKey]"
          :type="type"
          :depth="depth + 1"
        />
      </div>
    </div>
  </template>

  <!-- Root items when depth > 0 already rendered above, nothing extra here -->
  <template v-if="depth > 0">
    <!-- items are rendered by parent -->
  </template>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  node: { type: Object, required: true },
  type: { type: String, required: true },
  depth: { type: Number, default: 0 },
})

// Child namespace keys (exclude _items)
const childKeys = computed(() =>
  Object.keys(props.node).filter(k => k !== '_items').sort()
)

const openNs = reactive({})

function toggleNs(key) {
  openNs[key] = !openNs[key]
}
</script>
