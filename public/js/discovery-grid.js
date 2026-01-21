// Variables globales
let profiles = []; // Array to hold all user profiles
let filteredProfiles = [];
let currentUser = null;

const API_URL = 'https://nexus-api-ill3.onrender.com/api/users/api';

// Logging utility
const log = (msg, data = null) => console.log(`[Discovery-Grid.js] ${msg}`, data || '');
const error = (msg, err = null) => console.error(`[Discovery-Grid.js ERROR] ${msg}`, err || '');

// ============= API CALLS =============

async function getCurrentUser() {
    try {
        log('Récupération de l\'utilisateur connecté');
        const response = await fetch(`${API_URL}/auth/me`, { credentials: 'include' });
        if (response.ok) {
            currentUser = await response.json();
            log('Utilisateur chargé:', currentUser);
            return currentUser;
        } else {
            log(`Erreur HTTP ${response.status} - mode démo`);
        }
    } catch (err) {
        log('Erreur réseau - mode démo:', err);
    }
    return null;
}

async function getSearchProfiles(filters = {}) {
    profiles = []; // Reset profiles array before fetching new data

    try {
        log('Récupération des profils avec filtres:', filters);
        const queryParams = new URLSearchParams(filters);
        const response = await fetch(`${API_URL}/search/profiles?${queryParams}`, {
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include' 
        });
        if (response.ok) {
            const data = await response.json();
            log('Profils chargés:', data);
            return data || [];
        } else {
            log(`Erreur HTTP ${response.status}`);
        }
    } catch (err) {
        log('Erreur lors de la récupération des profils:', err);
    }
    return [];
}

