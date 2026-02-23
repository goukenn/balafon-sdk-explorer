<template>
  <div>
    <div v-if="loading" class="doc-loading">
      <span class="spinner"></span>
      <span>{{ t('doc.loading') }}</span>
    </div>

    <div v-else-if="content && isMd" class="doc-content" v-html="renderedMd" />

    <div v-else-if="content && !isMd" class="doc-content" v-html="content" />

    <!-- Inline PHPDoc fallback from sdk.json -->
    <div v-else-if="phpDocHtml" class="doc-content doc-phpdoc" v-html="phpDocHtml" />

    <div v-else class="doc-empty">
      <div class="doc-empty__icon">📄</div>
      <div class="doc-empty__title">{{ t('doc.empty.title') }}</div>
      <p class="doc-empty__text">
        Add a file at <code>public/docs/{{ docPrefix }}{{ type }}/{{ path }}.md</code> or
        <code>public/docs/{{ docPrefix }}{{ type }}/{{ path }}.html</code> to provide documentation.<br>
        For translated content, use <code>public/docs/{{ docPrefix }}{{ type }}/{{ path }}.fr.md</code>, etc.
      </p>
    </div>

    <div v-if="members" class="doc-members">
      <div v-if="sortedFuncs.length" class="doc-members__section">
        <h3 class="doc-members__title">{{ t('doc.members.methods') }}</h3>
        <table class="doc-members__table">
          <thead>
            <tr>
              <th>{{ t('doc.members.name') }}</th>
              <th>{{ t('doc.members.modifier') }}</th>
              <th>{{ t('doc.members.static') }}</th>
              <th>{{ t('doc.members.description') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="func in sortedFuncs" :key="func.name">
              <td class="doc-members__name"><code>{{ func.name }}()</code></td>
              <td class="doc-members__icon" v-html="modifierHtml(func.modifier)"></td>
              <td class="doc-members__icon" v-html="staticHtml(func.static)"></td>
              <td v-html="func.doc ? renderPhpDocDesc(func.doc) : ''"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="sortedProps.length" class="doc-members__section">
        <h3 class="doc-members__title">{{ t('doc.members.properties') }}</h3>
        <table class="doc-members__table">
          <thead>
            <tr>
              <th>{{ t('doc.members.name') }}</th>
              <th>{{ t('doc.members.modifier') }}</th>
              <th>{{ t('doc.members.static') }}</th>
              <th>{{ t('doc.members.description') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="prop in sortedProps" :key="prop.name">
              <td class="doc-members__name"><code>{{ prop.name }}</code></td>
              <td class="doc-members__icon" v-html="modifierHtml(prop.modifier)"></td>
              <td class="doc-members__icon" v-html="staticHtml(prop.static)"></td>
              <td v-html="prop.doc ? renderPhpDocDesc(prop.doc) : ''"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { marked } from 'marked'
import { useLang } from '../composables/useLang.js'
import { useSdk } from '../composables/useSdk.js'
import { getItemDoc, getItemMembers } from '../utils/sdk.js'

const { t } = useI18n()

const props = defineProps({
  type: { type: String, required: true },
  path: { type: String, required: true },
})

const { lang } = useLang()
const { currentSdkId } = useSdk()

// "default" SDK → /docs/{type}/{path}  |  other SDKs → /docs/{sdkId}/{type}/{path}
const docPrefix = computed(() => currentSdkId.value === 'default' ? '' : `${currentSdkId.value}/`)

const loading = ref(false)
const content = ref(null)
const isMd = ref(false)
const renderedMd = ref('')

// ─── PHPDoc inline fallback ────────────────────────────────────────────────

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// Parse a raw PHPDoc string into { description, tags }
// Input: "/**\n * Summary line.\n * @param string $x desc\n * @return void\n */"
function parsePhpDoc(raw) {
  const lines = raw
    .replace(/^[ \t]*\/\*\*[ \t]*/m, '')   // strip opening /**
    .replace(/[ \t]*\*\/[ \t]*$/, '')        // strip closing */
    .split('\n')
    .map(l => l.replace(/^[ \t]*\*[ \t]?/, '')) // strip leading " * "

  const descLines = []
  const tags = []

  for (const line of lines) {
    if (line.trimStart().startsWith('@')) {
      const m = line.trimStart().match(/^@(\w+)(?:\s+(.*))?$/)
      if (m) tags.push({ name: m[1], value: (m[2] ?? '').trim() })
    } else {
      descLines.push(line)
    }
  }

  return { description: descLines.join('\n').trim(), tags }
}

// Render parsed PHPDoc to an HTML string
function renderPhpDoc(docString) {
  const { description, tags } = parsePhpDoc(docString)
  let html = '<div class="phpdoc">'

  if (description) {
    const paras = description.split(/\n{2,}/).map(p => p.trim()).filter(Boolean)
    for (const para of paras) {
      html += `<p class="phpdoc__desc">${escapeHtml(para.replace(/\n/g, ' '))}</p>`
    }
  }

  if (tags.length) {
    html += '<dl class="phpdoc__tags">'
    for (const tag of tags) {
      html += `<div class="phpdoc__tag">`
      html += `<dt class="phpdoc__tag-name">@${escapeHtml(tag.name)}</dt>`
      html += `<dd class="phpdoc__tag-value">${escapeHtml(tag.value)}</dd>`
      html += `</div>`
    }
    html += '</dl>'
  }

  html += '</div>'
  return html
}

const phpDocHtml = computed(() => {
  const docStr = getItemDoc(props.type, props.path, lang.value)
  return docStr ? renderPhpDoc(docStr) : null
})

// Extract just the first paragraph of a PHPDoc block for compact table display
function renderPhpDocDesc(docString) {
  const { description } = parsePhpDoc(docString)
  if (!description) return ''
  const first = description.split(/\n{2,}/)[0].trim()
  return escapeHtml(first.replace(/\n/g, ' '))
}

// ─── Member icons ──────────────────────────────────────────────────────────

const SVG_PROTECTED = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="protected">
  <path d="M12 4L20 12L12 20L4 12L12 4Z" fill="#FFC107"/>
  <path d="M10 9L9 15M15 9L14 15M8 11H16M7 13H15" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
</svg>`

const SVG_STATIC = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="static">
  <path d="M12 3L4 7V17L12 21L20 17V7L12 3Z" fill="#9C27B0"/>
  <path d="M12 3V12M12 12L4 7M12 12L20 7" stroke="white" stroke-width="1"/>
  <circle cx="18" cy="6" r="5" fill="black" stroke="white" stroke-width="1"/>
  <text x="16" y="8" fill="white" font-size="7" font-family="Arial" font-weight="bold">S</text>
</svg>`

function modifierHtml(modifier) {
  if (modifier === 'protected') return SVG_PROTECTED
  return escapeHtml(modifier ?? '')
}

function staticHtml(isStatic) {
  return isStatic ? SVG_STATIC : ''
}

const members = computed(() => getItemMembers(props.type, props.path, lang.value))

// Convert a member dict to a sorted array: non-static α first, then static α
function sortMembers(/** @type {Record<string,any>|null} */ dict) {
  if (!dict) return []
  return Object.entries(dict)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => {
      const aStatic = !!a.static
      const bStatic = !!b.static
      if (aStatic !== bStatic) return aStatic ? 1 : -1
      return a.name.localeCompare(b.name)
    })
}

const sortedFuncs = computed(() => sortMembers(members.value?.funcs ?? null))
const sortedProps = computed(() => sortMembers(members.value?.props ?? null))

// ─── Doc file fetching ─────────────────────────────────────────────────────

// Try fetching a single URL; returns text on success or null on failure.
// Vite dev server (and most SPA hosts) return the index page (200 text/html)
// for any unmatched path. We detect and reject those responses:
//   - .md files are never served as text/html
//   - .html doc fragments don't start with a full HTML document structure
async function tryFetch(url) {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const text = await res.text()
    const ct = res.headers.get('content-type') ?? ''
    if (ct.includes('text/html')) {
      if (!url.endsWith('.html')) return null
      if (/^\s*(<(!DOCTYPE|html)[^>]*>|<meta\s+charset)/i.test(text)) return null
    }
    return text
  } catch {
    return null
  }
}

async function loadDoc() {
  loading.value = true
  content.value = null
  isMd.value = false
  renderedMd.value = ''

  const basePath = `/docs/${docPrefix.value}${props.type}/${props.path}`
  const currentLang = lang.value

  try {
    // 1. Try lang-specific .md
    let text = await tryFetch(`${basePath}.${currentLang}.md`)
    if (text !== null) {
      content.value = text
      isMd.value = true
      renderedMd.value = marked.parse(text)
      return
    }

    // 2. Try lang-specific .html
    text = await tryFetch(`${basePath}.${currentLang}.html`)
    if (text !== null) {
      content.value = text
      isMd.value = false
      return
    }

    // 3. Fallback: default language with extension (.en.md / .en.html)
    if (currentLang !== 'en') {
      text = await tryFetch(`${basePath}.en.md`)
      if (text !== null) {
        content.value = text
        isMd.value = true
        renderedMd.value = marked.parse(text)
        return
      }

      text = await tryFetch(`${basePath}.en.html`)
      if (text !== null) {
        content.value = text
        isMd.value = false
        return
      }
    }

    // 4. Fallback: bare .md (no language suffix)
    text = await tryFetch(`${basePath}.md`)
    if (text !== null) {
      content.value = text
      isMd.value = true
      renderedMd.value = marked.parse(text)
      return
    }

    // 5. Fallback: bare .html
    text = await tryFetch(`${basePath}.html`)
    if (text !== null) {
      content.value = text
      isMd.value = false
      return
    }

    content.value = null
  } finally {
    loading.value = false
  }
}

onMounted(loadDoc)
// Reload when route, language, or active SDK changes
watch(() => [props.type, props.path, lang.value, currentSdkId.value], loadDoc)
</script>

<style scoped>
.doc-members {
  margin-top: 2rem;
}

.doc-members__section {
  margin-bottom: 2rem;
}

.doc-members__title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 0.75rem;
  padding-bottom: 0.375rem;
  border-bottom: 1px solid var(--border);
}

.doc-members__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.doc-members__table th {
  text-align: left;
  padding: 0.5rem 0.75rem;
  background: var(--sidebar-bg);
  color: var(--text);
  font-weight: 600;
  border: 1px solid var(--border);
}

.doc-members__table td {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border);
  color: var(--text);
  vertical-align: top;
}

.doc-members__table tr:nth-child(even) td {
  background: var(--sidebar-bg);
}

.doc-members__name code {
  font-family: monospace;
  color: var(--accent);
  background: transparent;
}

.doc-members__icon {
  width: 2rem;
  text-align: center;
  vertical-align: middle;
}

.doc-members__icon svg {
  display: inline-block;
  vertical-align: middle;
}
</style>
