import User from '../models/User.js';

// @desc    Liker un utilisateur
// @route   POST /api/matches/like/:targetId
const likeUser = async (req, res) => {
    try {
        const userId = req.user && (req.user._id || req.user.id);
        const targetId = req.params.targetId;

        if (!userId) {
            return res.status(401).json({ message: "Non autorisé" });
        }

        if (userId === targetId) {
            return res.status(400).json({ message: "Vous ne pouvez pas vous liker" });
        }

        const user = await User.findById(userId);
        const target = await User.findById(targetId);

        if (!user || !target) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        // Ajouter le like
        if (!user.likes) user.likes = [];
        if (!user.likes.includes(targetId)) {
            user.likes.push(targetId);
        }

        // Vérifier si c'est un match mutuel
        let isMatch = false;
        if (target.likes && target.likes.includes(userId)) {
            isMatch = true;
            if (!user.matches) user.matches = [];
            if (!user.matches.includes(targetId)) {
                user.matches.push(targetId);
            }
            if (!target.matches) target.matches = [];
            if (!target.matches.includes(userId)) {
                target.matches.push(userId);
            }
            await target.save();
        }

        await user.save();

        res.json({ 
            message: isMatch ? "C'est un match ! 🎉" : "Like enregistré",
            isMatch 
        });
    } catch (error) {
        console.error('likeUser error', error);
        res.status(400).json({ message: 'Erreur lors du like', error: error.message });
    }
};

// @desc    Récupérer les matchs de l'utilisateur
// @route   GET /api/matches
const getMatches = async (req, res) => {
    try {
        const userId = req.user && (req.user._id || req.user.id);

        if (!userId) {
            return res.status(401).json({ message: "Non autorisé" });
        }

        const user = await User.findById(userId).populate('matches', '-password');

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        res.json(user.matches || []);
    } catch (error) {
        console.error('getMatches error', error);
        res.status(400).json({ message: 'Erreur lors de la récupération', error: error.message });
    }
};

// @desc    Rejeter un utilisateur
// @route   POST /api/matches/pass/:targetId
const passUser = async (req, res) => {
    try {
        const userId = req.user && (req.user._id || req.user.id);
        const targetId = req.params.targetId;

        if (!userId) {
            return res.status(401).json({ message: "Non autorisé" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        if (!user.passes) user.passes = [];
        if (!user.passes.includes(targetId)) {
            user.passes.push(targetId);
        }

        await user.save();

        res.json({ message: "Profil ignoré" });
    } catch (error) {
        console.error('passUser error', error);
        res.status(400).json({ message: 'Erreur lors du rejet', error: error.message });
    }
};

export { 
    likeUser, 
    getMatches, 
    passUser 
};