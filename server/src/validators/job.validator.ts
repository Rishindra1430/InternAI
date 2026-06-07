import { z } from 'zod';

export const jobSearchSchema = z.object({
  search: z
    .string()
    .trim()
    .max(200, 'Search query must be at most 200 characters')
    .optional(),
  location: z
    .string()
    .trim()
    .max(100, 'Location must be at most 100 characters')
    .optional(),
  isRemote: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
  source: z
    .enum(['greenhouse', 'lever', 'ashby'], {
      errorMap: () => ({
        message: 'Source must be one of: greenhouse, lever, ashby',
      }),
    })
    .optional(),
  skills: z
    .string()
    .trim()
    .max(500, 'Skills string must be at most 500 characters')
    .transform((val) =>
      val
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter((s) => s.length > 0)
    )
    .optional(),
  page: z.coerce
    .number()
    .int('Page must be an integer')
    .min(1, 'Page must be at least 1')
    .default(1),
  limit: z.coerce
    .number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit must be at most 100')
    .default(20),
  sortBy: z
    .enum(['postedDate', 'title', 'company'], {
      errorMap: () => ({
        message: 'sortBy must be one of: postedDate, title, company',
      }),
    })
    .default('postedDate'),
  sortOrder: z
    .enum(['asc', 'desc'], {
      errorMap: () => ({
        message: 'sortOrder must be one of: asc, desc',
      }),
    })
    .default('desc'),
});

export type JobSearchInput = z.infer<typeof jobSearchSchema>;
