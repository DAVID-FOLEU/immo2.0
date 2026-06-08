import express from 'express'
import pool from '../config/db.js'
import { authenticateToken } from './auth.js' // Conserve le middleware de session JWT principal

const router = express.Router()

// 1. Récupérer tous les témoignages (Route Publique)
// 💡 CORRECTION URL : Si dans ton server.js tu as mis app.use('/api/temoignages', ...), ici laisse uniquement '/'
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, comment, rating, avatar_url, created_at FROM temoignages ORDER BY created_at DESC'
    )
    res.json(rows)
  } catch (err) {
    console.error("Erreur GET témoignages:", err)
    res.status(500).json({ error: "Erreur serveur lors de la récupération des avis." })
  }
})

// 2. Insérer un nouveau témoignage (Route Sécurisée)
// 💡 CORRECTION URL : Remplacé '/temoignages' par '/' pour éviter le doublon d'URL
// 💡 CORRECTION MIDDLEWARE : On retire "isUser, isAdmin" pour laisser toute personne connectée (authenticateToken) publier un avis.
router.post('/', authenticateToken, async (req, res) => {
  const userId = req.user.id // Extrait du jeton décodé par ton middleware auth
  const { rating, comment } = req.body

  if (!rating || !comment) {
    return res.status(400).json({ error: "La note et le commentaire sont requis." })
  }

  try {
    // Étape A : Aller chercher le nom réel et l'avatar de l'utilisateur connecté dans la table 'users'
    const [userRows] = await pool.query('SELECT name, avatar_url FROM users WHERE id = ?', [userId])
    
    if (userRows.length === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé." })
    }

    const { name, avatar_url } = userRows[0]

    // Étape B : Insérer proprement l'avis avec les données d'identité extraites
    await pool.query(
      'INSERT INTO temoignages (user_id, name, comment, rating, avatar_url) VALUES (?, ?, ?, ?, ?)',
      [userId, name, comment, rating, avatar_url]
    )

    res.status(201).json({ success: true, message: "Témoignage ajouté avec succès !" })
  } catch (err) {
    console.error("Erreur POST témoignage:", err)
    res.status(500).json({ error: "Erreur lors de l'enregistrement de l'avis." })
  }
})

export default router