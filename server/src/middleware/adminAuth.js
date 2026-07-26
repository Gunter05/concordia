import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

const adminAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: "Non autorisé - Token manquant" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Vérifier que c'est un admin
        const admin = await Admin.findById(decoded.id);
        
        if (!admin) {
            return res.status(403).json({ message: "Accès refusé - Admin uniquement" });
        }

        req.admin = admin;
        next();
    } catch (error) {
        res.status(401).json({ message: "Token invalide" });
    }
};

// Middleware pour vérifier les permissions
const checkPermission = (permission) => {
    return (req, res, next) => {
        if (req.admin.role === 'super-admin' || req.admin.permissions.includes(permission)) {
            next();
        } else {
            res.status(403).json({ message: "Permission refusée" });
        }
    };
};

export { adminAuth, checkPermission };