async function createMatch(userId) {
    try {
        log('Création d\'un match avec:', userId);
        const response = await fetch(`${API_URL}/match/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ userId })
        });
        if (response.ok) {
            const data = await response.json();
            log('Match créé:', data);
            return data;
        }
    } catch (err) {
        log('Erreur lors de la création du match:', err);
    }
    return null;
}

async function passProfile(userId) {
    try {
        log('Passage du profil:', userId);
        const response = await fetch(`${API_URL}/match/pass`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ userId })
        });
        if (response.ok) {
            log('Profil passé');
            return true;
        }
    } catch (err) {
        log('Erreur lors du passage du profil:', err);
    }
    return false;
}

// ============= RENDERING =============

function renderProfiles() {
    const grid = document.getElementById('profiles-grid');
    const emptyState = document.getElementById('empty-state');
    
    if (filteredProfiles.length === 0) {
        grid.style.display = 'none';
        emptyState.style.display = 'flex';
        return;
    }
    
    grid.style.display = 'grid';
    emptyState.style.display = 'none';
    
    grid.innerHTML = filteredProfiles.map(profile => createProfileCard(profile)).join('');
    
    // Ajouter les event listeners
    addCardEventListeners();
}

function createProfileCard(profile) {
    const age = calculateAge(profile.dateNaissance);
    const gender = profile.genre === 'femme' ? '♀' : '♂';
    const avatar = profile.photos?.[0] || 'https://via.placeholder.com/300x350/7c3aed/ffffff?text=' + profile.prenom;
    const education = profile.education || 'Utilisateur';
    const universite = profile.universite || '';
    const interets = profile.interets || [];
    const bio = profile.bio || 'Aucune bio disponible';
    
    const tagsHtml = interets.slice(0, 2).map((interet, idx) => {
        const colors = ['tag-blue', 'tag-purple', 'tag-pink'];
        return `<span class="tag ${colors[idx % colors.length]}">${interet}</span>`;
    }).join('');
    
    const onlineIndicator = profile.online ? `<span class="profile-badge badge-online"><span class="status-dot"></span> EN LIGNE</span>` : '';
    
    return `
        <div class="profile-card" data-user-id="${profile._id}">
            <div class="profile-image">
                <img src="${avatar}" alt="${profile.prenom}" onerror="this.src='https://via.placeholder.com/300x350/7c3aed/ffffff?text=${profile.prenom}'">
                <div class="profile-badges">
                    <span class="profile-badge">${profile.typeRelation || 'Relation sérieuse'}</span>
                    ${onlineIndicator}
                </div>
            </div>
            <div class="profile-content">
                <div class="profile-header">
                    <div>
                        <div class="profile-name">${profile.prenom}, ${age} ${gender}</div>
                        <div class="profile-subtitle">
                            <i class='bx bxs-graduation'></i> ${education}${universite ? ' • ' + universite : ''}
                        </div>
                    </div>
                </div>
                <div class="profile-tags">
                    ${tagsHtml}
                </div>
                <p class="profile-bio">"${bio.substring(0, 100)}${bio.length > 100 ? '...' : ''}"</p>
                <div class="profile-actions">
                    <button class="btn-card-action btn-pass" data-action="pass" data-user-id="${profile._id}">
                        <i class='bx bx-x'></i> Passer
                    </button>
                    <button class="btn-card-action btn-like" data-action="like" data-user-id="${profile._id}">
                        <i class='bx bxs-heart'></i> Aimer
                    </button>
                </div>
            </div>
        </div>
    `;
}

function addCardEventListeners() {
    document.querySelectorAll('.btn-pass').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const userId = btn.dataset.userId;
            const card = btn.closest('.profile-card');
            
            await passProfile(userId);
            card.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                filteredProfiles = filteredProfiles.filter(p => p._id !== userId);
                renderProfiles();
            }, 300);
        });
    });
    
    document.querySelectorAll('.btn-like').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const userId = btn.dataset.userId;
            const card = btn.closest('.profile-card');
            
            await createMatch(userId);
            card.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                filteredProfiles = filteredProfiles.filter(p => p._id !== userId);
                renderProfiles();
            }, 300);
        });
    });
}

// ============= FILTERING =============

function applyFilters() {
    const ageMax = parseInt(document.getElementById('age-slider').value);
    const location = document.getElementById('location-select').value;
    let loggedInUser= JSON.parse(localStorage.getItem("loggedInUser"));

    filteredProfiles = profiles.filter(profile => {
        const age = calculateAge(profile.dateNaissance);
        
        // Filtre d'âge
        if (age > ageMax) return false;
        
        // Filtre de localisation
        if (location && profile.localisation !== location) return false;
        
        // Filtre d'ethnie
        if ((document.getElementById('ethnie').checked) && (loggedInUser.ethnie !== profile.ethnie)) return false;

        if((document.getElementById('religion').checked) && (loggedInUser.religion !== profile.religion)) return false;
        
        return true;
    });
    
    log(`${filteredProfiles.length} profils après filtrage`);
    renderProfiles();
}

// ============= EVENT LISTENERS =============

document.getElementById('age-slider')?.addEventListener('input', (e) => {
    const age = e.target.value;
    document.getElementById('age-value').textContent = `18 - ${age}`;
    applyFilters();
});

document.getElementById('location-select')?.addEventListener('change', () => {
    applyFilters();
});

document.getElementById('ethnie')?.addEventListener('change',  () => {
    applyFilters();
});

document.getElementById('religion')?.addEventListener('change',  () => {
    applyFilters();
});

document.getElementById('reset-filters')?.addEventListener('click', async () => {
    document.getElementById('age-slider').value = '30';
    document.getElementById('age-value').textContent = '18 - 30';
    document.getElementById('location-select').value = '';
    
    profiles = await getSearchProfiles();
    applyFilters();
});

// ============= UTILITAIRES =============

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

// ============= INITIALIZATION =============

async function init() {
    try {
        log('Initialisation de la grille de découverte...');
        
        // Vérifier l'authentification
        const user = await getCurrentUser();
        
        if (!user) {
            log('Utilisateur non authentifié - mode démo activé');
        } else {
            log('Utilisateur authentifié');
        }

        // Charger les profils depuis l'API externe
        try {
            const response = await fetch('https://nexus-api-ill3.onrender.com/api/users/');
            const users = await response.json();
            log('Utilisateurs chargés depuis l\'API externe:', users);
            
            // Mapper les données de l'API vers la structure des profils
            profiles = users.map(user => ({
                _id: user._id,
                prenom: user.nom?.split(' ')[0] || 'Utilisateur',
                dateNaissance: user.dateNaissance || '2000-01-01',
                genre: user.genre || 'non-spécifié',
                education: user.profession || 'Utilisateur',
                universite: user.universite || '',
                localisation: user.ville || user.localisation || 'Lieu inconnu',
                typeRelation: user.relation || user.typeRelation || 'Relation sérieuse',
                online: user.online || false,
                bio: user.bio || '',
                photos: user.photo ? [user.photo] : user.photos || [],
                interets: user.interet ? [user.interet] : user.interets || [],
                distance: user.distance
            }));
        } catch (err) {
            log('Erreur lors de la récupération depuis l\'API externe:', err);
            profiles = await getSearchProfiles();
        }
        
        if (profiles.length === 0) {
            log('Aucun profil trouvé - chargement des profils de test');
            // Profils de test
            profiles = [
                {
                    _id: '1',
                    prenom: 'Amara',
                    dateNaissance: '2001-05-15',
                    genre: 'femme',
                    education: 'Étudiante en Droit',
                    universite: 'UCAD',
                    localisation: 'Dakar',
                    typeRelation: 'Relation sérieuse',
                    online: true,
                    bio: 'Passionnée par la lecture et la découverte de nouvelles cultures. Cherche quelqu\'un d\'ambitieux et sincère pour partager des moments authentiques.',
                    photos: ['https://via.placeholder.com/300x350/7c3aed/ffffff?text=Amara'],
                    interets: ['Lecture', 'Bénévolat', 'Afrobeat']
                },
                {
                    _id: '2',
                    prenom: 'Malik',
                    dateNaissance: '2001-02-28',
                    genre: 'homme',
                    education: 'Ingénieur en Informatique',
                    universite: 'ESTM',
                    localisation: 'Dakar',
                    typeRelation: 'Relation sérieuse',
                    online: false,
                    bio: 'Passionné par la technologie et le sport. Toujours en mouvement. Je cherche une personne pour discuter autour d\'un match de foot.',
                    photos: ['https://via.placeholder.com/300x350/3b82f6/ffffff?text=Malik'],
                    interets: ['Tech', 'Sport', 'Voyage']
                },
                {
                    _id: '3',
                    prenom: 'Fatou',
                    dateNaissance: '2002-08-22',
                    genre: 'femme',
                    education: 'Étudiante en Arts',
                    universite: 'UCAD',
                    localisation: 'Dakar',
                    typeRelation: 'Amitié',
                    online: true,
                    bio: 'La créativité est mon moteur. J\'aime la musique, les exposés et les discussions profondes. J\'aime explorer la vie avec passion!',
                    photos: ['https://via.placeholder.com/300x350/ec4899/ffffff?text=Fatou'],
                    interets: ['Art', 'Mode', 'Musique']
                },
                {
                    _id: '4',
                    prenom: 'Jean',
                    dateNaissance: '2000-11-10',
                    genre: 'homme',
                    education: 'Entrepreneur',
                    universite: 'UCAD',
                    localisation: 'Dakar',
                    typeRelation: 'Relation sérieuse',
                    online: false,
                    bio: 'Fondateur d\'une startup. Cherche quelqu\'un pour construire un projet de vie ensemble. Ambitieux mais équilibré.',
                    photos: ['https://via.placeholder.com/300x350/10b981/ffffff?text=Jean'],
                    interets: ['Entrepreneurship', 'Startup', 'Wellness']
                },
                {
                    _id: '5',
                    prenom: 'Nia',
                    dateNaissance: '2003-03-10',
                    genre: 'femme',
                    education: 'Étudiante en Commerce',
                    universite: 'UCAD',
                    localisation: 'Dakar',
                    typeRelation: 'Amitié',
                    online: true,
                    bio: 'Folle de photographie et d\'art. J\'aime rencontrer des gens créatifs et inspirants. Bonne vibe seulement!',
                    photos: ['https://via.placeholder.com/300x350/f59e0b/ffffff?text=Nia'],
                    interets: ['Photographie', 'Art', 'Nature']
                },
                {
                    _id: '6',
                    prenom: 'Ousmane',
                    dateNaissance: '1999-07-05',
                    genre: 'homme',
                    education: 'Développeur Web',
                    universite: 'ESTM',
                    localisation: 'Dakar',
                    typeRelation: 'Relation sérieuse',
                    online: true,
                    bio: 'Dev passionné. Aime la technologie, le cinema et les road trips. Cherche quelqu\'un pour des aventures!',
                    photos: ['https://via.placeholder.com/300x350/8b5cf6/ffffff?text=Ousmane'],
                    interets: ['Code', 'Cinéma', 'Voyage']
                }
            ];
        }
        
        filteredProfiles = [...profiles];
        renderProfiles();
        log(`Grille de découverte initialisée avec ${profiles.length} profils`);
    } catch (err) {
        error('Erreur lors de l\'initialisation:', err);
        // Charger les profils de test en cas d'erreur
        profiles = [
            {
                _id: '1',
                prenom: 'Amara',
                dateNaissance: '2001-05-15',
                genre: 'femme',
                education: 'Étudiante en Droit',
                universite: 'UCAD',
                localisation: 'Dakar',
                typeRelation: 'Relation sérieuse',
                online: true,
                bio: 'Passionnée par la lecture et la découverte de nouvelles cultures.',
                photos: ['https://via.placeholder.com/300x350/7c3aed/ffffff?text=Amara'],
                interets: ['Lecture', 'Bénévolat', 'Afrobeat']
            }
        ];
        filteredProfiles = [...profiles];
        renderProfiles();
    }
}

// Initialiser au chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

log('Script discovery-grid.js chargé');