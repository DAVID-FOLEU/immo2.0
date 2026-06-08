import { Link } from 'react-router-dom'  // importer la logique des liens
import Carousel from 'react-bootstrap/Carousel'
import { motion } from 'framer-motion' // importer la logique des animations
import SectionLink from '../components/SectionLink.jsx'
import TestimonialMarquee from '../components/temoignage.jsx'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut' },
  },
}

const fadeDown = {
  hidden: { opacity: 0, y: -30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut' },
  },
}

const fadeLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: 'easeOut' },
  },
}

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
}

function Home() {
  // Configuration des 3 slides professionnels (Auto & Immo)
  const slides = [
    {
      id: 1,
      section: 'automobile',
      badge: "🚗 Secteur Automobile",
      title: "Trouvez votre voiture de rêve en ligne",
      subtitle: "Consultez les annonces de centaines de véhicules récents en vente ou en location. Comparez les prix et trouvez la voiture qui vous correspond.",
      bgImage: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1600&q=80",
      graphicImage: "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=800&q=60"
    },
    {
      id: 2,
      section: 'immobilier',
      badge: "🏢 Secteur Immobilier",
      title: "Des biens immobiliers d'exception",
      subtitle: "Explorez notre sélection exclusive de villas de luxe, d'hôtels et d'appartements haut de gamme disponibles immédiatement pour achat ou investissement.",
      bgImage: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=80",
      graphicImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=60"
    },
    {
      id: 3,
      section: 'automobile',
      badge: "💎 Solutions Sur-Mesure",
      title: "Vendez ou louez vos actifs rapidement",
      subtitle: "Bénéficiez d'une estimation juste et d'un accompagnement professionnel de bout en bout pour maximiser la rentabilité de vos biens auto et immo.",
      bgImage: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1600&q=80",
      graphicImage: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=60"
    }
  ]
  return (
    <>
      {/* Hero Section: full-width image + overlay + animated content */}
      <motion.section
      className="hero-section p-0 hero-full mb-5 position-relative overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={stagger}
    >
      <Carousel 
        controls={false} 
        indicators={false} 
        interval={5000} // Changement fluide toutes les 5 secondes
        fade // Effet de fondu croisé haut de gamme au lieu d'un slide brutal
        pause={false}
      >
        {slides.map((slide) => (
          <Carousel.Item key={slide.id}>
            {/* Background assombri pour garantir la lisibilité du texte */}
            <div
              className="hero-bg"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%), url('${slide.bgImage}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '100%',
                width: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: -1
              }}
            />

            <div className="container position-relative py-5">
              <div className="row align-items-center min-vh-60">
                <div className="col-lg-6 text-white">
                  <motion.span className="badge bg-warning text-dark mb-3 px-3 py-2 fw-semibold shadow-sm" variants={fadeUp}>
                    {slide.badge}
                  </motion.span>
                  <motion.h1 className="hero-title text-warning mb-4 fw-bold display-4" variants={fadeUp}>
                    {slide.title}
                  </motion.h1>
                  <motion.p className="hero-subtitle mb-4 text-light lead fs-5" variants={fadeUp}>
                    {slide.subtitle}
                  </motion.p>
                  <motion.div className="mb-4">
                    <span className="badge bg-white text-dark text-uppercase fw-semibold" style={{ opacity: 0.9 }}>
                      {slide.section === 'immobilier' ? 'Rubrique Immobilier' : 'Rubrique Automobile'}
                    </span>
                  </motion.div>

                  <motion.div className="d-flex gap-3 flex-wrap" variants={fadeUp}>
                    <SectionLink section={slide.section} action="acheter" className="btn btn-warning btn-lg text-dark fw-bold px-4 shadow">
                      🔍 Acheter
                    </SectionLink>
                    <SectionLink section={slide.section} action="louer" className="btn btn-success btn-lg fw-bold px-4 shadow">
                      🚗 Louer
                    </SectionLink>
                    <Link to="/vendre" className="btn btn-outline-light btn-lg px-4 backdrop-blur">
                      📋 Vendre
                    </Link>
                  </motion.div>
                </div>

                <div className="col-lg-6 d-none d-lg-block">
                  <motion.div className="hero-graphic" variants={fadeUp}>
                    <img
                      src={slide.graphicImage}
                      alt={slide.title}
                      className="img-fluid rounded-3 shadow-lg border border-light border-opacity-25"
                      style={{ height: '380px', width: '100%', objectFit: 'cover' }}
                    />
                  </motion.div>
                </div>
              </div>
            </div>
          </Carousel.Item>
        ))}
      </Carousel>
    </motion.section>
      {/* Features Section */}
      <motion.section
  className="container py-5 mb-5"
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.2 }}
  variants={stagger}
