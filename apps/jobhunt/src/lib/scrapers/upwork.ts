import { parseStringPromise } from 'xml2js';

export interface UpworkJob {
  externalId: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  budget: {
    min: number | null;
    max: number | null;
    type: 'hourly' | 'fixed';
  };
  skills: string[];
  category: string;
  country: string;
}

// Upwork RSS feed URLs by category
const UPWORK_RSS_FEEDS = {
  'web-development': 'https://www.upwork.com/ab/feed/jobs/rss?q=web+development&sort=recency',
  'react': 'https://www.upwork.com/ab/feed/jobs/rss?q=react&sort=recency',
  'nodejs': 'https://www.upwork.com/ab/feed/jobs/rss?q=node.js&sort=recency',
  'typescript': 'https://www.upwork.com/ab/feed/jobs/rss?q=typescript&sort=recency',
  'python': 'https://www.upwork.com/ab/feed/jobs/rss?q=python&sort=recency',
  'mobile': 'https://www.upwork.com/ab/feed/jobs/rss?q=mobile+app&sort=recency',
  'design': 'https://www.upwork.com/ab/feed/jobs/rss?q=ui+ux+design&sort=recency',
  'fullstack': 'https://www.upwork.com/ab/feed/jobs/rss?q=full+stack&sort=recency',
};

// Parse budget from description
function parseBudget(description: string): { min: number | null; max: number | null; type: 'hourly' | 'fixed' } {
  // Look for hourly rate: "$50.00-$100.00 Hourly"
  const hourlyMatch = description.match(/\$(\d+(?:\.\d{2})?)-\$(\d+(?:\.\d{2})?)\s*(?:\/hr|Hourly)/i);
  if (hourlyMatch) {
    return {
      min: parseFloat(hourlyMatch[1]),
      max: parseFloat(hourlyMatch[2]),
      type: 'hourly',
    };
  }

  // Look for fixed price: "Budget: $500-$1,000"
  const fixedMatch = description.match(/Budget:\s*\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*-\s*\$(\d+(?:,\d{3})*(?:\.\d{2})?)/i);
  if (fixedMatch) {
    return {
      min: parseFloat(fixedMatch[1].replace(/,/g, '')),
      max: parseFloat(fixedMatch[2].replace(/,/g, '')),
      type: 'fixed',
    };
  }

  // Single fixed price: "Budget: $500"
  const singleMatch = description.match(/Budget:\s*\$(\d+(?:,\d{3})*(?:\.\d{2})?)/i);
  if (singleMatch) {
    const price = parseFloat(singleMatch[1].replace(/,/g, ''));
    return {
      min: price,
      max: price,
      type: 'fixed',
    };
  }

  return { min: null, max: null, type: 'hourly' };
}

// Parse skills from description
function parseSkills(description: string): string[] {
  // Look for skills section: "Skills: React, TypeScript, Node.js"
  const skillsMatch = description.match(/Skills?:\s*([^<\n]+)/i);
  if (skillsMatch) {
    return skillsMatch[1]
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0 && s.length < 50);
  }

  // Common tech skills to detect
  const commonSkills = [
    'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Java',
    'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB', 'MySQL',
    'Next.js', 'Vue.js', 'Angular', 'GraphQL', 'REST API', 'Git',
    'Tailwind', 'CSS', 'HTML', 'Figma', 'UI/UX', 'Mobile', 'iOS', 'Android',
    'React Native', 'Flutter', 'Swift', 'Kotlin', 'PHP', 'Laravel', 'Django',
    'Ruby', 'Rails', 'Go', 'Rust', 'C#', '.NET', 'Azure', 'GCP',
  ];

  const detectedSkills: string[] = [];
  const lowerDesc = description.toLowerCase();

  for (const skill of commonSkills) {
    if (lowerDesc.includes(skill.toLowerCase())) {
      detectedSkills.push(skill);
    }
  }

  return detectedSkills.slice(0, 10); // Max 10 skills
}

// Parse category from description
function parseCategory(description: string): string {
  const categoryMatch = description.match(/Category:\s*([^<\n]+)/i);
  return categoryMatch ? categoryMatch[1].trim() : 'Web Development';
}

// Parse country from description
function parseCountry(description: string): string {
  const countryMatch = description.match(/Country:\s*([^<\n]+)/i);
  return countryMatch ? countryMatch[1].trim() : 'Worldwide';
}

// Extract job ID from link
function extractJobId(link: string): string {
  // Upwork job links: https://www.upwork.com/jobs/~01234567890abcdef
  const match = link.match(/~([a-f0-9]+)/i);
  return match ? match[1] : link;
}

// Clean HTML from description
function cleanDescription(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function fetchUpworkJobs(category: keyof typeof UPWORK_RSS_FEEDS = 'web-development'): Promise<UpworkJob[]> {
  const feedUrl = UPWORK_RSS_FEEDS[category];

  try {
    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'JobHunt/1.0 (Job Aggregator)',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.status}`);
    }

    const xml = await response.text();
    const result = await parseStringPromise(xml);

    const items = result?.rss?.channel?.[0]?.item || [];

    return items.map((item: any) => {
      const description = item.description?.[0] || '';
      const cleanDesc = cleanDescription(description);

      return {
        externalId: extractJobId(item.link?.[0] || ''),
        title: item.title?.[0] || 'Untitled',
        description: cleanDesc,
        link: item.link?.[0] || '',
        pubDate: item.pubDate?.[0] || new Date().toISOString(),
        budget: parseBudget(description),
        skills: parseSkills(description),
        category: parseCategory(description),
        country: parseCountry(description),
      };
    });
  } catch (error) {
    console.error(`Error fetching Upwork jobs for ${category}:`, error);
    return [];
  }
}

export async function fetchAllUpworkJobs(): Promise<UpworkJob[]> {
  const categories = Object.keys(UPWORK_RSS_FEEDS) as (keyof typeof UPWORK_RSS_FEEDS)[];
  const allJobs: UpworkJob[] = [];
  const seenIds = new Set<string>();

  // Fetch from multiple categories in parallel
  const results = await Promise.all(
    categories.slice(0, 4).map(category => fetchUpworkJobs(category))
  );

  for (const jobs of results) {
    for (const job of jobs) {
      if (!seenIds.has(job.externalId)) {
        seenIds.add(job.externalId);
        allJobs.push(job);
      }
    }
  }

  // Sort by date, newest first
  allJobs.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  return allJobs;
}

export { UPWORK_RSS_FEEDS };
