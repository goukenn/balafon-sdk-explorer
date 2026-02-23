<template>
  <TopNav />
  <div class="layout">
    <SideNav />
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import TopNav from './components/TopNav.vue'
import SideNav from './components/SideNav.vue'
import { RouterView } from 'vue-router'
</script>
