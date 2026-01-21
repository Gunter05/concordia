import { sendMessage, fetchMessages, fetchConversations } from './message_utils.js';

// Get DOM elements
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const messagesContainer = document.getElementById('messages-container');
const discussionList = document.getElementById('discussion-list');
const newMatchesList = document.getElementById('new-matches-list');
const chatUserName = document.getElementById('chat-user-name');
const chatUserAvatar = document.getElementById('chat-user-avatar');
const chatUserStatus = document.getElementById('chat-user-status');

let currentUserId = null;
let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

/**
 * Initialize the messaging interface
 */
function init() {
    if (!loggedInUser) {
        console.error('No user logged in');
        return;
    }

    console.log('[message2.js] Initializing - Logged in user:', loggedInUser._id);

    // Load conversations on page load
    loadConversations();
    
    // Add event listeners
    sendBtn.addEventListener('click', handleSendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });
}

/**
 * Load all conversations
 */
function loadConversations() {
    console.log('[message2.js] Starting to fetch conversations for user:', loggedInUser._id);
    
    fetchConversations((response) => {
        try {
            console.log('[message2.js] Raw response from fetchConversations:', response);
            
            let conversations = response;
            
            // Parse if response is a string
            if (typeof response === 'string') {
                conversations = JSON.parse(response);
            }
            
            console.log('[message2.js] Parsed conversations:', conversations);
            
            if (Array.isArray(conversations)) {
                console.log(`[message2.js] Found ${conversations.length} conversations`);
                updateDiscussionsList(conversations);
            } else {
                console.warn('[message2.js] Response is not an array:', conversations);
            }
        } catch (error) {
            console.error('[message2.js] Error parsing conversations:', error);
        }
    });
}

/**
 * Update discussions list with fetched conversations
 */
function updateDiscussionsList(conversations) {
    discussionList.innerHTML = '';
    
    conversations.forEach((conversation, index) => {
        // Find the other participant (not the logged-in user)
        const otherParticipant = conversation.participants.find(p => p._id !== loggedInUser._id);
        
        if (otherParticipant) {
            const discussionItem = createDiscussionElement(conversation, otherParticipant, index === 0);
            discussionList.appendChild(discussionItem);
        }
    });

    setupDiscussionListeners();
}

/**
 * Create a discussion item element
 */
function createDiscussionElement(conversation, otherParticipant, isActive = false) {
    const div = document.createElement('div');
    div.className = `discussion-item ${isActive ? 'active' : ''}`;
    div.setAttribute('data-user-id', otherParticipant._id);
    div.setAttribute('data-conversation-id', conversation._id);
    
    const lastMessage = conversation.lastMessage?.content || 'Pas de messages';
    const lastTime = formatTime(conversation.lastMessageAt);
    const unreadCount = conversation.lastMessage?.read ? 0 : 1;
    const userName = otherParticipant.nom || 'Unknown';
    const userAvatar = otherParticipant.photos?.[0] 
        ? `https://nexus-api-ill3.onrender.com/api/uploads/${otherParticipant.photos[0]}`
        : 'https://via.placeholder.com/56';

    div.innerHTML = `
        <div class="discussion-avatar">
            <div class="avatar-img" style="background-image: url('${userAvatar}');"></div>
        </div>
        <div class="discussion-content">
            <div class="discussion-header">
                <span class="discussion-name">${userName}</span>
            </div>
            <div class="discussion-preview">${escapeHtml(lastMessage)}</div>
        </div>
        <div class="discussion-meta">
            <div class="discussion-time">${lastTime}</div>
            ${unreadCount > 0 ? `<div class="unread-count">${unreadCount}</div>` : ''}
        </div>
    `;

    return div;
}

/**
 * Setup click listeners for discussion items
 */
function setupDiscussionListeners() {
    document.querySelectorAll('.discussion-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const userId = item.getAttribute('data-user-id');
            selectDiscussion(userId, item);
        });
    });
}

