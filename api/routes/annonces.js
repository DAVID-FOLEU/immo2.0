import express from 'express';
import pool from '../config/db.js';
import { authenticateToken, isUser, isAdmin } from './auth.js'; // Ton middleware de session JWT
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// ============================================================
// 1. ROUTE UNIFIÉE : TOUTES LES ANNONCES (Mixte ou par Catégorie)
// ============================================================
router.get('/annonces', async (req, res) => {
    try {
        const { categorie, ville, type_transaction, type_boost } = req.query;

        let query = `
            SELECT a.*, 
                   (SELECT image_url FROM annonce_images WHERE annonce_id = a.id AND is_principal = 1 LIMIT 1) as image_principale
            FROM annonces a 
            WHERE a.is_deleted = 0 AND a.is_visible = 1
        `;
        const queryParams = [];

        if (categorie) {
            query += ' AND a.categorie = ?';
            queryParams.push(categorie);
        }

        if (ville) {
            query += ' AND a.ville = ?';
            queryParams.push(ville);
        }

        if (type_transaction) {
            query += ' AND a.type_transaction = ?';
            queryParams.push(type_transaction);
        }

        if (type_boost) {
            query += ' AND a.type_boost = ?';
            queryParams.push(type_boost);
        }

        // Tri robuste prenant en compte la date d'expiration du boost
        query += `
            ORDER BY 
                CASE 
                    WHEN a.type_boost = 'gold' AND a.boost_end_at > NOW() THEN 1
                    WHEN a.type_boost = 'premium' AND a.boost_end_at > NOW() THEN 2
                    WHEN a.type_boost = 'enAvant' AND a.boost_end_at > NOW() THEN 3
                    ELSE 4
                END, 
                a.created_at DESC
        `;

        const [annonces] = await pool.query(query, queryParams);

        return res.json({
            success: true,
            count: annonces.length,
            data: annonces
        });

    } catch (error) {
        console.error("Erreur lors de la récupération des annonces :", error);
        return res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
});

// ============================================================
// 2. ROUTE UNIFIÉE : DÉTAILS DYNAMIQUES (Jointure intelligente selon type)
// ============================================================
router.get('/annonces/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [baseAnnonce] = await pool.query(
            'SELECT categorie FROM annonces WHERE id = ? AND is_deleted = 0', 
            [id]
        );

        if (baseAnnonce.length === 0) {
            return res.status(404).json({ error: 'Annonce introuvable ou supprimée.' });
        }

        const { categorie } = baseAnnonce[0];
        let detailQuery = '';

        if (categorie === 'immobilier') {
            detailQuery = `
                SELECT a.*, i.category_immo, i.quartier, i.goudron_proximite, 
                       i.precise_location, i.is_furnished, i.bedrooms, i.bathrooms, 
                       i.num_mois_minimum, i.disponible_a_partir_de,
                       u.name as proprietaire_name, u.phone as phone
                FROM annonces a
                LEFT JOIN immobilier i ON a.id = i.annonce_id
                LEFT JOIN users u ON a.user_id = u.id
                WHERE a.id = ?
            `;
        } else if (categorie === 'automobile') {
            detailQuery = `
                SELECT a.*, auto.brand, auto.year, auto.mileage, auto.carrosserie_type, 
                       auto.moteur, auto.transmission, auto.with_driver, auto.color,
                       u.name as proprietaire_name, u.phone as phone
                FROM annonces a
                LEFT JOIN automobile auto ON a.id = auto.annonce_id
                LEFT JOIN users u ON a.user_id = u.id
                WHERE a.id = ?
            `;
        }

        const [details] = await pool.query(detailQuery, [id]);
        
        if (details.length === 0) {
            return res.status(404).json({ error: 'Détails de l\'annonce introuvables.' });
        }

        const annonceComplete = details[0];

        const [images] = await pool.query(
            'SELECT id, image_url, is_principal FROM annonce_images WHERE annonce_id = ? ORDER BY is_principal DESC', 
            [id]
        );

        annonceComplete.images = images;

        return res.json({
            success: true,
            data: annonceComplete
        });

    } catch (error) {
        console.error(`Erreur lors de la récupération des détails de l'annonce ${id} :`, error);
        // CORRECTION : Guillemets doubles pour éviter le crash de syntaxe sur le caractère '
        return res.status(500).json({ error: "Erreur lors de la récupération des détails de l'annonce." });
    }
});

