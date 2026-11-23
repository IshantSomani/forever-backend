const mongoose = require("mongoose");

let isConnecting = null;

const connectDb = async () => {
    if (mongoose.connection.readyState >= 1) {
        return;
    }
    if (!isConnecting) {
        isConnecting = mongoose.connect(process.env.MONGODB_URI);
    }
    try {
        await isConnecting;
        console.log("Database is connected");
    } catch (error) {
        isConnecting = null;
        console.error("Database connection error:", error);
        throw error;
    }
};

module.exports = connectDb;