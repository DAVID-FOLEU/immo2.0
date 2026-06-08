import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from 'react-bootstrap/Button'
import FavoriteButton from '../components/FavoriteButton';
import { Carousel } from 'react-bootstrap';

function VoituresALouer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [car, setCar] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [days, setDays] = useState(1)

  // Numéro par défaut de la plateforme si aucun numéro n'est trouvé
  const DEFAULT_AGENCY_PHONE = "237655288528" 

  useEffect(() => {
    async function fetchCar() {
      try {
        // Interrogation de la route unifiée /api/annonces/:id
        const response = await fetch(`/api/annonces/${id}`)
        if (!response.ok) {
          throw new Error('Voiture introuvable.')
        }
        const resData = await response.json()
        
        // Extraction des données si enveloppées dans resData.data
        const carData = resData.data ? resData.data : resData
        setCar(carData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchCar()
    }
  }, [id])

  // Extraction dynamique des informations du vendeur / propriétaire
  const sellerPhone = car?.phone || car?.proprietaire_phone || DEFAULT_AGENCY_PHONE
  const sellerName = car?.proprietaire_nom || car?.vendeur_nom || '';

  // ALIGNEMENT DES PRIX : Extraction des clés réelles de ta base de données
  const pricePerDay = Number(car?.prix_location || car?.prix_vente || car?.priceLocation || car?.price || 0)
  const totalPrice = pricePerDay * days
  const currentUrl = window.location.href

  // LOGIQUE WhatsApp DYNAMIQUE : Message personnalisé demandé
  const handleWhatsAppContact = () => {
    if (!car) return

    // Préparation de l'interpellation (Ex: "Mr Patrick" ou "l'équipe")
    const salutation = sellerName ? `Mr/Mme ${sellerName}` : "l'équipe";
    const carName = car.titre_ou_modele || `${car.brand || 'Véhicule'} ${car.model || ''}`;
    const unit = car.periode_location || 'jour';

    // Construction du message court et percutant demandé
    const message = `Bonsoir ${salutation}, j'aimerai avoir la ${carName} pour ${days} ${unit}${days > 1 ? 's' : ''}, c'est possible ?

👉 Référence : ${currentUrl}`

    // Nettoyage et formatage du numéro pour l'URL wa.me
    const cleanPhone = sellerPhone.replace('+', '').trim()
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    
    window.open(whatsappUrl, '_blank')
  }

  // LOGIQUE D'APPEL DIRECT
  const handleDirectCall = () => {
    window.location.href = `tel:${sellerPhone}`
  }

  if (loading) {
    return (
      <div className="container py-5 text-dark">
        <div className="alert alert-info shadow-sm text-center">Chargement des détails du véhicule...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-5 text-dark">
        <div className="alert alert-danger shadow-sm text-center">{error}</div>
      </div>
    )
  }

  if (!car) {
    return (
      <div className="container py-5 text-dark">
        <div className="alert alert-warning shadow-sm text-center">Aucune voiture à afficher.</div>
      </div>
    )
  }

  return (
    <div className="container py-5 text-dark">
      <section className="row gx-4 gy-4">
        <div className="col-12 mb-2">
          <Button variant="outline-secondary" size="sm" className="fw-medium" onClick={() => navigate(-1)}>
            ← Retour
          </Button>
        </div>
    
        {/* Section Galerie d'images */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm border overflow-hidden rounded-3 position-relative" style={{ height: '400px' }}>
            <Carousel interval={null} indicators={true} variant="warning" style={{ height: '100%' }}>
              {/* Fallback au cas où le tableau d'images est vide */}
              {(car.images && car.images.length > 0 ? car.images : [car.image_principale || '/public/images.jpg']).map((img, index) => {
                const srcUrl = img.image_url || img;
                const finalSrc = srcUrl.startsWith('http') || srcUrl.startsWith('/public') ? srcUrl : `/api/uploads/${srcUrl}`;
                return (
                  <Carousel.Item key={index} style={{ height: '400px' }}>
                    <img
                      src={finalSrc}
                      alt={`${car.brand || 'Véhicule'} ${car.model || ''} - Vue ${index + 1}`}
                      className="d-block w-100"
                      style={{ 
                        height: '400px',
                        objectFit: 'cover',
                        objectPosition: 'center' 
                      }} 
                      onError={(e) => { e.target.src = '/public/images.jpg'; }}
                    />
                  </Carousel.Item>
                );
              })}
            </Carousel>
            {car.statut === "occupé" && (
              <span className='position-absolute bg-danger text-white top-0 end-0 m-2 px-2 py-1 small fw-bold shadow-sm' style={{ borderRadius: '6px', zIndex: 10 }}>
                Occupé
              </span>
            )}
          </div>
        </div>

        {/* Section Fiche technique */}
        <div className="col-12 col-lg-6">
          <div className="p-4 rounded-3 border shadow-sm d-flex flex-column justify-content-between" style={{ minHeight: '400px', backgroundColor: '#f1efef' }}>
            <div>
              <h3 className="fw-bold mb-3 text-success">
                {car.titre_ou_modele || `${car.brand} ${car.model || ''}`}
              </h3>
              <div className='d-flex gap-4 flex-wrap align-items-start'>
                <ul className="list-unstyled mb-0 small flex-grow-1">
                  <li className="mb-1"><strong>Marque :</strong> {car.brand || 'N/C'}</li>
                  <li className="mb-1"><strong>Modèle :</strong> {car.model || 'N/C'}</li>
                  <li className="mb-1"><strong>Année :</strong> {car.year || 'N/C'}</li>
                  <li className="mb-1"><strong>Moteur :</strong> {car.moteur || 'N/C'}</li>
                  <li className="mb-1"><strong>Transmission :</strong> {car.transmission || 'N/C'}</li>
                </ul>

                <ul className="list-unstyled mb-0 small flex-grow-1 border-start ps-md-3">
                  <li className="mb-1"><strong>Couleur :</strong> {car.color || 'N/C'}</li>
                  <li className="mb-1"><strong>Kilométrage :</strong> {car.mileage ? car.mileage.toLocaleString('fr-FR') : '0'} km</li>
                  <li className="mb-1"><strong>📍 Ville :</strong> {car.ville || 'N/C'}</li>
                  {sellerName && <li className="mb-1"><strong>Propriétaire :</strong> {sellerName}</li>}
                </ul>
              </div> 
              <div className="fs-5 text-success mt-3 fw-bold">
                Prix : {pricePerDay.toLocaleString('fr-FR')} FCFA / {car.periode_location || 'jour'}
              </div>
            </div>

            <div className="mt-4">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div className="mb-3 d-flex align-items-center gap-2">
                  <label htmlFor="rental-days" className="mb-0 small fw-semibold">Nombre de {car.periode_location || 'jour'}(s) :</label>
                  <input
                    id="rental-days"
                    type="number"
                    min="1"
                    value={days}
                    onInput={(e) => setDays(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="form-control form-control-sm shadow-sm"
                    style={{ width: '80px' }}
                  />
                </div>
                <div className="mb-3 small text-secondary">
                  Total estimé : <strong className="text-dark fs-5">{totalPrice.toLocaleString('fr-FR')} FCFA</strong>
                </div>
              </div> 
              
              {/* Barre d'actions */}
              <div className="d-flex gap-2 justify-content-end align-items-center flex-wrap">
                <FavoriteButton item={car} type="car" className="me-auto" />
                
                {/* Appel direct */}
                <Button 
                  variant="warning" 
                  className="fw-bold px-3 d-flex align-items-center gap-1"
                  onClick={handleDirectCall}
                >
                  📞 Appeler
                </Button>

                {/* WhatsApp avec message contextuel */}
                <Button 
                  variant="success" 
                  className="fw-bold text-white px-3 d-flex bg-success align-items-center gap-1"
                  onClick={handleWhatsAppContact}
                >
                  💬 WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default VoituresALouer;