/**
 * Select a discussion and load its messages
 */
function selectDiscussion(userId, discussionElement) {
    // Update active state
    document.querySelectorAll('.discussion-item').forEach(item => {
        item.classList.remove('active');
    });
    discussionElement.classList.add('active');

    currentUserId = userId;

    // Update chat header with user info
    const userName = discussionElement.querySelector('.discussion-name').textContent;
    const userAvatar = discussionElement.querySelector('.avatar-img').style.backgroundImage;
    chatUserName.textContent = userName;
    chatUserAvatar.style.backgroundImage = userAvatar;

    // Load messages for this conversation
    loadMessages(userId);
}

/**
 * Load messages for a specific user
 */
function loadMessages(withUserId) {
    fetchMessages(withUserId, (response) => {
        try {
            const messages = typeof response === 'string' ? JSON.parse(response) : response;
            console.log('Messages loaded:', messages);
            
            if (Array.isArray(messages)) {
                displayMessages(messages);
            }
        } catch (error) {
            console.error('Error parsing messages:', error);
        }
    });
}

/**
 * Display messages in the chat container
 */
function displayMessages(messages) {
    // Clear existing messages (keep system message if needed)
    const messageElements = messagesContainer.querySelectorAll('.message, .system-message');
    messageElements.forEach(msg => msg.remove());

    messages.forEach(message => {
        const messageElement = createMessageElement(message);
        messagesContainer.appendChild(messageElement);
    });

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Create a message element
 */
function createMessageElement(message) {
    const div = document.createElement('div');
    const isSent = message.senderId === loggedInUser._id;
    div.className = `message ${isSent ? 'sent' : 'received'}`;

    const messageTime = formatTime(message.timestamp);
    const avatarUrl = message.senderAvatar || 'https://via.placeholder.com/32';

    if (isSent) {
        div.innerHTML = `
            <div class="message-content">
                <div class="message-bubble">
                    <div class="message-text">${escapeHtml(message.content)}</div>
                </div>
                <div class="message-time">${messageTime}</div>
            </div>
            <div class="message-avatar">
                <div class="avatar-img" style="background-image: url('${avatarUrl}');"></div>
            </div>
        `;
    } else {
        div.innerHTML = `
            <div class="message-avatar">
                <div class="avatar-img" style="background-image: url('${avatarUrl}');"></div>
            </div>
            <div class="message-content">
                <div class="message-bubble">
                    <div class="message-text">${escapeHtml(message.content)}</div>
                </div>
                <div class="message-time">${messageTime}</div>
            </div>
        `;
    }

    return div;
}

/**
 * Handle sending a message
 */
function handleSendMessage() {
    const messageText = messageInput.value.trim();

    if (!messageText || !currentUserId) {
        console.warn('No message text or user selected');
        return;
    }

    // Send the message using the utility function
    sendMessage(currentUserId, messageText, (response) => {
        try {
            const result = typeof response === 'string' ? JSON.parse(response) : response;
            console.log('Message sent:', result);

            // Add the message to the UI immediately
            const newMessage = {
                senderId: loggedInUser._id,
                content: messageText,
                timestamp: new Date(),
                senderAvatar: loggedInUser.photo
            };

            const messageElement = createMessageElement(newMessage);
            messagesContainer.appendChild(messageElement);

            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            // Clear the input
            messageInput.value = '';
            messageInput.focus();
        } catch (error) {
            console.error('Error sending message:', error);
        }
    });
}

/**
 * Format timestamp to readable time
 */
function formatTime(timestamp) {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `${diffDays}j`;
    
    return date.toLocaleDateString('fr-FR');
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Update online status display
 */
function updateOnlineStatus(isOnline) {
    const status = isOnline ? 'En ligne' : 'Hors ligne';
    chatUserStatus.textContent = status;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

console.log('[message2.js] Script loaded successfully');
