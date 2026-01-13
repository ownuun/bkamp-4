'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import {
  BriefcaseIcon,
  DocumentPlusIcon,
  ArrowUpIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

// Mock data for demo
const mockJobs = [
  {
    id: '1',
    title: 'Senior React Developer Needed for E-commerce Platform',
    company: 'TechCorp Inc.',
    fitScore: 92,
    budget: '$50-80/hr',
    skills: ['React', 'TypeScript', 'Node.js'],
    postedAt: '2 hours ago',
    platform: 'Upwork',
  },
  {
    id: '2',
    title: 'Full Stack Developer for SaaS Startup',
    company: 'StartupXYZ',
    fitScore: 85,
    budget: '$40-60/hr',
    skills: ['Next.js', 'PostgreSQL', 'AWS'],
    postedAt: '5 hours ago',
    platform: 'Upwork',
  },
  {
    id: '3',
    title: 'Frontend Engineer - React/Next.js',
    company: 'DigitalAgency',
    fitScore: 78,
    budget: '$45-70/hr',
    skills: ['React', 'Next.js', 'Tailwind CSS'],
    postedAt: '1 day ago',
    platform: 'Upwork',
  },
];

function FitScoreBadge({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-blue-100 text-blue-800';
    if (score >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-semibold ${getColor()}`}>
      {score}%
    </span>
  );
}

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const tj = useTranslations('jobs');

  const hasResume = false; // TODO: Check from user profile

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-600 mt-1">{t('subtitle')}</p>
      </div>

      {/* No Resume Banner */}
      {!hasResume && (
        <div className="card p-6 mb-8 bg-primary-50 border-primary-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <DocumentPlusIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{t('noMatches')}</h3>
              <p className="text-gray-600 mt-1 text-sm">
                Upload your resume to start receiving personalized job matches.
              </p>
              <Link href="/profile/resume" className="btn-primary mt-4 inline-flex">
                {t('uploadResume')}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        {['all', 'new', 'saved', 'applied'].map((filter) => (
          <button
            key={filter}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {t(`filters.${filter}`)}
          </button>
        ))}
      </div>

      {/* Job Cards */}
      <div className="space-y-4">
        {mockJobs.map((job) => (
          <div key={job.id} className="card p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge-primary">{job.platform}</span>
                  <span className="flex items-center text-gray-400 text-sm">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    {job.postedAt}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 cursor-pointer">
                  {job.title}
                </h3>
                <p className="text-gray-600 text-sm mt-1">{job.company}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {job.skills.map((skill) => (
                    <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-500">{tj('fitScore')}</span>
                  <FitScoreBadge score={job.fitScore} />
                </div>
                <p className="text-lg font-semibold text-gray-900">{job.budget}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <button className="btn-ghost text-sm">
                {tj('viewDetails')}
              </button>
              <div className="flex items-center gap-2">
                <button className="btn-secondary text-sm">
                  {tj('save')}
                </button>
                <button className="btn-primary text-sm">
                  {tj('apply')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
