import { useEffect, useMemo, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import SectionLink from '../components/SectionLink.jsx'
import PropertyCard from '../components/PropertyCard.jsx'

const sectionLabels = {
  acheter: "Achat d'hôtels / maisons",
  louer: "Locations saisonnières",
}

const categories = [
  { id: 'all', label: 'Tous' },
  { id: 'meuble', label: 'Meblées' },
  { id: 'hotel', label: 'Hôtels' },
  { id: 'chambre', label: 'Chambres' },
  { id: 'studio', label: 'Studios' },
  { id: 'vide', label: 'Maisons vides' },
]

function ImmobilierPage() {
  
  const { section } = useParams()
  
  // États pour stocker les données de l'API
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // États pour les filtres de recherche
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [subTypeFilter, setSubTypeFilter] = useState('')
  const [villeFilter, setVilleFilter] = useState('')
  const [quartierFilter, setQuartierFilter] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  const currentSection = section || 'louer'
  const sectionTitle = sectionLabels[currentSection] || 'Immobilier'
  const isRentSection = currentSection === 'louer'
  const isSaleSection = currentSection === 'acheter'

  // Récupération des données depuis l'API Back-end Node.js - CORRIGÉE
  useEffect(() => {
    let isMounted = true

    async function fetchProperties() {
      try {
        const response = await fetch('http://localhost:3000/api/annonces?categorie=immobilier')
        if (!response.ok) {
          throw new Error('Impossible de charger le catalogue immobilier.')
        }
        const result = await response.json()
        
        if (isMounted) {
          // CORRECTION ICI : On extrait result.data qui contient le tableau d'annonces
          if (result.success && Array.isArray(result.data)) {
            setProperties(result.data)
          } else {
            setProperties([]) // Sécurité : évite le crash si l'API renvoie une structure vide
            console.error("Format de réponse inattendu ou échec de l'API")
          }
          setLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Erreur serveur interne')
          setLoading(false)
        }
      }
    }

    fetchProperties()

    return () => {
      isMounted = false
    }
  }, [])

  // FONCTION DE FILTRAGE ULTRA-ROBUSTE ADAPTÉE AUX DONNÉES BACKEND
  const getFilteredPropertiesExcluding = useCallback((excludeFilterName) => {
    const normalizedSearch = search.trim().toLowerCase()

    // Sécurité supplémentaire : si 'properties' n'est pas encore un tableau, on retourne un tableau vide
    if (!Array.isArray(properties)) return []

    return properties.filter((item) => {
      // Filtrage basé sur le champ de la table MySQL : type_transaction ('louer' ou 'acheter')
      if (isRentSection && item.type_transaction !== 'louer') return false
      if (isSaleSection && item.type_transaction !== 'acheter') return false

      // Filtrage par catégorie principale
      if (excludeFilterName !== 'category' && category !== 'all') {
        const categoryMatch = item.category === category
        const subTypeMatch = item.subType === category
        const emptyHouseMatch = category === 'vide' && item.type_transaction === 'louer' && item.furnished === false
        if (!categoryMatch && !subTypeMatch && !emptyHouseMatch) return false
      }

      // Filtres géographiques et structurels
      if (excludeFilterName !== 'subType' && subTypeFilter && item.subType !== subTypeFilter) return false
      if (excludeFilterName !== 'ville' && villeFilter && item.ville !== villeFilter) return false
      if (excludeFilterName !== 'quartier' && quartierFilter && item.quartier !== quartierFilter) return false

      // Filtrage par prix (Prix unifié provenant de MySQL)
      const priceValue = Number(item.price ?? 0)
      if (excludeFilterName !== 'price' && minPrice && priceValue < Number(minPrice)) return false
      if (excludeFilterName !== 'price' && maxPrice && priceValue > Number(maxPrice)) return false

      // Moteur de recherche plein texte sur les attributs
      if (excludeFilterName !== 'search' && normalizedSearch) {
        const searchText = `${item.title || ''} ${item.ville || ''} ${item.quartier || ''} ${item.location || ''} ${item.description || ''} ${item.category || ''} ${item.subType || ''} ${item.goudron || ''}`.toLowerCase()
        if (!searchText.includes(normalizedSearch)) return false
      }

      return true
    })
  }, [properties, search, category, subTypeFilter, villeFilter, quartierFilter, minPrice, maxPrice, isRentSection, isSaleSection])

  // GÉNÉRATION DES OPTIONS DYNAMIQUES DU FORMULAIRE
  const subTypes = useMemo(() => {
    const filtered = getFilteredPropertiesExcluding('subType')
    return Array.from(new Set(filtered.map((item) => item.subType).filter(Boolean))).sort()
  }, [getFilteredPropertiesExcluding])

  const villes = useMemo(() => {
    const filtered = getFilteredPropertiesExcluding('ville')
    return Array.from(new Set(filtered.map((item) => item.ville).filter(Boolean))).sort()
  }, [getFilteredPropertiesExcluding])

  const quartiers = useMemo(() => {
    const filtered = getFilteredPropertiesExcluding('quartier')
    return Array.from(new Set(filtered.map((item) => item.quartier).filter(Boolean))).sort()
  }, [getFilteredPropertiesExcluding])

  // CATALOGUE FINAL FILTRÉ ÉPURÉ
  const filteredProperties = useMemo(() => {
    return getFilteredPropertiesExcluding(null)
  }, [getFilteredPropertiesExcluding])

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory)
    setSubTypeFilter('')
    setVilleFilter('')
    setQuartierFilter('')
    setMinPrice('')
    setMaxPrice('')
  }

  const handleResetAll = () => {
    setCategory('all')
    search && setSearch('')
    setSubTypeFilter('')
    setVilleFilter('')
    setQuartierFilter('')
    setMinPrice('')
    setMaxPrice('')
  }

  return (
    <div className="container py-5 text-dark">
      <header className="text-center mb-5">
        <p className="text-uppercase text-success fw-bold mb-2">🏠 Immobilier</p>
        <h1 className="mb-3 fw-bold">{sectionTitle}</h1>
        <p className="text-secondary">
          Découvrez nos offres immobilières : meublés, hôtels, studios, chambres et locations de maisons vides.
        </p>
      </header>

      <div className="mb-4">
        {/* Navigation inter-sections */}
        <div className="d-flex flex-wrap gap-2 mb-3">
          <SectionLink action="louer" className={`btn btn-sm fw-semibold px-3 ${currentSection === 'louer' ? 'btn-success text-white' : 'btn-outline-secondary'}`}>
            🏠 Locations
          </SectionLink>
          <SectionLink action="acheter" className={`btn btn-sm fw-semibold px-3 ${currentSection === 'acheter' ? 'btn-success text-white' : 'btn-outline-secondary'}`}>
            🔑 Achat
          </SectionLink>
        </div>

        {(isRentSection || isSaleSection) && (
          <section className="mb-4 p-4 bg-light rounded-3 shadow-sm border">
            <h2 className="h5 mb-3 fw-bold">🔍 Recherche avancée intelligente</h2>
            <div className="row g-3">
              
              <div className="col-md-4">
                <label className="form-label small fw-semibold text-muted">Mot-clé libre</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Titre, description, quartier..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <div className="col-md-2">
                <label className="form-label small fw-semibold text-muted">Type de bien</label>
                <select className="form-select text-success fw-bold" value={category} onChange={(event) => handleCategoryChange(event.target.value)}>
                  {categories.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-2">
                <label className="form-label small fw-semibold text-muted">Sous-type</label>
                <select className="form-select" value={subTypeFilter} onChange={(event) => setSubTypeFilter(event.target.value)}>
                  <option value="">Tous ({subTypes.length})</option>
                  {subTypes.map((subType) => (
                    <option key={subType} value={subType}>{subType}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-2">
                <label className="form-label small fw-semibold text-muted">Ville</label>
                <select className="form-select" value={villeFilter} onChange={(event) => { setVilleFilter(event.target.value); setQuartierFilter(''); }}>
                  <option value="">Toutes</option>
                  {villes.map((ville) => (
                    <option key={ville} value={ville}>{ville}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-2">
                <label className="form-label small fw-semibold text-muted">Quartier</label>
                <select className="form-select" value={quartierFilter} onChange={(event) => setQuartierFilter(event.target.value)}>
                  <option value="">Tous</option>
                  {quartiers.map((quartier) => (
                    <option key={quartier} value={quartier}>{quartier}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-2">
                <label className="form-label small fw-semibold text-muted">Prix minimum (FCFA)</label>
                <input
                  type="number"
                  className="form-control"
                  min="0"
                  value={minPrice}
                  onChange={(event) => setMinPrice(event.target.value)}
                />
              </div>

              <div className="col-md-2">
                <label className="form-label small fw-semibold text-muted">Prix maximum (FCFA)</label>
                <input
                  type="number"
                  className="form-control"
                  min="0"
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value)}
                />
              </div>

              <div className="col-md-4 d-flex align-items-end">
                <button
                  type="button"
                  className="btn btn-outline-danger w-100 fw-medium"
                  onClick={handleResetAll}
                >
                  🗑️ Réinitialiser tous les filtres
                </button>
              </div>

              <div className="col-12">
                <div className="text-muted small fw-semibold">
                  {!loading && `${filteredProperties.length} bien(s) disponible(s) correspondant à vos critères.`}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Rendu conditionnel des états de l'API et du catalogue */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Chargement de l'immobilier...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger text-center border-danger shadow-sm" role="alert">
          ⚠️ Une erreur est survenue lors du chargement : {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {isRentSection || isSaleSection ? (
            filteredProperties.length === 0 ? (
              <div className="alert alert-warning shadow-sm text-center">
                Aucun bien immobilier ne correspond à vos filtres de recherche actuels.
              </div>
            ) : (
              <div className="row g-4">
                {filteredProperties.map((property) => (
                  <PropertyCard key={`prop-card-${property.id}`} property={property} />
                ))}
              </div>
            )
          ) : (
            <div className="alert alert-info text-center">
              Veuillez sélectionner une rubrique de navigation valide ci-dessus.
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ImmobilierPage