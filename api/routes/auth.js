
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/db.js'; // Remplace par le chemin vers ton pool de connexion MySQL

const router = express.Router();


// --- MIDDLEWARES DE PROTECTION DES ROUTES ---

// 1. Authentification de base (Vérifie le jeton JWT)
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: "Accès refusé, jeton manquant." });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Jeton invalide ou expiré." });
        req.user = user;
        next();
    });
};

// 2. Restriction aux Administrateurs uniquement
export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ 
            success: false, 
            message: "Accès interdit : Réservé aux administrateurs." 
        });
    }
};

// 3. Restriction aux Utilisateurs basiques / Professionnels
export const isUser = (req, res, next) => {
    if (req.user && req.user.role === 'user') {
        next();
    } else {
        return res.status(403).json({ 
            success: false, 
            message: "Accès interdit : Réservé aux Profils professionnels." 
        });
    }
};


// 1. CONFIGURATION DU SERVICE D'ENVOI D'EMAILS (Nodemailer)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER ,
        pass: process.env.EMAIL_PASS 
    }
});

// ============================================================
// 1. ROUTE BACKEND : INSCRIPTION (REGISTER)
// ============================================================
// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { email, password, phone, ville, paymentData } = req.body;

    // Validation des champs reçus
    if (!email || !password || !phone || !ville) {
        return res.status(400).json({ error: 'L\'adresse email, le mot de passe, le téléphone et la ville sont obligatoires.' });
    }

    try {
        // Vérifier si l'utilisateur existe déjà
        const [existingUser] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Cette adresse email est déjà utilisée.' });
        }

        // Hachage sécurisé du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Génération d'un code de validation aléatoire à 6 chiffres
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        const userId = uuidv4();
        const userName = email.split('@')[0]; // Génère un nom par défaut à partir de l'email

        // Insertion du compte en base de données avec le statut inactif (is_active = 0)
        await pool.query(`
            INSERT INTO users (id, email, password_hash, name, role, ville, phone, is_active, verification_code, code_expires_at)
            VALUES (?, ?, ?, ?, 'user', ?, ?, 0, ?, NOW() + INTERVAL 15 MINUTE)
        `, [userId, email, hashedPassword, userName, ville, phone, verificationCode]);

        // Si le système de paiement était activé côté React et des données ont été soumises
        if (paymentData) {
            console.log(`[Paiement] Enregistrement transaction de 1000 FCFA pour le numéro ${paymentData.phone}`);
            // Tu peux faire un INSERT ici dans une table `transactions` si nécessaire
        }

        // Configuration de l'email à envoyer
        const mailOptions = {
            from: `"immo 2.0" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '🔑 Votre code de validation - immo 2.0',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px; max-width: 500px; margin: auto;">
                    <h2 style="color: #ffc107; text-align: center;">Bienvenue sur immo 2.0 !</h2>
                    <p>Merci pour votre inscription. Veuillez utiliser le code d'activation ci-dessous pour valider votre compte :</p>
                    <div style="font-size: 26px; font-weight: bold; background: #f8f9fa; padding: 15px; text-align: center; border-radius: 6px; letter-spacing: 5px; color: #222; margin: 20px 0;">
                        ${verificationCode}
                    </div>
                    <p style="font-size: 12px; color: #888; text-align: center;">Ce code de sécurité expirera dans 15 minutes.</p>
                </div>
            `
        };

        // Envoi effectif de l'email
        await transporter.sendMail(mailOptions);

        return res.status(201).json({ 
            success: true, 
            message: 'Inscription réussie. Code de vérification envoyé par email.' 
        });

    } catch (error) {
        console.error("Erreur lors du register backend :", error);
        return res.status(500).json({ error: 'Erreur interne lors de la création du compte.' });
    }
});


