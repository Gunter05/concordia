import User from '../models/User.js';
import Admin from '../models/Admin.js';
import Message from '../models/Message.js';
import Report from '../models/Report.js';
import jwt from 'jsonwebtoken';

// ==================== AUTHENTIFICATION ====================

// @desc    Login admin
// @route   POST /api/admin/login
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ email }).select('+password');

        if (!admin || !(await admin.matchPassword(password))) {
            return res.status(401).json({ message: "Identifiants incorrects" });
        }

        // Update last login
        admin.lastLogin = new Date();
        await admin.save();

        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '8h' });

        res.json({
            _id: admin._id,
            username: admin.username,
            email: admin.email,
            role: admin.role,
            permissions: admin.permissions,
            token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==================== DASHBOARD STATS ====================

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
const getDashboardStats = async (req, res) => {
    try {
        const now = new Date();
        const last24h = new Date(now - 24 * 60 * 60 * 1000);
        const last7days = new Date(now - 7 * 24 * 60 * 60 * 1000);
        const last30days = new Date(now - 30 * 24 * 60 * 60 * 1000);

        // Utilisateurs
        const totalUsers = await User.countDocuments();
        const newUsersToday = await User.countDocuments({ createdAt: { $gte: last24h } });
        const newUsersWeek = await User.countDocuments({ createdAt: { $gte: last7days } });
        const activeUsers = await User.countDocuments({ lastLogin: { $gte: last7days } });

        // Messages
        const totalMessages = await Message.countDocuments();
        const messagesToday = await Message.countDocuments({ createdAt: { $gte: last24h } });
        
        // Signalements
        const pendingReports = await Report.countDocuments({ status: 'pending' });
        const totalReports = await Report.countDocuments();

        // Répartition par genre
        const genderDistribution = await User.aggregate([
            { $group: { _id: '$genre', count: { $sum: 1 } } }
        ]);

        // Utilisateurs par intention
        const intentionDistribution = await User.aggregate([
            { $group: { _id: '$intention', count: { $sum: 1 } } }
        ]);

        res.json({
            users: {
                total: totalUsers,
                newToday: newUsersToday,
                newWeek: newUsersWeek,
                active: activeUsers,
                genderDistribution,
                intentionDistribution
            },
            messages: {
                total: totalMessages,
                today: messagesToday
            },
            reports: {
                pending: pendingReports,
                total: totalReports
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==================== GESTION UTILISATEURS ====================

// @desc    Get all users with filters
// @route   GET /api/admin/users
const getUsers = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            search, 
            genre, 
            status,
            sortBy = 'createdAt',
            order = 'desc'
        } = req.query;

        const filter = {};

        if (search) {
            filter.$or = [
                { nom: new RegExp(search, 'i') },
                { prenom: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') }
            ];
        }

        if (genre) filter.genre = genre;
        if (status) filter.status = status;

        const users = await User.find(filter)
            .select('-password')
            .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await User.countDocuments(filter);

        res.json({
            users,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user details
// @route   GET /api/admin/users/:id
const getUserDetails = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('matches', 'nom prenom photos')
            .populate('likes', 'nom prenom photos');

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        // Statistiques utilisateur
        const messagesSent = await Message.countDocuments({ sender: user._id });
        const messagesReceived = await Message.countDocuments({ receiver: user._id });
        const reportsAgainst = await Report.countDocuments({ reportedUser: user._id });
        const reportsMade = await Report.countDocuments({ reportedBy: user._id });

        res.json({
            user,
            stats: {
                messagesSent,
                messagesReceived,
                matchesCount: user.matches?.length || 0,
                likesCount: user.likes?.length || 0,
                reportsAgainst,
                reportsMade
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
const updateUser = async (req, res) => {
    try {
        const updates = req.body;
        delete updates.password; // Empêcher la modification du mot de passe

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Suspend user
// @route   POST /api/admin/users/:id/suspend
const suspendUser = async (req, res) => {
    try {
        const { duration, reason } = req.body; // duration en jours

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        user.status = 'suspended';
        user.suspendedUntil = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);
        user.suspensionReason = reason;
        await user.save();

        res.json({ message: "Utilisateur suspendu", user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Ban user permanently
// @route   POST /api/admin/users/:id/ban
const banUser = async (req, res) => {
    try {
        const { reason } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        user.status = 'banned';
        user.banReason = reason;
        await user.save();

        res.json({ message: "Utilisateur banni", user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        // Supprimer aussi ses messages, matchs, etc.
        await Message.deleteMany({ $or: [{ sender: user._id }, { receiver: user._id }] });
        await Report.deleteMany({ $or: [{ reportedUser: user._id }, { reportedBy: user._id }] });

        res.json({ message: "Utilisateur supprimé" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==================== MODÉRATION ====================

// @desc    Get all reports
// @route   GET /api/admin/reports
const getReports = async (req, res) => {
    try {
        const { status = 'pending', page = 1, limit = 20 } = req.query;

        const filter = status !== 'all' ? { status } : {};

        const reports = await Report.find(filter)
            .populate('reportedUser', 'nom prenom email photos')
            .populate('reportedBy', 'nom prenom')
            .populate('reviewedBy', 'username')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Report.countDocuments(filter);

        res.json({
            reports,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Review report
// @route   PUT /api/admin/reports/:id
const reviewReport = async (req, res) => {
    try {
        const { status, action } = req.body;

        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ message: "Signalement non trouvé" });
        }

        report.status = status;
        report.action = action;
        report.reviewedBy = req.admin._id;
        report.reviewedAt = new Date();
        await report.save();

        // Appliquer l'action si nécessaire
        if (action === 'suspension') {
            await User.findByIdAndUpdate(report.reportedUser, {
                status: 'suspended',
                suspendedUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });
        } else if (action === 'ban') {
            await User.findByIdAndUpdate(report.reportedUser, {
                status: 'banned'
            });
        }

        res.json({ message: "Signalement traité", report });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export {
    loginAdmin,
    getDashboardStats,
    getUsers,
    getUserDetails,
    updateUser,
    suspendUser,
    banUser,
    deleteUser,
    reviewReport
};