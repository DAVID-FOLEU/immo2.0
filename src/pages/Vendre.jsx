import Info from '../components/Info.jsx'

function Vendre() {
  return (
    <>
      <header className="text-center mb-5">
        <p className="text-uppercase text-warning fw-bold mb-2">Vendre votre voiture</p>
        <h1 className="mb-3">Mettez votre véhicule en ligne</h1>
        <p className="text-secondary">
          Remplissez le formulaire ci-dessous pour nous envoyer les informations de votre voiture. Nous vous recontacterons rapidement.
        </p>
      </header>

      <Info />
    </>
  )
}

export default Vendre
