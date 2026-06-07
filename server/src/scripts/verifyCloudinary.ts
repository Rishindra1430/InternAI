import { verifyCloudinaryConfig } from '../config/cloudinary.js';
import { logger } from '../config/logger.js';

async function main(): Promise<void> {
  logger.info('Starting Cloudinary integration verification');

  const success = await verifyCloudinaryConfig();

  if (success) {
    logger.info('Cloudinary integration verification succeeded.');
    process.exit(0);
  }

  logger.error('Cloudinary integration verification failed. Please check your Cloudinary credentials and network connection.');
  process.exit(1);
}

main().catch((error) => {
  logger.error(`Cloudinary verification script failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});