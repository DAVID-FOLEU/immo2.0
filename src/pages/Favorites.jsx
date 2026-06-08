import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import Button from 'react-bootstrap/Button'
import PropertyCard from '../components/PropertyCard.jsx'
import CarCard from '../components/CarCard.jsx'
import CardLocation from '../components/CardLocation.jsx'
import { getSavedFavorites } from '../utils/favorites.js'

function Favorites() {
  const token = localStorage.getItem('token')
  const [favorites, setFavorites] = useState(getSavedFavorites())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('') // Résolu : Maintenant affiché en cas de problème

  useEffect(() => {
    const updateFavorites = () => {
      setFavorites(getSavedFavorites())
    }

    const fetchServerFavorites = async () => {
      if (!token) return
      setLoading(true)
      setError('') // Réinitialise l'erreur avant une nouvelle tentative
      try {
        const response = await axios.get('/api/favorites', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (response.data?.success) {
          setFavorites(response.data.data.map((row) => ({ type: row.type, item: row })))
          return
        }
      } catch (err) {
        console.error('Erreur récupération favoris serveur :', err)
        setError('Impossible de charger les favoris synchronisés depuis le serveur.')
      } finally {
        setLoading(false)
      }
    }

    fetchServerFavorites()

    // Écouteur pour mettre à jour les favoris en temps réel lors d'un clic sur FavoriteButton
    window.addEventListener('favorites-updated', updateFavorites)
    return () => window.removeEventListener('favorites-updated', updateFavorites)
  }, [token]) // Résolu : 'token' a été correctement ajouté au tableau des dépendances

  // Extraction propre des items sauvegardés
  const propertyFavorites = favorites
    .filter((fav) => fav.type === 'property')
    .map((fav) => (fav.item ? fav.item : fav))
  const carFavorites = favorites
    .filter((fav) => fav.type === 'car')
    .map((fav) => (fav.item ? fav.item : fav))

  return (
    <div className="container py-5 text-dark">
      <header className="mb-5 text-center">
        <p className="text-uppercase text-warning fw-bold mb-2">💖 Favoris</p>
        <h1 className="mb-3 fw-bold">Vos biens préférés</h1>
        <p className="text-secondary mb-0">
          Retrouvez ici tous les véhicules et biens immobiliers que vous avez ajoutés à vos favoris.
        </p>
      </header>

      {/* Ajout de la gestion d'affichage de l'erreur réseau ou serveur */}
      {error && (
        <div className="alert alert-danger text-center p-3 mb-4 rounded-3 small shadow-sm border-danger">
          ⚠️ <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5 bg-light rounded-3 shadow-sm border">
          <p className="fs-5 mb-3 text-muted">Chargement de vos favoris...</p>
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-5 bg-light rounded-3 shadow-sm border">
          <p className="fs-5 mb-3 text-muted">Vous n’avez encore ajouté aucun favori.</p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Button as={Link} to="/automobile" variant="dark" className="fw-semibold px-4">
              🚗 Parcourir l'automobile
            </Button>
            <Button as={Link} to="/immobilier" variant="warning" className="fw-semibold px-4">
              🏢 Explorer l'immobilier
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* SECTION : IMMOBILIER */}
          {propertyFavorites.length > 0 && (
            <section className="mb-5">
              <div className="border-bottom pb-2 mb-4">
                <h2 className="h4 mb-1 fw-bold">🏠 Biens immobiliers</h2>
                <p className="text-muted small mb-0">{propertyFavorites.length} favori(s) trouvé(s)</p>
              </div>
              <div className="row g-4">
                {propertyFavorites.map((property) => (
                  <PropertyCard key={`fav-prop-${property.id}`} property={property} />
                ))}
              </div>
            </section>
          )}

          {/* SECTION : AUTOMOBILE */}
          {carFavorites.length > 0 && (
            <section className="mb-5">
              <div className="border-bottom pb-2 mb-4">
                <h2 className="h4 mb-1 fw-bold">🚗 Véhicules</h2>
                <p className="text-muted small mb-0">{carFavorites.length} véhicule(s) en favoris</p>
              </div>
              <div className="row g-4">
                {carFavorites.map((car) => {
                  if (car.type_transaction === 'louer') {
                    return (
                      <CardLocation key={`fav-car-${car.id}`} car={car} />
                    )
                  } else {
                    return (
                      <CarCard key={`fav-car-${car.id}`} car={car} />
                    )
                  }
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}

export default Favorites