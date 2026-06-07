import axios from 'axios';
import { IJobProvider } from './JobProvider.interface.js';
import { NormalizedJob, normalizeLeverJob } from '../../utils/normalize.utils.js';
import { logger } from '../../config/logger.js';

interface LeverCategories {
  location: string;
  team: string;
}

interface LeverPosting {
  id: string;
  text: string;
  categories: LeverCategories;
  hostedUrl: string;
  createdAt: number;
  descriptionPlain: string;
}

const LEVER_COMPANIES: readonly string[] = [
  'netflix',
  'uber',
  'lyft',
  'reddit',
  'coinbase',
  'stripe',
  'robinhood',
  'plaid',
  'brex',
  'mercury',
] as const;

const BASE_URL = 'https://api.lever.co/v0/postings';

async function fetchCompanyJobs(company: string): Promise<NormalizedJob[]> {
  const url = `${BASE_URL}/${company}`;
  const response = await axios.get<LeverPosting[]>(url, {
    timeout: 15000,
  });

  const postings = response.data ?? [];

  return postings.map((posting) =>
    normalizeLeverJob(posting, company)
  );
}

export const leverProvider: IJobProvider = {
  source: 'lever',

  async fetchJobs(): Promise<NormalizedJob[]> {
    const results = await Promise.allSettled(
      LEVER_COMPANIES.map((company) => fetchCompanyJobs(company))
    );

    const allJobs: NormalizedJob[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allJobs.push(...result.value);
      } else {
        logger.error(
          `Lever: Failed to fetch jobs for ${LEVER_COMPANIES[index]}: ${String(result.reason)}`
        );
      }
    });

    logger.info(`Lever: Fetched ${allJobs.length} total jobs from ${LEVER_COMPANIES.length} companies`);
    return allJobs;
  },
};
