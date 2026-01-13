'use client';

import { useTranslations } from 'next-intl';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

const mockApplications = [
  {
    id: '1',
    jobTitle: 'Senior React Developer Needed for E-commerce Platform',
    company: 'TechCorp Inc.',
    appliedAt: '2024-01-10',
    status: 'submitted',
    fitScore: 92,
  },
  {
    id: '2',
    jobTitle: 'Full Stack Developer for SaaS Startup',
    company: 'StartupXYZ',
    appliedAt: '2024-01-08',
    status: 'viewed',
    fitScore: 85,
  },
  {
    id: '3',
    jobTitle: 'Frontend Engineer - React/Next.js',
    company: 'DigitalAgency',
    appliedAt: '2024-01-05',
    status: 'interview',
    fitScore: 78,
  },
  {
    id: '4',
    jobTitle: 'React Native Developer',
    company: 'MobileFirst',
    appliedAt: '2024-01-01',
    status: 'rejected',
    fitScore: 65,
  },
];

type Status = 'submitted' | 'viewed' | 'interview' | 'offer' | 'rejected';

const statusConfig: Record<Status, { label: string; color: string; icon: typeof ClockIcon }> = {
  submitted: { label: 'Submitted', color: 'bg-gray-100 text-gray-800', icon: ClockIcon },
  viewed: { label: 'Viewed', color: 'bg-blue-100 text-blue-800', icon: EnvelopeIcon },
  interview: { label: 'Interview', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
  offer: { label: 'Offer', color: 'bg-purple-100 text-purple-800', icon: CheckCircleIcon },
  rejected: { label: 'Not Selected', color: 'bg-red-100 text-red-800', icon: XCircleIcon },
};

function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${config.color}`}>
      <Icon className="w-4 h-4 mr-1" />
      {config.label}
    </span>
  );
}

export default function ApplicationsPage() {
  const tc = useTranslations('common');

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{tc('applications')}</h1>
        <p className="text-gray-600 mt-1">Track the status of your job applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Applied', value: mockApplications.length, color: 'text-gray-900' },
          { label: 'In Progress', value: 2, color: 'text-blue-600' },
          { label: 'Interview', value: 1, color: 'text-green-600' },
          { label: 'Not Selected', value: 1, color: 'text-red-600' },
        ].map((stat) => (
          <div key={stat.label} className="card p-4">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Applications Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Job
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Applied
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fit Score
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockApplications.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{app.jobTitle}</p>
                    <p className="text-sm text-gray-500">{app.company}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(app.appliedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-gray-900">{app.fitScore}%</span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={app.status as Status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="btn-ghost text-sm">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
