const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.token || (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : req.headers.authorization);

        if (!token) {
            return res.status(401).json({ success: false, message: 'Please authenticate to access this resource' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Allow master admin token
        if (decoded._id === 'master_admin') {
            req.user = { _id: 'master_admin', email: decoded.email, role: 'admin' };
            return next();
        }

        const currentUser = await userModel.findById(decoded._id).select('+password');
        if (!currentUser) {
            return res.status(401).json({ success: false, message: 'User belonging to this token no longer exists' });
        }

        if (!currentUser.active) {
            return res.status(403).json({
                success: false,
                message: 'Account has been deactivated. Contact support'
            });
        }

        // Check if the request method requires admin role
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
            if (currentUser.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'You are not authorized to perform this action.'
                });
            }
        }

        req.user = currentUser;
        next();
    } catch (error) {
        console.error('Authentication Error:', error.message);
        return res.status(401).json({ message: "Invalid Token", error: error.message });
    }
}

module.exports = authMiddleware;