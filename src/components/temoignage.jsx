import { useEffect, useState } from 'react'
import axios from 'axios'
import '../styles/TestimonialMarquee.css'

function TestimonialMarquee() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true) 
  
  const [newReview, setNewReview] = useState({
    rating: '5',
    comment: ''
  })

  const token = localStorage.getItem('token')

  const API_BASE_URL = import.meta.env?.VITE_API_URL ;

  useEffect(() => {
    let isMounted = true

    const fetchTestimonials = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/temoignages`)
        if (isMounted) {
          setReviews(response.data)
          setLoading(false)
        }
      } catch (err) {
        console.error('Erreur lors du chargement des témoignages:', err)
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchTestimonials()

    return () => {
      isMounted = false
    }
  }, [API_BASE_URL])

  const refreshTestimonials = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/temoignages`)
      setReviews(response.data)
    } catch (err) {
      console.error('Erreur lors du rafraîchissement des témoignages:', err)
    }
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()

    if (!token) {
      alert("Vous devez être connecté pour laisser un avis.")
      return
    }

    try {
      await axios.post(`${API_BASE_URL}/api/temoignages`, {
        rating: parseInt(newReview.rating, 10),
        comment: newReview.comment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      alert("Merci ! Votre avis a été enregistré avec succès.")
      setNewReview({ rating: '5', comment: '' })
      refreshTestimonials()
    } catch (err) {
      console.error("Erreur soumission témoignage:", err)
      alert(err.response?.data?.data?.error || "Impossible d'enregistrer votre avis.")
    }
  }

  const fallbackAvatar = '/images.jpg'
  const duplicatedReviews = reviews.length > 0 ? [...reviews, ...reviews] : []

  return (
    <div className="testimonial-section py-5 bg-dark text-white">
      {/* SECTION TITRE : Centré par le container classique */}
      <div className="container mb-5 text-center">
        <h2 className="fw-bold">Ce que nos partenaires d'affaires disent</h2>
        <p className="text-muted">Des avis honnêtes, des profils authentiques.</p>
      </div>

      {/* 1️⃣ LISTE MARQUEE EN PLEINE LARGEUR (container-fluid sans contrainte de ligne) */}
      <div className="container-fluid px-0 mb-5"> 
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-light" role="status"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="container">
            <div className="alert alert-secondary text-center border-secondary">
              Aucun avis pour le moment. Soyez le premier à en laisser un !
            </div>
          </div>
        ) : (
          <div className="marquee-wrapperw-100">
            <div className="marquee-track">
              {duplicatedReviews.map((review, index) => {
                const avatarUrl = review.avatar_url 
                  ? (review.avatar_url.startsWith('http') ? review.avatar_url : `${API_BASE_URL}/api/uploads/${review.avatar_url}`)
                  : fallbackAvatar

                return (
                  <div className="testimonial-card" key={`${review.id || index}-${index}`}>
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <img 
                        src={avatarUrl} 
                        alt={review.name} 
                        className="avatar-bw rounded-circle border border-secondary"
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        onError={(e) => { e.target.src = fallbackAvatar; }}
                      />
                      <div className="text-start">
                        <h4 className="h6 fw-bold mb-0 text-white">{review.name}</h4>
                        <span className="text-warning small">
                          {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                        </span>
                      </div>
                    </div>
                    <p className="testimonial-text text-start mb-0 text-light-50">
                      “ {review.comment} ”
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2️⃣ FORMULAIRE CENTRÉ : Utilisation de la grille Bootstrap avec justification au centre */}
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 col-lg-5">
            <div className="card border-0 shadow-sm p-4 bg-white text-dark" style={{ borderRadius: '12px' }}>
              <h5 className="fw-bold mb-3 text-dark">⭐ Laisser un Avis</h5>
              
              <form onSubmit={handleReviewSubmit}>
                <div className="mb-3">
                  <label className="small text-muted mb-1 fw-semibold">Note globale</label>
                  <select 
                    className="form-select" 
                    value={newReview.rating} 
                    onChange={e => setNewReview({...newReview, rating: e.target.value})}
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                    <option value="4">⭐⭐⭐⭐ (4/5)</option>
                    <option value="3">⭐⭐⭐ (3/5)</option>
                    <option value="2">⭐⭐ (2/5)</option>
                    <option value="1">⭐ (1/5)</option>
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="small text-muted mb-1 fw-semibold">Votre Commentaire</label>
                  <textarea 
                    className="form-control" 
                    rows="4" 
                    placeholder="Partagez votre expérience..."
                    value={newReview.comment} 
                    onChange={e => setNewReview({...newReview, comment: e.target.value})} 
                    required
                  ></textarea>
                </div>
                
                <button type="submit" className="btn btn-dark btn-sm w-100 fw-semibold py-2">
                  🚀 Soumettre mon témoignage
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default TestimonialMarquee;