// ============================================================
// 2. ROUTE BACKEND : VÉRIFICATION DE L'EMAIL (VERIF EMAIL)
// ============================================================
// POST /api/auth/verify-code
router.post('/verify-code', async (req, res) => {
    console.log("Données reçues du Front :", req.body);
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ error: 'L\'email et le code de validation sont requis.' });
    }

    try {
        // Récupération des informations de validation de l'utilisateur
        const [users] = await pool.query(
            'SELECT id, verification_code, code_expires_at FROM users WHERE email = ?', 
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'Aucun utilisateur trouvé avec cet email.' });
        }

        const user = users[0];

        // 🟢 CORRECTION SÉCURITÉ CRASH : On vérifie si verification_code n'est pas déjà NULL avant le .toString()
        if (!user.verification_code || user.verification_code.toString() !== code.toString()) {
            return res.status(400).json({ error: 'Le code de validation saisi est incorrect ou a déjà été utilisé.' });
        }

        // 2. Vérification de la date de validité du code (Comparaison via Timestamps)
       // Dans /verify-code :
        const maintenant = new Date().toISOString().slice(0, 19).replace('T', ' '); // Chaîne locale
        const dateExpiration = user.code_expires_at; // Sera une chaîne "YYYY-MM-DD HH:MM:SS" grâce à dateStrings

        if (maintenant > dateExpiration) {
            return res.status(400).json({ 
                error: "Le code de validation a expiré. Veuillez cliquer sur 'Renvoyer le code'." 
            });
        }

        // 3. Activation du compte et nettoyage des données de validation éphémères
        await pool.query(`
            UPDATE users 
            SET is_active = 1, verification_code = NULL, code_expires_at = NULL 
            WHERE id = ?
        `, [user.id]);

        return res.json({ 
            success: true, 
            message: 'Votre adresse email a été validée avec succès.' 
        });

    } catch (error) {
        console.error("Erreur lors de la vérification du code :", error);
        return res.status(500).json({ error: 'Erreur interne lors de la validation du code.' });
    }
});


// ============================================================
// 3. ROUTE BACKEND : RENVOYER LE CODE
// ============================================================
// POST /api/auth/resend-code
router.post('/resend-code', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "L'adresse email est obligatoire." });
    }

    try {
        // 1. Vérifier si l'utilisateur existe
        const [user] = await pool.query('SELECT id, is_active FROM users WHERE email = ?', [email]);
        
        if (user.length === 0) {
            return res.status(404).json({ error: "Aucun compte n'est associé à cette adresse email." });
        }

        // 2. Vérifier si le compte n'est pas déjà actif
        if (user[0].is_active === 1) {
            return res.status(400).json({ error: "Ce compte est déjà validé. Vous pouvez vous connecter." });
        }

        // 3. Génération d'un nouveau code aléatoire à 6 chiffres
        const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        // 4. Mise à jour du code et de l'expiration dans la base de données
        await pool.query(`
            UPDATE users 
            SET verification_code = ?, code_expires_at = NOW() + INTERVAL 15 MINUTE 
            WHERE email = ?
        `, [newVerificationCode, email]);

        // 6. Configuration du nouvel email à envoyer
        const mailOptions = {
            from: `"immo 2.0" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '🔄 Nouveau code de validation - immo 2.0',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px; max-width: 500px; margin: auto;">
                    <h2 style="color: #ffc107; text-align: center;">Votre nouveau code de validation</h2>
                    <p>Vous avez demandé un nouveau code d'activation. Veuillez utiliser le code ci-dessous pour valider votre compte immo 2.0 :</p>
                    <div style="font-size: 26px; font-weight: bold; background: #f8f9fa; padding: 15px; text-align: center; border-radius: 6px; letter-spacing: 5px; color: #222; margin: 20px 0;">
                        ${newVerificationCode}
                    </div>
                    <p style="font-size: 12px; color: #888; text-align: center;">Ce nouveau code de sécurité expirera dans 15 minutes.</p>
                </div>
            `
        };

        // 7. Envoi de l'email
        await transporter.sendMail(mailOptions);

        return res.status(200).json({ 
            success: true, 
            message: 'Un nouveau code de vérification a été envoyé par email.' 
        });

    } catch (error) {
        console.error("Erreur lors du renvoi du code :", error);
        return res.status(500).json({ error: 'Erreur interne lors du renvoi du code.' });
    }
});