>
  {/* En-tête de section Pro */}
  <div className="text-center mb-5">
    <h2 className="fw-bold text-dark display-5 mb-2">Pourquoi choisir AutoMarket Pro ?</h2>
    <p className="text-muted lead mx-auto" style={{ maxWidth: '650px', fontSize: '1.1rem' }}>
      Une expertise unique combinant l'immobilier haut de gamme et l'automobile de prestige pour concrétiser vos projets en toute sérénité.
    </p>
  </div>

  <div className="row g-4">
    {/* Carte 1 : Recherche Avancée */}
    <motion.div className="col-md-6 col-lg-3" variants={fadeUp}>
      <div className="feature-card p-4 rounded-3 h-100 bg-white shadow-sm border border-light transition-hover">
        <div className="d-flex align-items-center justify-content-center bg-warning bg-opacity-10 text-warning rounded-circle mb-4" style={{ width: '55px', height: '55px', fontSize: '1.5rem' }}>
          🔍
        </div>
        <h5 className="fw-bold text-dark mb-3">Solutions Sur-Mesure</h5>
        <p className="text-muted small mb-0">
          Des filtres ultra-précis pour cibler instantanément la villa de vos rêves ou le véhicule adapté à vos exigences de confort et de budget.
        </p>
      </div>
    </motion.div>

    {/* Carte 2 : Transactions Sécurisées */}
    <motion.div className="col-md-6 col-lg-3" variants={fadeUp}>
      <div className="feature-card p-4 rounded-3 h-100 bg-white shadow-sm border border-light transition-hover">
        <div className="d-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success rounded-circle mb-4" style={{ width: '55px', height: '55px', fontSize: '1.5rem' }}>
          🛡️
        </div>
        <h5 className="fw-bold text-dark mb-3">Sécurité & Transparence</h5>
        <p className="text-muted small mb-0">
          Toutes nos annonces d'achat, vente et location passent par un protocole de vérification strict pour sécuriser vos transactions financières.
        </p>
      </div>
    </motion.div>

    {/* Carte 3 : Service Client Premium */}
    <motion.div className="col-md-6 col-lg-3" variants={fadeUp}>
      <div className="feature-card p-4 rounded-3 h-100 bg-white shadow-sm border border-light transition-hover">
        <div className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle mb-4" style={{ width: '55px', height: '55px', fontSize: '1.5rem' }}>
          🤝
        </div>
        <h5 className="fw-bold text-dark mb-3">Accompagnement Pro</h5>
        <p className="text-muted small mb-0">
          Nos conseillers experts vous guident pas à pas, de l'estimation de vos biens jusqu'aux démarches administratives ou de financement.
        </p>
      </div>
    </motion.div>

    {/* Carte 4 : Disponibilité Totale */}
    <motion.div className="col-md-6 col-lg-3" variants={fadeUp}>
      <div className="feature-card p-4 rounded-3 h-100 bg-white shadow-sm border border-light transition-hover">
        <div className="d-flex align-items-center justify-content-center bg-danger bg-opacity-10 text-danger rounded-circle mb-4" style={{ width: '55px', height: '55px', fontSize: '1.5rem' }}>
          ✨
        </div>
        <h5 className="fw-bold text-dark mb-3">Expérience Premium</h5>
        <p className="text-muted small mb-0">
          Une plateforme moderne, fluide et entièrement responsive, pensée pour vous offrir un accès privilégié à nos offres où que vous soyez.
        </p>
      </div>
    </motion.div>
  </div>

  {/* Petit effet CSS optionnel pour rendre le survol interactif */}
  <style>{`
    .transition-hover {
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .transition-hover:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.08) !important;
    }
  `}</style>
