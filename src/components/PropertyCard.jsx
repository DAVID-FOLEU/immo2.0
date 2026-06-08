import { Link } from 'react-router-dom'
import Card from 'react-bootstrap/Card'
import FavoriteButton from './FavoriteButton.jsx'
import '../styles/CarCard.css' 

function PropertyCard({ property }) {
  const fallbackImage = '/public/images.jpg';
  
  // 1. Lecture dynamique de l'image principale
  const rawImage = property.image_principale || 
    (property.images && property.images.length > 0 ? (property.images[0].image_url || property.images[0]) : null);

  let imageUrl = fallbackImage;
  if (rawImage) {
    imageUrl = rawImage.startsWith('http') || rawImage.startsWith('/public')
      ? rawImage
      : `/api/uploads/${rawImage}`;
  }

  // 2. Détermination dynamique du prix
  const isLocation = property.type_transaction === 'louer';
  const displayPrice = isLocation ? property.prix_location : property.prix_vente;
  const priceSuffix = isLocation ? ` F CFA / ${property.periode_location || 'mois'}` : ' F CFA';

  // 3. Traduction des catégories
  const categoryLabel = {
    meuble: 'Meublée',
    hotel: 'Hôtel',
    chambre: 'Chambre',
    studio: 'Studio',
    appartement: 'Appartement',
    maison: 'Maison / Villa',
    terrain: 'Terrain',
    bureau: 'Bureau / Local com.',
  }[property.categorie_immo || property.category] || 'Bien immobilier';

  const subtypeLabel = property.subType || property.sous_type ? ` · ${property.subType || property.sous_type}` : '';

  return (
    <div className="col-12 col-md-6 col-lg-4 mb-4">
      {/* Règle CSS locale pour forcer une taille d'image stricte et identique sur toutes les cartes */}
      <style>{`
        .custom-property-img-wrapper {
          height: 240px; /* Aligne et force la même hauteur pour toutes les images */
          width: 100%;
          overflow: hidden;
          position: relative;
        }
      `}</style>

      <Link to={`/immobilier/details/${property.id}`} className="text-decoration-none text-dark d-block h-100">
        <Card className="shadow-sm custom-car-card position-relative overflow-hidden border-0">
          
          {/* Bouton Favoris */}
          <div 
            className="position-absolute top-0 end-0 m-2 z-3 fav-container"
            onClick={(e) => e.preventDefault()}
          >
            <FavoriteButton item={property} type="property" />
          </div>
        <div className='position-absolute top-0 start-0 m-2 z-3 d-flex top-0 start-0  ms-2 p-0 gap-1'>
          {/* Badge Statut / Type de transaction */}
          <span className={`${isLocation ? 'bg-success' : 'bg-primary'} text-white  px-2 small z-3 fw-semibold shadow-sm`} style={{ borderRadius: '5px' }}>
            {isLocation ? '🟢 À Louer' : '🔵 À Vendre'}
          </span>

          {/* Badge Boost */}
          {property.type_boost && property.type_boost !== 'gratuit' && (
            <span className="bg-warning text-dark  px-2 small z-3 fw-semibold shadow-sm" style={{ borderRadius: '5px' }}>
              🔥 {property.type_boost.toUpperCase()}
            </span>
          )}
        </div>
          {/* Conteneur de l'image avec hauteur unifiée */}
          <div className="card-img-wrapper custom-property-img-wrapper">
            <Card.Img
              variant="top"
              src={imageUrl}
              alt={property.titre_ou_modele || categoryLabel}
              className="w-100 h-100"
              style={{ objectFit: 'cover', objectPosition: 'center' }} 
              onError={(e) => { e.target.src = fallbackImage; }}
            />
          </div>

          {/* Card Body coulissant au survol */}
          <Card.Body className="d-flex flex-column sliding-body">
            <Card.Title className="d-flex justify-content-between align-items-start gap-1 mb-1">
              <span className="text-white fs-5 fw-bold text-truncate">
                {property.titre_ou_modele || property.title || categoryLabel}
              </span>
              <span className="bg-white text-dark py-1 px-2 fs-6 text-nowrap fw-semibold" style={{ borderRadius: '5px' }}>
                {property.ville || 'N/C'}
              </span>
            </Card.Title>

            <Card.Subtitle className="mb-3 text-light opacity-75 small">
              <span>{categoryLabel}{subtypeLabel}</span>
            </Card.Subtitle>

            {/* Informations spécifiques */}
            <div className="small text-light opacity-75 flex-grow-1">
              {property.quartier && <div className="text-truncate">📍 Quartier : {property.quartier}</div>}
              {property.nombre_pieces && <div>🔑 {property.nombre_pieces} pièces</div>}
              {isLocation && property.caution_mois && (
                <div className="mt-1 text-warning fw-semibold">💰 Avance : {property.caution_mois} mois</div>
              )}
            </div>
            
            {/* Prix */}
            <div className="fw-bold text-warning mt-2 fs-5">
              {displayPrice ? Number(displayPrice).toLocaleString('fr-FR') : 'Prix sur demande'}{priceSuffix}
            </div>
          </Card.Body>
        </Card>
      </Link>
    </div>
  )
}

export default PropertyCard;