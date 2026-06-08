import js from "@eslint/js";
import globals from "globals";

export default [
    js.configs.recommended,
    {
        languageOptions: {
            // Indique à ESLint que tu es dans un environnement Node.js
            globals: {
                ...globals.node,
            },
        },
        rules: {
            // Passe les variables inutilisées en simples avertissements (jaune) au lieu d'erreurs (rouge)
            "no-unused-vars": "warn",
            "no-undef": "error"
        }
    }
];