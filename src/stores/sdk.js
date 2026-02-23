import { defineStore } from 'pinia'
import { ref } from 'vue'
import { sdkDataRef } from '../utils/sdk.js'

const STORAGE_KEY = 'balafon-docs-sdk'

// Default SDK: src/data/sdk.json  → id "default"
const defaultModules = import.meta.glob('../data/sdk.json', { eager: true })
// Additional SDKs: src/data/[prefix].sdk.json  → id = prefix
const extraModules = import.meta.glob('../data/*.sdk.json', { eager: true })

function extractData(/** @type {any} */ mod) {
  return mod.default ?? mod
}

const SDK_LIST = [
  ...Object.entries(defaultModules).map(([, mod]) => ({
    id: 'default',
    label: 'Default',
    data: extractData(mod),
  })),
  ...Object.entries(extraModules).map(([path, mod]) => {
    const id = path.match(/\/([^/]+)\.sdk\.json$/)?.[1] ?? path
    return { id, label: id, data: extractData(mod) }
  }),
]

export const useSdkStore = defineStore('sdk', () => {
  const currentSdkId = ref(localStorage.getItem(STORAGE_KEY) || 'default')

  // Initialise sdkDataRef with the persisted selection
  const initial = SDK_LIST.find(s => s.id === currentSdkId.value) ?? SDK_LIST[0]
  sdkDataRef.value = initial.data

  function setActiveSdk(/** @type {string} */ id) {
    const sdk = SDK_LIST.find(s => s.id === id)
    if (!sdk) return
    currentSdkId.value = id
    localStorage.setItem(STORAGE_KEY, id)
    sdkDataRef.value = sdk.data
  }

  // Expose only id + label (no raw data) for the UI
  const availableSdks = SDK_LIST.map(({ id, label }) => ({ id, label }))

  return { availableSdks, currentSdkId, setActiveSdk }
})
