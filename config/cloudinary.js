const cloudinary = require('cloudinary').v2;

const connectCloudinary = async () => {
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_SECRET_KEY
        });

        console.log('Cloudinary connected successfully.');

        // // Upload the image
        // const uploadResult = await cloudinary.uploader.upload(
        //     'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg',
        //     { public_id: 'shoes' }
        // );
        // console.log('Upload Result:', uploadResult);

        // // Generate optimized URL
        // const optimizeUrl = cloudinary.url('shoes', {
        //     fetch_format: 'auto',
        //     quality: 'auto'
        // });
        // console.log('Optimized URL:', optimizeUrl);

        // // Generate auto-cropped URL
        // const autoCropUrl = cloudinary.url('shoes', {
        //     crop: 'auto',
        //     gravity: 'auto',
        //     width: 500,
        //     height: 500,
        // });
        // console.log('Auto Crop URL:', autoCropUrl);
    } catch (error) {
        console.error('Failed to connect to Cloudinary:', error);
    }
}

module.exports = connectCloudinary;