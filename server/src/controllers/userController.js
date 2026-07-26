import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// renommage pour correspondre aux appels dans le controller
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d'});
};

// @desc    Inscrire un nouvel utilisateur
// @route   POST /api/users/register
const registerUser = async (req, res) => {
    const {
        nom,
        email,
        password,
        dateNaissance,
        genre,
        intention,
        bio,
        photos,
        religion,
        ethnie,
        localisation,
        interets
    } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: "L’utilisateur existe déjà" });
    }

    if (!email || !password || !nom) {
        return res.status(400).json({ message: "Champs requis manquants" });
    }


    const user = await User.create({
        nom,
        email,
        password,
        dateNaissance,
        genre,
        intention,
        bio,
        photos,
        religion,
        ethnie,
        localisation,
        interets
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            nom: user.nom,
            email: user.email,
            dateNaissance: user.dateNaissance,
            genre: user.genre,
            intention: user.intention,
            bio: user.bio,
            photos: user.photos,
            religion: user.religion,
            ethnie: user.ethnie,
            localisation: user.localisation,
            interets: user.interets,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: "Données invalides" });
    }
};

// @desc    Authentifier l’utilisateur et obtenir le token
// @route   POST /api/users/login
const authUser = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            nom: user.nom,
            email: user.email,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }
};

// @desc    Créer / mettre à jour le profil de l'utilisateur connecté
// @route   POST /api/users/profile
const createProfile = async (req, res) => {
    try {
        const userId = req.user && (req.user._id || req.user.id);
        if (!userId) {
            return res.status(401).json({ message: "Non autorisé" });
        }

        // Champs attendus pour le profil (le front envoie ce qu'il veut)
        const { prenom, bio, photos, religion, ethnie, location } = req.body;

        const updated = await User.findByIdAndUpdate(
            userId,
            { prenom, bio, photos, religion, ethnie, location },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updated) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        res.json(updated);
    } catch (error) {
        console.error('createProfile error', error);
        res.status(400).json({ message: 'Impossible de créer/mettre à jour le profil', error: error.message });
    }
};

// @desc    Récupérer le profil de l'utilisateur connecté
// @route   GET /api/users/profile
const getProfile = async (req, res) => {
    try {
        const userId = req.user && (req.user._id || req.user.id);
        if (!userId) {
            return res.status(401).json({ message: "Non autorisé" });
        }

        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        res.json(user);
    } catch (error) {
        console.error('getProfile error', error);
        res.status(400).json({ message: 'Erreur lors de la récupération du profil', error: error.message });
    }
};

// @desc    Rechercher des utilisateurs avec filtres
// @route   GET /api/users/search
const searchUsers = async (req, res) => {
    try {
        const userId = req.user && (req.user._id || req.user.id);
        if (!userId) {
            return res.status(401).json({ message: "Non autorisé" });
        }

        const { age, sexe, religion, ethnie, location } = req.query;
        const filter = { _id: { $ne: userId } };

        if (age) filter.age = { $gte: parseInt(age) - 5, $lte: parseInt(age) + 5 };
        if (sexe) filter.sexe = sexe;
        if (religion) filter.religion = religion;
        if (ethnie) filter.ethnie = ethnie;
        if (location) filter.location = new RegExp(location, 'i');

        const users = await User.find(filter).select('-password').limit(20);

        res.json(users);
    } catch (error) {
        console.error('searchUsers error', error);
        res.status(400).json({ message: 'Erreur lors de la recherche', error: error.message });
    }
};

// @desc    Récupérer un utilisateur par ID
// @route   GET /api/users/:id
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        res.json(user);
    } catch (error) {
        console.error('getUserById error', error);
        res.status(400).json({ message: 'Erreur lors de la récupération', error: error.message });
    }
};

// @desc    Récupérer l'utilisateur connecté
// @route   GET /api/auth/me
const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user && (req.user._id || req.user.id);
        if (!userId) {
            return res.status(401).json({ message: "Non autorisé" });
        }

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        res.json(user);
    } catch (error) {
        console.error('getCurrentUser error', error);
        res.status(400).json({ message: 'Erreur lors de la récupération de l\'utilisateur', error: error.message });
    }
};

// @desc    Mettre à jour un utilisateur (modifications partielles)
// @route   PUT /api/users/:id
const updateUser = async (req, res) => {
    let userId = req.params.id;

    try {

        // Liste des champs autorisés à mettre à jour
        const allowedFields = [
            'nom',
            'prenom',
            'dateNaissance',
            'genre',
            'intention',
            'bio',
            'photos',
            'religion',
            'ethnie',
            'localisation',
            'universite',
            'education',
            'interets'
        ];

        // Construire l'objet de mise à jour avec les champs non-null
        const updateData = {};
        allowedFields.forEach(field => {
            if (req.body.hasOwnProperty(field) && req.body[field] !== null && req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        // Si aucun champ à mettre à jour
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "Aucun champ à mettre à jour" });
        }

        const updated = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!updated) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        res.json(updated);
    } catch (error) {
        console.error('updateUser error', error);
        res.status(400).json({ message: 'Erreur lors de la mise à jour du profil', error: error.message ,userId: userId});
    }
};

// @desc    Récupérer tous les utilisateurs
// @route   GET /api/users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs", error: error.message });
    }
};

export {
    registerUser,
    authUser,
    createProfile,
    getProfile,
    searchUsers,
    getUserById,
    getCurrentUser,
    updateUser,
    getAllUsers
};