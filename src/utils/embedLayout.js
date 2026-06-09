import { attendanceRouteNameSet } from '@/constants/attendanceRoutes'

const EMBED_ALLOWED_ROUTE_NAMES = new Set([
  'contract-management',
  'contract-detail',
  'businesstrip-management',
  ...attendanceRouteNameSet,
])

export function isEmbedAllowedRoute(route) {
  if (!route) {
    return false
  }
  if (EMBED_ALLOWED_ROUTE_NAMES.has(route.name)) {
    return true
  }
  if (route.path?.startsWith('/hrm/my-attendance')) {
    return true
  }
  if (route.path?.startsWith('/management/contract-management')) {
    return true
  }
  if (route.path?.startsWith('/businesstrip-management')) {
    return true
  }
  return false
}

/**
 * 判断单个路由是否需要无壳展示。
 * 优先级：query > meta > iframe
 */
export function shouldUseEmbedLayout(route) {
  if (route.query?.layout === 'no') {
    return { embed: true, source: 'query' }
  }
  if (route.meta?.embed === true) {
    return { embed: true, source: 'meta' }
  }
  if (typeof window !== 'undefined' && window.self !== window.top) {
    return { embed: true, source: 'iframe' }
  }
  return { embed: false, source: null }
}

export function resolveEmbedLayout(route) {
  const { embed, source } = shouldUseEmbedLayout(route)
  if (!embed) {
    return { shouldEmbed: false, source: null }
  }
  if (!isEmbedAllowedRoute(route)) {
    return { shouldEmbed: false, source: null }
  }
  return { shouldEmbed: true, source }
}
