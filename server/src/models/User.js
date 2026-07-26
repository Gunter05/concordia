import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        nom: {
            type: String,
            required: [true, 'Veuillez entrer un nom']
        },
        prenom: {
            type: String
        },
        email: {
            type: String,
            required: [true, 'Veuillez entrer un email'],
            unique: true,
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Veuillez entrer un email valide']
        },
        password: {
            type: String,
            required: [true, 'Veuillez entrer un mot de passe'],
            select: false
        },
        dateNaissance: {
            type: Date,
            required: [true, 'Veuillez entrer votre date de naissance']
        },
        genre: {
            type: String,
            enum: ['homme', 'femme'],
            required: [true, 'Veuillez sélectionner votre genre']
        },
        intention: {
            type: String,
            enum: ['relation', 'amitié', 'découverte'],
            required: [true, 'Veuillez sélectionner votre intention']
        },
        bio: {
            type: String,
            maxlength: 500
        },
        photos: [{
            type: String
        }],
        religion: {
            type: String
        },
        ethnie: {
            type: String
        },
        localisation: {
            type: String
        },
        universite: {
            type: String
        },
        education: {
            type: String
        },
        interets: [{
            type: String
        }],
        likes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        passes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        matches: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        blocked: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        online: {
            type: Boolean,
            default: false
        },
        lastSeen: {
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

// Calculer l'âge virtuel
userSchema.virtual('age').get(function() {
    if (!this.dateNaissance) return null;
    const today = new Date();
    const birthDate = new Date(this.dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
});

// Hash password avant de sauvegarder
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Méthode pour comparer les passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Méthode pour obtenir un objet JSON avec l'âge
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

export default mongoose.model('User', userSchema);