const orderModel = require('../models/order.model');
const userModel = require('../models/user.model');
const productModel = require('../models/product.model');
const Stripe = require('stripe');
require('dotenv').config();

const currency = "INR"
// const deliveryCharge = 50

// Stripe gateways initialize
const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}`);

const calculateDeliveryFee = (subtotal) => {
    if (subtotal === 0) return 0;
    if (subtotal >= 4000) return 0; // Free delivery over ₹4000
    if (subtotal >= 3000) return 5;  // Reduced fee over ₹3000
    if (subtotal >= 2000) return 10;  // Reduced fee over ₹2000
    if (subtotal >= 1000) return 20;  // Reduced fee over ₹1000
    return 50; // Base fee
};

// Rebuild order items from the database so the client can never set its own prices.
const buildTrustedOrder = async (clientItems) => {
    if (!Array.isArray(clientItems) || clientItems.length === 0) {
        throw new Error('Order must contain at least one item');
    }
    const ids = [...new Set(clientItems.map((i) => String(i._id)))];
    const products = await productModel.find({ _id: { $in: ids } });
    const byId = new Map(products.map((p) => [String(p._id), p]));

    const items = clientItems.map((i) => {
        const product = byId.get(String(i._id));
        const quantity = Number(i.quantity);
        if (!product) throw new Error('A product in your cart is no longer available');
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) throw new Error('Invalid item quantity');
        if (!product.sizes.includes(i.size)) throw new Error(`Size ${i.size} is not available for ${product.name}`);
        return { ...product.toObject(), size: i.size, quantity };
    });
    const subtotal = items.reduce((acc, it) => acc + it.price * it.quantity, 0);
    const deliveryFee = calculateDeliveryFee(subtotal);
    return { items, subtotal, deliveryFee, total: subtotal + deliveryFee };
};


exports.placeOrder = async (req, res, next) => {
    try {
        const { userId, items: clientItems, address } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { items, total } = await buildTrustedOrder(clientItems);

        const newOrder = new orderModel({
            userId,
            items,
            amount: total,
            address,
            paymentMethod: 'cod',
            payment: false,
            date: Date.now()
        });

        await newOrder.save();
        // Remove items from user's cart
        user.cartData = {};
        await user.save();

        return res.status(201).json({ message: 'Order placed successfully' });
    } catch (error) {
        console.error(error);
        if (/item|product|Size/.test(error.message)) return res.status(400).json({ message: error.message });
        return res.status(500).json({ message: 'Failed to place order' });
    }

}


exports.placeOrderStripe = async (req, res, next) => {
    try {
        const { userId, items: clientItems, address } = req.body;
        const { origin } = req.headers;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { items, deliveryFee, total: totalAmount } = await buildTrustedOrder(clientItems);

        const newOrder = new orderModel({
            userId,
            items,
            amount: totalAmount,
            address,
            paymentMethod: 'stripe',
            payment: false,
            date: Date.now()
        });

        await newOrder.save();

        // Create line items correctly
        const line_items = items.map((item) => ({
            price_data: {
                currency: currency,
                product_data: {
                    name: item.name,
                },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
        }));

        if (deliveryFee > 0) {
            line_items.push({
                price_data: {
                    currency: currency,
                    product_data: {
                        name: 'Delivery Charges',
                    },
                    unit_amount: Math.round(deliveryFee * 100),
                },
                quantity: 1,
            });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: 'payment',
        });

        return res.status(200).json({ success: true, message: 'Order placed successfully with Stripe', session_url: session.url });
    } catch (error) {
        console.error(error);
        if (/item|product|Size/.test(error.message)) return res.status(400).json({ success: false, message: error.message });
        return res.status(500).json({ success: false, message: 'Failed to place order with Stripe', error: error.message });
    }
};


exports.verifyStripe = async (req, res) => {
    const { orderId, success, userId } = req.body;

    try {
        if (success === 'true' || success === true) {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            const targetUserId = userId || req.userId;
            if (targetUserId) {
                await userModel.findByIdAndUpdate(targetUserId, { cartData: {} });
            }
            return res.status(200).json({ message: "Payment successful. Order marked as paid.", success: true });
        } else {
            await orderModel.findByIdAndDelete(orderId);
            return res.status(200).json({ message: "Payment failed. Order cancelled.", success: false });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to verify payment with Stripe', error: error.message });
    }
}

exports.placeOrderRazorpay = async (req, res, next) => {

}

// Admin Panal
exports.allOrders = async (req, res, next) => {
    try {
        const orders = await orderModel.find();
        return res.status(200).json({ message: "All orders fetched successfully.", data: orders });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred while fetching all orders.", error: error.message });
    }
}

// User Frontend
exports.userOrders = async (req, res, next) => {
    try {
        const userId = req.userId || req.body?.userId;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        const userOrders = await orderModel.find({ userId }).sort({ date: -1 });

        return res.status(200).json({ message: "User orders retrieved successfully.", data: userOrders || [] });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred while fetching the user orders.", error: error.message });
    }
};


// Admin Panal
exports.updateStatus = async (req, res, next) => {
    try {
        const { orderId, status } = req.body;
        await orderModel.findByIdAndUpdate(orderId, { status });
        return res.status(200).json({ message: "Order status updated successfully." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred while updating the order status.", error: error.message });
    }
}