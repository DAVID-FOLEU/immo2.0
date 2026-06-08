import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function VerifyEmail() {
  const navigate = useNavigate()
  
  // Initialisation directe de l'état depuis le localStorage
  const [email] = useState(() => localStorage.getItem('verification_email') || '')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // États pour la gestion du renvoi du code
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // Redirection vers l'inscription si aucun email n'est stocké
  useEffect(() => {
    if (!email) {
      navigate('/register')
    }
  }, [email, navigate])

  // Gestionnaire du compte à rebours pour le bouton de renvoi
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Soumission du code de vérification
  const handleVerify = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!code || code.length < 6) {
      setError('Veuillez entrer le code complet à 6 chiffres.')
      return
    }

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Code invalide ou expiré.')
        return
      }

      setSuccess('Compte validé avec succès ! Redirection...')
      localStorage.removeItem('verification_email')
      
      setTimeout(() => {
        navigate('/userDashboard')
      }, 2000)

    } catch {
      setError('Erreur de connexion avec le serveur.')
    }
  }

  // Fonction pour renvoyer le code d'activation
  const handleResendCode = async () => {
    if (countdown > 0 || isResending) return

    setError('')
    setSuccess('')
    setIsResending(true)

    try {
      const response = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Impossible de renvoyer le code.')
        return
      }

      setSuccess('Un nouveau code de validation a été envoyé à votre email.')
      setCountdown(60) // Bloque le bouton pendant 60 secondes

    } catch {
      setError('Erreur réseau lors de la tentative de renvoi.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card shadow-lg border-0 p-4" style={{ borderRadius: '16px' }}>
            <h3 className="text-center fw-bold mb-3">📧 Validation de l'email</h3>
            <p className="text-muted text-center small">
              Un code de validation a été envoyé à l'adresse <strong>{email}</strong>.
            </p>
            
            {/* Sécurisation anti-crash DOM via ternaire explicite et balises span */}
            {error ? (
              <div className="alert alert-danger p-2 small text-center">
                <span>{error}</span>
              </div>
            ) : null}
            
            {success ? (
              <div className="alert alert-success p-2 small text-center">
                <span>{success}</span>
              </div>
            ) : null}

            <form onSubmit={handleVerify}>
              <div className="mb-3">
                <input
                  type="text" 
                  className="form-control text-center fs-4 fw-bold" 
                  placeholder="000000" 
                  maxLength="6"
                  value={code} 
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <button type="submit" className="btn btn-warning w-100 fw-bold text-dark mb-3">
                Vérifier le code
              </button>
            </form>

            {/* Section Renvoyer le code */}
            <div className="text-center mt-2">
              <p className="text-muted small mb-0">
                Vous n'avez pas reçu de code ?{' '}
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={countdown > 0 || isResending}
                  className={`btn btn-link p-0 text-decoration-none fw-bold ${
                    countdown > 0 ? 'text-muted' : 'text-success'
                  }`}
                >
                  {isResending 
                    ? 'Envoi en cours...' 
                    : countdown > 0 
                    ? `Renvoyer (${countdown}s)` 
                    : 'Renvoyer le code'}
                </button>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail