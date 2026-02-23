import { shallowRef } from 'vue'
import defaultSdkData from '../data/sdk.json'

// Reactive SDK data — swap this ref to switch the active SDK at runtime
export const sdkDataRef = shallowRef(defaultSdkData)

// Keys that hold typed collections (all start with '::')
const SPECIAL_KEYS = new Set([
  '::class', '::interface', '::trait',
  '::namespaces', '::conditionals_functions', '::meta', '::files',
])

// Resolve $r index to a file path from ::files, or null
function resolveFileRef(/** @type {any} */ entry) {
  const files = sdkDataRef.value['::files']
  if (!Array.isArray(files) || !entry || typeof entry !== 'object') return null
  const idx = entry['$r']
  return (typeof idx === 'number' && idx >= 0 && idx < files.length) ? files[idx] : null
}

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
  const data = sdkDataRef.value
  const result = {}
  for (const key of Object.keys(data)) {
    if (!SPECIAL_KEYS.has(key)) result[key] = /** @type {any} */ (data)[key]
  }
  return result
}

// Map type string → raw name dict
// The new JSON format emits [] for empty typed collections — normalize to {}
function getRawDict(type) {
  const data = sdkDataRef.value
  let raw
  switch (type) {
    case 'class':                raw = data['::class']; break
    case 'interface':            raw = data['::interface']; break
    case 'trait':                raw = data['::trait']; break
    case 'function':             return getRawFunctions()
    case 'conditional_function': raw = data['::conditionals_functions']; break
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
    const val = /** @type {any} */ (dict)[fullName]
    // Resolve primary file ref from $r (use first element if array)
    const firstEntry = Array.isArray(val) ? val[0] : val
    const fileRef = resolveFileRef(firstEntry)
    return {
      fullName,
      shortName,
      namespace,
      path: nameToPath(fullName),
      type,
      fileRef,
    }
  }).sort((a, b) => a.fullName.localeCompare(b.fullName))
}

// Return all source file paths for an item (array because a function can be defined in multiple files)
export function getItemFileRefs(type, path) {
  const fullName = pathToName(path)
  const dict = /** @type {Record<string, any>} */ (getRawDict(type))
  const val = dict[fullName]
  if (!val || typeof val !== 'object') return []
  if (Array.isArray(val)) {
    return val.map(e => resolveFileRef(e)).filter(Boolean)
  }
  const ref = resolveFileRef(val)
  return ref ? [ref] : []
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
/**
 * 
 * @returns {framework:string, versions:string[], url:string, description:string}
 */
export function getMeta() {
  return sdkDataRef.value['::meta'] || { 
    framework: 'Balafon', versions: ['1.0'] 
  }
}

// Get item counts for all categories
export function getCounts() {
  const data = sdkDataRef.value
  const rawFns = getRawFunctions()
  return {
    class:                Object.keys(data['::class'] || {}).length,
    interface:            Object.keys(data['::interface'] || {}).length,
    trait:                Object.keys(data['::trait'] || {}).length,
    function:             Object.keys(rawFns).length,
    conditional_function: Object.keys(data['::conditionals_functions'] || {}).length,
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

// Pick the best doc string from an entry for the given language.
// Looks for "doc.{lang}" first (e.g. "doc.fr"), falls back to "doc".
// If entry is an array (multiple definitions per ::files), picks the first one that has a doc.
function pickDoc(/** @type {any} */ entry, /** @type {string} */ lang) {
  if (!entry) return null
  if (Array.isArray(entry)) {
    for (const e of entry) {
      const d = pickDoc(e, lang)
      if (d) return d
    }
    return null
  }
  if (typeof entry !== 'object') return null
  const langKey = `doc.${lang}`
  if (lang && lang !== 'en' && typeof entry[langKey] === 'string') return entry[langKey]
  return typeof entry.doc === 'string' ? entry.doc : null
}

// Return the inline PHPDoc string for an item, or null if not present.
// Pass lang (e.g. 'fr') to prefer "doc.fr" over "doc".
export function getItemDoc(type, path, lang = 'en') {
  const fullName = pathToName(path)
  const dict = /** @type {Record<string, any>} */ (getRawDict(type))
  const val = dict[fullName]
  return pickDoc(val, lang)
}

// Return { funcs, props } for a class/interface/trait entry, or null if neither is present.
// Each member's "doc" field is resolved to the best available language string.
export function getItemMembers(type, path, lang = 'en') {
  const fullName = pathToName(path)
  const dict = /** @type {Record<string, any>} */ (getRawDict(type))
  const val = dict[fullName]
  if (!val || typeof val !== 'object') return null
  const rawFuncs = (val.funcs && typeof val.funcs === 'object' && !Array.isArray(val.funcs)) ? val.funcs : null
  const rawProps = (val.props && typeof val.props === 'object' && !Array.isArray(val.props)) ? val.props : null
  if (!rawFuncs && !rawProps) return null

  function normalizeMember(/** @type {any} */ member) {
    if (!member || typeof member !== 'object') return member
    return { ...member, doc: pickDoc(member, lang) }
  }

  const funcs = rawFuncs
    ? Object.fromEntries(Object.entries(rawFuncs).map(([k, v]) => [k, normalizeMember(v)]))
    : null
  const props = rawProps
    ? Object.fromEntries(Object.entries(rawProps).map(([k, v]) => [k, normalizeMember(v)]))
    : null
  return { funcs, props }
}
