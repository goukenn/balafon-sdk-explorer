import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/main.css'
import App from './App.vue'
import router from './router/index.js'
import { i18n } from './i18n/index.js'
import { useSdkStore } from './stores/sdk.js'

const pinia = createPinia()

const app = createApp(App)
app.use(pinia)

// Init SDK store before mount so sdkDataRef is set before any component renders
useSdkStore()

app.use(router).use(i18n).mount('#app')
