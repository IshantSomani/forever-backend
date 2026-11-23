const mongoose = require("mongoose");

const connectDb = async () => {
    if (mongoose.connection.readyState >= 1) {
        return;
    }
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}`);
        console.log("Database is connected");
    } catch (error) {
        console.error("Database connection error:", error);
    }
};

module.exports = connectDb;