import sdkData from '../data/sdk.json'

// Keys that hold typed collections (all start with '::')
const SPECIAL_KEYS = new Set([
  '::class', '::interface', '::trait',
  '::namespaces', '::conditionals_functions', '::meta',
])

// ─── Name helpers ─────────────────────────────────────────────────────────────

// Parse a PHP fully-qualified name into { namespace, shortName }
// "IGK\\Controllers\\BaseController" → { namespace: "IGK\\Controllers", shortName: "BaseController" }
// "igk_app"                          → { namespace: "",                  shortName: "igk_app" }
export function parseName(fullName) {
  const parts = fullName.split('\\')
  const shortName = parts[parts.length - 1]
  const namespace = parts.slice(0, -1).join('\\')
  return { namespace, shortName }
}

// "IGK\\Controllers\\BaseController" → "IGK/Controllers/BaseController"
export function nameToPath(fullName) {
  return fullName.replace(/\\/g, '/')
}

// "IGK/Controllers/BaseController" → "IGK\\Controllers\\BaseController"
// Accepts a string or the string[] Vue Router passes for /:path+ params
export function pathToName(path) {
  const str = Array.isArray(path) ? path.join('/') : String(path)
  return str.replace(/\//g, '\\')
}

// ─── Raw data sources ─────────────────────────────────────────────────────────

// Global functions: all top-level keys that do NOT start with '::'
function getRawFunctions() {
  const result = {}
  for (const key of Object.keys(sdkData)) {
    if (!SPECIAL_KEYS.has(key)) result[key] = /** @type {any} */ (sdkData)[key]
  }
  return result
}

// Map type string → raw name dict
// The new JSON format emits [] for empty typed collections — normalize to {}
function getRawDict(type) {
  let raw
  switch (type) {
    case 'class':                raw = sdkData['::class']; break
    case 'interface':            raw = sdkData['::interface']; break
    case 'trait':                raw = sdkData['::trait']; break
    case 'function':             return getRawFunctions()
    case 'conditional_function': raw = sdkData['::conditionals_functions']; break
    default:                     return {}
  }
  if (!raw || Array.isArray(raw)) return {}
  return raw
}

// ─── Public API ───────────────────────────────────────────────────────────────

// Build a flat, sorted list of item objects for a category
export function getItems(type) {
  const dict = getRawDict(type)
  return Object.keys(dict).map(fullName => {
    const { namespace, shortName } = parseName(fullName)
    return {
      fullName,
      shortName,
      namespace,
      path: nameToPath(fullName),
      type,
    }
  }).sort((a, b) => a.shortName.localeCompare(b.shortName))
}

// Build a namespace tree for the sidebar
// Returns: { _items: [...], ChildNs: { _items: [...], ... } }
export function buildNamespaceTree(type) {
  const items = getItems(type)
  const tree = { _items: [] }

  for (const item of items) {
    if (!item.namespace) {
      tree._items.push(item)
    } else {
      const nsParts = item.namespace.split('\\')
      let node = tree
      for (const part of nsParts) {
        if (!node[part]) node[part] = { _items: [] }
        node = node[part]
      }
      node._items.push(item)
    }
  }
  return tree
}

// Get framework metadata
export function getMeta() {
  return sdkData['::meta'] || { framework: 'Balafon', versions: ['1.0'] }
}

// Get item counts for all categories
export function getCounts() {
  const rawFns = getRawFunctions()
  return {
    class:                Object.keys(sdkData['::class'] || {}).length,
    interface:            Object.keys(sdkData['::interface'] || {}).length,
    trait:                Object.keys(sdkData['::trait'] || {}).length,
    function:             Object.keys(rawFns).length,
    conditional_function: Object.keys(sdkData['::conditionals_functions'] || {}).length,
  }
}

// Find a single item by type + URL path; returns null if not found
export function findItem(type, path) {
  const fullName = pathToName(path)
  const dict = getRawDict(type)
  if (!(fullName in dict)) return null
  const { namespace, shortName } = parseName(fullName)
  return { fullName, shortName, namespace, path, type }
}

// Return the inline PHPDoc string for an item, or null if not present
export function getItemDoc(type, path) {
  const fullName = pathToName(path)
  const dict = /** @type {Record<string, any>} */ (getRawDict(type))
  const val = dict[fullName]
  return (val && typeof val === 'object' && typeof val.doc === 'string') ? val.doc : null
}

// Return { funcs, props } for a class/interface/trait entry, or null if neither is present
export function getItemMembers(type, path) {
  const fullName = pathToName(path)
  const dict = /** @type {Record<string, any>} */ (getRawDict(type))
  const val = dict[fullName]
  if (!val || typeof val !== 'object') return null
  const funcs = (val.funcs && typeof val.funcs === 'object' && !Array.isArray(val.funcs)) ? val.funcs : null
  const props = (val.props && typeof val.props === 'object' && !Array.isArray(val.props)) ? val.props : null
  if (!funcs && !props) return null
  return { funcs, props }
}
