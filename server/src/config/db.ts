import mongoose from 'mongoose';
import { env } from './env.js';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function connectDB(): Promise<void> {
  let attempts = 0;

  mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB connected successfully');
  });

  mongoose.connection.on('error', (err: Error) => {
    console.error('❌ MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected');
  });

  while (attempts < MAX_RETRIES) {
    try {
      attempts++;
      console.log(
        `🔄 MongoDB connection attempt ${attempts}/${MAX_RETRIES}...`
      );

      await mongoose.connect(env.MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      return;
    } catch (error) {
      const errMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error(
        `❌ MongoDB connection attempt ${attempts} failed: ${errMessage}`
      );

      if (attempts >= MAX_RETRIES) {
        console.error(
          `💀 Failed to connect to MongoDB after ${MAX_RETRIES} attempts. Exiting.`
        );
        process.exit(1);
      }

      console.log(`⏳ Retrying in ${RETRY_DELAY_MS / 1000} seconds...`);
      await sleep(RETRY_DELAY_MS);
    }
  }
}
