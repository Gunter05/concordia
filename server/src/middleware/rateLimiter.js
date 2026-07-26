import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        message: 'Trop de requêtes effectuées depuis cette adresse IP, veuillez réessayer après 15 minutes.'
    }
});

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 auth requests per `window` (15 minutes)
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Trop de tentatives de connexion/inscription depuis cette adresse IP, veuillez réessayer après 15 minutes.'
    }
});
