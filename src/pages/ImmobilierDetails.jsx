import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from 'react-bootstrap/Button'
import { Carousel } from 'react-bootstrap'
import FavoriteButton from '../components/FavoriteButton.jsx'

function ImmobilierDetails() {
  const { id } = useParams() // Récupère l'identifiant passé dans l'URL
  const navigate = useNavigate()
  
  // ÉTATS DES DONNÉES
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Numéro WhatsApp/Téléphone par défaut si l'annonce n'en a pas
  const DEFAULT_PHONE = "237655288528" 

  useEffect(() => {
    let isMounted = true

    async function fetchPropertyDetails() {
      try {
        // Appelle ton API Node/MySQL pour récupérer un bien spécifique par son ID
        const response = await fetch(`/api/annonces/${id}`)
        if (!response.ok) {
          throw new Error('Ce bien immobilier est introuvable ou a été supprimé.')
        }
        const resData = await response.json()
        
        if (isMounted) {
          // Ajuste selon la structure de ton API (resData.data ou resData direct)
          const data = resData.data ? resData.data : resData
          setProperty(data)
          setLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des détails')
          setLoading(false)
        }
      }
    }

    if (id) {
      fetchPropertyDetails()
    }

    return () => {
      isMounted = false
    }
  }, [id])

  // Traduction et formatage des catégories immobilières
  const categoryLabel = {
    meuble: 'Meublé',
    hotel: 'Hôtel',
    chambre: 'Chambre',
    studio: 'Studio',
    appartement: 'Appartement',
    maison: 'Maison / Villa',
    terrain: 'Terrain',
    bureau: 'Bureau / Local com.',
  }[property?.categorie_immo || property?.category] || 'Bien immobilier';

  // Détermination des contacts
  const sellerPhone = property?.phone || property?.proprietaire_phone || DEFAULT_PHONE
  const sellerName = property?.proprietaire_nom || property?.vendeur_nom || ''

  // États pour options de réservation (meublé / hôtel)
  const [durationType, setDurationType] = useState('jours') // 'heures' ou 'jours'
  const [durationValue, setDurationValue] = useState(1)
  const [hotelExtra, setHotelExtra] = useState(0) // ex: nombre de personnes/places supplémentaires

  // Gestion dynamique des prix
  const isLocation = property?.type_transaction === 'louer'
  const displayPrice = isLocation ? property?.prix_location : (property?.prix_vente || property?.price)
  const priceSuffix = isLocation ? ` F CFA / ${property?.periode_location || 'mois'}` : ' F CFA'

  // Action de contact WhatsApp avec message pré-rempli intelligent
  const handleWhatsApp = () => {
    if (!property) return

    const salutation = sellerName ? `Bonjour ${sellerName}` : "Bonjour"
    const propertyTitle = property.titre_ou_modele || `${categoryLabel} à ${property.ville || 'N/C'}`
    const actionText = isLocation ? "la location" : "l'achat"
    const currentUrl = window.location.href

    // Ajout des options sélectionnées dynamiquement au message
    let optionsText = ''
    if (property.categorie_immo === 'meuble' || property.categorie_immo === 'meublé' || categoryLabel.toLowerCase().includes('meubl')) {
      optionsText += `\n• Durée souhaitée : ${durationValue} ${durationType}`
    }
    if (property.categorie_immo === 'hotel' || categoryLabel.toLowerCase().includes('hôtel') || categoryLabel.toLowerCase().includes('hotel')) {
      optionsText += `\n• Option supplémentaire : ${hotelExtra} personne(s) / place(s)`
    }

    const message = `${salutation}, je suis très intéressé(e) par ${actionText} de ce bien : "${propertyTitle}".${optionsText}\n\n🔗 Lien de l'annonce : ${currentUrl}`

    const cleanPhone = sellerPhone.replace('+', '').trim()
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank')
  }

  // Action d'appel direct
  const handleCall = () => {
    window.location.href = `tel:${sellerPhone}`
  }

  // Rendu en cours de chargement
  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Chargement des données...</span>
          </div>
        </div>
      </div>
    )
  }

  // Rendu en cas d'erreur
  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger shadow-sm text-center">⚠️ {error}</div>
        <div className="text-center mt-3">
          <Button variant="outline-secondary" onClick={() => navigate(-1)}>Retour au catalogue</Button>
        </div>
      </div>
    )
  }

  // Rendu si aucun bien trouvé
  if (!property) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning shadow-sm text-center">Aucune information disponible pour ce bien.</div>
      </div>
    )
  }

  return (
    <div className="container py-5 text-dark">
      {/* Bouton retour */}
      <div className="mb-4">
        <button className="btn btn-outline-secondary btn-sm fw-semibold" onClick={() => navigate(-1)}>
          ← Retour aux annonces
        </button>
      </div>

      <div className="row g-4">
        {/* COLONNE GAUCHE : Galerie Photos (Carousel Bootstrap) */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm border overflow-hidden rounded-3 position-relative" style={{ minHeight: '400px' }}>
            <Carousel interval={null} indicators={true} className="h-100 bg-dark">
              {(property.images && property.images.length > 0 
                ? property.images 
                : [property.image_principale || '/public/images.jpg']
              ).map((img, index) => {
                const srcUrl = img.image_url || img
                const finalSrc = srcUrl.startsWith('http') || srcUrl.startsWith('/public') 
                  ? srcUrl 
                  : `/api/uploads/${srcUrl}`

                return (
                  <Carousel.Item key={index}>
                    <img
                      src={finalSrc}
                      alt={`${categoryLabel} - Vue ${index + 1}`}
                      className="d-block w-100"
                      style={{ height: '450px', objectFit: 'cover', objectPosition: 'center' }}
                      onError={(e) => { e.target.src = '/public/images.jpg'; }}
                    />
                  </Carousel.Item>
                )
              })}
            </Carousel>
            
            {/* Badge Transaction collé sur l'image */}
            <span className={`position-absolute top-0 start-0 m-3 badge ${isLocation ? 'bg-success' : 'bg-primary'} px-3 py-2 fs-6 shadow`}>
              {isLocation ? 'À Louer' : 'À Vendre'}
            </span>
          </div>
        </div>

        {/* COLONNE DROITE : Fiche Technique & Actions */}
        <div className="col-12 col-lg-6">
          <div className="p-4 rounded-3 border shadow-sm d-flex flex-column justify-content-between h-100" style={{ backgroundColor: '#f1efef', minHeight: '450px' }}>
            <div>
              {/* Catégorie de bien */}
              <span className="badge bg-info text-dark mb-2 text-uppercase fw-bold px-2 py-1 small">
                {categoryLabel} {property.sous_type ? `· ${property.sous_type}` : ''}
              </span>

              {/* Titre Principal */}
              <h2 className="fw-bold text-success mb-3">
                {property.titre_ou_modele || property.title || `${categoryLabel} à ${property.ville}`}
              </h2>

              {/* Prix */}
              <div className="fs-3 fw-bold text-dark mb-4 border-bottom pb-2">
                {displayPrice ? `${Number(displayPrice).toLocaleString('fr-FR')}${priceSuffix}` : 'Prix sur demande'}
              </div>

              {/* Détails techniques */}
              <div className="row g-3 small">
                <div className="col-sm-6">
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2"><strong>🗺️ Ville :</strong> {property.ville || 'N/C'}</li>
                    <li className="mb-2"><strong>📍 Quartier :</strong> {property.quartier || 'N/C'}</li>
                    {property.nombre_pieces && <li className="mb-2"><strong>🔑 Nombre de pièces :</strong> {property.nombre_pieces}</li>}
                  </ul>
                </div>
                <div className="col-sm-6 border-sm-start ps-sm-3">
                  <ul className="list-unstyled mb-0">
                    {isLocation && property.caution_mois && (
                      <li className="mb-2 text-success"><strong>💰 Avance / Caution :</strong> {property.caution_mois} mois</li>
                    )}
                    {sellerName && <li className="mb-2"><strong>👤 Annonceur :</strong> {sellerName}</li>}
                  </ul>
                </div>
              </div>

              {/* Description */}
              <div className="mt-4">
                <h6 className="fw-bold text-secondary mb-2">Description du bien :</h6>
                <p className="text-muted small" style={{ lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                  {property.description || "Aucune description supplémentaire fournie pour cette annonce immobilière."}
                </p>
              </div>

              {/* Options de réservation pour Meublé / Hôtel */}
              <div className="mt-3">
                { (property.categorie_immo === 'meuble' || property.categorie_immo === 'meublé' || categoryLabel.toLowerCase().includes('meubl')) && (
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <label className="small mb-0 fw-semibold">Durée :</label>
                    <select className="form-select form-select-sm w-auto" value={durationType} onChange={(e) => setDurationType(e.target.value)}>
                      <option value="heures">Heures</option>
                      <option value="jours">Jours</option>
                    </select>
                    <input type="number" min={1} className="form-control form-control-sm w-25" value={durationValue} onChange={(e) => setDurationValue(Number(e.target.value))} />
                  </div>
                )}

                { (property.categorie_immo === 'hotel' || categoryLabel.toLowerCase().includes('hôtel') || categoryLabel.toLowerCase().includes('hotel')) && (
                  <div className="d-flex align-items-center gap-2">
                    <label className="small mb-0 fw-semibold">Option suite :</label>
                    <input type="number" min={0} className="form-control form-control-sm w-25" value={hotelExtra} onChange={(e) => setHotelExtra(Number(e.target.value))} />
                    <span className="small text-muted">(personnes / places supplémentaires)</span>
                  </div>
                )}
              </div>
            </div>

            {/* BARRE D'ACTIONS DU BAS */}
            <div className="mt-4 pt-3 border-top d-flex gap-2 align-items-center flex-wrap">
              {/* Gestion des Favoris */}
              <FavoriteButton item={property} type="property" className="me-auto" />

              {/* Bouton Téléphone */}
              <Button 
                variant="warning" 
                className="fw-bold px-4 text-dark d-flex align-items-center gap-2"
                onClick={handleCall}
              >
                📞 Appeler
              </Button>

              {/* Bouton WhatsApp */}
              <Button 
                variant="success" 
                className="fw-bold text-white px-4 bg-success border-0 d-flex align-items-center gap-2"
                onClick={handleWhatsApp}
              >
                💬 WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImmobilierDetails