import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NavigationBar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import Acheter from './pages/Acheter.jsx'
import Louer from './pages/Louer.jsx'
import Vendre from './pages/Vendre.jsx'
import Voiture from './pages/Voiture.jsx'
import VoituresALouer from './pages/VoituresALouer.jsx'
import Meublee from './pages/Meublé.jsx'
import Automobile from './pages/Automobile.jsx'
import PropertyDetails from './pages/ImmobilierDetails.jsx'
import Favorites from './pages/Favorites.jsx'
import Login from './pages/Login.jsx'
import Panier from './pages/Panier.jsx' 
import Footer from './components/Footer.jsx'
import UserDashboard from './pages/userDashbord.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import VerifResetPassword from './pages/VerifResetPassword.jsx'
import Register from './pages/Register.jsx'
import VerifEmail from './pages/VerifEmail.jsx'

function App() {
  return (
    <BrowserRouter>      {/* // Il permet à React de modifier l'URL du navigateur sans rafraîchir la page. */}
      <NavigationBar />
      {/* dehors du bloc <Routes> Parce que tu veux que 
      ta barre de navigation reste visible en permanence 
      sur le site, peu importe la page sur laquelle se trouve l'utilisateur.
       Elle ne bougera jamais, seul le contenu en dessous va changer. */}
      <main className="">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/acheter" element={<Acheter />} />
          <Route path="/louer" element={<Louer />} />
          <Route path="/automobile/:section?" element={<Automobile />} />
          <Route path="/immobilier/details/:id" element={<PropertyDetails />} />
          <Route path="/immobilier/:section?" element={<Meublee />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/panier" element={<Panier />} />
          <Route path="/vendre" element={<Vendre />} />
          <Route path="/userDashboard" element={<UserDashboard />} />
          <Route path="/voiture/:id" element={<Voiture />} />
          <Route path="/voituresALouer/:id" element={<VoituresALouer />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/ForgotPassword" element={<ForgotPassword />} />
          <Route path="/verifResetPassword" element={<VerifResetPassword />} />
          <Route path="/VerifEmail" element={<VerifEmail />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  )
}

export default App