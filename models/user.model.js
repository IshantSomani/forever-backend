const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name'],
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters'],
        minlength: [3, 'Name must be at least 3 characters'],
        validate: {
            validator: function (value) {
                return /^[a-zA-Z\s'-]+$/.test(value);
            },
            message: 'Name contains invalid characters'
        }
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        minLength: [5, 'Email must be at least 5 characters long'],
        validate: {
            validator: validator.isEmail,
            message: 'Please provide a valid email address'
        },
        index: true
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [5, 'Password must be at least 5 characters'],
        maxlength: [128, 'Password cannot exceed 128 characters'],
        select: false,
        // validate: {
        //     validator: function (value) {
        //         return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(value);
        //     },
        //     message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        // }
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'moderator'],
        default: 'user'
    },
    active: {
        type: Boolean,
        default: true,
        // select: false
    },
    // emailVerified: {
    //     type: Boolean,
    //     default: false
    // },
    // verificationToken: String,
    cartData: {
        type: Object,
        default: {}
    }
}, {
    timestamps: true,
    toObject: { virtuals: true },
    minimize: false
});

// Password hashing middleware
userSchema.statics.hashPassword = async function (password) {
    return await bcrypt.hash(password, 10);
}

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAuthToken = function () {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
    }
    const token = jwt.sign(
        { _id: this._id, email: this.email, role: this.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    return token;
}

// In user model
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

// Query middleware to exclude inactive users
userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
});

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
};

const userModel = mongoose.model('User', userSchema);
module.exports = userModel;