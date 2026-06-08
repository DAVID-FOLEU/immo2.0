import { useEffect, useState } from 'react'
import SearchLocation from '../components/SearchLocation.jsx'

function Louer() {
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
          // Filtrage strict basé sur la colonne réelle de ta table MySQL : type_transaction égal à 'louer'
          const forRent = data.filter(car => car.type_transaction === 'louer')
          setCars(forRent)
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

    // Nettoyage au démontage pour éviter les mises à jour d'état sur un composant démonté
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="container py-5 text-dark">
      <header className="text-center mb-5">
        <p className="text-uppercase text-success fw-bold mb-2">🚗 Location de véhicules</p>
        <h1 className="mb-3 fw-bold">Louez la voiture qu'il vous faut</h1>
        <p className="text-secondary">
          Découvrez notre gamme de véhicules en location courte ou longue durée. Tarifs compétitifs et services premium.
        </p>
      </header>

      {/* États de chargement et d'erreurs stylisés avec Bootstrap */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status">
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
              Aucun véhicule disponible à la location pour le moment.
            </div>
          ) : (
            <SearchLocation cars={cars} />
          )}
        </>
      )}

      {/* Section des avantages de la location */}
      <section className="mb-4 mt-5 p-4 bg-success bg-opacity-10 rounded-3 border border-success border-opacity-25">
        <h2 className="mb-3 fw-bold h4">Avantages de la location</h2>
        <div className="row g-3">
          <div className="col-md-6">
            <h5 className="text-success fw-semibold">✓ Flexibilité maximale</h5>
            <p className="text-muted small">Durées courtes (jours), moyennes (semaines) ou longues (mois). Sans engagement.</p>
          </div>
          <div className="col-md-6">
            <h5 className="text-success fw-semibold">✓ Assurance comprise</h5>
            <p className="text-muted small">Couverture complète incluse dans le prix. Pas de mauvaise surprise.</p>
          </div>
          <div className="col-md-6">
            <h5 className="text-success fw-semibold">✓ Entretien gratuit</h5>
            <p className="text-muted small">Tous les frais d'entretien et réparations sont pris en charge.</p>
          </div>
          <div className="col-md-6">
            <h5 className="text-success fw-semibold">✓ Service client 24/7</h5>
            <p className="text-muted small">Support disponible à tout moment pour vos questions ou problèmes.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Louer