// ============================================================
// 3. CREATE ANNONCE
// POST /api/annonces
// ============================================================
router.post('/annonces', authenticateToken, isUser, async (req, res) => {
    try {
        const userId = req.user.id
        const payload = req.body || {}
        const categorie = payload.categorie || 'automobile'

        const annonceId = uuidv4()

        const titre = payload.title || payload.titre_ou_modele || ''
        const ville = payload.ville || ''
        const type_transaction = payload.type_transaction || (payload.isForRent ? 'louer' : 'vendre')
        const prix_vente = payload.price || null
        const prix_location = payload.priceLocation || null

        await pool.query(
            `INSERT INTO annonces (id, user_id, titre_ou_modele, categorie, ville, type_transaction, prix_vente, prix_location, is_visible, is_deleted, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 0, NOW())`,
            [annonceId, userId, titre, categorie, ville, type_transaction, prix_vente, prix_location]
        )

        // Images
        if (Array.isArray(payload.images) && payload.images.length > 0) {
            const insertImgPromises = payload.images.map((imgUrl, idx) => {
                const isPrincipal = idx === 0 ? 1 : 0
                return pool.query('INSERT INTO annonce_images (annonce_id, image_url, is_principal) VALUES (?, ?, ?)', [annonceId, imgUrl, isPrincipal])
            })
            await Promise.all(insertImgPromises)
        }

        // Détails selon la catégorie
        if (categorie === 'automobile') {
            const { brand, year, mileage, moteur, transmission, withDriver, color } = payload
            await pool.query(
                `INSERT INTO automobile (annonce_id, brand, year, mileage, moteur, transmission, with_driver, color)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [annonceId, brand || '', year || null, mileage || null, moteur || '', transmission || '', withDriver ? 1 : 0, color || '']
            )
        } else if (categorie === 'immobilier') {
            const { category_immo, quartier, goudron_proximite, is_furnished, bedrooms, bathrooms, num_mois_minimum, disponible_a_partir_de } = payload
            await pool.query(
                `INSERT INTO immobilier (annonce_id, category_immo, quartier, goudron_proximite, is_furnished, bedrooms, bathrooms, num_mois_minimum, disponible_a_partir_de)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [annonceId, category_immo || '', quartier || '', goudron_proximite || '', is_furnished ? 1 : 0, bedrooms || null, bathrooms || null, num_mois_minimum || null, disponible_a_partir_de || null]
            )
        }

        return res.status(201).json({ success: true, id: annonceId, message: 'Annonce créée avec succès.' })
    } catch (error) {
        console.error('Erreur création annonce :', error)
        return res.status(500).json({ error: 'Erreur interne lors de la création de l\'annonce.' })
    }
})

// ============================================================
// 4. UPDATE ANNONCE
// PUT /api/annonces/:id
// ============================================================
router.put('/annonces/:id', authenticateToken, isUser, async (req, res) => {
    const { id } = req.params
    const payload = req.body || {}
    try {
        // Vérifier que l'annonce appartient à l'utilisateur
        const [rows] = await pool.query('SELECT user_id FROM annonces WHERE id = ? AND is_deleted = 0', [id])
        if (rows.length === 0) return res.status(404).json({ error: 'Annonce introuvable' })
        if (rows[0].user_id !== req.user.id) return res.status(403).json({ error: 'Accès refusé' })

        const updates = []
        const params = []
        if (payload.title) { updates.push('titre_ou_modele = ?'); params.push(payload.title) }
        if (payload.ville) { updates.push('ville = ?'); params.push(payload.ville) }
        if (payload.price !== undefined) { updates.push('prix_vente = ?'); params.push(payload.price) }
        if (payload.priceLocation !== undefined) { updates.push('prix_location = ?'); params.push(payload.priceLocation) }

        if (updates.length > 0) {
            const q = `UPDATE annonces SET ${updates.join(', ')} WHERE id = ?`
            params.push(id)
            await pool.query(q, params)
        }

        return res.json({ success: true, message: 'Annonce mise à jour.' })
    } catch (error) {
        console.error('Erreur update annonce :', error)
        return res.status(500).json({ error: 'Erreur interne lors de la mise à jour.' })
    }
})

// ============================================================
// 5. DELETE ANNONCE (soft delete)
// DELETE /api/annonces/:id
// ============================================================
router.delete('/annonces/:id', authenticateToken, isUser, async (req, res) => {
    const { id } = req.params
    try {
        const [rows] = await pool.query('SELECT user_id FROM annonces WHERE id = ? AND is_deleted = 0', [id])
        if (rows.length === 0) return res.status(404).json({ error: 'Annonce introuvable' })
        if (rows[0].user_id !== req.user.id) return res.status(403).json({ error: 'Accès refusé' })

        await pool.query('UPDATE annonces SET is_deleted = 1 WHERE id = ?', [id])
        return res.json({ success: true, message: 'Annonce supprimée.' })
    } catch (error) {
        console.error('Erreur delete annonce :', error)
        return res.status(500).json({ error: 'Erreur interne lors de la suppression.' })
    }
})

export default router;
