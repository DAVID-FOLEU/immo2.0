import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('Veuillez renseigner votre adresse email.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue.')
      }

      setSuccess(true)

      // Redirection après 2 secondes vers la page de vérification en passant l'email dans le state
      setTimeout(() => {
        navigate('/verif-reset-password', { state: { email } })
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de contacter le serveur.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-5 text-dark">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-lg border-0" style={{ borderRadius: '16px' }}>
            <div className="card-body p-5">
              
              <div className="text-center mb-4">
                <div className="d-inline-flex align-items-center justify-content-center bg-warning bg-opacity-10 text-warning rounded-circle mb-3" style={{ width: '60px', height: '60px' }}>
                  <span className="fs-3">🔑</span>
                </div>
                <h2 className="fw-bold text-dark mb-1">Mot de passe oublié</h2>
                <p className="text-muted small px-2">
                  Entrez l'adresse e-mail associée à votre compte. Nous vous enverrons un code de réinitialisation.
                </p>
              </div>

              {error && <div className="alert alert-danger p-2 small mb-3 text-center">⚠️ {error}</div>}

              {success && (
                <div className="alert alert-success p-3 small mb-3 d-flex align-items-center gap-2">
                  <span className="spinner-border spinner-border-sm text-success" role="status"></span>
                  <span>Code envoyé ! Redirection vers la vérification...</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="email" className="form-label fw-semibold">Adresse email</label>
                  <input
                    type="email"
                    className="form-control py-2"
                    id="email"
                    placeholder="exemple@email.com"
                    value={email}
                    disabled={loading || success}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError('')
                    }}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-warning btn-lg w-100 fw-bold text-dark mb-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
                  disabled={loading || success}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      Envoi en cours...
                    </>
                  ) : (
                    "Envoyer le code de récupération"
                  )}
                </button>
              </form>

              <div className="text-center mt-3">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="btn btn-link p-0 text-decoration-none small text-muted fw-semibold"
                >
                  ⬅️ Retour à la page de connexion
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword