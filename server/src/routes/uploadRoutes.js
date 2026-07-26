import express from'express';
const router = express.Router();
import { upload } from '../../config/cloudinary.js';
import authMiddleware from '../middleware/authMiddleware.js';

// Route SANS auth pour l'inscription
router.post('/profile-register', upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Aucun fichier uploadé' });
        }

        res.status(200).json({
            message: 'Photo uploadée avec succès',
            url: req.file.path
        });
    } catch (error) {
        console.error('Erreur upload:', error);
        res.status(500).json({ message: error.message });
    }
});

// Route AVEC auth pour les profils existants
router.post('/profile', authMiddleware, upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Aucun fichier uploadé' });
        }

        res.status(200).json({
            message: 'Photo uploadée avec succès',
            url: req.file.path
        });
    } catch (error) {
        console.error('Erreur upload:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;