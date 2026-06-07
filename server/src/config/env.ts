import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  MONGODB_URI: z
    .string()
    .min(1, 'MONGODB_URI is required')
    .url('MONGODB_URI must be a valid URI'),
  JWT_ACCESS_SECRET: z
    .string()
    .min(16, 'JWT_ACCESS_SECRET must be at least 16 characters'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(16, 'JWT_REFRESH_SECRET must be at least 16 characters'),
  JWT_ACCESS_EXPIRY: z.string().min(1, 'JWT_ACCESS_EXPIRY is required').default('15m'),
  JWT_REFRESH_EXPIRY: z.string().min(1, 'JWT_REFRESH_EXPIRY is required').default('7d'),
  CLOUDINARY_CLOUD_NAME: z
    .string()
    .min(1, 'CLOUDINARY_CLOUD_NAME is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z
    .string()
    .min(1, 'CLOUDINARY_API_SECRET is required'),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  GEMINI_MODEL: z.string().min(1, 'GEMINI_MODEL is required').default('gemini-1.5-flash'),
  EMAIL_HOST: z.string().min(1, 'EMAIL_HOST is required').default('smtp.gmail.com'),
  EMAIL_PORT: z.coerce.number().int().positive().default(587),
  EMAIL_USER: z.string().email('EMAIL_USER must be a valid email'),
  EMAIL_PASS: z.string().min(1, 'EMAIL_PASS is required'),
  CLIENT_URL: z
    .string()
    .url('CLIENT_URL must be a valid URL')
    .default('http://localhost:5173'),
  RUN_AGGREGATOR_ON_STARTUP: z
    .preprocess((value) => value === 'true', z.boolean())
    .default(false),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const formatted = parsed.error.issues
      .map((issue) => `  ✗ ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    console.error(
      '\n❌ Environment variable validation failed:\n' + formatted + '\n'
    );
    process.exit(1);
  }

  return parsed.data;
}

export const env: Env = validateEnv();
