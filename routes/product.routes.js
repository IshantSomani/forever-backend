const express = require('express');
const { addProduct, getAllProduct, removeProduct, singleProduct } = require('../controllers/product.controller');
const upload = require('../middleware/multer.middleware');
const authMiddleware = require('../middleware/auth.middleware');
const router = express.Router();

router.post('/add', authMiddleware, upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 },
]), addProduct);
router.delete('/remove/:id', authMiddleware, removeProduct);
router.get('/single/:id', singleProduct);
router.get('/allProduct', getAllProduct);

module.exports = router;