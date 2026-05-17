// src/config/cloudinary.js
import { v2 as cloudinaryV2 } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinaryV2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinaryV2,
  params: { folder: 'autonexus/cars', allowed_formats: ['jpg', 'jpeg', 'png', 'webp'] }
});

export const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
export const cloudinary = cloudinaryV2;
