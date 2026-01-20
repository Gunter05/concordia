// Configuration de l'API
// Fichier centralisé pour gérer les URLs d'API

// URL de base de l'API
// En développement : http://localhost:5000
// En production : ta URL de production
const API_BASE_URL = window.location.origin; // Utilise la même domaine que le frontend

// Exemple d'utilisation :
// import { API_BASE_URL } from './config/api.js';
// fetch(`${API_BASE_URL}/api/utilisateurs`);

export const API = {
    // Authentication
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    GET_CURRENT_USER: `${API_BASE_URL}/api/auth/me`,
    
    // Users
    GET_USER: (id) => `${API_BASE_URL}/api/users/${id}`,
    UPDATE_USER: `${API_BASE_URL}/api/users/update`,
    
    // Search / Discovery
    SEARCH_PROFILES: `${API_BASE_URL}/api/search/profiles`,
    
    // Matches
    CREATE_MATCH: `${API_BASE_URL}/api/match/like`,
    PASS_PROFILE: `${API_BASE_URL}/api/match/pass`,
    GET_MATCHES: `${API_BASE_URL}/api/match/matches`,
    
    // Chat
    GET_CONVERSATIONS: `${API_BASE_URL}/api/chat/conversations`,
    GET_CONVERSATION: (userId) => `${API_BASE_URL}/api/chat/conversation/${userId}`,
    SEND_MESSAGE: `${API_BASE_URL}/api/chat/send`,
};

// Fonction utilitaire pour les requêtes fetch avec gestion d'erreur
export async function apiCall(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            credentials: 'include', // Inclut les cookies (pour JWT)
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('[API Error]', error);
        throw error;
    }
}

export default API;
