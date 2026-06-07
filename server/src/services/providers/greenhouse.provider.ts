import axios from 'axios';
import { IJobProvider } from './JobProvider.interface.js';
import { NormalizedJob, normalizeGreenhouseJob } from '../../utils/normalize.utils.js';
import { logger } from '../../config/logger.js';

interface GreenhouseLocation {
  name: string;
}

interface GreenhouseJob {
  id: number;
  title: string;
  location: GreenhouseLocation;
  absolute_url: string;
  updated_at: string;
  content: string;
}

interface GreenhouseResponse {
  jobs: GreenhouseJob[];
}

const GREENHOUSE_COMPANIES: readonly string[] = [
  'stripe',
  'airbnb',
  'shopify',
  'notion',
  'figma',
  'linear',
  'vercel',
  'discord',
  'twitch',
  'dropbox',
] as const;

const BASE_URL = 'https://boards-api.greenhouse.io/v1/boards';

async function fetchCompanyJobs(company: string): Promise<NormalizedJob[]> {
  const url = `${BASE_URL}/${company}/jobs`;
  const response = await axios.get<GreenhouseResponse>(url, {
    timeout: 15000,
    params: { content: true },
  });

  const jobs = response.data.jobs ?? [];

  return jobs.map((job) =>
    normalizeGreenhouseJob(job, company)
  );
}

export const greenhouseProvider: IJobProvider = {
  source: 'greenhouse',

  async fetchJobs(): Promise<NormalizedJob[]> {
    const results = await Promise.allSettled(
      GREENHOUSE_COMPANIES.map((company) => fetchCompanyJobs(company))
    );

    const allJobs: NormalizedJob[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allJobs.push(...result.value);
      } else {
        logger.error(
          `Greenhouse: Failed to fetch jobs for ${GREENHOUSE_COMPANIES[index]}: ${String(result.reason)}`
        );
      }
    });

    logger.info(`Greenhouse: Fetched ${allJobs.length} total jobs from ${GREENHOUSE_COMPANIES.length} companies`);
    return allJobs;
  },
};
