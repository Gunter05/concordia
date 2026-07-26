import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'L\'expéditeur est requis']
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Le destinataire est requis']
        },
        content: {
            type: String,
            required: [true, 'Le message ne peut pas être vide'],
            maxlength: 1000
        },
        read: {
            type: Boolean,
            default: false
        },
        readAt: {
            type: Date
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

// Index pour les requêtes de conversation
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ receiver: 1, read: 1 });

export default mongoose.model('Message', messageSchema);