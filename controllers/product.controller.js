const productModel = require('../models/product.model');
const cloudinary = require('cloudinary').v2;

exports.addProduct = async (req, res, next) => {
    try {
        const { name, description, price, category, subCategory, sizes, bestSeller } = req.body;

        const image1 = req.files.image1 && req.files.image1[0];
        const image2 = req.files.image2 && req.files.image2[0];
        const image3 = req.files.image3 && req.files.image3[0];
        const image4 = req.files.image4 && req.files.image4[0];
        
        const images = [image1, image2, image3, image4].filter(item => item !== undefined);

        const imagesUrl = await Promise.all(
            images.map(async (item) => {
                const url = await cloudinary.uploader.upload(item.path, { resource_type: 'image' },);
                return url.secure_url;
            })
        );

        // Validate required fields
        if (!name || !description || !price || !category || !subCategory || !sizes || !bestSeller) {
            return res.status(400).json({ message: "All fields are required: Name, Description, Price, Category, Subcategory, Sizes, bestSeller" });
        }

        const product = new productModel({
            name,
            description,
            price: Number(price),
            category,
            subCategory,
            sizes: JSON.parse(sizes),
            bestSeller: bestSeller === 'true' ? true : false,
            images: imagesUrl,
            date: Date.now()
        });

        await product.save();

        return res.status(200).json({ message: "Product added successfully", data: product });
    } catch (error) {
        console.error('Error in Add Product:', error);
        return res.status(500).json({ message: 'Server error during product addition', error: error.message });
    }
}

exports.getAllProduct = async (req, res, next) => {
    try {
        const products = await productModel.find();
        return res.status(200).json({ message: "Products fetched successfully", data: products });
    } catch (error) {
        console.error('Error in Get All Products:', error);
        return res.status(500).json({ message: 'Server error during product retrieval', error: error.message });
    }
}

exports.removeProduct = async (req, res, next) => {
    try {
        const product = await productModel.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        return res.status(200).json({ message: "Product removed successfully" });

    } catch (error) {
        console.error('Error in Remove Product:', error);
        return res.status(500).json({ message: 'Server error during product removal', error: error.message });
    }
}

exports.singleProduct = async (req, res, next) => {
    try {
        const product = await productModel.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        return res.status(200).json({ message: "Product fetched successfully", data: product });
    } catch (error) {
        console.error('Error in Get Single Product:', error);
        return res.status(500).json({ message: 'Server error during product retrieval', error: error.message });
    }
}