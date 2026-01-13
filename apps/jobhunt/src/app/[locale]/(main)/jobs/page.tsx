'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

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
    description: 'We are looking for an experienced React developer to help build our e-commerce platform...',
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
    description: 'Join our growing team to build innovative SaaS solutions...',
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
    description: 'Looking for a skilled frontend engineer to work on client projects...',
  },
  {
    id: '4',
    title: 'Node.js Backend Developer',
    company: 'FinTech Solutions',
    fitScore: 71,
    budget: '$55-85/hr',
    skills: ['Node.js', 'Express', 'MongoDB'],
    postedAt: '2 days ago',
    platform: 'Upwork',
    description: 'Backend developer needed for our financial services platform...',
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

export default function JobsPage() {
  const t = useTranslations('jobs');
  const tc = useTranslations('common');
  const [search, setSearch] = useState('');

  const filteredJobs = mockJobs.filter(
    (job) =>
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.skills.some((skill) => skill.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{tc('jobs')}</h1>
        <p className="text-gray-600 mt-1">Browse all available job opportunities</p>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
            placeholder="Search jobs or skills..."
          />
        </div>
        <button className="btn-secondary">
          <FunnelIcon className="w-5 h-5 mr-2" />
          Filters
        </button>
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-500 mb-4">
        {filteredJobs.length} jobs found
      </p>

      {/* Job List */}
      <div className="space-y-4">
        {filteredJobs.map((job) => (
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
                <p className="text-gray-500 text-sm mt-2 line-clamp-2">{job.description}</p>
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
                  <span className="text-sm text-gray-500">{t('fitScore')}</span>
                  <FitScoreBadge score={job.fitScore} />
                </div>
                <p className="text-lg font-semibold text-gray-900">{job.budget}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <button className="btn-ghost text-sm">
                {t('viewDetails')}
              </button>
              <div className="flex items-center gap-2">
                <button className="btn-secondary text-sm">
                  {t('save')}
                </button>
                <button className="btn-primary text-sm">
                  {t('apply')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
