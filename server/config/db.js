import mongoose from 'mongoose';

const connectDB = async () => {
    if (process.env.NODE_ENV === 'test') {
        console.log('Environnement de test détecté - Connexion MongoDB réelle ignorée');
        return;
    }
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connecté avec succès');
    } catch (error) {
        console.error('Erreur de connexion MongoDB', error);
        process.exit(1);
    }
};

export default connectDB;