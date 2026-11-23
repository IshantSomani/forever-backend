const jwt = require('jsonwebtoken');

const cartMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.token || (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : req.headers.authorization);
        
        if (!token) {
            return res.status(401).json({ success: false, message: 'Please authenticate to access this resource' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.userId = decoded._id;
        if (!req.body || typeof req.body !== 'object') {
            req.body = {};
        }
        req.body.userId = decoded._id;

        next();
    } catch (error) {
        console.error('Authentication Error:', error.message);
        return res.status(401).json({ message: "Invalid Token", error: error.message });
    }
}

module.exports = cartMiddleware;