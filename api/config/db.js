
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Charger les variables d'environnement du fichier .env
dotenv.config();

// // --- CONFIGURATION DU POOL MYSQL (AIVEN) ---
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    ssl: { rejectUnauthorized: false },
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
    enableKeepAlive: true, // INDISPENSABLE pour éviter ECONNRESET
    keepAliveInitialDelay: 0, 
    connectTimeout: 20000, // On donne 20 secondes pour se connecter (mieux pour les connexions lentes)
    timezone: '+01:00',      // Force MySQL à travailler à l'heure du Cameroun (GTM+1)
    dateStrings: true
});

// Exporter le pool pour pouvoir l'utiliser dans auth.js et server.js
export default pool;