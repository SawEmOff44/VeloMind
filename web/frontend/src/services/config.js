const trimTrailingSlash = (value) => String(value || '').replace(/\/+$/, '')

const normalizeApiBase = (value) => {
  const normalized = trimTrailingSlash(value || '/api')

  if (!normalized || normalized === '/') {
    return '/api'
  }

  return normalized.endsWith('/api') ? normalized : `${normalized}/api`
}

export const API_BASE = normalizeApiBase(
  import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL
)

export const buildApiUrl = (path = '') =>
  `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`
