import express from 'express'
import pool from '../config/db.js'
import { authenticateToken } from './auth.js'

const router = express.Router()

// GET /api/user/profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id

    // Récupérer le profil utilisateur
    const [users] = await pool.query('SELECT id, name, email, role, ville, phone, avatar FROM users WHERE id = ?', [userId])
    if (users.length === 0) return res.status(404).json({ error: 'Utilisateur introuvable' })
    const user = users[0]

    // Récupérer les annonces publiées par l'utilisateur
    const [annonces] = await pool.query('SELECT a.*, (SELECT image_url FROM annonce_images WHERE annonce_id = a.id AND is_principal = 1 LIMIT 1) as image_principale FROM annonces a WHERE a.user_id = ? AND a.is_deleted = 0', [userId])

    // Récupérer le nombre de favoris
    const [favRows] = await pool.query('SELECT COUNT(*) as cnt FROM user_favorites WHERE user_id = ?', [userId])

    // Pour simplifier, messages et threads sont retournés vides si pas de table dédiée
    const response = {
      profile: user,
      annonces,
      favoritesCount: favRows[0].cnt || 0,
      messages: [],
      success: true
    }

    return res.json(response)
  } catch (error) {
    console.error('Erreur /api/user/profile :', error)
    return res.status(500).json({ error: 'Erreur interne serveur' })
  }
})

export default router
