// Variables globales
let currentUserId = null;
let currentChatUserId = null;
let discussions = [];
let currentUser = null;

// API Base URL
const API_URL = '/api';

// Logging utility
const log = (msg, data = null) => {
    console.log(`[Message.js] ${msg}`, data || '');
};

const error = (msg, err = null) => {
    console.error(`[Message.js ERROR] ${msg}`, err || '');
};

// ============= FONCTIONS D'API =============

// Récupérer les infos de l'utilisateur actuel
async function getCurrentUser() {
    try {
        log('Récupération de l\'utilisateur connecté...');
        const response = await fetch(`${API_URL}/auth/me`, {
            credentials: 'include'
        });
        if (response.ok) {
            currentUser = await response.json();
            currentUserId = currentUser._id || currentUser.id;
            log('Utilisateur chargé:', currentUser);
            return currentUser;
        } else {
            error(`Erreur HTTP ${response.status} lors de la récupération de l'utilisateur`);
        }
    } catch (err) {
        error('Erreur réseau lors de la récupération de l\'utilisateur:', err);
    }
    return null;
}

// Récupérer les matches (nouveaux profils)
async function getMatches() {
    try {
        log('Récupération des matches...');
        const response = await fetch(`${API_URL}/match/matches`, {
            credentials: 'include'
        });
        if (response.ok) {
            const data = await response.json();
            log('Matches chargés:', data);
            return data;
        } else {
            error(`Erreur HTTP ${response.status} lors de la récupération des matches`);
        }
    } catch (err) {
        error('Erreur lors de la récupération des matches:', err);
    }
    return [];
}

// Récupérer toutes les conversations
async function getConversations() {
    try {
        log('Récupération des conversations...');
        const response = await fetch(`${API_URL}/chat/conversations`, {
            credentials: 'include'
        });
        if (response.ok) {
            discussions = await response.json();
            log('Conversations chargées:', discussions);
            return discussions;
        } else {
            error(`Erreur HTTP ${response.status} lors de la récupération des conversations`);
        }
    } catch (err) {
        error('Erreur lors de la récupération des conversations:', err);
    }
    return [];
}

// Récupérer une conversation spécifique avec les messages
async function getConversation(userId) {
    try {
        log('Récupération de la conversation avec:', userId);
        const response = await fetch(`${API_URL}/chat/conversation/${userId}`, {
            credentials: 'include'
        });
        if (response.ok) {
            const data = await response.json();
            log('Conversation chargée:', data);
            return data;
        } else {
            error(`Erreur HTTP ${response.status} lors de la récupération de la conversation`);
        }
    } catch (err) {
        error('Erreur lors de la récupération de la conversation:', err);
    }
    return null;
}

// Envoyer un message
async function sendMessage(receiverId, content) {
    try {
        log('Envoi d\'un message à:', receiverId);
        const response = await fetch(`${API_URL}/chat/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                receiverId,
                content
            })
        });
        if (response.ok) {
            const data = await response.json();
            log('Message envoyé:', data);
            return data;
        } else {
            error(`Erreur HTTP ${response.status} lors de l\'envoi du message`);
        }
    } catch (err) {
        error('Erreur lors de l\'envoi du message:', err);
    }
    return null;
}

// Récupérer les infos d'un utilisateur
async function getUserInfo(userId) {
    try {
        log('Récupération des infos utilisateur:', userId);
        const response = await fetch(`${API_URL}/user/${userId}`, {
            credentials: 'include'
        });
        if (response.ok) {
            const data = await response.json();
            log('Infos utilisateur chargées:', data);
            return data;
        } else {
            error(`Erreur HTTP ${response.status} lors de la récupération des infos utilisateur`);
        }
    } catch (err) {
        error('Erreur lors de la récupération des infos utilisateur:', err);
    }
    return null;
}

// ============= FONCTIONS DE RENDU =============

// Mettre à jour le header avec les infos utilisateur
function updateUserHeader(user) {
    const userAvatar = document.querySelector('.user-avatar');
    const headerLeft = document.querySelector('.logo-icon');
    
    if (user && user.photos && user.photos[0]) {
        userAvatar.style.backgroundImage = `url('${user.photos[0]}')`;
    }
}

