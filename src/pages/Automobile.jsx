import { useEffect, useMemo, useState, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import CarCard from '../components/CarCard.jsx'
import CardLocation from '../components/CardLocation.jsx'

function Automobile() {
  const { section } = useParams()
  const currentSection = section || 'all'

  // ÉTATS DES DONNÉES (Issus de l'API Node/MySQL)
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // ÉTATS DES FILTRES (Ils restent intacts en mémoire)
  const [search, setSearch] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [color, setColor] = useState('')
  const [ville, setVille] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  // API FETCH : S'exécute une seule fois au montage
  useEffect(() => {
    let isMounted = true

    async function fetchCars() {
      try {
        const res = await fetch('http://localhost:3000/api/annonces?categorie=automobile')
        if (!res.ok) throw new Error('Erreur lors du chargement des véhicules')
        const result = await res.json()
        
        if (isMounted) {
          if (result.success && Array.isArray(result.data)) {
            setCars(result.data)
          } else {
            setCars([])
            console.error("Format de réponse inattendu ou échec de l'API")
          }
          setLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : String(err))
          setLoading(false)
        }
      }
    }
    fetchCars()

    return () => {
      isMounted = false
    }
  }, [])

  // FONCTION DE FILTRAGE PAR CRITÈRES
  const getFilteredCarsExcluding = useCallback((excludeFilterName) => {
    const normalizedSearch = search.trim().toLowerCase()

    if (!Array.isArray(cars)) return []

    return cars.filter((car) => {
      // 1. Recherche textuelle globale
      if (excludeFilterName !== 'search' && normalizedSearch !== '') {
        const matchesSearch = `${car.titre_ou_modele || ''} ${car.brand || ''} ${car.description || ''}`
          .toLowerCase()
          .includes(normalizedSearch)
        if (!matchesSearch) return false
      }

      // 2. Filtres par critères
      if (excludeFilterName !== 'brand' && brand && car.brand !== brand) return false
      
      if (excludeFilterName !== 'model' && model) {
        const matchesModel = 
          (car.model && car.model.toLowerCase().includes(model.toLowerCase())) ||
          (car.titre_ou_modele && car.titre_ou_modele.toLowerCase().includes(model.toLowerCase()))
        if (!matchesModel) return false
      }
      
      if (excludeFilterName !== 'year' && year && String(car.year) !== year) return false
      if (excludeFilterName !== 'color' && color && car.color !== color) return false
      if (excludeFilterName !== 'ville' && ville && car.ville !== ville) return false

      // 3. Fourchettes de prix
      const actualPrice = car.type_transaction === 'louer' 
        ? Number(car.prix_location || 0) 
        : Number(car.price || 0)

      if (excludeFilterName !== 'price' && minPrice && actualPrice < Number(minPrice)) return false
      if (excludeFilterName !== 'price' && maxPrice && actualPrice > Number(maxPrice)) return false

      return true
    })
  }, [cars, search, brand, model, year, color, ville, minPrice, maxPrice])

  // LISTES DÉROULANTES DYNAMIQUES (MEMOÏSÉES)
  const villes = useMemo(() => {
    const availableCars = getFilteredCarsExcluding('ville')
    return Array.from(new Set(availableCars.map((car) => car.ville).filter(Boolean))).sort()
  }, [getFilteredCarsExcluding])

  const brands = useMemo(() => {
    const availableCars = getFilteredCarsExcluding('brand')
    return Array.from(new Set(availableCars.map((car) => car.brand).filter(Boolean))).sort()
  }, [getFilteredCarsExcluding])

  const colors = useMemo(() => {
    const availableCars = getFilteredCarsExcluding('color')
    return Array.from(new Set(availableCars.map((car) => car.color).filter(Boolean))).sort()
  }, [getFilteredCarsExcluding])

  const years = useMemo(() => {
    const availableCars = getFilteredCarsExcluding('year')
    return Array.from(new Set(availableCars.map((car) => car.year).filter(Boolean))).sort((a, b) => b - a)
  }, [getFilteredCarsExcluding])

  // APPLICATION DU FILTRE CONTEXTUEL DE L'ONGLET REÇU PAR L'URL
  const filtered = useMemo(() => {
    const baseFiltered = getFilteredCarsExcluding(null)
    
    return baseFiltered.filter((car) => {
      if (currentSection === 'acheter' && car.type_transaction !== 'vente') return false
      if (currentSection === 'louer' && car.type_transaction !== 'louer') return false
      return true
    })
  }, [getFilteredCarsExcluding, currentSection])

  // ACTION DE RÉINITIALISATION
  const resetFilters = () => {
    setSearch('')
    setBrand('')
    setModel('')
    setYear('')
    setColor('')
    setVille('')
    setMinPrice('')
    setMaxPrice('')
  }

  return (
    <div className="container py-5">
      <header className="text-center mb-5">
        <p className="text-uppercase text-warning fw-bold mb-2">🚗 Parc Automobile</p>
        <h1 className="mb-3 fw-bold">Acheter ou louer un véhicule</h1>
      </header>

      {/* Onglets de navigation par sections (Toujours visibles) */}
      <div className="mb-4 d-flex gap-2 flex-wrap">
        <Link to="/automobile/acheter" className={`btn btn-sm px-3 fw-semibold ${currentSection === 'acheter' ? 'btn-warning' : 'btn-outline-secondary'}`}>Acheter</Link>
        <Link to="/automobile/louer" className={`btn btn-sm px-3 fw-semibold ${currentSection === 'louer' ? 'btn-warning' : 'btn-outline-secondary'}`}>Louer</Link>
        <Link to="/automobile" className={`btn btn-sm px-3 fw-semibold ${currentSection === 'all' ? 'btn-warning' : 'btn-outline-secondary'}`}>Tous</Link>
      </div>

      {/* Formulaire de recherche (Reste en place et fonctionnel pendant le chargement) */}
      <section className="mb-5 p-4 bg-light rounded-3 shadow-sm border border-light text-dark">
        <h2 className="h5 mb-3 fw-bold">🔍 Recherche intelligente (Filtres croisés)</h2>
        <form className="row g-3">
          <div className="col-md-4">
            <label className="form-label small fw-semibold text-muted">Mot-clé général</label>
            <input
              type="text"
              className="form-control"
              placeholder="Recherche libre, titre, mots clés..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-semibold text-muted">Ville</label>
            <select className="form-select" value={ville} onChange={(e) => setVille(e.target.value)}>
              <option value="">Toutes ({villes.length})</option>
              {villes.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-semibold text-muted">Marque disponible</label>
            <select className="form-select" value={brand} onChange={(e) => setBrand(e.target.value)}>
              <option value="">Toutes ({brands.length})</option>
              {brands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-semibold text-muted">Modèle / Titre</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ex: Prado, Accent"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-semibold text-muted">Année</label>
            <select className="form-select" value={year} onChange={(e) => setYear(e.target.value)}>
              <option value="">Toutes ({years.length})</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-semibold text-muted">Couleur</label>
            <select className="form-select" value={color} onChange={(e) => setColor(e.target.value)}>
              <option value="">Toutes ({colors.length})</option>
              {colors.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-semibold text-muted">Prix min (F CFA)</label>
            <input type="number" className="form-control" value={minPrice} min="0" placeholder="Minimum" onChange={(e) => setMinPrice(e.target.value)} />
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-semibold text-muted">Prix max (F CFA)</label>
            <input type="number" className="form-control" value={maxPrice} min="0" placeholder="Maximum" onChange={(e) => setMaxPrice(e.target.value)} />
          </div>

          <div className="col-md-4 d-flex align-items-end">
            <button type="button" className="btn btn-outline-danger w-100 fw-semibold" onClick={resetFilters}>
              🗑️ Réinitialiser les filtres
            </button>
          </div>
        </form>
      </section>

      {/* GESTION DU RENDU DYNAMIQUE DES RÉSULTATS */}
      {loading ? (
        // Le chargement s'affiche uniquement à la place des cartes
        <div className="text-center py-5 my-4">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Mise à jour du catalogue...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger shadow-sm">⚠️ {error}</div>
      ) : filtered.length === 0 ? (
        <div className="alert alert-warning text-center shadow-sm">Aucun véhicule ne correspond à vos critères actuels.</div>
      ) : currentSection === 'all' ? (
        <>
          <h3 className="mb-3 fw-bold text-dark">🛒 Véhicules à Vendre</h3>
          <div className="row g-4 mb-5">
            {filtered.filter((c) => c.type_transaction === 'vente').length === 0 ? (
              <p className="text-muted small ms-2">Aucun résultat disponible pour la vente avec ces filtres.</p>
            ) : (
              filtered.filter((c) => c.type_transaction === 'vente').map((car) => (
                <CarCard key={car.id} car={car} />
              ))
            )}
          </div>

          <h3 className="mb-3 fw-bold text-dark">🔑 Véhicules en Location</h3>
          <div className="row g-4">
            {filtered.filter((c) => c.type_transaction === 'louer').length === 0 ? (
              <p className="text-muted small ms-2">Aucun résultat disponible pour la location avec ces filtres.</p>
            ) : (
              filtered.filter((c) => c.type_transaction === 'louer').map((car) => (
                <CardLocation key={car.id} car={car} />
              ))
            )}
          </div>
        </>
      ) : currentSection === 'acheter' ? (
        <div className="row g-4">
          {filtered.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      ) : (
        <div className="row g-4">
          {filtered.map((car) => (
            <CardLocation key={car.id} car={car} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Automobile;