// ============================================================
// 3. ROUTE BACKEND : CONNEXION (LOGIN)
// ============================================================
// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Veuillez fournir un email et un mot de passe.' });
    }

    try {
        // Rechercher l'utilisateur par son email
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'Identifiants ou mot de passe incorrects.' });
        }

        const user = users[0];

        // Vérifier impérativement si le compte a été activé par email
        if (user.is_active === 0) {
            return res.status(403).json({ 
                error: 'Votre compte n\'est pas encore actif. Veuillez vérifier votre boîte mail et valider votre compte.' 
            });
        }

        // Comparer le mot de passe reçu avec le hash stocké en base de données
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Identifiants ou mot de passe incorrects.' });
        }

        // Génération d'un token JWT valable 24h pour maintenir la session côté React
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'votre_cle_secrete_jwt',
            { expiresIn: '24h' }
        );

        // Réponse positive avec envoi des infos de l'utilisateur (sans le password_hash !)
        return res.json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                ville: user.ville,
                phone: user.phone
            }
        });

    } catch (error) {
        console.error("Erreur lors du login backend :", error);
        return res.status(500).json({ error: 'Erreur interne lors de la connexion.' });
    }
});

// ============================================================
// 4. ROUTE BACKEND : DEMANDE DE RÉINITIALISATION (FORGOT PASSWORD)
// ============================================================
// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'L\'adresse email est obligatoire.' });
    }

    try {
        // Vérifier si l'utilisateur existe dans la base de données
        const [users] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'Aucun compte n\'est associé à cette adresse email.' });
        }

        const user = users[0];

        // Génération d'un code temporaire à 6 chiffres
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const codeExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // Valable 15 min

        // Mise à jour de la ligne utilisateur avec le jeton éphémère de récupération
        await pool.query(
            'UPDATE users SET verification_code = ?, code_expires_at = ? WHERE id = ?',
            [resetCode, codeExpiresAt, user.id]
        );

        // Configuration et composition du mail de secours
        const mailOptions = {
            from: `"immo 2.0" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '🔑 Code de récupération de votre mot de passe',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px; max-width: 500px; margin: auto;">
                    <h2 style="color: #222; text-align: center;">Réinitialisation de mot de passe</h2>
                    <p>Vous avez demandé la réinitialisation de votre accès. Utilisez le code de vérification sécurisé ci-dessous pour modifier votre mot de passe :</p>
                    <div style="font-size: 28px; font-weight: bold; background: #f8f9fa; padding: 15px; text-align: center; border-radius: 6px; letter-spacing: 5px; color: #ffc107; margin: 20px 0;">
                        ${resetCode}
                    </div>
                    <p style="font-size: 12px; color: #888; text-align: center;">Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail. Le code expirera dans 15 minutes.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        return res.json({ success: true, message: 'Le code de récupération a été expédié.' });

    } catch (error) {
        console.error("Erreur forgot-password:", error);
        return res.status(500).json({ error: 'Une erreur interne a empêché l\'envoi du code.' });
    }
});


// ============================================================
// 5. ROUTE BACKEND : CONFIRMATION DU NOUVEAU MOT DE PASSE (RESET PASSWORD)
// ============================================================
// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
        return res.status(400).json({ error: 'Tous les paramètres sont obligatoires.' });
    }

    try {
        // Recherche de l'utilisateur par son email
        const [users] = await pool.query(
            'SELECT id, verification_code, code_expires_at FROM users WHERE email = ?', 
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'Compte utilisateur introuvable.' });
        }

        const user = users[0];

        // 1. Vérification de la correspondance du code
        if (!user.verification_code || user.verification_code !== code) {
            return res.status(400).json({ error: 'Le code de sécurité saisi est incorrect.' });
        }

        // 2. Vérification de la date limite de validité du code
        if (new Date() > new Date(user.code_expires_at)) {
            return res.status(400).json({ error: 'Ce code a expiré. Veuillez refaire une demande.' });
        }

        // 3. Cryptage sécurisé du nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 4. Mise à jour de la BDD et purge des jetons éphémères de validation
        await pool.query(
            'UPDATE users SET password_hash = ?, verification_code = NULL, code_expires_at = NULL WHERE id = ?',
            [hashedPassword, user.id]
        );

        return res.json({ success: true, message: 'Votre mot de passe a été réinitialisé avec succès.' });

    } catch (error) {
        console.error("Erreur reset-password:", error);
        return res.status(500).json({ error: 'Erreur interne lors de la mise à jour de l\'accès.' });
    }
});

export default router;