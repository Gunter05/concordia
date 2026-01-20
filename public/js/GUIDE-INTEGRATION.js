/**
 * GUIDE D'INTÉGRATION FRONTEND-BACKEND
 * 
 * Ce fichier explique comment connecter tes pages frontend à l'API backend
 */

// ============================================================
// 1. APPELER L'API DEPUIS LE FRONTEND
// ============================================================

// Méthode simple avec fetch
fetch('/api/search/profiles')
    .then(response => response.json())
    .then(data => {
        console.log('Profils reçus:', data);
        // Utilise les données pour afficher dans la page
    })
    .catch(error => console.error('Erreur:', error));

// Avec async/await (meilleur pour la lisibilité)
async function getProfiles() {
    try {
        const response = await fetch('/api/search/profiles');
        if (!response.ok) {
            throw new Error(`Erreur ${response.status}`);
        }
        const profiles = await response.json();
        console.log('Profils:', profiles);
        return profiles;
    } catch (error) {
        console.error('Erreur lors de la récupération:', error);
    }
}

// ============================================================
// 2. ENVOYER DES DONNÉES (POST/PUT)
// ============================================================

// Exemple: Login
async function login(email, password) {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password }),
            credentials: 'include' // Important: inclut les cookies
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('Login réussi:', data);
            // Stocke le token ou redirige vers la page d'accueil
            localStorage.setItem('token', data.token);
            window.location.href = '/decouverte_filtre.html';
        } else {
            console.error('Login échoué:', data.message);
        }
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// ============================================================
// 3. INTÉGRER LES DONNÉES DANS LE HTML
// ============================================================

// Exemple: Afficher les profils dans une grille
async function displayProfiles() {
    const profiles = await getProfiles();
    const grid = document.getElementById('profiles-grid');
    
    profiles.forEach(profile => {
        const card = document.createElement('div');
        card.className = 'profile-card';
        card.innerHTML = `
            <img src="${profile.photos[0]}" alt="${profile.prenom}">
            <h3>${profile.prenom}, ${calculateAge(profile.dateNaissance)}</h3>
            <p>${profile.bio}</p>
            <button onclick="likeProfile('${profile._id}')">❤️ Aimer</button>
        `;
        grid.appendChild(card);
    });
}

// ============================================================
// 4. ACTIONS (Like, Pass, Message)
// ============================================================

// Like un profil
async function likeProfile(userId) {
    try {
        const response = await fetch('/api/match/like', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
            credentials: 'include'
        });
        
        if (response.ok) {
            console.log('Profile aimé!');
        }
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// Pass un profil
async function passProfile(userId) {
    try {
        const response = await fetch('/api/match/pass', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
            credentials: 'include'
        });
        
        if (response.ok) {
            console.log('Profile passé');
        }
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// ============================================================
// 5. RÉCUPÉRER L'UTILISATEUR ACTUEL
// ============================================================

async function getCurrentUser() {
    try {
        const response = await fetch('/api/auth/me', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const user = await response.json();
            console.log('Utilisateur actuel:', user);
            
            // Affiche le nom dans le profil
            document.getElementById('user-name').textContent = user.prenom;
            document.getElementById('user-avatar').src = user.photos[0];
            
            return user;
        } else {
            console.log('Non authentifié, redirection vers login');
            window.location.href = '/login.html';
        }
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// ============================================================
// 6. GESTION DES ERREURS
// ============================================================

async function apiCall(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            ...options
        });
        
        if (!response.ok) {
            // Gère les erreurs courantes
            if (response.status === 401) {
                console.log('Non authentifié');
                window.location.href = '/login.html';
            } else if (response.status === 404) {
                console.error('Ressource non trouvée');
            } else if (response.status === 500) {
                console.error('Erreur serveur');
            }
            throw new Error(`Erreur ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erreur API:', error);
        throw error;
    }
}

// ============================================================
// 7. UTILITAIRES
// ============================================================

// Calculer l'âge à partir de la date de naissance
function calculateAge(dateNaissance) {
    if (!dateNaissance) return 0;
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

// Format de date
function formatDate(date) {
    return new Date(date).toLocaleDateString('fr-FR');
}

// ============================================================
// 8. EXEMPLE COMPLET: Page Découverte
// ============================================================

// Au chargement de la page
document.addEventListener('DOMContentLoaded', async () => {
    // Vérifie que l'utilisateur est connecté
    await getCurrentUser();
    
    // Charge les profils
    const profiles = await getProfiles();
    
    // Affiche les profils
    displayProfiles();
});

// ============================================================
// CHECKLIST DE CONNEXION
// ============================================================
/*
✅ Backend lancé sur http://localhost:5000
✅ Frontend accessible via http://localhost:5000/decouverte_filtre.html
✅ Base de données MongoDB connectée
✅ Routes API définies et fonctionnelles
✅ CORS activé (app.use(cors()))
✅ Fichiers statiques servis (app.use(express.static(...)))
✅ JWT/Authentication configurée
✅ Tests passés sur http://localhost:5000/test-api.html

Prochaines étapes:
1. Vérifier les logs du serveur (console.log)
2. Vérifier la console du navigateur (F12)
3. Utiliser Postman pour tester les routes
4. Debugger avec le Network tab (F12 > Network)
*/
