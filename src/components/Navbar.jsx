import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap'
import { getSavedFavorites } from '../utils/favorites.js'

function NavigationBar() {
  const navigate = useNavigate()
  
  // AJOUT : État pour contrôler l'ouverture/fermeture du menu mobile
  const [expanded, setExpanded] = useState(false)

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user')
    return savedUser ? JSON.parse(savedUser) : null
  })

  const [favoritesCount, setFavoritesCount] = useState(() => {
    try {
      return getSavedFavorites().length
    } catch {
      return 0
    }
  })

  // Écouteurs pour mettre à jour l'interface lorsque l'utilisateur ou les favoris changent
  useEffect(() => {
    const updateFavoritesCount = () => {
      try {
        setFavoritesCount(getSavedFavorites().length)
      } catch {
        setFavoritesCount(0)
      }
    }

    const updateUserFromLocalStorage = () => {
      const savedUser = localStorage.getItem('user')
      setUser(savedUser ? JSON.parse(savedUser) : null)
    }

    window.addEventListener('storage', updateFavoritesCount)
    window.addEventListener('storage', updateUserFromLocalStorage)
    window.addEventListener('favorites-updated', updateFavoritesCount)
    window.addEventListener('auth-authUpdate', updateUserFromLocalStorage)

    return () => {
      window.removeEventListener('storage', updateFavoritesCount)
      window.removeEventListener('storage', updateUserFromLocalStorage)
      window.removeEventListener('favorites-updated', updateFavoritesCount)
      window.removeEventListener('auth-authUpdate', updateUserFromLocalStorage)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setUser(null)
    setExpanded(false) // Referme le menu lors de la déconnexion
    navigate('/')
  }

  return (
    //  AJOUT : expanded={expanded} et onToggle pour synchroniser le bouton hamburger
    <Navbar 
      bg="dark" 
      variant="dark" 
      expand="lg" 
      className="mb-0 sticky-top"
      expanded={expanded}
      onToggle={(isOpen) => setExpanded(isOpen)}
    >
      <Container>
        {/*  AJOUT : onClick={() => setExpanded(false)} pour refermer si on clique sur le logo */}
        <Navbar.Brand as={NavLink} to="/" className="fw-bold text-warning" onClick={() => setExpanded(false)}>
          🏎️ Immo 2.0
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-lg-center">
            
            {/*  AJOUT : onClick={() => setExpanded(false)} sur chaque Nav.Link */}
            <Nav.Link as={NavLink} to="/" end onClick={() => setExpanded(false)}>
              Accueil
            </Nav.Link>
            
            <Nav.Link as={NavLink} to="/automobile" onClick={() => setExpanded(false)}>
              Automobile
            </Nav.Link>
            
            <Nav.Link as={NavLink} to="/immobilier" onClick={() => setExpanded(false)}>
              Immobilier
            </Nav.Link>
            
            <Nav.Link as={NavLink} to="/favorites" className="position-relative text-white" onClick={() => setExpanded(false)}>
              Favoris
              {favoritesCount > 0 && (
                <span
                  className="position-absolute rounded-circle bg-danger"
                  style={{ width: '10px', height: '10px', top: '4px', right: '-4px' }}
                />
              )}
            </Nav.Link>

            {user ? (
              <Dropdown align="end" className="ms-lg-2 mt-2 mt-lg-0">
                <Dropdown.Toggle variant="outline-warning" className="text-white" id="user-dropdown">
                  👤 {user.name}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {/*  AJOUT : onClick sur les sous-menus pour masquer aussi la nav */}
                  <Dropdown.Item href="/userDashboard" onClick={() => setExpanded(false)}>Mon compte</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout} className="text-danger">
                    Déconnexion
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Nav.Link as={NavLink} to="/login" className="btn btn-outline-warning text-white ms-lg-2 px-3 mt-2 mt-lg-0" onClick={() => setExpanded(false)}>
                🔐 Connexion
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default NavigationBar;