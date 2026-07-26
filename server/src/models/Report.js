import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    reportedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reason: {
        type: String,
        enum: ['spam', 'harassment', 'fake-profile', 'inappropriate-content', 'other'],
        required: true
    },
    description: {
        type: String,
        maxlength: 500
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
        default: 'pending'
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    reviewedAt: Date,
    action: {
        type: String,
        enum: ['none', 'warning', 'suspension', 'ban']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Report', reportSchema);