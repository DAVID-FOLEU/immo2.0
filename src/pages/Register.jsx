import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ENABLE_PAYMENT = false 

function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('') // Nouveau : Numéro de téléphone de l'utilisateur
  const [ville, setVille] = useState('') // Nouveau : Ville de résidence
  
  const [error, setError] = useState('')
  const [errorPass, setErrorPass] = useState('')

  const [paymentMethod, setPaymentMethod] = useState('momo')
  const [phoneNumber, setPhoneNumber] = useState('') // Utilisé pour le numéro de facturation MoMo/OM
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setErrorPass('')

    // Validation des nouveaux champs indispensables
    if (!email || !password || !phone || !ville) {
      setError('Veuillez remplir tous les champs obligatoires.')
      return
    }

    if (!email.includes('@')) {
      setError('Veuillez entrer une adresse email valide.')
      return
    }

    if (password.length < 5) {
      setErrorPass('Mot de passe trop faible (5 caractères minimum).')
      return
    }

    // Validation du format du numéro de téléphone principal (Cameroun)
    const cmrRegex = /^6[256789]\d{7}$/
    if (!cmrRegex.test(phone.trim())) {
      setError('Veuillez entrer un numéro de téléphone valide à 9 chiffres (ex: 6xxxxxxxx).')
      return
    }

    let paymentData = null

    // Gestion de la logique de paiement locale si activée
    if (ENABLE_PAYMENT) {
      if (!phoneNumber) {
        setError('Veuillez entrer votre numéro pour le paiement.')
        return
      }
      if (!cmrRegex.test(phoneNumber.trim())) {
        setError('Veuillez entrer un numéro MTN ou Orange Money valide pour le paiement.')
        return
      }
      paymentData = { method: paymentMethod, phone: phoneNumber, amount: 1000 }
    }

    setIsProcessingPayment(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password,
          phone,  // Transmis au backend
          ville,  // Transmis au backend
          ...(ENABLE_PAYMENT && { paymentData }) 
        })
      })

      const data = await response.json()
      setIsProcessingPayment(false)

      if (!response.ok) {
        setError(data.error || "Erreur lors de l'inscription.")
        return
      }

      // Stockage temporaire pour l'écran de vérification OTP / Email
      localStorage.setItem('verification_email', email)
      navigate('/VerifEmail')

    } catch (err) {
      console.error("Erreur lors de l'inscription :", err)
      setIsProcessingPayment(false)
      setError('Erreur réseau ou serveur injoignable.')
    }
  }

  return (
    <div className="container py-5 text-dark">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-lg border-0" style={{ borderRadius: '16px' }}>
            <div className="card-body p-5">
              <h2 className="text-center mb-4 fw-bold text-success">📝 Créer un compte</h2>

              {/* Correction anti-crash DOM : rendu par ternaire explicite */}
              {error ? (
                <div className="alert alert-danger p-2 small text-center">
                  <span>{error}</span>
                </div>
              ) : null}

              <form onSubmit={handleSubmit}>
                {/* Champ Email */}
                <div className="mb-3">
                  <label htmlFor="email" className="form-label fw-semibold">Adresse email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    placeholder="exemple@email.com"
                    value={email}
                    disabled={isProcessingPayment}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    required
                  />
                </div>

                {/* Champ Numéro de Téléphone Principal */}
                <div className="mb-3">
                  <label htmlFor="phone" className="form-label fw-semibold">Numéro de téléphone</label>
                  <input
                    type="tel"
                    className="form-control"
                    id="phone"
                    placeholder="Ex: 677123456"
                    maxLength="9"
                    value={phone}
                    disabled={isProcessingPayment}
                    onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '')); setError(''); }}
                    required
                  />
                </div>

                {/* Champ Ville */}
                <div className="mb-3">
                  <label htmlFor="ville" className="form-label fw-semibold">Ville de résidence</label>
                  <input
                    type="text"
                    className="form-control"
                    id="ville"
                    placeholder="Ex: Douala, Yaoundé..."
                    value={ville}
                    disabled={isProcessingPayment}
                    onChange={(e) => { setVille(e.target.value); setError(''); }}
                    required
                  />
                </div>

                {/* Champ Mot de passe */}
                <div className="mb-4">
                  <label htmlFor="password" className="form-label fw-semibold mb-1">Mot de passe</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    placeholder="••••••••"
                    value={password}
                    disabled={isProcessingPayment}
                    onChange={(e) => { setPassword(e.target.value); setError(''); setErrorPass(''); }}
                    required
                  />
                  {errorPass && <div className="text-danger small mt-1 fw-medium">⚠️ {errorPass}</div>}
                </div>

                {/* Section Paiement Mobile Money (Conditionnelle) */}
                {ENABLE_PAYMENT ? (
                  <div className="p-3 mb-4 rounded-3 border bg-light shadow-sm">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="fw-bold text-secondary small">Frais d'inscription :</span>
                      <span className="badge bg-success fs-6 fw-bold px-3 py-2">1 000 FCFA</span>
                    </div>

                    <label className="form-label fw-semibold small mb-2">Mode de paiement</label>
                    <div className="d-flex gap-3 mb-3">
                      <div className="flex-fill">
                        <input 
                          type="radio" 
                          className="btn-check" 
                          name="method" 
                          id="momo" 
                          checked={paymentMethod === 'momo'} 
                          onChange={() => { setPaymentMethod('momo'); setError(''); }} 
                          disabled={isProcessingPayment} 
                        />
                        <label className={`btn w-100 fw-bold border-2 small ${paymentMethod === 'momo' ? 'btn-outline-warning border-warning text-dark' : 'btn-outline-secondary text-muted'}`} htmlFor="momo">🟡 MTN MoMo</label>
                      </div>
                      <div className="flex-fill">
                        <input 
                          type="radio" 
                          className="btn-check" 
                          name="method" 
                          id="om" 
                          checked={paymentMethod === 'om'} 
                          onChange={() => { setPaymentMethod('om'); setError(''); }} 
                          disabled={isProcessingPayment} 
                        />
                        <label className={`btn w-100 fw-bold border-2 small ${paymentMethod === 'om' ? 'btn-outline-danger border-danger text-dark' : 'btn-outline-secondary text-muted'}`} htmlFor="om">🟠 Orange Money</label>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="phoneNumber" className="form-label fw-semibold small">Numéro de facturation (Momo/OM)</label>
                      <input
                        type="tel" 
                        className="form-control text-center fw-bold fs-5 border-success" 
                        id="phoneNumber" 
                        placeholder="Ex: 677123456" 
                        maxLength="9"
                        value={phoneNumber} 
                        disabled={isProcessingPayment}
                        onChange={(e) => { setPhoneNumber(e.target.value.replace(/\D/g, '')); setError(''); }}
                      />
                    </div>
                  </div>
                ) : null}

                {/* Bouton de soumission dynamique */}
                <button 
                  type="submit" 
                  className="btn btn-success btn-lg w-100 fw-bold text-white mb-3 shadow-sm d-flex align-items-center justify-content-center gap-2" 
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span>{ENABLE_PAYMENT ? "Attente du paiement..." : "Création du compte..."}</span>
                    </>
                  ) : (
                    <span>{ENABLE_PAYMENT ? "Payer 1000 FCFA & S'inscrire" : "S'inscrire"}</span>
                  )}
                </button>
              </form>

              {/* Redirection Connexion */}
              <div className="text-center mt-3">
                <p className="text-muted mb-0 small">
                  Vous avez déjà un compte ?{' '}
                  <button 
                    onClick={() => navigate('/login')} 
                    className="btn btn-link p-0 text-decoration-none fw-bold text-success"
                    disabled={isProcessingPayment}
                  >
                    Connectez-vous
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register;