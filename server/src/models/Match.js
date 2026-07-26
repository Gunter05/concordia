import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema(
    {
        user1: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        user2: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        likedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        matched: {
            type: Boolean,
            default: false
        },
        matchedAt: {
            type: Date
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

// Index pour les recherches rapides
matchSchema.index({ user1: 1, user2: 1 });
matchSchema.index({ user1: 1, matched: 1 });

export default mongoose.model('Match', matchSchema);