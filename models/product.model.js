const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        minlength: [2, 'Product name must be at least 2 characters']
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        trim: true,
        minlength: [5, 'Description must be at least 5 characters']
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative'],
        max: [10000, 'Price cannot exceed ₹10,000'],
        set: v => Math.round(v * 100) / 100
    },
    images: {
        type: Array,
        required: [true, 'At least one product image is required'],
        validate: {
            validator: function (images) {
                return images.length >= 1 && images.length <= 5;
            },
            message: 'Must provide between 1-5 product images'
        }
    },
    category: {
        type: String,
        required: [true, 'Product category is required'],
        enum: ['mens', 'womens', 'kids']
    },
    subCategory: {
        type: String,
        required: [true, 'Product sub-category is required']
    },
    sizes: {
        type: Array,
        required: [true, 'At least one size must be specified']
    },
    bestSeller: {
        type: Boolean,
        default: false
    },
    status: {
        type: Boolean,
        default: true
    },
    date: {
        type: Number,
        default: Date.now // Added default value
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Corrected index name
productSchema.index({ bestSeller: -1 });

// Updated virtual property with ₹ symbol
productSchema.virtual('formattedPrice').get(function () {
    return `₹${this.price.toFixed(2)}`;
});

// Corrected query middleware to use status field
productSchema.pre(/^find/, function (next) {
    this.find({ status: { $ne: false } });
    next();
});

const productModel = mongoose.model('Product', productSchema);
module.exports = productModel;