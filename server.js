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

// config
connectDb();
connectCloudinary();

app.use('/api/users', userRoutes);
app.use('/api/products', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);

app.get('/', (req, res, next) => {
    res.send('API is running...');
})

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});