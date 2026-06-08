// ============================================================
// 1. CONFIGURATION INITIALE ET TIMEZONE
// ============================================================
import dotenv from 'dotenv';
dotenv.config(); // Chargement de l'environnement en priorité absolue

process.env.TZ = 'Africa/Douala'; // Configuration de la Timezone locale

// ============================================================
// 2. IMPORTS DES MODULES TIERS ET LOCAUX (ES Modules)
// ============================================================
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import { createClient } from 'redis';
import axios from 'axios';

// IMPORT DE TON POOL DEPUIS SON EMPLACEMENT REEL
import pool from './config/db.js'; 

// Imports de tes fichiers de routes personnalisés
import authRoutes from './routes/auth.js';
import annoncesRoutes from './routes/annonces.js';
import favoritesRoutes from './routes/favorites.js';
import userRoutes from './routes/user.js';
import testimonialRouter from './routes/testimonials.js';

// ============================================================
// 3. CONFIGURATION DES CHEMINS GLOBAUX
// ============================================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ============================================================
// 4. CONFIGURATION ET CONNEXION A REDIS
// ============================================================
const redisClient = createClient({
    url: process.env.REDIS_URL,
    api_key: process.env.REDIS_API_KEY,
    user_key: process.env.REDIS_USER_KEY
});

redisClient.on('error', (err) => {
    console.error('⚠️ Erreur Redis Socket:', err.message);
});

// Connexion à Redis
redisClient.connect().then(() => console.log("✅ Connecté à Redis")).catch((err) => {
    console.error("❌ Échec de la connexion Redis à l'initialisation:", err.message);
});

// ============================================================
// 5. FONCTIONS UTILITAIRES ET LOGIQUE MÉTIER
// ============================================================

/**
 * Récupère l'IP réelle et la localisation d'un visiteur via GeoIP
 */
async function getClientInfo(req) {
    // x-forwarded-for est crucial sur Vercel car l'IP passe par leur proxy
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
    let location = "Localhost/Inconnue";

    if (ip !== '::1' && ip !== '127.0.0.1' && ip !== 'localhost') {
        try {
            const response = await axios.get(`http://ip-api.com/json/${ip}?fields=status,country,city`);
            if (response.data.status === 'success') {
                location = `${response.data.city}, ${response.data.country}`;
            }
        } catch { 
            console.error("Erreur GeoIP"); 
        }
    }
    return { ip, location, ua: req.headers['user-agent'] };
}

// Stockage temporaire des codes de vérification par email
const emailVerificationCodes = new Map();

// ============================================================
// 6. MIDDLEWARES GLOBAUX & SÉCURITÉ
// ============================================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// NOTE POUR VERCEL : Les fichiers stockés localement dans /uploads seront effacés 
// à chaque redémarrage de l'instance Serverless. Pense à utiliser Cloudinary ou S3 à terme.
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================================
// 7. BRANCHEMENT DES ROUTES API (AIGUILLAGE)
// ============================================================
app.use('/api/auth', authRoutes);
app.use('/api', annoncesRoutes);      // Ex: /api/annonces
app.use('/api', favoritesRoutes);     // Ex: /api/favorites
app.use('/api/user', userRoutes);         // Ex: /api/user/profile
app.use('/api/temoignages', testimonialRouter);

// --- ROUTE DE TRACKING MARKETING ET STATISTIQUES ---
app.post('/api/track', async (req, res) => {
    let conn;
    try {
        const { event, target, visitorUuid, sessionId, visitorPhone, deliveryLocation, url, referrer } = req.body;
        const clientInfo = await getClientInfo(req);
        const ip = clientInfo.ip; 

        conn = await pool.getConnection();
        await conn.beginTransaction();

        // Insertion du log de trafic
        await conn.execute(
            `INSERT INTO site_traffic (visitor_uuid, session_id, ip_address, location, event_type, target_uuid, visitor_phone, delivery_location, url_path, referrer) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [visitorUuid || null, sessionId, ip, clientInfo.location, event, target || null, visitorPhone || null, deliveryLocation || null, url || null, referrer || 'Accès Direct']
        );

        if (visitorUuid) {
            await conn.execute(
                `UPDATE users SET online = 1 WHERE id = ?`, // Correction : utilisation de la clé 'id' cohérente avec ton schéma
                [visitorUuid]
            );

            await conn.execute(
                `INSERT INTO user_access_logs (user_uuid, action_type, ip_address, location, user_agent) 
                 VALUES (?, 'REACTIVATION', ?, ?, ?)`,
                [visitorUuid, ip, clientInfo.location, clientInfo.ua]
            );
        }

        await conn.commit();
        res.sendStatus(204);

    } catch (e) {
        if (conn) await conn.rollback();
        console.error("❌ Erreur Tracking/Reactivation:", e);
        res.sendStatus(500);
    } finally {
        if (conn) conn.release();
    }
});

// ============================================================
// 8. EXPORTATION CRITIQUE POUR VERCEL SERVERLESS
// ============================================================
export default app;

// ============================================================
// 9. DÉMARRAGE EN MODE DÉVELOPPEMENT LOCAL UNIQUEMENT
// ============================================================
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.SERVER_PORT || process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 [Local] Express server démarré sur http://localhost:${PORT}`);
    });
}