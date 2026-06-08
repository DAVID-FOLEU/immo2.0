import { useEffect, useState } from 'react'
import Search from '../components/Search.jsx'

function Acheter() {
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function fetchCars() {
      try {
        // Modifie l'URL si ton API tourne sur un autre port (ex: http://localhost:3000/api/cars)
        const response = await fetch('http://localhost:3000/api/cars')
        
        if (!response.ok) {
          throw new Error('Impossible de charger les véhicules.')
        }
        
        const data = await response.json()
        
        if (isMounted) {
          // Filtrage strict basé sur la structure réelle de ta base de données : type_transaction égal à 'vente'
          const forSale = data.filter(car => car.type_transaction === 'vente')
          setCars(forSale)
          setLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la récupération des données.')
          setLoading(false)
        }
      }
    }

    fetchCars()

    // Nettoyage au démontage pour éviter les fuites de mémoire si l'utilisateur change de page rapidement
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="container py-5">
      <header className="text-center mb-5">
        <p className="text-uppercase text-warning fw-bold mb-2">Acheter une voiture</p>
        <h1 className="mb-3 fw-bold">Nos meilleures offres</h1>
        <p className="text-secondary">
          Parcourez nos annonces et utilisez les filtres pour trouver le véhicule en vente qui correspond à votre budget et à vos besoins.
        </p>
      </header>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Chargement des véhicules...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger text-center shadow-sm" role="alert">
          ⚠️ {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {cars.length === 0 ? (
            <div className="alert alert-warning text-center shadow-sm">
              Aucun véhicule disponible à la vente pour le moment.
            </div>
          ) : (
            <Search cars={cars} />
          )}
        </>
      )}
    </div>
  )
}

export default Acheter