</motion.section>

      {/* Stats Section */}
      <motion.section
        className="container bg-dark text-white py-5 rounded-3 mb-5"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
      >
        <div className="row text-center g-4">
          <motion.div className="col-md-4" variants={fadeUp}>
            <h3 className="display-6 fw-bold text-warning">500+</h3>
            <p className="mb-0">Véhicules disponibles</p>
          </motion.div>
          <motion.div className="col-md-4" variants={fadeUp}>
            <h3 className="display-6 fw-bold text-warning">50+</h3>
            <p className=" mb-0">Marques automobiles</p>
          </motion.div>
          <motion.div className="col-md-4" variants={fadeUp}>
            <h3 className="display-6 fw-bold text-warning">24/7</h3>
            <p className="mb-0">Service en ligne</p>
          </motion.div>
        </div>
      </motion.section>

      {/* How it works */}
      <motion.section
        className="container py-5 mb-5"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
      >
        <motion.h2 className="text-center mb-5 fw-bold" variants={fadeDown}>Comment ça fonctionne ?</motion.h2>
        <div className="row g-4">
          <motion.div className="col-md-6" variants={fadeUp}>
            <div className="step-card p-4 rounded-3">
              <div className="step-number">1</div>
              <h4 className="mb-2">Parcourez les annonces</h4>
              <p className="text-muted">Accédez à notre catalogue complet avec des filtres de recherche avancés pour affiner vos résultats.</p>
            </div>
          </motion.div>
          <motion.div className="col-md-6" variants={fadeUp}>
            <div className="step-card p-4 rounded-3">
              <div className="step-number">2</div>
              <h4 className="mb-2">Consultez les détails</h4>
              <p className="text-muted">Cliquez sur une voiture pour voir tous les détails : photos, spécifications, prix et description.</p>
            </div>
          </motion.div>
          <motion.div className="col-md-6" variants={fadeUp}>
            <div className="step-card p-4 rounded-3">
              <div className="step-number">3</div>
              <h4 className="mb-2">Contactez-nous</h4>
              <p className="text-muted">Prenez contact pour visiter le véhicule, négocier ou obtenir un financement personnalisé.</p>
            </div>
          </motion.div>
          <motion.div className="col-md-6" variants={fadeUp}>
            <div className="step-card p-4 rounded-3">
              <div className="step-number">4</div>
              <h4 className="mb-2">Concrétisez votre achat</h4>
              <p className="text-muted">Finalisez la vente avec nos experts. Assistance administrative complète incluse.</p>
            </div>
          </motion.div>
        </div>
      </motion.section>
      <div>
        <TestimonialMarquee/>
      </div>

      {/* CTA Section */}
      <motion.section
        className="container bg-warning text-dark py-5 mb-4 rounded-3 text-center mt-3"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeLeft}
      >
        <h2 className="mb-3 fw-bold" >
          Prêt à trouver votre voiture ?
        </h2>
        <p className="mb-4 fs-5" >
          Parcourez notre sélection de 500+ véhicules et trouvez celui qui vous convient.
        </p>
        <div >
          <SectionLink section="automobile" action="acheter" className="btn btn-dark btn-lg px-5 fw-bold">
            Commencer la recherche →
          </SectionLink>
        </div>
      </motion.section>
    </>
  )
}

export default Home
