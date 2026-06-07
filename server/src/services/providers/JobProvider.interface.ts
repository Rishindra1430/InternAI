import { NormalizedJob } from '../../utils/normalize.utils.js';

export interface IJobProvider {
  source: 'greenhouse' | 'lever' | 'ashby';
  fetchJobs(): Promise<NormalizedJob[]>;
}
