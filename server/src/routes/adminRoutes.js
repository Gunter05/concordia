import express from 'express';
import { loginAdmin, getDashboardStats, getUsers, getUserDetails, updateUser, suspendUser, banUser, deleteUser, reviewReport } from '../controllers/adminController.js';
import { adminAuth, checkPermission } from '../middleware/adminAuth.js';

const router = express.Router();

// Auth
router.post('/login', loginAdmin);

// Dashboard
router.get('/stats', adminAuth, getDashboardStats);

// Users
router.get('/users', adminAuth, checkPermission('users'), getUsers);
router.get('/users/:id', adminAuth, checkPermission('users'), getUserDetails);
router.put('/users/:id', adminAuth, checkPermission('users'), updateUser);
router.post('/users/:id/suspend', adminAuth, checkPermission('users'), suspendUser);
router.post('/users/:id/ban', adminAuth, checkPermission('users'), banUser);
router.delete('/users/:id', adminAuth, checkPermission('users'), deleteUser);
// Reports
router.put('/reports/:id', adminAuth, checkPermission('content'), reviewReport);

export default router;