// Afficher les nouveaux matchs
async function displayMatches() {
    const matchesList = document.getElementById('new-matches-list');
    const matches = await getMatches();
    
    matchesList.innerHTML = '';
    
    matches.forEach(match => {
        const avatar = (match.photos && match.photos[0]) || 'https://via.placeholder.com/64';
        const name = `${match.prenom || ''} ${match.nom || ''}`.trim();
        
        const matchHTML = `
            <div class="match-item" data-user-id="${match._id}">
                <div class="match-avatar">
                    <div class="avatar-img" style="background-image: url('${avatar}');"></div>
                </div>
                <div class="match-name">${name}</div>
            </div>
        `;
        matchesList.insertAdjacentHTML('beforeend', matchHTML);
    });
    
    addMatchClickListeners();
}

// Afficher les discussions
async function displayDiscussions() {
    const discussionsList = document.getElementById('discussion-list');
    const conversations = await getConversations();
    
    discussionsList.innerHTML = '';
    
    for (const conv of conversations) {
        // Récupérer l'info de l'autre utilisateur
        const otherUserId = conv.participants.find(id => id !== currentUserId);
        const userInfo = await getUserInfo(otherUserId);
        
        if (!userInfo) continue;
        
        const avatar = (userInfo.photos && userInfo.photos[0]) || 'https://via.placeholder.com/56';
        const name = `${userInfo.prenom || ''} ${userInfo.nom || ''}`.trim();
        const online = userInfo.online || false;
        const verified = userInfo.verified || false;
        
        const lastMessage = conv.lastMessage ? conv.lastMessage.content : 'Pas de message';
        const unreadCount = conv.unread || 0;
        
        const discussionHTML = `
            <div class="discussion-item" data-user-id="${otherUserId}">
                <div class="discussion-avatar">
                    <div class="avatar-img" style="background-image: url('${avatar}');"></div>
                    ${online ? '<div class="online-indicator"></div>' : ''}
                </div>
                <div class="discussion-content">
                    <div class="discussion-header">
                        <span class="discussion-name">${name}</span>
                        ${verified ? '<span class="material-symbols-outlined verified-icon">verified</span>' : ''}
                    </div>
                    <div class="discussion-preview">${lastMessage.substring(0, 40)}${lastMessage.length > 40 ? '...' : ''}</div>
                </div>
                <div class="discussion-meta">
                    <div class="discussion-time">${formatTime(conv.lastMessageAt)}</div>
                    ${unreadCount > 0 ? `<div class="unread-count">${unreadCount}</div>` : ''}
                </div>
            </div>
        `;
        discussionsList.insertAdjacentHTML('beforeend', discussionHTML);
    }
    
    addDiscussionClickListeners();
}

