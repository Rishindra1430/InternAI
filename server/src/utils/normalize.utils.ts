export interface NormalizedJob {
  title: string;
  company: string;
  location: string;
  description: string;
  skills: string[];
  applyUrl: string;
  source: 'greenhouse' | 'lever' | 'ashby';
  postedDate: Date;
  externalId: string;
  isRemote: boolean;
}

const TECH_SKILLS: string[] = [
  // Languages
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'golang',
  'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'r', 'dart', 'lua',
  'perl', 'haskell', 'elixir', 'clojure', 'objective-c',
  // Frontend
  'react', 'react.js', 'reactjs', 'angular', 'vue', 'vue.js', 'vuejs',
  'svelte', 'next.js', 'nextjs', 'nuxt', 'gatsby', 'html', 'css', 'sass',
  'scss', 'less', 'tailwind', 'tailwindcss', 'bootstrap', 'material-ui',
  'chakra', 'redux', 'mobx', 'webpack', 'vite', 'rollup',
  // Backend
  'node.js', 'nodejs', 'express', 'express.js', 'fastify', 'nest.js',
  'nestjs', 'django', 'flask', 'fastapi', 'spring', 'spring boot',
  'rails', 'ruby on rails', 'laravel', 'asp.net', '.net', 'graphql',
  'rest', 'restful', 'grpc',
  // Databases
  'sql', 'mysql', 'postgresql', 'postgres', 'mongodb', 'redis', 'sqlite',
  'dynamodb', 'cassandra', 'elasticsearch', 'neo4j', 'firebase', 'supabase',
  'prisma', 'sequelize', 'mongoose', 'typeorm',
  // Cloud & DevOps
  'aws', 'amazon web services', 'azure', 'gcp', 'google cloud', 'heroku',
  'vercel', 'netlify', 'docker', 'kubernetes', 'k8s', 'terraform',
  'ansible', 'jenkins', 'github actions', 'gitlab ci', 'ci/cd', 'nginx',
  'linux', 'bash', 'shell',
  // Data & ML
  'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn',
  'pandas', 'numpy', 'opencv', 'nlp', 'computer vision', 'data science',
  'data engineering', 'spark', 'hadoop', 'airflow', 'kafka',
  // Mobile
  'react native', 'flutter', 'ios', 'android', 'swiftui', 'jetpack compose',
  // Tools & Other
  'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'figma',
  'postman', 'swagger', 'openapi', 'oauth', 'jwt', 'websocket',
  'microservices', 'serverless', 'agile', 'scrum', 'tdd', 'unit testing',
  'jest', 'mocha', 'cypress', 'playwright', 'selenium',
];

function safeString(value: unknown, fallback: string = ''): string {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function safeDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date() : d;
  }
  return new Date();
}

function getNestedValue(obj: unknown, ...keys: string[]): unknown {
  let current: unknown = obj;
  for (const key of keys) {
    if (current !== null && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return current;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractSkillsFromDescription(description: string): string[] {
  const cleanText = stripHtml(description).toLowerCase();
  const found = new Set<string>();

  for (const skill of TECH_SKILLS) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(?:^|[\\s,;/()\\[\\]|•·–-])${escaped}(?:[\\s,;/()\\[\\]|•·–-]|$)`, 'i');

    if (pattern.test(cleanText)) {
      found.add(skill);
    }
  }

  return Array.from(found).sort();
}

export function isRemoteJob(title: string, location: string): boolean {
  const combined = `${title} ${location}`.toLowerCase();
  const remotePatterns = [
    'remote',
    'work from home',
    'wfh',
    'distributed',
    'anywhere',
    'virtual',
    'telecommute',
    'telework',
  ];

  return remotePatterns.some((pattern) => combined.includes(pattern));
}

export function normalizeGreenhouseJob(
  job: unknown,
  company: string
): NormalizedJob {
  const record = (job !== null && typeof job === 'object' ? job : {}) as Record<string, unknown>;

  const title = safeString(record['title'], 'Untitled Position');

  const locationObj = record['location'];
  const location =
    typeof locationObj === 'object' && locationObj !== null
      ? safeString((locationObj as Record<string, unknown>)['name'], 'Not specified')
      : safeString(locationObj, 'Not specified');

  const contentRaw = safeString(record['content']);
  const description = stripHtml(contentRaw);

  const absoluteUrl = safeString(record['absolute_url']);
  const applyUrl = absoluteUrl || safeString(record['url']);

  const postedDate = safeDate(record['updated_at'] || record['created_at']);
  const externalId = safeString(record['id']);

  return {
    title,
    company,
    location,
    description,
    skills: extractSkillsFromDescription(contentRaw),
    applyUrl,
    source: 'greenhouse',
    postedDate,
    externalId,
    isRemote: isRemoteJob(title, location),
  };
}

export function normalizeLeverJob(
  job: unknown,
  company: string
): NormalizedJob {
  const record = (job !== null && typeof job === 'object' ? job : {}) as Record<string, unknown>;

  const title = safeString(record['text'], 'Untitled Position');

  const categories = record['categories'];
  let location = 'Not specified';
  if (typeof categories === 'object' && categories !== null) {
    location = safeString(
      (categories as Record<string, unknown>)['location'],
      'Not specified'
    );
  }

  const descriptionRaw = safeString(record['descriptionPlain']);
  const descriptionHtml = safeString(record['description']);
  const description = descriptionRaw || stripHtml(descriptionHtml);

  const listsRaw = record['lists'];
  let fullContent = descriptionHtml;
  if (Array.isArray(listsRaw)) {
    for (const list of listsRaw) {
      if (typeof list === 'object' && list !== null) {
        const listRecord = list as Record<string, unknown>;
        fullContent += ' ' + safeString(listRecord['content']);
      }
    }
  }

  const applyUrl = safeString(
    record['applyUrl'] || record['hostedUrl'] || record['urls']
      ? safeString(getNestedValue(record, 'urls', 'show'))
      : ''
  );

  const postedDate = safeDate(record['createdAt']);
  const externalId = safeString(record['id']);

  return {
    title,
    company,
    location,
    description,
    skills: extractSkillsFromDescription(fullContent),
    applyUrl,
    source: 'lever',
    postedDate,
    externalId,
    isRemote: isRemoteJob(title, location),
  };
}

export function normalizeAshbyJob(
  job: unknown,
  company: string
): NormalizedJob {
  const record = (job !== null && typeof job === 'object' ? job : {}) as Record<string, unknown>;

  const title = safeString(record['title'], 'Untitled Position');

  const location = safeString(
    record['location'] || getNestedValue(record, 'locationName'),
    'Not specified'
  );

  const descriptionHtml = safeString(
    record['descriptionHtml'] || record['description']
  );
  const descriptionPlain = safeString(record['descriptionPlain']);
  const description = descriptionPlain || stripHtml(descriptionHtml);

  const applyUrl = safeString(
    record['applyUrl'] ||
      record['jobUrl'] ||
      getNestedValue(record, 'applicationUrl')
  );

  const postedDate = safeDate(
    record['publishedAt'] || record['createdAt'] || record['updatedAt']
  );
  const externalId = safeString(record['id'] || record['jobId']);

  const isRemote =
    record['isRemote'] === true ||
    isRemoteJob(title, location);

  return {
    title,
    company,
    location,
    description,
    skills: extractSkillsFromDescription(descriptionHtml),
    applyUrl,
    source: 'ashby',
    postedDate,
    externalId,
    isRemote,
  };
}
