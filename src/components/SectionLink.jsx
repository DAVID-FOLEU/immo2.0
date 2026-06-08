import { forwardRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { buildSectionPath, getSectionFromPath } from '../utils/sectionRoutes.js'

const SectionLink = forwardRef(({ action, section, to, ...props }, ref) => {
  const location = useLocation()

  // 1. Détection sécurisée de la section courante depuis l'URL ou fallback par défaut
  // Aligné sur l'univers de tes tables : 'automobile' ou 'immobilier'
  const currentSection = section || getSectionFromPath(location.pathname) || 'automobile'
  
  // 2. Détermination de la cible (action ou lien direct)
  const target = to ?? action

  // 3. Construction dynamique et sécurisée du chemin final pour l'utilisateur
  let finalTo = target

  if (typeof target === 'string') {
    // Si la cible est un chemin relatif (ex: 'details' ou 'recherche'), 
    // buildSectionPath va la combiner proprement avec 'automobile' ou 'immobilier'
    finalTo = buildSectionPath(target, currentSection)
  } else if (!target) {
    // Sécurité : si aucune cible n'est fournie, évite le crash en redirigeant vers la racine de la section
    finalTo = `/${currentSection}`
  }

  return <Link ref={ref} to={finalTo} {...props} />
})

// Optionnel mais recommandé en développement pour le débogage dans React DevTools
SectionLink.displayName = 'SectionLink'

export default SectionLink