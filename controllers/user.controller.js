const validator = require('validator');
const userModel = require('../models/user.model');

exports.registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required: Name, Email, Password" });
        }

        // Validate email format
        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: "Please provide a valid email address" });
        }

        // Check for existing user
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Email already registered" });
        }

        const hashPassword = await userModel.hashPassword(password);

        if (!hashPassword) {
            throw new Error("Invalid password");
        }

        const user = new userModel({
            name, email, password: hashPassword,
        });

        await user.save();

        // Remove password from response
        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;

        return res.status(200).json({ message: 'User register successfully!', data: userWithoutPassword });
    } catch (error) {
        console.error('Registration Error:', error);
        return res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
}

exports.loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await userModel.findOne({ email }).select('+password');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Password check
        if (!(await user.comparePassword(password))) {
            return res.status(401).json({ message: "Invalid password" });
        }

        if (!user.active) {
            return res.status(403).json({ message: "Account deactivated" });
        }

        const token = user.generateAuthToken();
        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;

        return res.status(200).json({
            message: 'Login successful!',
            token,
            data: userWithoutPassword
        });

    } catch (error) {
        console.error('Login Error:', error);
        return res.status(500).json({
            message: 'Server error during login',
            error: error.message
        });
    }
}

exports.registerAdmin = async (req, res) => {
    try {
        // Authorization check
        // if (req.data.role !== 'admin') {
        //     return res.status(403).json({ message: "Unauthorized: Admin privileges required" });
        // }

        const { name, email, password, role = 'moderator' } = req.body;

        // Validate input
        const requiredFields = { name, email, password };
        const missingFields = Object.entries(requiredFields).filter(([_, value]) => !value).map(([key]) => key);

        if (missingFields.length > 0) {
            return res.status(400).json({ message: `Missing required fields: ${missingFields.join(', ')}` });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: "Please provide a valid email address" });
        }

        if (!['admin', 'moderator'].includes(role)) {
            return res.status(400).json({ message: "Invalid role specified" });
        }

        // Check existing user
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Email already registered" });
        }

        // Create new admin/moderator
        const user = new userModel({
            name,
            email,
            password,
            role,
            // emailVerified: true
        });

        await user.save();

        // Generate token
        const token = user.generateAuthToken();

        return res.status(201).json({
            message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully!`,
            data: userModel.updateSearchIndex,
            token
        });

    } catch (error) {
        console.error('Admin Registration Error:', error);
        return res.status(500).json({
            message: 'Server error during admin registration',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};