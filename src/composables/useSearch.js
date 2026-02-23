import { getItems } from '../utils/sdk.js'

// All SDK types available for search
const ALL_TYPES = ['class', 'interface', 'trait', 'function', 'conditional_function']

const TYPE_LABELS = {
  class: 'Class',
  interface: 'Interface',
  trait: 'Trait',
  function: 'Function',
  conditional_function: 'Conditional Function',
}

// Build a flat search index once at module load (all types combined)
const INDEX = ALL_TYPES.flatMap(type =>
  getItems(type).map(item => ({
    ...item,
    typeLabel: TYPE_LABELS[type],
    // Precompute lowercase variants for fast matching
    _lc: item.fullName.toLowerCase(),
    _short_lc: item.shortName.toLowerCase(),
  }))
)

/**
 * Search the SDK index.
 * @param {string} query - raw user input
 * @param {number} maxPerType - max results per type group
 * @returns {{ type, typeLabel, items }[] } grouped results
 */
export function search(query, maxPerType = 8) {
  const q = query.trim().toLowerCase()
  if (!q) return []

  // Score each match: exact shortName > startsWith shortName > includes shortName > includes fullName
  const scored = []
  for (const entry of INDEX) {
    let score = 0
    if (entry._short_lc === q)                score = 4
    else if (entry._short_lc.startsWith(q))   score = 3
    else if (entry._short_lc.includes(q))     score = 2
    else if (entry._lc.includes(q))           score = 1
    if (score > 0) scored.push({ ...entry, score })
  }

  // Sort by score desc, then shortName asc
  scored.sort((a, b) => b.score - a.score || a.shortName.localeCompare(b.shortName))

  // Group by type, capped per type
  const grouped = {}
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

/** Total number of items across all types */
export const TOTAL_COUNT = INDEX.length
