
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';

// @desc    Envoyer un message
// @route   POST /api/chat/send
const sendMessage = async (req, res) => {
    try {
        const senderId = req.user && (req.user._id || req.user.id);
        const { receiverId, content } = req.body;

        if (!senderId) {
            return res.status(401).json({ message: "Non autorisé" });
        }

        if (!receiverId || !content) {
            return res.status(400).json({ message: "Destinataire et contenu requis" });
        }

        // Vérifier que les deux utilisateurs existent
        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);

        if (!sender || !receiver) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        // Vérifier que l'utilisateur n'est pas bloqué
        if (receiver.blocked && receiver.blocked.includes(senderId)) {
            return res.status(403).json({ message: "Vous ne pouvez pas envoyer de message à cet utilisateur" });
        }

        // Créer le message
        const message = await Message.create({
            sender: senderId,
            receiver: receiverId,
            content
        });

        // Trouver ou créer la conversation
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
                lastMessage: message._id,
                lastMessageAt: new Date()
            });
        } else {
            conversation.lastMessage = message._id;
            conversation.lastMessageAt = new Date();
            await conversation.save();
        }

        // Populer et retourner le message
        await message.populate('sender', 'nom prenom photos');
        await message.populate('receiver', 'nom prenom photos');

        res.status(201).json(message);
    } catch (error) {
        console.error('sendMessage error', error);
        res.status(400).json({ message: 'Erreur lors de l\'envoi du message', error: error.message });
    }
};

// @desc    Récupérer une conversation
// @route   GET /api/chat/conversation/:userId
const getConversation = async (req, res) => {
    try {
        const currentUserId = req.user && (req.user._id || req.user.id);
        const otherUserId = req.params.userId || req.body.otherUserId;

        if (!currentUserId) {
            return res.status(401).json({ message: "Non autorisé" });
        }

        // Récupérer tous les messages entre les deux utilisateurs
        const messages = await Message.find({
            $or: [
                { sender: currentUserId, receiver: otherUserId },
                { sender: otherUserId, receiver: currentUserId }
            ]
        })
        .populate('sender', 'nom prenom photos')
        .populate('receiver', 'nom prenom photos')
        .sort({ createdAt: 1 });

        // Marquer les messages comme lus
        await Message.updateMany(
            {
                receiver: currentUserId,
                sender: otherUserId,
                read: false
            },
            { read: true, readAt: new Date() }
        );

        res.json(messages);
    } catch (error) {
        console.error('getConversation error', error);
        res.status(400).json({ message: 'Erreur lors de la récupération de la conversation', error: error.message });
    }
};

// @desc    Récupérer toutes les conversations de l'utilisateur
// @route   GET /api/chat/conversations
const getConversations = async (req, res) => {
    try {
        const userId = req.user && (req.user._id || req.user.id);

        if (!userId) {
            return res.status(401).json({ message: "Non autorisé" });
        }

        const conversations = await Conversation.find({
            participants: userId
        })
        .populate('participants', 'nom prenom photos')
        .populate('lastMessage')
        .sort({ lastMessageAt: -1 });

        res.json(conversations);
    } catch (error) {
        console.error('getConversations error', error);
        res.status(400).json({ message: 'Erreur lors de la récupération des conversations', error: error.message });
    }
};

// @desc    Récupérer les messages non lus
// @route   GET /api/chat/unread
const getUnreadMessages = async (req, res) => {
    try {
        const userId = req.user && (req.user._id || req.user.id);

        if (!userId) {
            return res.status(401).json({ message: "Non autorisé" });
        }

        const unreadMessages = await Message.find({
            receiver: userId,
            read: false
        })
        .populate('sender', 'nom prenom photos')
        .sort({ createdAt: -1 });

        const unreadCount = unreadMessages.length;

        res.json({ unreadCount, messages: unreadMessages });
    } catch (error) {
        console.error('getUnreadMessages error', error);
        res.status(400).json({ message: 'Erreur lors de la récupération des messages non lus', error: error.message });
    }
};

// @desc    Bloquer un utilisateur
// @route   POST /api/chat/block/:userId
const blockUser = async (req, res) => {
    try {
        const currentUserId = req.user && (req.user._id || req.user.id);
        const userToBlockId = req.params.userId;

        if (!currentUserId) {
            return res.status(401).json({ message: "Non autorisé" });
        }

        const user = await User.findById(currentUserId);

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        if (!user.blocked) user.blocked = [];
        if (!user.blocked.includes(userToBlockId)) {
            user.blocked.push(userToBlockId);
        }

        await user.save();

        res.json({ message: "Utilisateur bloqué" });
    } catch (error) {
        console.error('blockUser error', error);
        res.status(400).json({ message: 'Erreur lors du blocage', error: error.message });
    }
};

// @desc    Débloquer un utilisateur
// @route   POST /api/chat/unblock/:userId
const unblockUser = async (req, res) => {
    try {
        const currentUserId = req.user && (req.user._id || req.user.id);
        const userToUnblockId = req.params.userId;

        if (!currentUserId) {
            return res.status(401).json({ message: "Non autorisé" });
        }

        const user = await User.findById(currentUserId);

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        if (user.blocked) {
            user.blocked = user.blocked.filter(id => id.toString() !== userToUnblockId);
        }

        await user.save();

        res.json({ message: "Utilisateur débloqué" });
    } catch (error) {
        console.error('unblockUser error', error);
        res.status(400).json({ message: 'Erreur lors du déblocage', error: error.message });
    }
};

// @desc    Supprimer une conversation
// @route   DELETE /api/chat/conversation/:userId
const deleteConversation = async (req, res) => {
    try {
        const currentUserId = req.user && (req.user._id || req.user.id);
        const otherUserId = req.params.userId;

        if (!currentUserId) {
            return res.status(401).json({ message: "Non autorisé" });
        }

        // Supprimer la conversation
        await Conversation.deleteOne({
            participants: { $all: [currentUserId, otherUserId] }
        });

        // Supprimer les messages
        await Message.deleteMany({
            $or: [
                { sender: currentUserId, receiver: otherUserId },
                { sender: otherUserId, receiver: currentUserId }
            ]
        });

        res.json({ message: "Conversation supprimée" });
    } catch (error) {
        console.error('deleteConversation error', error);
        res.status(400).json({ message: 'Erreur lors de la suppression', error: error.message });
    }
};

export { 
    sendMessage, 
    getConversation, 
    getConversations, 
    getUnreadMessages, 
    blockUser, 
    unblockUser, 
    deleteConversation 
};