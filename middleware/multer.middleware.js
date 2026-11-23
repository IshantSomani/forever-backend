const multer = require('multer');
const os = require('os');
const path = require('path');

// Ensure tmp upload directory is writable across all hosting environments (Vercel serverless / AWS / Local)
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, os.tmpdir());
    },
    filename: (req, file, callback) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        callback(null, `${uniqueSuffix}${path.extname(file.originalname || '.jpg')}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

module.exports = upload;
