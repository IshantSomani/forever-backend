const userModel = require("../models/user.model");

exports.addToCart = async (req, res, next) => {
    try {
        const { userId, itemId, size } = req.body;

        if (!itemId || !size) {
            return res.status(400).json({ message: "Item ID and size are required" });
        }

        const userData = await userModel.findById(userId);

        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        // Defensive copy of cart data
        const cartData = (userData.cartData && typeof userData.cartData === 'object') 
            ? JSON.parse(JSON.stringify(userData.cartData)) 
            : {};

        if (!cartData[itemId]) {
            cartData[itemId] = {};
        }

        if (cartData[itemId][size]) {
            cartData[itemId][size] += 1;
        } else {
            cartData[itemId][size] = 1;
        }

        await userModel.findByIdAndUpdate(userId, { cartData });
        return res.status(200).json({ message: "Item added to cart successfully" });
    } catch (error) {
        console.error('Error in Add to Cart:', error);
        return res.status(500).json({ message: 'Server error during cart addition', error: error.message });
    }
};

exports.updateCart = async (req, res, next) => {
    try {
        const { userId, itemId, size, quantity } = req.body;
        const userData = await userModel.findById(userId);

        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        const cartData = (userData.cartData && typeof userData.cartData === 'object')
            ? JSON.parse(JSON.stringify(userData.cartData))
            : {};

        if (!cartData[itemId]) {
            cartData[itemId] = {};
        }

        const numQuantity = Number(quantity);
        if (numQuantity <= 0) {
            delete cartData[itemId][size];
            if (Object.keys(cartData[itemId]).length === 0) {
                delete cartData[itemId];
            }
        } else {
            cartData[itemId][size] = numQuantity;
        }

        await userModel.findByIdAndUpdate(userId, { cartData });
        return res.status(200).json({ message: "Item updated in cart successfully" });
    } catch (error) {
        console.error('Error in Update Cart:', error);
        return res.status(500).json({ message: 'Server error during cart update', error: error.message });
    }
};

exports.removeCart = async (req, res, next) => {
    try {
        const { userId, itemId, size, quantity } = req.body;

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        const cartData = (userData.cartData && typeof userData.cartData === 'object')
            ? JSON.parse(JSON.stringify(userData.cartData))
            : {};

        if (!cartData[itemId] || !cartData[itemId][size]) {
            return res.status(404).json({ message: "Item not found in cart" });
        }

        const numQuantity = Number(quantity) || 1;
        cartData[itemId][size] = Math.max(0, cartData[itemId][size] - numQuantity);

        if (cartData[itemId][size] === 0) {
            delete cartData[itemId][size];
            if (Object.keys(cartData[itemId]).length === 0) {
                delete cartData[itemId];
            }
        }

        await userModel.findByIdAndUpdate(userId, { cartData });
        return res.status(200).json({ message: `${numQuantity} item(s) removed from cart successfully` });
    } catch (error) {
        console.error('Error in Remove Cart:', error);
        return res.status(500).json({ message: 'Server error during cart removal', error: error.message });
    }
};

exports.getUserCart = async (req, res, next) => {
    try {
        const { userId } = req.body;
        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        const cartData = userData.cartData || {};
        return res.status(200).json({ message: "Cart fetched successfully", data: cartData });
    } catch (error) {
        console.error('Error in Get User Cart:', error);
        return res.status(500).json({ message: 'Server error during cart retrieval', error: error.message });
    }
};
