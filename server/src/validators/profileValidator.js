import { body, validationResult } from 'express-validator';

const validateProfile = [
    body('prenom')
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage('Le prénom doit contenir au moins 2 caractères')
        .isLength({ max: 50 })
        .withMessage('Le prénom ne doit pas dépasser 50 caractères'),
    body('bio')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('La biographie ne doit pas dépasser 500 caractères'),
    body('religion')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('La religion ne doit pas dépasser 50 caractères'),
    body('ethnie')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('L\'ethnie ne doit pas dépasser 50 caractères'),
    body('location')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('La localisation doit contenir entre 2 et 100 caractères'),
    body('photos')
        .optional()
        .isArray()
        .withMessage('Les photos doivent être un tableau')
        .custom((value) => {
            if (Array.isArray(value) && value.length > 10) {
                throw new Error('Maximum 10 photos autorisées');
            }
            return true;
        })
        .custom((value) => {
            if (Array.isArray(value)) {
                value.forEach(photo => {
                    if (!photo.match(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/)) {
                        throw new Error('URL de photo invalide');
                    }
                });
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

export default validateProfile;