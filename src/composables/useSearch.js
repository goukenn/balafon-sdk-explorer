import { computed } from 'vue'
import { getItems, sdkDataRef } from '../utils/sdk.js'

// All SDK types available for search
const ALL_TYPES = ['class', 'interface', 'trait', 'function', 'conditional_function']

const TYPE_LABELS = {
  class: 'Class',
  interface: 'Interface',
  trait: 'Trait',
  function: 'Function',
  conditional_function: 'Conditional Function',
}

// Reactive index — rebuilt automatically when the active SDK changes
const indexComputed = computed(() =>
  ALL_TYPES.flatMap(type =>
    getItems(type).map(item => ({
      ...item,
      typeLabel: TYPE_LABELS[type],
      _lc: item.fullName.toLowerCase(),
      _short_lc: item.shortName.toLowerCase(),
    }))
  )
)

export function useSearch() {
  const totalCount = computed(() => indexComputed.value.length)

  /**
   * Search the current SDK index.
   * Reads indexComputed.value so callers' computeds track the SDK change.
   * @param {string} query - raw user input
   * @param {number} maxPerType - max results per type group
   * @returns {{ type, typeLabel, items }[]} grouped results
   */
  function search(query, maxPerType = 8) {
    const index = indexComputed.value   // reactive read — tracked by callers
    const q = query.trim().toLowerCase()
    if (!q) return []

    // Score each match: exact shortName > startsWith shortName > includes shortName > includes fullName
    const scored = []
    for (const entry of index) {
      let score = 0
      if (entry._short_lc === q)                score = 4
      else if (entry._short_lc.startsWith(q))   score = 3
      else if (entry._short_lc.includes(q))     score = 2
      else if (entry._lc.includes(q))           score = 1
      if (score > 0) scored.push({ ...entry, score })
    }

    // Sort by score desc, then fullName asc
    scored.sort((a, b) => b.score - a.score || a.fullName.localeCompare(b.fullName))

    // Group by type, capped per type
    const grouped = /** @type {Record<string, any[]>} */ ({})
    for (const hit of scored) {
      if (!grouped[hit.type]) grouped[hit.type] = []
      if (grouped[hit.type].length < maxPerType) {
        grouped[hit.type].push(hit)
      }
    }

    return ALL_TYPES
      .filter(t => grouped[t]?.length)
      .map(t => ({ type: t, typeLabel: TYPE_LABELS[t], items: grouped[t] }))
  }

  return { search, totalCount }
}
