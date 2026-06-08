import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

function VerifResetPassword() {
  const location = useLocation()
  const navigate = useNavigate()
  
  // Récupère l'email transmis par la page précédente si disponible
  const [email, setEmail] = useState(location.state?.email || '')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleResetSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !code || !newPassword) {
      setError('Tous les champs sont obligatoires.')
      return
    }

    if (newPassword.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Échec de la réinitialisation.')
      }

      setSuccess(true)

      // Redirection vers le login après succès
      setTimeout(() => {
        navigate('/login')
      }, 2500)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur interne est survenue.')
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
                <div className="d-inline-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success rounded-circle mb-3" style={{ width: '60px', height: '60px' }}>
                  <span className="fs-3">🛡️</span>
                </div>
                <h2 className="fw-bold text-dark mb-1">Nouveau mot de passe</h2>
                <p className="text-muted small px-2">
                  Saisissez le code à 6 chiffres reçu par e-mail et définissez votre nouvel accès.
                </p>
              </div>

              {error && <div className="alert alert-danger p-2 small mb-3 text-center">⚠️ {error}</div>}

              {success && (
                <div className="alert alert-success p-3 small mb-3 text-center">
                  🎉 Mot de passe mis à jour avec succès ! Redirection vers la page de connexion...
                </div>
              )}

              <form onSubmit={handleResetSubmit}>
                {/* Email de contrôle */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Adresse email de vérification</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    disabled={!!location.state?.email || loading || success}
                    required
                  />
                </div>

                {/* Code à 6 chiffres */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Code de sécurité reçu</label>
                  <input
                    type="text"
                    className="form-control text-center fw-bold letter-spacing-5"
                    maxLength="6"
                    placeholder="123456"
                    value={code}
                    disabled={loading || success}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} // Garde uniquement les chiffres
                    required
                  />
                </div>

                {/* Nouveau Password */}
                <div className="mb-4">
                  <label className="form-label small fw-semibold">Nouveau mot de passe</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Min. 6 caractères"
                    value={newPassword}
                    disabled={loading || success}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-dark btn-lg w-100 fw-bold mb-3 shadow-sm"
                  disabled={loading || success}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                  ) : (
                    "Mettre à jour le mot de passe"
                  )}
                </button>
              </form>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifResetPassword