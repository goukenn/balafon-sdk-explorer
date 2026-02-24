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

// Return true when the interface has no methods across all its definitions.
export function getItemIsContract(type, path) {
  if (type !== 'interface') return false
  const defs = getItemDefinitions(type, path)
  if (defs.length === 0) return false
  return defs.every(def => !def.funcs || Object.keys(def.funcs).length === 0)
}

// Return true when the item has exactly one definition and it is marked is_conditional.
export function getItemIsConditional(type, path) {
  const fullName = pathToName(path)
  const dict = /** @type {Record<string, any>} */ (getRawDict(type))
  const val = dict[fullName]
  if (!val || typeof val !== 'object') return false
  if (Array.isArray(val)) return val.length === 1 ? !!val[0].is_conditional : false
  return !!val.is_conditional
}

// Return the modifier ("final" | "abstract" | ...) of an item, or null.
// Only returns a value when there is exactly one definition (ambiguous otherwise).
export function getItemModifier(type, path) {
  const fullName = pathToName(path)
  const dict = /** @type {Record<string, any>} */ (getRawDict(type))
  const val = dict[fullName]
  if (!val || typeof val !== 'object') return null
  if (Array.isArray(val)) {
    return val.length === 1 ? (val[0].modifier ?? null) : null
  }
  return val.modifier ?? null
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

// Return all definitions for an item as a normalized array.
// Each definition: { fileRef, is_conditional, doc, funcs, props }
// Member docs are resolved for the given language.
// Single-object entries are wrapped in a one-element array for uniformity.
export function getItemDefinitions(type, path, lang = 'en') {
  const fullName = pathToName(path)
  const dict = /** @type {Record<string, any>} */ (getRawDict(type))
  const val = dict[fullName]
  if (!val || typeof val !== 'object') return []
  const entries = Array.isArray(val) ? val : [val]

  function normalizeMember(/** @type {any} */ member) {
    if (!member || typeof member !== 'object') return member
    return { ...member, doc: pickDoc(member, lang) }
  }

  return entries.map(entry => {
    const rawFuncs = (entry.funcs && typeof entry.funcs === 'object' && !Array.isArray(entry.funcs)) ? entry.funcs : null
    const rawProps = (entry.props && typeof entry.props === 'object' && !Array.isArray(entry.props)) ? entry.props : null
    return {
      fileRef: resolveFileRef(entry),
      is_conditional: !!entry.is_conditional,
      modifier: entry.modifier ?? null,
      doc: pickDoc(entry, lang),
      params: Array.isArray(entry.params) ? entry.params : null,
      returnType: (typeof entry.return === 'string' && entry.return) ? entry.return : null,
      funcs: rawFuncs ? Object.fromEntries(Object.entries(rawFuncs).map(([k, v]) => [k, normalizeMember(v)])) : null,
      props: rawProps ? Object.fromEntries(Object.entries(rawProps).map(([k, v]) => [k, normalizeMember(v)])) : null,
    }
  })
}

// Return { funcs, props } for a single definition (by index, default 0).
export function getItemMembers(type, path, lang = 'en', defIndex = 0) {
  const defs = getItemDefinitions(type, path, lang)
  const def = defs[defIndex] ?? defs[0]
  if (!def || (!def.funcs && !def.props)) return null
  return { funcs: def.funcs, props: def.props }
}

// Return the return type for an item when there is exactly one definition, or null.
export function getItemReturn(type, path) {
  const fullName = pathToName(path)
  const dict = /** @type {Record<string, any>} */ (getRawDict(type))
  const val = dict[fullName]
  if (!val || typeof val !== 'object') return null
  const raw = Array.isArray(val) ? (val.length === 1 ? val[0].return : null) : val.return
  return (typeof raw === 'string' && raw) ? raw : null
}

// Return the params array for an item when there is exactly one definition, or null.
export function getItemParams(type, path) {
  const fullName = pathToName(path)
  const dict = /** @type {Record<string, any>} */ (getRawDict(type))
  const val = dict[fullName]
  if (!val || typeof val !== 'object') return null
  if (Array.isArray(val)) {
    return val.length === 1 ? (Array.isArray(val[0].params) ? val[0].params : null) : null
  }
  return Array.isArray(val.params) ? val.params : null
}

// ─── Parameter formatting helpers ─────────────────────────────────────────────

export function formatParam(/** @type {any} */ param) {
  if (typeof param === 'string') return param
  if (!param || typeof param !== 'object') return ''
  let s = ''
  if (param.type) s += `${param.type} `
  s += param.name ?? ''
  if ('default' in param) s += `=${param.default}`
  return s
}

export function formatParams(/** @type {any[]|null|undefined} */ params) {
  if (!Array.isArray(params) || params.length === 0) return ''
  return params.map(formatParam).join(', ')
}

// ─── Signature HTML rendering (colorized) ────────────────────────────────────

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function defaultValueClass(val) {
  if (typeof val === 'number') return 'sig-number'
  const s = String(val).trim()
  if (s === 'null' || s === 'true' || s === 'false') return 'sig-keyword'
  if (/^["']/.test(s)) return 'sig-string'
  if (/^-?\d+(\.\d+)?$/.test(s)) return 'sig-number'
  return null
}

function renderParamHtml(/** @type {any} */ param) {
  if (typeof param === 'string') return `<span class="sig-param">${escHtml(param)}</span>`
  if (!param || typeof param !== 'object') return ''
  let s = ''
  if (param.type) s += `<span class="sig-type">${escHtml(param.type)}</span> `
  s += `<span class="sig-param">${escHtml(param.name ?? '')}</span>`
  if ('default' in param) {
    const cls = defaultValueClass(param.default)
    const val = escHtml(String(param.default))
    s += cls ? ` = <span class="${cls}">${val}</span>` : ` = ${val}`
  }
  return s
}

// Render a PHP-style function signature as colorized HTML.
// returnType is suppressed when null or "void".
export function renderSignatureHtml(/** @type {string} */ name, /** @type {any[]|null|undefined} */ params, /** @type {string|null|undefined} */ returnType) {
  const paramsHtml = Array.isArray(params) && params.length
    ? params.map(renderParamHtml).join(', ')
    : ''
  let html = `${escHtml(name ?? '')}(${paramsHtml})`
  if (returnType && returnType !== 'void') {
    html += `: <span class="sig-type">${escHtml(returnType)}</span>`
  }
  return html
}
