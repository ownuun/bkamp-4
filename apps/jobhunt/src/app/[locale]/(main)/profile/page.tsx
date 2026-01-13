'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import {
  DocumentTextIcon,
  PlusIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

export default function ProfilePage() {
  const t = useTranslations('resume');
  const tc = useTranslations('common');

  // Mock data
  const hasResume = false;
  const resumeAnalysis = null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
      </div>

      {/* Resume Section */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Resumes</h2>
          <Link href="/profile/resume" className="btn-primary text-sm">
            <PlusIcon className="w-4 h-4 mr-2" />
            Upload Resume
          </Link>
        </div>

        {!hasResume ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
            <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No resume uploaded</h3>
            <p className="text-gray-500 mb-4">Upload your resume to get personalized job matches</p>
            <Link href="/profile/resume" className="btn-primary">
              {t('upload.title')}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Resume Card */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-primary-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">resume.pdf</h4>
                <p className="text-sm text-gray-500">Uploaded 2 days ago</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge-success">
                  <CheckCircleIcon className="w-4 h-4 mr-1" />
                  Analyzed
                </span>
                <button className="btn-ghost text-sm">View Analysis</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preferences Link */}
      <div className="card p-6 mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Job Preferences</h2>
            <p className="text-gray-500 text-sm mt-1">Configure your desired job criteria</p>
          </div>
          <Link href="/profile/preferences" className="btn-secondary">
            {tc('edit')}
          </Link>
        </div>
      </div>
    </div>
  );
}
