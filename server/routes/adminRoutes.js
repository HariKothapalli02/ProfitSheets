const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllUsers, updateUserStatus } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/stats', protect, adminOnly, getDashboardStats);
router.get('/users', protect, adminOnly, getAllUsers);
router.put('/users/:id', protect, adminOnly, updateUserStatus);

module.exports = router;
