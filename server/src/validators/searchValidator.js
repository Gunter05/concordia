import { query, validationResult } from 'express-validator';

const validateSearch = [
    query('age')
        .optional()
        .isInt({ min: 18, max: 100 })
        .withMessage('L\'âge doit être entre 18 et 100'),
    query('sexe')
        .optional()
        .isIn(['homme', 'femme', 'autre'])
        .withMessage('Le sexe doit être homme, femme ou autre'),
    query('religion')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('La religion ne doit pas dépasser 50 caractères'),
    query('ethnie')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('L\'ethnie ne doit pas dépasser 50 caractères'),
    query('location')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('La localisation doit contenir entre 2 et 100 caractères'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

export default validateSearch;