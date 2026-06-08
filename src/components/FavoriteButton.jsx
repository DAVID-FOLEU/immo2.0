import { useEffect, useState } from 'react'
import axios from 'axios'
import { isFavorite, toggleFavorite } from '../utils/favorites.js'

function FavoriteButton({ item, type = 'car', onToggle, className = '' }) {
  const token = localStorage.getItem('token') 

  const [favorite, setFavorite] = useState(() => {
    if (!token) {
      return isFavorite(item.id, type)
    }
    return false
  })
  
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) return

    let isMounted = true
    const checkFavoriteStatus = async () => {
      try {
        const response = await axios.get(`/api/favorites/check/${item.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (isMounted) {
          setFavorite(response.data.isFavorite)
        }
      } catch (err) {
        console.error("Erreur vérification favori en BDD:", err)
        if (isMounted) {
          setFavorite(isFavorite(item.id, type))
        }
      }
    }

    checkFavoriteStatus()

    return () => {
      isMounted = false
    }
  }, [item.id, type, token])

  const handleClick = async (e) => {
    // CRITICAL: stopPropagation empêche de déclencher le Link de la CarCard parente
    e.stopPropagation()
    e.preventDefault() 
    if (loading) return

    if (token) {
      setLoading(true)
      try {
        const response = await axios.post(`/api/favorites/toggle`, 
          { annonceId: item.id },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const nextState = response.data.isFavorite
        setFavorite(nextState)
        if (onToggle) onToggle(nextState)
      } catch (err) {
        console.error("Erreur lors de la mise à jour du favori:", err)
        alert("Impossible de mettre à jour vos favoris.")
      } finally {
        setLoading(false)
      }
    } else {
      const nextState = toggleFavorite(item, type)
      setFavorite(nextState)
      if (onToggle) onToggle(nextState)
    }
  }

  return (
    <button
      className={`custom-fav-btn ${favorite ? 'is-active' : ''} ${className}`}
      onClick={handleClick}
      disabled={loading}
      aria-pressed={favorite}
      aria-label={favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      {loading ? (
        <span className="spinner-border spinner-border-sm text-light" role="status" aria-hidden="true"></span>
      ) : (
        /* Utilisation d'un seul SVG dont le comportement (remplissage/bordure) est géré via le CSS */
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="heart-icon">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      )}
    </button>
  )
}

export default FavoriteButton