import { param, validationResult } from 'express-validator';
import mongoose from 'mongoose';

const validateUserId = [
    param('targetId')
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

export default validateUserId;