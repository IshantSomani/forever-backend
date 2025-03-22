const express = require('express');
const { loginUser, registerUser, registerAdmin } = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// Admin routes
router.post('/register/admin',
    // authMiddleware,
    registerAdmin
);

module.exports = router;