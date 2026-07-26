
import { body, validationResult } from 'express-validator';

const handleValidationResults = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}
	next();
};

export const validateRegister = [
	body('nom')
		.notEmpty().withMessage('Le nom est requis')
		.isLength({ min: 2, max: 50 }).withMessage('Le nom doit contenir entre 2 et 50 caractères'),
	body('email')
		.notEmpty().withMessage('L\'email est requis')
		.isEmail().withMessage('Email invalide'),
	body('password')
		.notEmpty().withMessage('Le mot de passe est requis')
		.isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
	body('age')
		.notEmpty().withMessage('L\'âge est requis')
		.isInt({ min: 18, max: 120 }).withMessage('L\'âge doit être compris entre 18 et 120 ans'),
	body('sexe')
		.notEmpty().withMessage('Le sexe est requis')
		.isIn(['homme', 'femme', 'autre']).withMessage('Sexe invalide'),
	body('intention')
		.notEmpty().withMessage('L\'intention est requise')
		.isIn(['relation', 'amitié', 'découverte']).withMessage('Intention invalide'),
	handleValidationResults
];

export const validateLogin = [
	body('email')
		.notEmpty().withMessage('L\'email est requis')
		.isEmail().withMessage('Email invalide'),
	body('password')
		.notEmpty().withMessage('Le mot de passe est requis'),
	handleValidationResults
];
