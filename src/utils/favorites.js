const FAVORITES_KEY = 'favorites'

export function getSavedFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || []
  } catch {
    return []
  }
}

export function saveFavorites(items) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(items))
}

export function isFavorite(id, type = 'generic') {
  return getSavedFavorites().some((item) => item.id === id && item.type === type)
}

export function toggleFavorite(item, type = 'generic') {
  const favorites = getSavedFavorites()
  const existsIndex = favorites.findIndex((fav) => fav.id === item.id && fav.type === type)
  if (existsIndex >= 0) {
    const next = [...favorites.slice(0, existsIndex), ...favorites.slice(existsIndex + 1)]
    saveFavorites(next)
    window.dispatchEvent(new Event('favorites-updated'))
    return false
  }

  const next = [...favorites, { id: item.id, type, item }]
  saveFavorites(next)
  window.dispatchEvent(new Event('favorites-updated'))
  return true
}
