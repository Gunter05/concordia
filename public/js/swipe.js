// Variables globales
let profiles = [];
let currentIndex = 0;
let currentUser = null;

const API_URL = '/api';

// Logging utility
const log = (msg, data = null) => console.log(`[Swipe.js] ${msg}`, data || '');
const error = (msg, err = null) => console.error(`[Swipe.js ERROR] ${msg}`, err || '');

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
            error(`Erreur HTTP ${response.status}`);
        }
    } catch (err) {
        error('Erreur réseau:', err);
    }
    return null;
}

async function getSearchProfiles(filters = {}) {
    try {
        log('Récupération des profils avec filtres:', filters);
        const queryParams = new URLSearchParams(filters);
        const response = await fetch(`${API_URL}/search/profiles?${queryParams}`, { 
            credentials: 'include' 
        });
        if (response.ok) {
            const data = await response.json();
            log('Profils chargés:', data);
            return data || [];
        } else {
            error(`Erreur HTTP ${response.status}`);
        }
    } catch (err) {
        error('Erreur lors de la récupération des profils:', err);
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
        error('Erreur lors de la création du match:', err);
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
        error('Erreur lors du passage du profil:', err);
    }
    return false;
}

// ============= UI RENDERING =============

function displayProfile(profile) {
    if (!profile) {
        showEmptyState();
        return;
    }

    const card = document.getElementById('profile-card');
    card.style.display = 'flex';

    // Image
    const avatar = profile.photos?.[0] || 'https://via.placeholder.com/500x600';
    document.getElementById('profile-img').src = avatar;
    document.getElementById('profile-img').alt = `${profile.prenom} ${profile.nom}`;

    // Info utilisateur
    const age = calculateAge(profile.dateNaissance);
    const gender = profile.genre === 'femme' ? '♀' : '♂';
    document.getElementById('profile-name-age').textContent = `${profile.prenom}, ${age} ${gender}`;

    const education = profile.education || 'Utilisateur';
    const university = profile.universite || '';
    document.getElementById('profile-education').innerHTML = 
        `<i class='bx bxs-graduation'></i> ${education}${university ? ' • ' + university : ''}`;

    const location = profile.localisation || 'Localisation inconnue';
    const distance = profile.distance || '5 km';
    document.getElementById('profile-location').innerHTML = 
        `<i class='bx bxs-map'></i> ${location} • À ${distance}`;

    // Type de relation
    const relationType = profile.typeRelation || 'Relation sérieuse';
    document.getElementById('profile-type').innerHTML = 
        `<i class='bx bxs-heart'></i> ${relationType}`;

    // Statut en ligne
    const statusBadge = document.getElementById('profile-status');
    if (profile.online) {
        statusBadge.style.display = 'flex';
    } else {
        statusBadge.style.display = 'none';
    }

    // Bio
    const bio = profile.bio || 'Aucune bio disponible';
    document.getElementById('profile-bio').textContent = bio;

    // Tags
    const tagsContainer = document.getElementById('profile-tags');
    tagsContainer.innerHTML = '';
    if (profile.interets && profile.interets.length > 0) {
        profile.interets.slice(0, 3).forEach((interet, index) => {
            const colors = ['tag-blue', 'tag-purple', 'tag-pink'];
            const tag = document.createElement('span');
            tag.className = `tag ${colors[index % colors.length]}`;
            tag.textContent = interet;
            tagsContainer.appendChild(tag);
        });
    }
}

function showEmptyState() {
    document.getElementById('profile-card').style.display = 'none';
    document.getElementById('empty-state').style.display = 'flex';
}

function hideEmptyState() {
    document.getElementById('profile-card').style.display = 'flex';
    document.getElementById('empty-state').style.display = 'none';
}

// ============= SWIPE LOGIC =============

function loadNextProfile() {
    currentIndex++;
    if (currentIndex >= profiles.length) {
        showEmptyState();
        return;
    }
    hideEmptyState();
    displayProfile(profiles[currentIndex]);
}

async function swipeLeft() {
    if (currentIndex >= profiles.length) return;
    
    const profile = profiles[currentIndex];
    const card = document.getElementById('profile-card');
    
    card.classList.add('swipe-left');
    await passProfile(profile._id);
    
    setTimeout(() => {
        card.classList.remove('swipe-left');
        loadNextProfile();
    }, 500);
}

async function swipeRight() {
    if (currentIndex >= profiles.length) return;
    
    const profile = profiles[currentIndex];
    const card = document.getElementById('profile-card');
    
    card.classList.add('swipe-right');
    await createMatch(profile._id);
    
    setTimeout(() => {
        card.classList.remove('swipe-right');
        loadNextProfile();
    }, 500);
}

// ============= EVENT LISTENERS =============

