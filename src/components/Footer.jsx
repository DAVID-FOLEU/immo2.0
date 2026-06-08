// import React from 'react';
import { Link } from 'react-router-dom';
import SectionLink from './SectionLink.jsx';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-white pt-5 pb-3 mt-5 border-top border-warning border-3">
      <div className="container">
        <div className="row g-4">
          
          {/* Section 1: À propos / Vision */}
          <div className="col-12 col-md-4">
            <h5 className="fw-bold text-warning mb-3">🚗 Immo 2.0</h5>
            <p className="text-muted small">
              Votre partenaire de confiance pour la concrétisation de vos projets de vie. 
              Nous vous accompagnons dans l'acquisition de biens immobiliers d'exception 
              et la sélection de véhicules haut de gamme adaptés à vos exigences.
            </p>
            {/* <div className="d-flex gap-3 fs-5 mt-3">
              <a href="#" className="text-white-50 text-decoration-none hover-warning">🌐</a>
              <a href="#" className="text-white-50 text-decoration-none hover-warning">📱</a>
              <a href="#" className="text-white-50 text-decoration-none hover-warning">✉️</a>
            </div> */}
          </div>

          {/* Section 2: Navigation Immobilier */}
          <div className="col-6 col-md-2">
            <h6 className="fw-bold text-uppercase small tracking-wider mb-3 text-light">Immobilier</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2">
              <li><Link to="/immobilier/acheter" className="text-white-50 text-decoration-none text-hover-white">Achat d'hôtels / villas</Link></li>
              <li><Link to="/immobilier/louer" className="text-white-50 text-decoration-none text-hover-white">Locations saisonnières</Link></li>
            </ul>
          </div>

          {/* Section 3: Navigation Automobile */}
          <div className="col-6 col-md-2">
            <h6 className="fw-bold text-uppercase small tracking-wider mb-3 text-light">Automobile</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2">
              <li><SectionLink section="automobile" action="acheter" className="text-white-50 text-decoration-none text-hover-white">Acheter un véhicule</SectionLink></li>
              <li><SectionLink section="automobile" action="louer" className="text-white-50 text-decoration-none text-hover-white">Louer un véhicule</SectionLink></li>
              <li><Link to="/vendre" className="text-white-50 text-decoration-none text-hover-white">Vendre votre voiture</Link></li>
            </ul>
          </div>

          {/* Section 4: Contact & Réassurance */}
          <div className="col-12 col-md-4">
            <h6 className="fw-bold text-uppercase small tracking-wider mb-3 text-light">Contact & Support</h6>
            <ul className="list-unstyled small text-white-50 d-flex flex-column gap-2">
              <li className="d-flex align-items-center gap-2">
                📍 <span>Cameroun</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                📞 <span>+237 6xx xxx xxx</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                ✉️ <span>contact@immo2.0.com</span>
              </li>
              {/* <li className="d-flex align-items-center gap-2 mt-2">
                🕒 <span className="small text-warning">Lun - Ven : 8h00 - 18h00 | Sam : 9h00 - 13h00</span>
              </li> */}
            </ul>
          </div>

        </div>

        {/* Ligne de séparation */}
        <hr className="bg-secondary my-4" />

        {/* Baseline légale */}
        <div className="row align-items-center small text-white-50">
          <div className="col-12 col-md-6 text-center text-md-start mb-2 mb-md-0">
            &copy; {currentYear} <strong>Immo 2.0 Prestige</strong>. Tous droits réservés.
          </div>
          <div className="col-12 col-md-6 text-center text-md-end">
            <ul className="list-inline mb-0 small">
              <li className="list-inline-item me-3">
                <Link to="/mentions-legales" className="text-white-50 text-decoration-none text-hover-white">Mentions légales</Link>
              </li>
              <li className="list-inline-item me-3">
                <Link to="/politique-confidentialite" className="text-white-50 text-decoration-none text-hover-white">Confidentialité</Link>
              </li>
              <li className="list-inline-item">
                <Link to="/cgv" className="text-white-50 text-decoration-none text-hover-white">CGU / CGV</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Petits styles inline pour les effets au survol */}
      <style>{`
        .text-hover-white:hover {
          color: #ffffff !important;
          transition: color 0.2s ease-in-out;
        }
        .hover-warning:hover {
          color: #ffc107 !important;
          transform: scale(1.1);
          transition: all 0.2s ease-in-out;
        }
      `}</style>
    </footer>
  );
}

export default Footer;