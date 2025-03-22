const express = require('express');
const { placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus, verifyStripe } = require('../controllers/order.controller');
const authMiddleware = require('../middleware/auth.middleware');
const cartMiddleware = require('../middleware/cart.middleware');

const router = express.Router();

// Admin Panel Routes
router.get('/list', authMiddleware, allOrders);
router.put('/status', authMiddleware, updateStatus);

// Payment Methods
router.post('/place', cartMiddleware, placeOrder);
router.post('/stripe', cartMiddleware, placeOrderStripe);
router.post('/razorpay', cartMiddleware, placeOrderRazorpay);

// User Routes
router.get('/userOrders', cartMiddleware, userOrders);

router.post('/verifyPayment', cartMiddleware, verifyStripe);


module.exports = router;