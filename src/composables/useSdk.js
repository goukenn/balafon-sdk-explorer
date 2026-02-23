import { storeToRefs } from 'pinia'
import { useSdkStore } from '../stores/sdk.js'

export function useSdk() {
  const store = useSdkStore()
  const { currentSdkId } = storeToRefs(store)
  // availableSdks is a plain array (static list) — access directly, not via storeToRefs
  return { availableSdks: store.availableSdks, currentSdkId, setActiveSdk: store.setActiveSdk }
}
