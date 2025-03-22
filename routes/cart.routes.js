const express = require('express');
const { addToCart, removeCart, getUserCart } = require('../controllers/cart.controller');
const cartMiddleware = require('../middleware/cart.middleware');
const router = express.Router();

router.post('/addItem', cartMiddleware, addToCart);
router.delete('/removeItem', cartMiddleware, removeCart);
router.get('/getCart', cartMiddleware, getUserCart);



module.exports = router;