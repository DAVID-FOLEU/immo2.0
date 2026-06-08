import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Carousel from 'react-bootstrap/Carousel'
import Button from 'react-bootstrap/Button'
import properties from '../data/immobilier.json'
import FavoriteButton from '../components/FavoriteButton.jsx'

function PropertyDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Récupération du bien immobilier correspondant à l'ID de l'URL
  const property = useMemo(
    () => properties.find((item) => String(item.id) === String(id)),
    [id]
  )

  const [durationType, setDurationType] = useState('day')
  const [durationCount, setDurationCount] = useState(1)

  // CLÉ DE LA CORRECTION : Détection du changement d'ID directement pendant le rendu
  // Cela évite le useEffect et résout instantanément l'erreur de cascade ESLint
  const [prevId, setPrevId] = useState(id)
  if (id !== prevId) {
    setPrevId(id)
    setDurationCount(1) // Réinitialisation de la quantité
    if (property && !property.hourlyPrice) {
      setDurationType('day') // Force l'unité en jour(s) si pas de tarif horaire
    }
  }

  // Sécurité si l'ID ne correspond à aucun bien
  if (!property) {
    return (
      <div className="container py-5 text-dark">
        <div className="alert alert-warning shadow-sm">Bien immobilier introuvable.</div>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          ← Retour
        </Button>
      </div>
    )
  }

  // Gestion des fallbacks pour l'affichage du prix de base en FCFA
  const basePrice = property.price ?? property.dailyPrice ?? property.hourlyPrice ?? 0
  const priceText = `${basePrice.toLocaleString('fr-FR')} FCFA ${property.pricePeriod === 'nuit' ? '/ nuit' : '/ mois'}`

  // Dictionnaire pour mapper proprement les catégories vers les labels UI
  const categoryLabel = {
    meuble: 'Meublée',
    hotel: 'Hôtel',
    chambre: 'Chambre',
    studio: 'Studio',
    vide: 'Maison vide',
  }[property.category] || 'Bien immobilier'

  // Flags de catégorie pour le contrôle de l'affichage conditionnel
  const isMeubleCategory = property.category === 'meuble'
  const isHotelCategory = property.category === 'hotel'

  // Variables de calcul pour l'estimation de la durée du séjour
  const unitPrice = durationType === 'hour' ? (property.hourlyPrice ?? 0) : (property.dailyPrice ?? basePrice)
  const totalPrice = unitPrice * durationCount
  const durationLabel = durationType === 'hour' ? 'Heure(s)' : 'Jour(s)'

  return (
    <div className="container py-5 text-dark">
      <Button variant="outline-secondary" size="sm" className="mb-4 fw-medium" onClick={() => navigate(-1)}>
        ← Retour
      </Button>

      {/* Section principale : alignement du carrousel et de la fiche d'informations */}
      <div className="row gy-4 mb-4">
        {/* Bloc Carrousel */}
        <div className="col-12 col-lg-7">
          <div className="card shadow-sm border h-100 rounded-3 overflow-hidden">
            <Carousel interval={null} variant="white" className="h-100">
              {(property.images || []).map((src, index) => (
                <Carousel.Item key={index} style={{ height: '400px' }}>
                  <img
                    className="d-block w-100 h-100"
                    src={src}
                    alt={`${property.title} - image ${index + 1}`}
                    style={{ objectFit: 'cover' }}
                  />
                </Carousel.Item>
              ))}
            </Carousel>
          </div>
        </div>

        {/* Fiche de détails textuels */}
        <div className="col-12 col-lg-5">
          <div className="p-4 bg-light rounded-3 shadow-sm border h-100 d-flex flex-column justify-content-between">
            <div>
              <span className="badge bg-success text-white mb-3 px-3 py-2 text-uppercase fs-7 fw-semibold">{categoryLabel}</span>
              <h1 className="h3 fw-bold mb-2 text-success">{property.title}</h1>
              
              <div className="text-muted small mb-4">
                <div className="mb-2"><strong>📍 Ville :</strong> {property.ville || property.location}</div>
                <div className="mb-2"><strong>🏢 Quartier :</strong> {property.quartier || 'N/C'}</div>
                <div className="mb-2"><strong>🛣️ Distance du goudron :</strong> {property.goudron || 'N/C'}</div>
              </div>

              <div className="mb-4 align-items-center d-flex justify-content-between">
                <span className="fs-4 fw-bold text-success">{priceText}</span>
                {/* Durée d'engagement minimale uniquement pour les locations standards (hors meublés / hôtels) */}
                {property.category !== 'meuble' && property.category !== 'hotel' && property.numMois && (
                  <span className="badge bg-outline-success border border-success text-success fs-6 fw-semibold px-2 py-1">
                    Minimum {property.numMois} mois
                  </span>
                )}
              </div>

              {property.category === 'meuble' && property.subType && (
                <div className="mb-3 small text-dark">
                  <strong>Type de meublé :</strong> {property.subType}
                </div>
              )}

              <p className="text-secondary small border-top pt-3 line-height-lg">{property.description}</p>
            </div>

            <div className="d-flex gap-2 flex-wrap pt-3 border-top mt-3">
              <FavoriteButton item={property} type="property" />
              <Button variant="success" className="flex-grow-1 fw-bold text-white shadow-sm" onClick={() => navigate('/immobilier/louer')}>
                🏠 Voir d'autres biens
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Calculateur dynamique de budget : réservé exclusivement aux meublés et hôtels */}
      {(isMeubleCategory || isHotelCategory) && (
        <div className="row">
          <div className="col-12">
            <div className="p-4 bg-white rounded-3 border shadow-sm">
              <h2 className="h5 fw-bold mb-3 text-dark">🗓️ Planifier et calculer la durée de séjour</h2>
              
              <div className="row g-4 align-items-center">
                <div className="col-12 col-sm-4">
                  <label className="form-label small fw-bold text-muted">Choisir l'unité de temps</label>
                  <select
                    className="form-select form-select-lg border-success fw-semibold text-dark"
                    value={durationType}
                    onChange={(event) => setDurationType(event.target.value)}
                  >
                    {/* Masque l'option horaire si le bien ne définit pas de 'hourlyPrice' */}
                    {property.hourlyPrice && <option value="hour">Heure(s)</option>}
                    <option value="day">Jour(s)</option>
                  </select>
                </div>

                <div className="col-12 col-sm-4">
                  <label className="form-label small fw-bold text-muted">Définir la quantité ({durationLabel})</label>
                  <input
                    type="number"
                    className="form-control form-control-lg border-success text-center fw-bold"
                    min="1"
                    value={durationCount}
                    onChange={(event) => setDurationCount(Math.max(1, Number(event.target.value) || 1))}
                  />
                </div>

                {/* Bloc de rendu pour l'estimation finale calculée en direct */}
                <div className="col-12 col-sm-4 text-sm-end bg-light p-3 rounded-3 border-start border-success border-4 shadow-sm">
                  <div className="small text-muted fw-medium">Estimation du montant total :</div>
                  <div className="fs-3 fw-bold text-success">
                    {totalPrice.toLocaleString('fr-FR')} FCFA
                  </div>
                  <div className="text-muted small">
                    ({durationCount} {durationLabel} x {unitPrice.toLocaleString('fr-FR')} FCFA)
                  </div>
                </div>
              </div>

              {/* Rappel de la grille tarifaire complète en bas de carte */}
              <div className="mt-3 pt-3 border-top d-flex gap-4 text-muted small flex-wrap">
                {property.hourlyPrice && (
                  <div>⏱️ <strong>Tarif horaire :</strong> {property.hourlyPrice.toLocaleString('fr-FR')} FCFA / heure</div>
                )}
                <div>📅 <strong>Tarif journalier / de base :</strong> {(property.dailyPrice ?? basePrice).toLocaleString('fr-FR')} FCFA / jour</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PropertyDetails