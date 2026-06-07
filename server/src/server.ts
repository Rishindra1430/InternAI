import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { logger } from './config/logger.js';
import { startJobAggregatorCron } from './jobs/jobAggregator.cron.js';
import { app, server } from './app.js';

async function startServer(): Promise<void> {
  try {
    await connectDB();
    logger.info('Connected to MongoDB');

    server.listen(env.PORT, () => {
      logger.info(`InternAI server running on port ${env.PORT}`);
    });

    startJobAggregatorCron();
  } catch (err) {
    logger.error(
      `Failed to start server: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
    process.exit(1);
  }
}

startServer();

process.on('unhandledRejection', (reason: unknown) => {
  logger.error(
    `Unhandled Rejection: ${
      reason instanceof Error ? reason.message : String(reason)
    }`
  );
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err: Error) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});
