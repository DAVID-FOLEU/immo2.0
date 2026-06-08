// routes/annonces.js ou routes/favorites.js
import express from 'express'
import pool from '../config/db.js'
// Import de ton middleware d'authentification pour récupérer req.user.id
// Ajuste le chemin selon ton architecture
import { authenticateToken, isUser } from './auth.js'

const router = express.Router()

/**
 * 1. Vérifier si une annonce spécifique est en favori pour l'utilisateur connecté
 * GET /api/favorites/check/:annonceId
 */
router.get('/favorites/check/:annonceId', authenticateToken, isUser, async (req, res) => {
    try {
        const userId = req.user.id // Extrait du jeton JWT par authenticateToken
        const { annonceId } = req.params

        const [rows] = await pool.query(
            'SELECT id FROM user_favorites WHERE user_id = ? AND annonce_id = ?',
            [userId, annonceId]
        )

        res.json({ isFavorite: rows.length > 0 })
    } catch (error) {
        console.error("Erreur check favori:", error)
        res.status(500).json({ error: "Erreur interne du serveur" })
    }
})

/**
 * 3. Récupération de tous les favoris de l'utilisateur connecté
 * GET /api/favorites
 */
router.get('/favorites', authenticateToken, isUser, async (req, res) => {
    try {
        const userId = req.user.id

        const [rows] = await pool.query(
            `SELECT a.*, 
                    (SELECT image_url FROM annonce_images WHERE annonce_id = a.id AND is_principal = 1 LIMIT 1) AS image_principale,
                    IF(a.categorie = 'immobilier', 'property', 'car') AS type
             FROM user_favorites uf
             JOIN annonces a ON uf.annonce_id = a.id
             WHERE uf.user_id = ? AND a.is_deleted = 0 AND a.is_visible = 1
             ORDER BY uf.id DESC`,
            [userId]
        )

        return res.json({ success: true, count: rows.length, data: rows })
    } catch (error) {
        console.error('Erreur récupération favoris :', error)
        return res.status(500).json({ error: 'Erreur interne lors de la lecture des favoris.' })
    }
})

/**
 * 2. Ajouter ou retirer une annonce des favoris (Toggle automatique)
 * POST /api/favorites/toggle
 */
router.post('/favorites/toggle', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id
        const { annonceId } = req.body

        if (!annonceId) {
            return res.status(400).json({ error: "L'identifiant de l'annonce est requis." })
        }

        // Vérifier si le favori existe déjà
        const [rows] = await pool.query(
            'SELECT id FROM user_favorites WHERE user_id = ? AND annonce_id = ?',
            [userId, annonceId]
        )

        if (rows.length > 0) {
            // S'il existe, on le supprime (Retrait des favoris)
            await pool.query(
                'DELETE FROM user_favorites WHERE user_id = ? AND annonce_id = ?',
                [userId, annonceId]
            )
            return res.json({ success: true, isFavorite: false, message: "Retiré des favoris" })
        } else {
            // S'il n'existe pas, on l'ajoute (Ajout aux favoris)
            await pool.query(
                'INSERT INTO user_favorites (user_id, annonce_id) VALUES (?, ?)',
                [userId, annonceId]
            )
            return res.json({ success: true, isFavorite: true, message: "Ajouté aux favoris" })
        }
    } catch (error) {
        console.error("Erreur toggle favori:", error)
        res.status(500).json({ error: "Erreur interne lors de la mise à jour des favoris" })
    }
})

export default router