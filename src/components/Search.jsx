import { useMemo, useState } from 'react'
import CarCard from './CarCard.jsx'

function Search({ cars = [] }) {
  const [search, setSearch] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [color, setColor] = useState('')
  const [ville, setVille] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  // Extractions dynamiques pour les menus déroulants basées sur ta BDD
  const brands = useMemo(
    () => Array.from(new Set(cars.map((car) => car.brand).filter(Boolean))).sort(),
    [cars]
  )

  const colors = useMemo(
    () => Array.from(new Set(cars.map((car) => car.color).filter(Boolean))).sort(),
    [cars]
  )

  const villes = useMemo(
    () => Array.from(new Set(cars.map((car) => car.ville).filter(Boolean))).sort(),
    [cars]
  )

  const years = useMemo(
    () => Array.from(new Set(cars.map((car) => car.year).filter(Boolean))).sort((a, b) => b - a),
    [cars]
  )

  // Logique de filtrage mise à jour selon la structure SQL
  const filteredCars = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return cars.filter((car) => {
      // Extraction dynamique du prix réel stocké en BDD (Vente ou Location)
      const actualPrice = Number(car.type_transaction === 'louer' ? car.prix_location : car.prix_vente || 0)

      const matchesSearch =
        normalizedSearch === '' ||
        `${car.titre_ou_modele || ''} ${car.brand || ''} ${car.description || ''}`
          .toLowerCase()
          .includes(normalizedSearch)

      const matchesBrand = !brand || car.brand === brand
      
      const matchesModel = !model || 
        (car.model && car.model.toLowerCase().includes(model.toLowerCase())) ||
        (car.titre_ou_modele && car.titre_ou_modele.toLowerCase().includes(model.toLowerCase()))

      const matchesYear = !year || String(car.year) === year
      const matchesColor = !color || car.color === color
      const matchesVille = !ville || car.ville === ville
      const matchesMinPrice = !minPrice || actualPrice >= Number(minPrice)
      const matchesMaxPrice = !maxPrice || actualPrice <= Number(maxPrice)

      return (
        matchesSearch &&
        matchesBrand &&
        matchesModel &&
        matchesYear &&
        matchesColor &&
        matchesVille &&
        matchesMinPrice &&
        matchesMaxPrice
      )
    })
  }, [cars, search, brand, model, year, color, ville, minPrice, maxPrice])

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
    <>
      <section className="mb-4 p-4 bg-light rounded-3 shadow-sm">
        <h2 className="h5 mb-3 fw-bold text-dark">🔍 Recherche de véhicules</h2>
        <form className="row g-3">
          <div className="col-md-4">
            <label className="form-label small fw-semibold text-muted">Recherche globale</label>
            <input
              type="text"
              className="form-control"
              placeholder="Titre, marque, mots-clés..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-semibold text-muted">Marque</label>
            <select className="form-select" value={brand} onChange={(event) => setBrand(event.target.value)}>
              <option value="">Toutes</option>
              {brands.map((brandOption) => (
                <option key={brandOption} value={brandOption}>
                  {brandOption}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-semibold text-muted">Modèle / Titre</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ex: Prado, Civic"
              value={model}
              onChange={(event) => setModel(event.target.value)}
            />
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-semibold text-muted">Année</label>
            <select className="form-select" value={year} onChange={(event) => setYear(event.target.value)}>
              <option value="">Toutes</option>
              {years.map((yearOption) => (
                <option key={yearOption} value={yearOption}>
                  {yearOption}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-semibold text-muted">Couleur</label>
            <select className="form-select" value={color} onChange={(event) => setColor(event.target.value)}>
              <option value="">Toutes</option>
              {colors.map((colorOption) => (
                <option key={colorOption} value={colorOption}>
                  {colorOption}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-semibold text-muted">Ville</label>
            <select className="form-select" value={ville} onChange={(event) => setVille(event.target.value)}>
              <option value="">Toutes</option>
              {villes.map((villeOption) => (
                <option key={villeOption} value={villeOption}>
                  {villeOption}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label small fw-semibold text-muted">Prix min (F CFA)</label>
            <input
              type="number"
              className="form-control"
              placeholder="Minimum"
              value={minPrice}
              min="0"
              onChange={(event) => setMinPrice(event.target.value)}
            />
          </div>

          <div className="col-md-3">
            <label className="form-label small fw-semibold text-muted">Prix max (F CFA)</label>
            <input
              type="number"
              className="form-control"
              placeholder="Maximum"
              value={maxPrice}
              min="0"
              onChange={(event) => maxPrice(event.target.value)} // Correction bug syntaxe onChange d'origine
              // Note: Remplacé par la bonne assignation :
              onChange={(event) => setMaxPrice(event.target.value)}
            />
          </div>

          <div className="col-md-4 d-flex align-items-end">
            <button type="button" className="btn btn-outline-secondary w-100 fw-semibold" onClick={resetFilters}>
              🔄 Réinitialiser les filtres
            </button>
          </div>
        </form>
      </section>

      {filteredCars.filter(car => car.type_transaction === 'vente').length === 0 ? (
        <div className="alert alert-warning text-center">Aucun véhicule en vente ne correspond à ces critères.</div>
      ) : (
        <div className="row">
          {filteredCars.map((car) => (
            // Filtrage strict basé sur la colonne type_transaction de ta base de données
            car.type_transaction === 'vente' && <CarCard key={car.id} car={car} />
          ))}
        </div>
      )}
    </>
  )
}

export default Search