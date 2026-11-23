const express = require('express');
const connectDb = require("./config/db");
const connectCloudinary = require("./config/cloudinary");
const cors = require('cors');
const userRoutes = require('./routes/user.routes');
const productRouter = require('./routes/product.routes');
const cartRouter = require('./routes/cart.routes');
const orderRouter = require('./routes/order.routes');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(cors({
  origin: '*'
}));
app.use(express.json());

// Ensure Database is connected before handling API requests
app.use(async (req, res, next) => {
    try {
        await connectDb();
        next();
    } catch (err) {
        console.error("Database connection failure:", err);
        return res.status(500).json({ message: "Database connection failed", error: err.message });
    }
});

connectCloudinary();

app.use('/api/users', userRoutes);
app.use('/api/products', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);

app.get('/', (req, res) => {
    res.send('API is running...');
});

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;