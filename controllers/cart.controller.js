const userModel = require("../models/user.model");

exports.addToCart = async (req, res, next) => {
    try {
        const { userId, itemId, size } = req.body;
        const userData = await userModel.findById(userId)

        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        const cartData = await userData.cartData;

        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1;
            } else {
                cartData[itemId][size] = 1
            }
        } else {
            cartData[itemId] = { [size]: 1 }
        }
        await userModel.findByIdAndUpdate(userId, { cartData });
        return res.status(200).json({ message: "Item added to cart successfully" });
    } catch (error) {
        console.error('Error in Add to Cart:', error);
        return res.status(500).json({ message: 'Server error during cart addition', error: error.message });
    }

}
exports.updateCart = async (req, res, next) => {
    try {
        const { userId, itemId, size, quantity } = req.body;
        const userData = await userModel.findById(userId)

        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        const cartData = await userData.cartData;

        cartData[itemId][size] = quantity
        await userModel.findByIdAndUpdate(userId, { cartData });
        return res.status(200).json({ message: "Item updated in cart successfully" });
    } catch (error) {
        console.error('Error in Update Cart:', error);
        return res.status(500).json({ message: 'Server error during cart update', error: error.message });
    }

}

exports.removeCart = async (req, res, next) => {
    try {
        const { userId, itemId, size, quantity } = req.body;

        // Find user
        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        const cartData = await userData.cartData || {};

        if (!cartData[itemId] || !cartData[itemId][size]) {
            return res.status(404).json({ message: "Item not found in cart" });
        }

        // Reduce the quantity, but prevent negative values
        cartData[itemId][size] = Math.max(0, cartData[itemId][size] - quantity);

        if (cartData[itemId][size] === 0) {
            delete cartData[itemId][size];

            // If no sizes are left for this item, remove the item entry
            if (Object.keys(cartData[itemId]).length === 0) {
                delete cartData[itemId];
            }
        }

        await userModel.findByIdAndUpdate(userId, { cartData });
        return res.status(200).json({ message: `${quantity} item(s) removed from cart successfully` });
    } catch (error) {
        console.error('Error in Remove Cart:', error);
        return res.status(500).json({ message: 'Server error during cart removal', error: error.message });
    }
}
exports.getUserCart = async (req, res, next) => {
    try {
        const { userId } = req.body;
        const userData = await userModel.findById(userId)
        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        const cartData = await userData.cartData;
        return res.status(200).json({ message: "Cart fetched successfully", data: cartData });

    } catch (error) {
        console.error('Error in Get User Cart:', error);
        return res.status(500).json({ message: 'Server error during cart retrieval', error: error.message });
    }
}