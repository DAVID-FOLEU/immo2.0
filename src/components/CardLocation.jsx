import { Link } from 'react-router-dom'
import Card from 'react-bootstrap/Card'
import FavoriteButton from './FavoriteButton.jsx'
import '../styles/CarCard.css' // Réutilise le même fichier CSS

function CardLocation({ car }) {
  const fallbackImage = '/public/images.jpg';
  
  // Lecture dynamique de l'image principale (champ direct ou 1er élément de la table images)
  const imageUrl = car.image_principale 
    ? `/api/uploads/${car.image_principale}` 
    : (car.images && car.images.length > 0 ? `/api/uploads/${car.images[0].image_url || car.images[0]}` : fallbackImage);

  const isLocation = car.type_transaction === 'louer';
  const displayPrice = isLocation ? car.prix_location : car.prix_vente;
  const priceSuffix = isLocation ? ` F CFA / ${car.periode_location || 'jour'}` : ' F CFA';

  return (
    <div className="col-12 col-md-6 col-lg-4 mb-4">
      {/* Lien global sur toute la carte menant vers les détails de location */}
      <Link to={`/VoituresALouer/${car.id}`} className="text-decoration-none text-dark d-block h-100">
        <Card className="shadow-sm custom-car-card position-relative overflow-hidden border-0">
          
          {/* 1. Bouton Favoris : Fixé en haut à droite */}
          <div className="position-absolute top-0 end-0 m-2 z-3 fav-container">
            <FavoriteButton item={car} type="car" />
          </div>

          {/* 2. Badge Statut d'occupation : Fixé en haut à gauche */}
          {car.statut === "occupé" ? (
            <span className='position-absolute bg-danger text-white top-0 start-0 m-2 p-1 px-2 small z-3 fw-semibold shadow-sm' style={{ borderRadius: '5px' }}>
              🔴 Occupé
            </span>
          ) : (
            <span className='position-absolute bg-success text-white top-0 start-0 m-2 p-1 px-2 small z-3 fw-semibold shadow-sm' style={{ borderRadius: '5px' }}>
              🟢 Disponible
            </span>
          )}

          {/* Conteneur de l'image principale */}
          <div className="card-img-wrapper">
            <Card.Img
              variant="top"
              src={imageUrl}
              alt={car.titre_ou_modele || `${car.brand || 'Véhicule'}`}
              className="w-100 h-100"
              style={{ objectFit: 'cover' }}
              onError={(e) => { e.target.src = fallbackImage; }}
            />
          </div>

          {/* 3. Card Body avec animation coulissante (PC) et lisibilité garantie (Mobile) */}
          <Card.Body className="d-flex flex-column sliding-body">
            <Card.Title className="d-flex justify-content-between align-items-start gap-1 mb-1">
              <span className="text-white fs-5 fw-bold text-truncate">
                {car.titre_ou_modele || `${car.brand} ${car.model || ''}`}
              </span>
              <span className="bg-white text-dark py-1 px-2 fs-6 text-nowrap fw-semibold" style={{ borderRadius: '5px' }}>
                {car.ville}
              </span>
            </Card.Title>

            <Card.Subtitle className="mb-3 text-light opacity-75 small">
              <span>{car.year || 'Année N/A'} • {car.color || 'Couleur N/A'} • {car.transmission || 'Manuelle/Auto'}</span>
            </Card.Subtitle>

            <div className="small text-light opacity-75">
              {car.mileage !== undefined && <div>📍 {Number(car.mileage).toLocaleString('fr-FR')} km</div>}
            </div>
            
            <div className="fw-bold text-warning mt-2 fs-5">
              {displayPrice ? Number(displayPrice).toLocaleString('fr-FR') : 'Prix sur demande'}{priceSuffix}
            </div>
          </Card.Body>
        </Card>
      </Link>
    </div>
  )
}

export default CardLocation