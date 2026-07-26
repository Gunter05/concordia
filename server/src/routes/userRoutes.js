import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { registerUser, createProfile, getProfile, searchUsers, getUserById, updateUser, getAllUsers } from '../controllers/userController.js';
import validateProfile from '../validators/profileValidator.js';
import  validateSearch  from '../validators/searchValidator.js';

const router = express.Router();

// // route pour l’inscription
// router.post('/register', validateRegister, registerUser);

// // route pour la connexion
// router.post('/login', validateLogin, authUser);

// route pour le profil (création / mise à jour) — protégée
router.post('/profile', authMiddleware, validateProfile, createProfile);
router.get('/profile', authMiddleware, getProfile);

// route pour la recherche d'utilisateurs
router.get('/search', authMiddleware, validateSearch, searchUsers);

// route pour mettre à jour un utilisateur (modifications partielles) — protégée
router.put('/:id', updateUser);

// route pour obtenir un utilisateur par son ID
router.get('/:id', getUserById);

// route pour obtenir tous les utilisateurs
router.get('/', getAllUsers);


export default router;