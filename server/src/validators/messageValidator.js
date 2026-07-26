import { body, param, validationResult } from 'express-validator';
import mongoose from 'mongoose';

const validateMessage = [
    body('receiverId')
        .notEmpty()
        .withMessage('Le destinataire est requis')
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('ID destinataire invalide');
            }
            return true;
        }),
    body('content')
        .notEmpty()
        .withMessage('Le message ne peut pas être vide')
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Le message doit contenir entre 1 et 1000 caractères'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateConversationId = [
    param('userId')
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('ID utilisateur invalide');
            }
            return true;
        }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

export { 
    validateMessage, 
    validateConversationId 
};