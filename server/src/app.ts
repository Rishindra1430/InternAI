// ─── 1. External Dependencies ────────────────────────────────────────────────
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

// ─── 2. Config ───────────────────────────────────────────────────────────────
import { env } from './config/env.js';
import { logger } from './config/logger.js';

// ─── 3. Middleware ───────────────────────────────────────────────────────────
import { errorHandler } from './middleware/error.middleware.js';

// ─── 4. Routes ───────────────────────────────────────────────────────────────
import authRoutes from './routes/auth.routes.js';
import jobRoutes from './routes/job.routes.js';
import applicationRoutes from './routes/application.routes.js';
import resumeRoutes from './routes/resume.routes.js';
import aiRoutes from './routes/ai.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import adminRoutes from './routes/admin.routes.js';

// ─── 5. Socket & Cron ───────────────────────────────────────────────────────
import { setupNotificationSocket } from './sockets/notification.socket.js';

// ─── App Initialization ─────────────────────────────────────────────────────

const app = express();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: env.CLIENT_URL,
    credentials: true,
  },
});

// ─── Global Middleware ───────────────────────────────────────────────────────

app.use(helmet());

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

app.use(cookieParser());

app.use(express.json({ limit: '10mb' }));

app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                 // 100 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    message: 'Too many requests, please try again later.',
  },
});
app.use(limiter);

// ─── API Routes ──────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// ─── Health Check ────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    data: null,
    message: 'InternAI API is running',
  });
});

// ─── Error Handler (must be last) ────────────────────────────────────────────

app.use(errorHandler);

// ─── Socket.io Setup ─────────────────────────────────────────────────────────

setupNotificationSocket(io);

// ─── Graceful Error Handling ─────────────────────────────────────────────────

process.on('unhandledRejection', (reason: unknown) => {
  logger.error(
    `Unhandled Rejection: ${
      reason instanceof Error ? reason.message : String(reason)
    }`
  );
});

process.on('uncaughtException', (err: Error) => {
  logger.error(`Uncaught Exception: ${err.message}`);
});

// ─── Exports (for testing) ──────────────────────────────────────────────────

export { app, server, io };
