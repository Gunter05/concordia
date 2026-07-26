import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
    {
        participants: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }],
        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message'
        },
        lastMessageAt: {
            type: Date,
            default: Date.now
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

// Index pour les recherches de conversations
conversationSchema.index({ participants: 1 });

export default mongoose.model('Conversation', conversationSchema);