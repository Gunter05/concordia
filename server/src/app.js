import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../config/db.js';

import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import searchRoutes from './routes/searchRoutes.js';

import uploadRoutes from './routes/uploadRoutes.js';

import adminRoutes from './routes/adminRoutes.js';

import { apiLimiter, authLimiter } from './middleware/rateLimiter.js';

dotenv.config();
const app = express();

/* ------------------ FIX __dirname ------------------ */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ------------------ DB ------------------ */
connectDB();

/* ------------------ CORS PRODUCTION ------------------ */
// const allowedOrigins = [
//   "https://concordia-dating.netlify.app"
// ];

app.use(helmet());

app.use(express.json());

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://concordia-dating.vercel.app', // Configurable via variable d'environnement ou valeur par défaut
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Les méthodes autorisées
  credentials: true // Si tu utilises des cookies/sessions
}));

app.options("*", cors());


/* ------------------ BODY PARSER ------------------ */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* ------------------ STATIC FILES ------------------ */
app.use(express.static(path.join(__dirname, '../public')));

/* ------------------ TEST ROUTE ------------------ */
app.get('/', (req, res) => {
  res.json({
    message: "Bienvenue sur l'API de Concordia !",
    status: "Serveur opérationnel",
    timestamp: new Date().toISOString()
  });
});

/* ------------------ API ROUTES ------------------ */
// Appliquer le rate-limiter global de l'API
app.use('/api', apiLimiter);

// Appliquer le rate-limiter spécifique de l'authentification
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);

/* ------------------ HTML ROUTES ------------------ */
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.get('/inscription', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/inscription.html'));
});

app.get('/decouverte', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/decouverte_filtre.html'));
});

app.get('/messages', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/message.html'));
});

app.get('/settings', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/settings.html'));
});

/* ------------------ ERRORS ------------------ */
app.use((req, res, next) => {
  res.status(404);
  next(new Error('Route non trouvée'));
});

app.use((err, req, res, next) => {
  res.status(res.statusCode || 500).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

export default app;
