
import express from 'express';
import User from '../models/User.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/search/profiles - Récupère les profils selon les filtres
router.get('/profiles', authMiddleware, async (req, res) => {
    try {
        // Récupère les paramètres de filtrage
        const { ageMin = 18, ageMax = 50, localisation, genre } = req.query;
        
        // Récupère l'utilisateur actuel
        const currentUserId = req.user.id;
        
        // Récupère l'utilisateur actuel pour exclure ses likes/passes
        const currentUser = await User.findById(currentUserId);
        
        // Construit les filtres MongoDB
        const filters = {
            _id: { 
                $ne: currentUserId, // Exclut l'utilisateur actuel
                $nin: [
                    ...(currentUser.likes || []),
                    ...(currentUser.passes || []),
                    ...(currentUser.blocked || [])
                ]
            }
        };
        
        // Filtre par localisation
        if (localisation) {
            filters.localisation = localisation;
        }
        
        // Filtre par genre
        if (genre) {
            filters.genre = genre;
        }
        
        // Récupère les profils
        const profiles = await User.find(filters)
            .select('-password -email')
            .limit(50)
            .exec();
        
        // Filtre par âge côté application (car dateNaissance)
        const filteredProfiles = profiles.filter(profile => {
            if (!profile.dateNaissance) return false;
            
            const today = new Date();
            const birthDate = new Date(profile.dateNaissance);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            
            return age >= parseInt(ageMin) && age <= parseInt(ageMax);
        });
        
        res.json(filteredProfiles);
    } catch (err) {
        console.error('[SearchRoutes] Erreur:', err);
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
});

export default router;