import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from 'react-bootstrap/Button'
import { Carousel } from 'react-bootstrap'
import FavoriteButton from '../components/FavoriteButton.jsx'

function Voiture() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [car, setCar] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Numéro de secours (fallback) si aucun numéro n'est associé à l'annonce
  const DEFAULT_AGENCY_PHONE = "237655288528" 

  useEffect(() => {
    async function fetchCar() {
      try {
        // Interrogation de la route unifiée /api/annonces/:id
        const response = await fetch(`/api/annonces/${id}`)
        if (!response.ok) {
          throw new Error('Véhicule introuvable.')
        }
        const resData = await response.json()
        
        // S'adapte si ton API renvoie { success: true, data: [...] }
        const carData = resData.data ? resData.data : resData;
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

  // Extraction dynamique du numéro et du nom du vendeur (aligné avec la base de données unifiée)
  const sellerPhone = car?.phone || car?.proprietaire_phone || DEFAULT_AGENCY_PHONE
  const sellerName = car?.proprietaire_nom || car?.vendeur_nom || '';

  // ALIGNEMENT DES PRIX : Extraction de la clé unifiée de ton architecture
  const displayPrice = Number(car?.prix_vente || car?.price || 0)
  const currentUrl = window.location.href

  // LOGIQUE WhatsApp DYNAMIQUE : Message personnalisé court et poli pour l'achat
  const handleWhatsAppContact = () => {
    if (!car) return

    // Préparation de la salutation dynamique (Ex: "Mr Eric" ou "l'équipe")
    const salutation = sellerName ? `Mr/Mme ${sellerName}` : "l'équipe";
    const carName = car.titre_ou_modele || `${car.brand || 'Véhicule'} ${car.model || ''}`;

    // Message personnalisé d'achat
    const message = `Bonsoir ${salutation}, je suis intéressé(e) pour l'achat de la ${carName}, pouvons-nous prendre rendez-vous ?

👉 Référence : ${currentUrl}`

    // Nettoyage de la chaîne du numéro pour l'API WhatsApp
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
              {/* Fallback au cas où le tableau d'images est vide ou non défini */}
              {(car.images && car.images.length > 0 ? car.images : [car.image_principale || '/public/images.jpg']).map((img, index) => {
                const srcUrl = img.image_url || img;
                const finalSrc = srcUrl.startsWith('http') || srcUrl.startsWith('/public') ? srcUrl : `/api/uploads/${srcUrl}`;
                return (
                  <Carousel.Item key={index} style={{ height: '400px' }}>
                    <img
                      src={finalSrc}
                      alt={`${car.brand || 'Automobile'} ${car.model || ''} - Vue ${index + 1}`}
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
            {car.statut === "vendu" && (
              <span className='position-absolute bg-danger text-white top-0 end-0 m-2 px-2 py-1 small fw-bold shadow-sm' style={{ borderRadius: '6px', zIndex: 10 }}>
                Vendu
              </span>
            )}
          </div>
        </div>

        {/* Section Fiche technique unifiée en couleur avec VoituresALouer */}
        <div className="col-12 col-lg-6">
          <div className="p-4 rounded-3 border shadow-sm d-flex flex-column justify-content-between" style={{ minHeight: '400px', backgroundColor: '#f1efef' }}>
            <div>
              <h3 className="fw-bold mb-3 text-success">
                {car.titre_ou_modele || `${car.brand} ${car.model || ''}`}
              </h3>
            
              <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap flex-sm-nowrap">
                <ul className="list-unstyled mb-0 small flex-grow-1">
                  <li className="mb-1"><strong>Marque :</strong> {car.brand || 'N/C'}</li>
                  <li className="mb-1"><strong>Modèle :</strong> {car.model || 'N/C'}</li>
                  <li className="mb-1"><strong>Année :</strong> {car.year || 'N/C'}</li>
                  <li className="mb-1"><strong>Moteur :</strong> {car.moteur || 'N/C'}</li>
                  <li className="mb-1"><strong>Transmission :</strong> {car.transmission || 'N/C'}</li>
                </ul>
                
                <div className="description flex-grow-1 border-start ps-md-3 line-height-md" style={{ minHeight: '130px' }}>
                  <ul className="list-unstyled mb-2 small">
                    <li className="mb-1"><strong>Couleur :</strong> {car.color || 'N/C'}</li>
                    <li className="mb-1"><strong>Kilométrage :</strong> {car.mileage ? car.mileage.toLocaleString('fr-FR') : '0'} km</li>
                    <li className="mb-1"><strong>📍 Ville :</strong> {car.ville || 'Localisation N/C'}</li>
                    {sellerName && <li className="mb-1"><strong>Vendeur :</strong> {sellerName}</li>}
                  </ul>
                  <span className='fw-bold small d-block mb-1'>Description :</span>
                  <p className="small text-secondary mb-0">
                    {car.description || "Aucune description supplémentaire disponible pour ce véhicule."}
                  </p>
                </div>
              </div>
              
              <div className="fs-4 text-success mt-3 fw-bold">
                Prix : {displayPrice > 0 ? `${displayPrice.toLocaleString('fr-FR')} FCFA` : 'Prix sur demande'}
              </div>
            </div>

            <div className="mt-4">
              {/* Barre d'actions unifiée */}
              <div className="d-flex gap-2 justify-content-end align-items-center flex-wrap">
                <FavoriteButton item={car} type="car" className="me-auto" />
                
                {/* Appel Direct */}
                <Button 
                  variant="warning" 
                  className="fw-bold px-3 d-flex align-items-center gap-1"
                  onClick={handleDirectCall}
                >
                  📞 Appeler
                </Button>

                {/* Contact WhatsApp avec message de prise de rendez-vous d'achat */}
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

export default Voiture;