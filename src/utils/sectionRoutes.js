const SECTION_PREFIXES = {
  automobile: '/automobile',
  immobilier: '/immobilier',
}

export function getSectionFromPath(pathname) {
  if (pathname.startsWith('/immobilier')) return 'immobilier'
  if (pathname.startsWith('/automobile')) return 'automobile'
  return undefined
}

export function buildSectionPath(action, section = 'automobile') {
  const normalizedSection = SECTION_PREFIXES[section] ? section : 'automobile'
  const prefix = SECTION_PREFIXES[normalizedSection]

  if (typeof action !== 'string') {
    return action
  }

  if (action.startsWith('/')) {
    return action
  }

  if (action === 'all') {
    return prefix
  }

  if (action === 'automobile' || action === 'immobilier') {
    return SECTION_PREFIXES[action]
  }

  if (['acheter', 'louer', 'estimer', 'investir'].includes(action)) {
    return `${prefix}/${action}`
  }

  return `/${action}`
}
