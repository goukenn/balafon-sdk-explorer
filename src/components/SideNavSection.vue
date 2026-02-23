<template>
  <div class="sidenav__section">
    <button class="sidenav__section-toggle" @click="isOpen = !isOpen">
      <span>
        {{ section.label }}
        <span class="sidenav__section-count">{{ section.count }}</span>
      </span>
      <span class="toggle-icon" :class="{ open: isOpen }">▶</span>
    </button>

    <div v-if="isOpen" class="sidenav__tree">
      <!-- Functions: flat list -->
      <template v-if="section.items">
        <RouterLink
          v-for="item in section.items"
          :key="item.fullName"
          :to="`/${section.type}/${item.path}`"
          class="sidenav__item"
        >{{ item.shortName }}</RouterLink>
      </template>

      <!-- Namespaced types: tree -->
      <template v-else-if="section.tree">
        <SideNavTree :node="section.tree" :type="section.type" :depth="0" />
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import SideNavTree from './SideNavTree.vue'

const props = defineProps({
  section: { type: Object, required: true },
})

const isOpen = ref(false)
</script>