// Afficher les messages d'une conversation
async function displayMessages(userId) {
    const messagesContainer = document.getElementById('messages-container');
    const conversation = await getConversation(userId);
    
    messagesContainer.innerHTML = '';
    
    if (!conversation) {
        messagesContainer.innerHTML = '<div class="empty-chat"><div class="empty-chat-text">Aucun message pour le moment</div></div>';
        return;
    }
    
    // Afficher le message système de match
    if (conversation.matchDate) {
        const systemHTML = `
            <div class="system-message">
                <div class="system-text">Vous avez matché le ${conversation.matchDate}</div>
            </div>
        `;
        messagesContainer.insertAdjacentHTML('beforeend', systemHTML);
    }
    
    // Afficher les messages
    if (conversation.messages && conversation.messages.length > 0) {
        conversation.messages.forEach(msg => {
            const isSent = msg.sender === currentUserId;
            const avatar = (msg.senderInfo && msg.senderInfo.photos && msg.senderInfo.photos[0]) || 'https://via.placeholder.com/32';
            
            const messageHTML = `
                <div class="message ${isSent ? 'sent' : 'received'}">
                    ${!isSent ? `
                        <div class="message-avatar">
                            <div class="avatar-img" style="background-image: url('${avatar}');"></div>
                        </div>
                    ` : ''}
                    <div class="message-content">
                        <div class="message-bubble">
                            <div class="message-text">${escapeHtml(msg.content)}</div>
                        </div>
                        <div class="message-time">${formatTime(msg.createdAt)}</div>
                    </div>
                    ${isSent ? `
                        <div class="message-avatar">
                            <div class="avatar-img" style="background-image: url('${avatar}');"></div>
                        </div>
                    ` : ''}
                </div>
            `;
            messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
        });
    }
    
    // Scroll vers le bas
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Mettre à jour le header du chat
async function updateChatHeader(userId) {
    const userInfo = await getUserInfo(userId);
    
    if (!userInfo) return;
    
    const avatar = (userInfo.photos && userInfo.photos[0]) || 'https://via.placeholder.com/44';
    const name = `${userInfo.prenom || ''} ${userInfo.nom || ''}`.trim();
    
    document.getElementById('chat-user-avatar').style.backgroundImage = `url('${avatar}')`;
    document.getElementById('chat-user-name').textContent = name;
    document.getElementById('chat-user-status').textContent = userInfo.online ? 'En ligne' : 'Hors ligne';
}

// ============= ÉCOUTEURS D'ÉVÉNEMENTS =============

// Ajouter les écouteurs pour les matchs
function addMatchClickListeners() {
    document.querySelectorAll('.match-item').forEach(item => {
        item.addEventListener('click', async (e) => {
            const userId = item.dataset.userId;
            currentChatUserId = userId;
            
            // Mettre à jour l'UI
            document.querySelectorAll('.discussion-item').forEach(d => d.classList.remove('active'));
            
            await updateChatHeader(userId);
            await displayMessages(userId);
        });
    });
}

// Ajouter les écouteurs pour les discussions
function addDiscussionClickListeners() {
    document.querySelectorAll('.discussion-item').forEach(item => {
        item.addEventListener('click', async (e) => {
            const userId = item.dataset.userId;
            currentChatUserId = userId;
            
            // Mettre à jour l'état actif
            document.querySelectorAll('.discussion-item').forEach(d => d.classList.remove('active'));
            item.classList.add('active');
            
            await updateChatHeader(userId);
            await displayMessages(userId);
        });
    });
}

// Envoyer un message
document.getElementById('send-btn')?.addEventListener('click', async (e) => {
    e.preventDefault();
    
    const input = document.getElementById('message-input');
    const content = input.value.trim();
    
    if (!content || !currentChatUserId) return;
    
    const message = await sendMessage(currentChatUserId, content);
    
    if (message) {
        input.value = '';
        await displayMessages(currentChatUserId);
    }
});

// Enter pour envoyer
document.getElementById('message-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('send-btn').click();
    }
});

// ============= UTILITAIRES =============

function formatTime(date) {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    
    if (d.toDateString() === now.toDateString()) {
        return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) {
        return 'Hier';
    }
    
    return d.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============= INITIALISATION =============

async function init() {
    log('Initialisation de la page de messages...');
    
    try {
        // Vérifier que le DOM est prêt
        if (!document.getElementById('app-container')) {
            error('DOM non trouvé - attendre le chargement');
            return;
        }
        
        // Récupérer l'utilisateur courant
        const user = await getCurrentUser();
        
        if (!currentUserId) {
            error('Utilisateur non authentifié - redirection vers login');
            // Attendre 1 seconde avant redirection
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 1000);
            return;
        }
        
        log('Utilisateur authentifié:', currentUserId);
        
        // Charger les données
        try {
            await updateUserHeader(currentUser);
            log('Header utilisateur mis à jour');
        } catch (err) {
            error('Erreur lors de la mise à jour du header:', err);
        }
        
        try {
            await displayMatches();
            log('Matches affichés');
        } catch (err) {
            error('Erreur lors de l\'affichage des matches:', err);
        }
        
        try {
            await displayDiscussions();
            log('Discussions affichées');
        } catch (err) {
            error('Erreur lors de l\'affichage des discussions:', err);
        }
        
        // Charger la première discussion par défaut
        if (discussions && discussions.length > 0) {
            const firstUserId = discussions[0].participants.find(id => id !== currentUserId);
            currentChatUserId = firstUserId;
            
            try {
                await updateChatHeader(firstUserId);
                await displayMessages(firstUserId);
                
                // Marquer comme actif
                document.querySelector('.discussion-item')?.classList.add('active');
                log('Première discussion chargée');
            } catch (err) {
                error('Erreur lors du chargement de la première discussion:', err);
            }
        } else {
            log('Aucune discussion trouvée');
            const emptyContainer = document.getElementById('messages-container');
            if (emptyContainer) {
                emptyContainer.innerHTML = `
                    <div class="empty-chat">
                        <div class="empty-chat-icon">💬</div>
                        <div class="empty-chat-text">Aucune discussion pour le moment. Explorez les matchs!</div>
                    </div>
                `;
            }
        }
        
        log('Initialisation terminée avec succès!');
    } catch (err) {
        error('Erreur critique lors de l\'initialisation:', err);
    }
}

