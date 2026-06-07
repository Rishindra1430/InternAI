import axios from 'axios';
import { IJobProvider } from './JobProvider.interface.js';
import { NormalizedJob, normalizeAshbyJob } from '../../utils/normalize.utils.js';
import { logger } from '../../config/logger.js';

interface AshbyJob {
  id: string;
  title: string;
  location: string;
  employmentType: string;
  applicationUrl: string;
  publishedAt: string;
  descriptionHtml: string;
}

interface AshbyResponse {
  jobs: AshbyJob[];
}

const ASHBY_COMPANIES: readonly string[] = [
  'openai',
  'anthropic',
  'scale',
  'mistral',
  'perplexity',
  'cursor',
  'replit',
  'retool',
] as const;

const BASE_URL = 'https://api.ashbyhq.com/posting-api/job-board';

async function fetchCompanyJobs(company: string): Promise<NormalizedJob[]> {
  const url = `${BASE_URL}/${company}`;
  const response = await axios.get<AshbyResponse>(url, {
    timeout: 15000,
  });

  const jobs = response.data.jobs ?? [];

  return jobs.map((job) =>
    normalizeAshbyJob(job, company)
  );
}

export const ashbyProvider: IJobProvider = {
  source: 'ashby',

  async fetchJobs(): Promise<NormalizedJob[]> {
    const results = await Promise.allSettled(
      ASHBY_COMPANIES.map((company) => fetchCompanyJobs(company))
    );

    const allJobs: NormalizedJob[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allJobs.push(...result.value);
      } else {
        logger.error(
          `Ashby: Failed to fetch jobs for ${ASHBY_COMPANIES[index]}: ${String(result.reason)}`
        );
      }
    });

    logger.info(`Ashby: Fetched ${allJobs.length} total jobs from ${ASHBY_COMPANIES.length} companies`);
    return allJobs;
  },
};
