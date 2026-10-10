import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

dotenv.config({ path: fileURLToPath(new URL('../../../.env', import.meta.url)) });

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  CLIENT_ORIGINS: z.string().optional(),
  MONGODB_URI: z.string().min(1).default('mongodb://127.0.0.1:27017/se-commerce-engine'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional()
});

const result = schema.safeParse(process.env);

if (!result.success) {
  throw new Error(`Invalid environment configuration: ${result.error.issues.map((issue) => issue.path.join('.') + ' ' + issue.message).join('; ')}`);
}

const defaultOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const parseOrigins = (value = '') => value.split(',').map((origin) => origin.trim()).filter(Boolean);
const mergedOrigins = [...new Set([
  ...parseOrigins(result.data.CLIENT_ORIGINS),
  ...parseOrigins(result.data.CLIENT_ORIGIN),
  ...defaultOrigins
])];

export const env = { ...result.data, CLIENT_ORIGINS: mergedOrigins };