// Initialiser au chargement du DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // Le DOM est déjà chargé
    init();
}

// Rafraîchir toutes les 5 secondes pour les nouveaux messages
setInterval(async () => {
    if (currentChatUserId) {
        try {
            await displayMessages(currentChatUserId);
            await displayDiscussions();
        } catch (err) {
            error('Erreur lors du rafraîchissement:', err);
        }
    }
}, 5000);

log('Script message.js chargé');

// ============= DONNÉES DE FALLBACK (optionnel) =============

const initialData = {
    user: {
        name: "Utilisateur",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBNXLQNCWmwbRjjVk8Yqh-aToB8QNmi4LauoDAnPkaxsG2IE7rK5woyC6Xm3p8AsPZEW0BQX8FU46BYtAxV4_Xwj8BKacNjJ-Zm1QtgxtsGapB-dCchexEO_EV2iFutz38hY1OgpiOmEyCtXBFar_JVEnzyS_LQwwzximc7CcARHOQ1ZgJv0ZquGYZFYQUInwwJSACsFCze_pNlMUk_uyRIWH_pJclYw9kXde9X0wOfHYN133We1yuW1c_BLgQQ8Iq9fSDTZS7TzLzW"
    },
    matches: [
        {
            id: 1,
            name: "Sarah",
            avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuALg9KzwYik7xko__doezmrSTV54H5ZCAADsW91MNV06azCHHQcTGGl5bZMHgEG5qZDKnDIUOVMha9m2juKT8NKAFfj3sjQWPwX5rIeCY9PHUb79k1RbWFyqLTX_5572ABGjnP2v2YsaIjV_AnKQTKo3Co2Lz21LNqPPGr_6TXNmE9PrdsIH4yS2sMW5dd_yNcZJqFKkjgnp_GRKQigOhxzR8w9fvikvC8OW7wSslbVk2MZw7b-4nzbIveyq23irYukT_NbhXT-132K",
            online: true
        },
        {
            id: 2,
            name: "Fatou",
            avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBeFTGnGVFAFjJ7jR2rLh3VaaVjTelzFxb4Ae7HNug9T-LaXsGRUpFLQdw63mg21-kWFJnob57fYqsAq8wEIFrYPF5Ct6r6GF9ypyYcpNvDuVw3FxjHzIYNT-BNYXAcKsEGpJk-ypaIs8abTl1O1N93PWCpvjtps_CHCoLCY0p4hbuDgSJGtjU6X30XckyjZh7W7DI9mHXRzzKGDrJ_eCkMW5KRo7nCt7GUmZYbaB89ntFc3F4rRES_fQB9YAu_9iD_2k1p6CQaDStU",
            online: false
        },
        {
            id: 3,
            name: "Nia",
            avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDdrSmTkikNrcHVG61ZSAJQhwlxEtvML_JXTGS4GseErrYe4JJyybVN1KU6-xBKEdRLdEavEd44MJzubqzBrF_R1tuzH6qpIDk6ozhW1Pbo5b4tBB0yO-9S7Vkp5FJqWUEBmRi3J_SznfXwZ-9VKDIS0VweLGDX_N1PgL0JxXmkTSfIgYB6XgRNMeh2DBII3_fUbsNzFBtNwfv611Hz9NrE0-77tI4RbykJ7WpiXD37bA20NgvI3fFInfGTmyuA0bnBzA8Qwb9KB3vq",
            online: false
        },
        {
            id: 4,
            name: "Zoe",
            avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAo9RYwR-UALL744rdxKkuj4J97dvYJ9YuX8OwoqhiuChixP1PBHOUFoNiCnsVaLaq5fiXsjb5n2rzLNq3Ch3fKf4sGBMza8ovEtADvn7qdheYGs2DmmcfqJDYNWnfUxhK1uPArX8YVsqPFh9IIkj4FiehWr812kt_Pf7eyYrDQKHiGl4JHOL_AXnZ11QiKstngiMSgeKAaAANkR3QaffJwXgA6QgDdDQxjr4iDB_0xUhTJ1CTS_sGUQgck4UfbXWKKxltgIggkqrKe",
            online: false
        }
    ],
    discussions: [
        {
            id: 1,
            userId: 5,
            name: "Amina",
            verified: true,
            avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBuwKYUhpOHcOv7IoMjuNWiJy1KWEerRMWU0aP6wwPsO3DfWhCxWTHwwZBzGroEtZ0BVcYUeku9_l8TPlv_13LsMH7fKojmQDYp6dplpQY87YuQ0s2IGV3h42bEUiRivOyxe9_pH-krLT3CM3rAJWC54SHfnFDfcF1wcSaqw0AkOJic2nC-6lDq9gsKPCOPGH9vWqQGvhjwtbOcqXy8_xo47hVcYWAexdgToMSl7663z1ZEe1cn-8_qzTWFUEPj6qCKFf3WUzCHqdQO",
            online: true,
            lastMessage: "Droit ! Enchantée ",
            time: "10:42",
            unread: 2,
            matchDate: "12 Octobre",
            messages: [
                { id: 1, type: "received", text: "Salut ! J'ai vu que tu étudies aussi à Dakar ?", time: "10:30" },
                { id: 2, type: "sent", text: "Oui, exactement ! En ingénierie. Et toi ?", time: "10:32" },
                { id: 3, type: "received", text: "Droit ! Enchantée ", time: "10:42" }
            ]
        },
        {
            id: 2,
            userId: 6,
            name: "Kwame",
            verified: false,
            avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuApR9lxCKJ4wbiybbq7MAiD3ykHJeug3lmDD8WrxRSXr-IEa9T0VfgybWyzLXCR23ng2GeMM8CsLNSmh2YTQc2PlemD9SN7XKwaE_1nUudPfsTAjZQ-qdbdzX6m401CIMFlSqfDyf1x7iiSTa0SNSeDBTSwB8Z9UJuNm5xrIAPVn7SVU3VBkE3tdgcog5-SSpxHnmBsvte6lfAYANsN8O8ilOddwAAWjEd__NdYozW_G5U1kFoqkg7XrKcb-2qTic3YN9d4p2VEEppV",
            online: false,
            lastMessage: "On se voit demain pour le café ?",
            time: "Hier",
            unread: 0,
            messages: []
        },
                {
                    id: 3,
                    userId: 7,
                    name: "Binta",
                    verified: false,
                    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBJsKYg5DeSvkrPIUfXfVPOJorxjW8bh72p3gvb24lOdJ4y6HE1-A3xeSl4bIYTup_stoSJmXROkJCs8s3KPpitZ7DUAJwBr-829Hna4Xnj96fR7RJIbSOlBdn4VWp9LEvX2JR37paNCEB0fph0eJc_WF9135z5IE-dybYVEP51LF9vg8F0q6otOhwrdj6sZ_J_pGmKtTg8-960mG3kpL3k6K79MLJ4njToEHNQrt-SaZ7Chuizu_39N0zLPDIcYKMX3mU-UETnt855",
                    online: false,
                    lastMessage: "À bientôt !",
                    time: "Hier",
                    unread: 0,
                    messages: []
                }
            ]
        };