const orderModel = require('../models/order.model');
const userModel = require('../models/user.model');
const Stripe = require('stripe');
require('dotenv').config();

const currency = "INR"
// const deliveryCharge = 50

// Stripe gateways initialize
const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}`);

exports.placeOrder = async (req, res, next) => {
    try {
        const { userId, items, amount, address } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newOrder = new orderModel({
            userId,
            items,
            amount,
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
        return res.status(500).json({ message: 'Failed to place order' });
    }

}

const calculateDeliveryFee = (subtotal) => {
    if (subtotal === 0) return 0;
    if (subtotal >= 4000) return 0; // Free delivery over ₹4000
    if (subtotal >= 3000) return 5;  // Reduced fee over ₹3000
    if (subtotal >= 2000) return 10;  // Reduced fee over ₹2000
    if (subtotal >= 1000) return 20;  // Reduced fee over ₹1000
    return 50; // Base fee
};

exports.placeOrderStripe = async (req, res, next) => {
    try {
        const { userId, items, address } = req.body;
        const { origin } = req.headers;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const deliveryFee = calculateDeliveryFee(subtotal);
        const totalAmount = subtotal + deliveryFee;

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
        return res.status(500).json({ success: false, message: 'Failed to place order with Stripe', error: error.message });
    }
};


exports.verifyStripe = async (req, res) => {
    const { orderId, success, userId } = req.body;

    try {
        if (success === 'true') {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            await orderModel.findByIdAndUpdate(userId, { cartData: {} });
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
        const { userId } = req.body;
        const userOrders = await orderModel.find({ userId });

        if (!userOrders || userOrders.length === 0) {
            return res.status(404).json({ message: "No orders found for the provided user." });
        }

        return res.status(200).json({ message: "User orders retrieved successfully.", data: userOrders });
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