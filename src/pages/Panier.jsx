import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Button from 'react-bootstrap/Button'

function Panier() {
  const navigate = useNavigate()

  // 1. Extraction et normalisation de la logique de chargement
  const loadCartData = useCallback(() => {
    try {
      const savedCart = localStorage.getItem('cart')
      const parsedCart = savedCart ? JSON.parse(savedCart) : []
      
      return parsedCart.map(item => {
        // Aligné sur les données MySQL (type_transaction: 'louer' ou 'vendre') ou fallback sur les anciennes clés
        const category = item.type_transaction || (item.days || item.priceLocation ? 'louer' : 'vendre')
        const normalizedDays = category === 'louer' ? (item.days ? Number(item.days) : 1) : undefined
        const price = Number(item.price ?? item.priceLocation ?? 0)
        
        const totalPrice = category === 'louer'
          ? price * normalizedDays
          : price

        return {
          ...item,
          type_transaction: category,
          days: normalizedDays,
          price,
          totalPrice,
        }
      })
    } catch (error) {
      console.error("Erreur de lecture initiale du panier :", error)
      return []
    }
  }, [])

  // 2. Chargement initial sécurisé directement à l'initialisation de l'état (Pas de rendu en cascade)
  const [cartItems, setCartItems] = useState(() => loadCartData())

  // 3. Écouteur global pour synchroniser le panier au signal "cart-updated"
  useEffect(() => {
    const handleCartUpdate = () => {
      setCartItems(loadCartData())
    }

    window.addEventListener('cart-updated', handleCartUpdate)
  
    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate)
    }
  }, [loadCartData])

  // Fonction pour supprimer un véhicule ou un bien du panier
  const removeFromCart = (id) => {
    const updatedCart = cartItems.filter(item => item.id !== id)
    setCartItems(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
    window.dispatchEvent(new Event('cart-updated'))
  }

  // Modification interactive de la durée en cours (Calcul fluide via onInput)
  const updateDays = (id, newDays) => {
    const valAsNumber = parseInt(newDays, 10)
    const normalizedDays = isNaN(valAsNumber) || valAsNumber < 1 ? 1 : valAsNumber

    const updatedCart = cartItems.map(item => {
      if (item.id !== id || item.type_transaction !== 'louer') {
        return item
      }
      const price = Number(item.price ?? 0)
      return {
        ...item,
        days: normalizedDays,
        totalPrice: price * normalizedDays,
      }
    })
    setCartItems(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
    window.dispatchEvent(new Event('cart-updated'))
  }

  // Fonction pour vider complètement le panier
  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem('cart')
    window.dispatchEvent(new Event('cart-updated'))
  }

  // Calcul automatisé du montant global cumulé
  const totalAmount = cartItems.reduce((total, item) => {
    return total + Number(item.totalPrice ?? item.price ?? 0)
  }, 0)

  return (
    <div className="container py-5 text-dark">
      <Button variant="outline-secondary" size="sm" onClick={() => navigate('/Automobile')} className="mb-3 fw-medium">
        ← Continuer mes recherches
      </Button>
      <h2 className="fw-bold mb-4 mt-2">🛒 Votre Panier</h2>

      {cartItems.length === 0 ? (
        <div className="text-center py-5 bg-light rounded-3 shadow-sm border">
          <p className="text-muted fs-5 mb-4">Votre panier est actuellement vide.</p>
          
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Button as={Link} to="/automobile" variant="warning" className="fw-bold text-dark px-4">
              🚗 Véhicules
            </Button>
            <Button as={Link} to="/immobilier/louer" variant="success" className="fw-bold text-white px-4">
              🏠 Immobilier
            </Button>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {/* Liste des éléments du panier */}
          <div className="col-12 col-lg-8">
            {cartItems.map((item) => (
              <div className="card mb-3 shadow-sm border" key={`cart-item-${item.id}`}>
                <div className="row g-0 align-items-center flex-column flex-md-row">
                  <div className="col-12 col-md-4">
                    <img
                      src={Array.isArray(item.images) ? item.images[0] : (item.images || 'https://via.placeholder.com/300x140?text=Pas+d%27image')}
                      alt={`${item.brand || item.title || ''}`}
                      className="img-fluid rounded-start w-100"
                      style={{ height: '140px', objectFit: 'cover' }}
                    />
                  </div>
                  <div className="col-12 col-md-8">
                    <img src="" alt="" />
                    <div className="card-body d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                      <div>
                        <h5 className="card-title fw-bold mb-1 text-success">
                          {item.brand ? `${item.brand} ${item.model || ''}` : (item.title || 'Produit sans nom')}
                        </h5>
                        <p className="text-muted small mb-2">
                          {item.year && `${item.year} • `}{item.mileage ? `${item.mileage.toLocaleString('fr-FR')} km` : item.ville || 'Localisation N/C'}
                        </p>
                        <div className="mb-2">
                          <span className="badge bg-secondary text-uppercase">
                            {item.type_transaction === 'vendre' || item.type_transaction === 'acheter' ? 'Achat / Vente' : 'Location'}
                          </span>
                        </div>
                        
                        {item.type_transaction === 'louer' ? (
                          <div className="small text-secondary">
                            <div>Tarif : <strong className="text-dark">{(item.price || 0).toLocaleString('fr-FR')} FCFA / jour</strong></div>
                            <div className="d-flex align-items-center gap-2 mt-2">
                              <label htmlFor={`days-input-${item.id}`} className="mb-0 small fw-semibold">Durée (jours) :</label>
                              <input
                                id={`days-input-${item.id}`}
                                type="number"
                                min="1"
                                value={item.days}
                                onInput={(e) => updateDays(item.id, e.target.value)}
                                className="form-control form-control-sm border-success"
                                style={{ width: '80px' }}
                              />
                            </div>
                            <div className="mt-2 text-dark">Sous-total : <strong className="text-success">{(item.totalPrice || 0).toLocaleString('fr-FR')} FCFA</strong></div>
                          </div>
                        ) : (
                          <div className="small text-dark">Prix : <strong className="text-success">{(item.price || 0).toLocaleString('fr-FR')} FCFA</strong></div>
                        )}
                      </div>
                      
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={() => removeFromCart(item.id)}
                        title="Retirer cet élément"
                        className="align-self-start align-self-sm-center fw-medium px-3"
                      >
                        🗑️ Supprimer
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <Button variant="link" className="mt-2 text-danger text-decoration-none small p-0 fw-semibold" onClick={clearCart}>
              🗑️ Vider entièrement le panier
            </Button>
          </div>

          {/* Panneau du Résumé Financier */}
          <div className="col-12 col-lg-4">
            <div className="p-4 bg-light rounded-3 shadow-sm border">
              <h4 className="fw-bold mb-3 h5">Résumé de la commande</h4>
              <hr />
              <div className="d-flex justify-content-between align-items-center mb-2 small text-muted">
                <span>Articles sélectionnés :</span>
                <span className="fw-bold text-dark">{cartItems.length}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center fs-5 mb-4">
                <span className="fw-semibold">Montant Total :</span>
                <span className="fw-bold text-success">{(totalAmount).toLocaleString('fr-FR')} FCFA</span>
              </div>
              
              <Button 
                variant="success" 
                className="w-100 btn-lg fw-bold text-white shadow-sm py-2"
                onClick={() => alert('Félicitations ! Traitement de votre commande en cours...')}
              >
                Passer la commande
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Panier