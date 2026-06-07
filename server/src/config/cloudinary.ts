import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function verifyCloudinaryConfig(): Promise<boolean> {
  try {
    const api = cloudinary.api as any;
    if (typeof api.ping !== 'function') {
      throw new Error('Cloudinary API ping is not available');
    }

    await api.ping();
    return true;
  } catch {
    return false;
  }
}

export { cloudinary };
