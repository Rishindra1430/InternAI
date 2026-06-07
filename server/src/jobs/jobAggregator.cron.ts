import cron from 'node-cron';
import { greenhouseProvider } from '../services/providers/greenhouse.provider.js';
import { leverProvider } from '../services/providers/lever.provider.js';
import { ashbyProvider } from '../services/providers/ashby.provider.js';
import jobRepository from '../repositories/job.repository.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';
import type { NormalizedJob } from '../repositories/job.repository.js';
import type { IJobProvider } from '../services/providers/JobProvider.interface.js';

interface AggregationStats {
  totalFetched: number;
  newJobs: number;
  updatedJobs: number;
  errors: number;
}

/**
 * Aggregate internship jobs from all configured providers.
 *
 * 1. Uses the Greenhouse, Lever, and Ashby provider instances
 * 2. Fetches jobs from all providers in parallel (tolerating individual failures)
 * 3. Upserts each normalized job via the job repository
 * 4. Logs a summary of the aggregation run
 */
export async function aggregateJobs(): Promise<void> {
  logger.info('Job aggregation started');
  const startTime = Date.now();

  const providers: IJobProvider[] = [
    greenhouseProvider,
    leverProvider,
    ashbyProvider,
  ];

  // Fetch jobs from all providers concurrently; tolerate individual failures
  const results = await Promise.allSettled(
    providers.map((provider) =>
      provider.fetchJobs().then((jobs) => ({
        source: provider.source,
        jobs,
      }))
    )
  );

  // Collect successful results and log failures
  const allJobs: NormalizedJob[] = [];

  for (const result of results) {
    if (result.status === 'fulfilled') {
      logger.info(
        `Fetched ${result.value.jobs.length} jobs from ${result.value.source}`
      );
      allJobs.push(...result.value.jobs);
    } else {
      logger.error(`Provider fetch failed: ${String(result.reason)}`);
    }
  }

  const stats: AggregationStats = {
    totalFetched: allJobs.length,
    newJobs: 0,
    updatedJobs: 0,
    errors: 0,
  };

  const seenJobs = new Set<string>();

  for (const job of allJobs) {
    const uniqueKey = `${job.source}|${job.externalId}|${job.applyUrl}`;
    if (seenJobs.has(uniqueKey)) {
      continue;
    }
    seenJobs.add(uniqueKey);

    try {
      const result = await jobRepository.upsertFromProvider(job);
      if (result.isNew) {
        stats.newJobs++;
      } else {
        stats.updatedJobs++;
      }
    } catch (err) {
      stats.errors++;
      logger.error(
        `Failed to upsert job "${job.title}" from ${job.source}: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  }

  const durationMs = Date.now() - startTime;

  logger.info(
    `Job aggregation completed in ${durationMs}ms — ` +
      `total fetched: ${stats.totalFetched}, ` +
      `new: ${stats.newJobs}, ` +
      `updated: ${stats.updatedJobs}, ` +
      `errors: ${stats.errors}`
  );
}

/**
 * Schedule the job aggregation cron.
 *
 * Runs every 6 hours (`0 *​/6 * * *`).
 * If `RUN_AGGREGATOR_ON_STARTUP` env var is set to `"true"`, also
 * triggers one immediate run on startup.
 */
export function startJobAggregatorCron(): void {
  const schedule = '0 */6 * * *';

  cron.schedule(schedule, () => {
    logger.info('Cron trigger: starting scheduled job aggregation');
    aggregateJobs().catch((err: unknown) => {
      logger.error(
        `Scheduled job aggregation failed: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    });
  });

  logger.info(`Job aggregator cron scheduled: "${schedule}" (every 6 hours)`);

  if (env.RUN_AGGREGATOR_ON_STARTUP) {
    logger.info('Running initial job aggregation on startup');
    aggregateJobs().catch((err: unknown) => {
      logger.error(
        `Startup job aggregation failed: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    });
  }
}
