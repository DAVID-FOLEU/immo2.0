import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [errorPass, setErrorPass] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setErrorPass('')

    if (!email || !password) {
      setError('Veuillez remplir tous les champs.')
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

    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Une erreur est survenue lors de la connexion.')
        setLoading(false)
        return
      }

      // Stockage local du jeton JWT et du profil utilisateur
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      // Déclenche un événement personnalisé pour notifier instantanément les composants (ex: Navbar)
      window.dispatchEvent(new Event('auth-authUpdate'))
      
      // Redirection automatique selon les privilèges du rôle stocké en BDD
      if (data.user.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/userDashboard')
      }

    } catch {
      setError('Impossible de joindre le serveur backend. Veuillez vérifier votre connexion.')
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
              <h2 className="text-center mb-4 fw-bold">🔐 Connexion</h2>

              {error && <div className="alert alert-danger p-2 small text-center">⚠️ {error}</div>}

              <form onSubmit={handleSubmit}>
                {/* Champ Email */}
                <div className="mb-3">
                  <label htmlFor="email" className="form-label fw-semibold">Adresse email</label>
                  <input
                    type="email"
                    className="form-control py-2"
                    id="email"
                    placeholder="exemple@email.com"
                    value={email}
                    disabled={loading}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    required
                  />
                </div>

                {/* Champ Mot de passe */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <label htmlFor="password" className="form-label fw-semibold mb-1">Mot de passe</label>
                    <button
                      type="button"
                      onClick={() => navigate('/ForgotPassword')}
                      className="btn btn-link p-0 text-decoration-none small text-warning fw-semibold mb-1"
                      disabled={loading}
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                  <input
                    type="password"
                    className="form-control py-2"
                    id="password"
                    placeholder="••••••••"
                    value={password}
                    disabled={loading}
                    onChange={(e) => { setPassword(e.target.value); setError(''); setErrorPass(''); }}
                    required
                  />
                  {errorPass && <div className="text-danger small mt-1">⚠️ {errorPass}</div>}
                </div>

                {/* Bouton de soumission avec Spinner */}
                <button 
                  type="submit" 
                  className="btn btn-warning btn-lg w-100 fw-bold text-dark mb-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      Vérification...
                    </>
                  ) : (
                    "Se connecter"
                  )}
                </button>
              </form>

              {/* Redirection Inscription */}
              <div className="text-center mt-3">
                <p className="text-muted mb-0 small">
                  Pas encore de compte ?{' '}
                  <button 
                    onClick={() => navigate('/register')} 
                    className="btn btn-link p-0 text-decoration-none fw-bold text-warning"
                    disabled={loading}
                  >
                    Inscrivez-vous
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

export default Login