document.getElementById('btn-pass')?.addEventListener('click', swipeLeft);
document.getElementById('btn-like')?.addEventListener('click', swipeRight);

document.getElementById('btn-info')?.addEventListener('click', () => {
    if (currentIndex < profiles.length) {
        const profile = profiles[currentIndex];
        console.log('Infos complètes:', profile);
        // Vous pouvez ouvrir un modal ou une page de détails ici
    }
});

// Clavier
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') swipeLeft();
    if (e.key === 'ArrowRight') swipeRight();
});

// Slider d'âge
document.getElementById('age-slider')?.addEventListener('input', (e) => {
    const age = e.target.value;
    document.getElementById('age-value').textContent = `18 - ${age}`;
    // Rechargez les profils avec les nouveaux filtres
});

// Réinitialiser les filtres
document.getElementById('reset-filters')?.addEventListener('click', async () => {
    document.getElementById('age-slider').value = '30';
    document.getElementById('age-value').textContent = '18 - 30';
    document.getElementById('location-select').value = '';
    
    // Rechargez tous les profils
    profiles = await getSearchProfiles();
    currentIndex = 0;
    if (profiles.length > 0) {
        hideEmptyState();
        displayProfile(profiles[0]);
    } else {
        showEmptyState();
    }
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
        log('Initialisation de la page de découverte...');
        
        // Vérifier l'authentification
        const user = await getCurrentUser();
        
        if (!user) {
            log('Utilisateur non authentifié - mode démo activé');
            // En mode démo, on continue sans redirection
            // Utiliser des profils de test
            profiles = await getSearchProfiles({ demo: true });
        } else {
            log('Utilisateur authentifié:', user);
            // Charger les profils réels
            profiles = await getSearchProfiles();
        }
        
        if (profiles.length === 0) {
            log('Aucun profil trouvé');
            // Créer des profils de test
            profiles = [
                {
                    _id: '1',
                    prenom: 'Amara',
                    dateNaissance: '2001-05-15',
                    genre: 'femme',
                    education: 'Étudiante en Droit',
                    universite: 'UCAD',
                    localisation: 'Dakar',
                    distance: '5 km',
                    typeRelation: 'Relation sérieuse',
                    online: true,
                    bio: 'Passionnée par la lecture, les débats et la découverte de nouvelles cultures 🌍. Je cherche quelqu\'un d\'ambitieux et sincère pour partager des moments authentiques.',
                    photos: ['https://via.placeholder.com/500x600/7c3aed/ffffff?text=Amara'],
                    interets: ['Lecture', 'Bénévolat', 'Afrobeat']
                },
                {
                    _id: '2',
                    prenom: 'Fatou',
                    dateNaissance: '2002-08-22',
                    genre: 'femme',
                    education: 'Étudiante en Ingénierie',
                    universite: 'Université Cheikh Anta Diop',
                    localisation: 'Dakar',
                    distance: '8 km',
                    typeRelation: 'Relation sérieuse',
                    online: false,
                    bio: 'Aime les films, les voyages et les conversations intéressantes. Cherche quelqu\'un pour explorer la vie avec!',
                    photos: ['https://via.placeholder.com/500x600/ec4899/ffffff?text=Fatou'],
                    interets: ['Voyage', 'Cinéma', 'Technologie']
                },
                {
                    _id: '3',
                    prenom: 'Nia',
                    dateNaissance: '2003-03-10',
                    genre: 'femme',
                    education: 'Étudiante en Commerce',
                    universite: 'UCAD',
                    localisation: 'Dakar',
                    distance: '3 km',
                    typeRelation: 'Amitié',
                    online: true,
                    bio: 'Folle de photographie et d\'art. J\'aime rencontrer des gens créatifs et inspirants!',
                    photos: ['https://via.placeholder.com/500x600/3b82f6/ffffff?text=Nia'],
                    interets: ['Photographie', 'Art', 'Nature']
                }
            ];
            log('Profils de test créés');
        } else {
            hideEmptyState();
            displayProfile(profiles[0]);
            log(`${profiles.length} profils chargés`);
        }
        
        if (profiles.length > 0) {
            hideEmptyState();
            displayProfile(profiles[0]);
        } else {
            showEmptyState();
        }
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
                distance: '5 km',
                typeRelation: 'Relation sérieuse',
                online: true,
                bio: 'Passionnée par la lecture, les débats et la découverte de nouvelles cultures 🌍. Je cherche quelqu\'un d\'ambitieux et sincère pour partager des moments authentiques.',
                photos: ['https://via.placeholder.com/500x600/7c3aed/ffffff?text=Amara'],
                interets: ['Lecture', 'Bénévolat', 'Afrobeat']
            }
        ];
        hideEmptyState();
        displayProfile(profiles[0]);
    }
}

// Initialiser au chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

log('Script swipe.js chargé');
