import { v2 as cloudinary } from 'cloudinary';
// eslint-disable-next-line @typescript-eslint/no-var-requires
// @ts-ignore
import CloudinaryStorage from 'multer-storage-cloudinary';
import multer from 'multer';

// Configuration Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configuration du storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'concordia/profiles', // Dossier dans Cloudinary
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
            { width: 800, height: 800, crop: 'limit' }, // Limite la taille
            { quality: 'auto' } // Optimisation automatique
        ]
    }
});

// Middleware multer
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    }
});

export { 
    cloudinary,
    upload,
};