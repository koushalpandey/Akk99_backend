import ImageKit from 'imagekit';
import dotenv from 'dotenv';

dotenv.config();

export const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

// Image upload options
export const uploadOptions = {
  folder: '/products',
  transformation: [
    {
      quality: 80,
      format: 'webp'
    }
  ]
};

// Image optimization presets
export const imagePresets = {
  thumbnail: [{ width: 200, height: 200, crop: 'main' }],
  medium: [{ width: 500, height: 500, crop: 'main' }],
  large: [{ width: 1000, height: 1000, crop: 'main' }],
  product: [{ width: 800, height: 800, crop: 'main' }]
};