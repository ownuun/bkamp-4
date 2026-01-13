'use client';

import { useState } from 'react';
import { XMarkIcon, SparklesIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { apiCall } from '@/hooks/useApi';

interface QuickApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: {
    id: string;
    title: string;
    company_name: string | null;
    external_url: string;
  };
  onSuccess?: () => void;
}

export function QuickApplyModal({ isOpen, onClose, job, onSuccess }: QuickApplyModalProps) {
  const [coverLetter, setCoverLetter] = useState('');
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; externalUrl?: string; error?: string } | null>(null);

  const handleGenerateCoverLetter = async () => {
    setGenerating(true);
    const { data, error } = await apiCall<{ coverLetter: string }>('/api/applications/cover-letter', 'POST', {
      jobId: job.id,
    });

    if (data?.coverLetter) {
      setCoverLetter(data.coverLetter);
    } else {
      alert(error || 'Failed to generate cover letter');
    }
    setGenerating(false);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const { data, error } = await apiCall<{ success: boolean; externalUrl: string }>('/api/applications', 'POST', {
      jobId: job.id,
      coverLetter,
      generateCover: !coverLetter, // Generate if not provided
    });

    if (data?.success) {
      setResult({ success: true, externalUrl: data.externalUrl });
      onSuccess?.();
    } else {
      setResult({ success: false, error: error || 'Failed to apply' });
    }
    setSubmitting(false);
  };

  const handleClose = () => {
    setCoverLetter('');
    setResult(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50" onClick={handleClose} />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>

          {result ? (
            // Result screen
            <div className="text-center py-8">
              {result.success ? (
                <>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Application Saved!</h3>
                  <p className="text-gray-600 mb-6">
                    Complete your application on Upwork to submit it.
                  </p>
                  <div className="flex flex-col gap-3">
                    <a
                      href={result.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary flex items-center justify-center gap-2"
                    >
                      Apply on Upwork
                      <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                    </a>
                    <button onClick={handleClose} className="btn-secondary">
                      Close
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XMarkIcon className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Application Failed</h3>
                  <p className="text-gray-600 mb-6">{result.error}</p>
                  <button onClick={() => setResult(null)} className="btn-primary">
                    Try Again
                  </button>
                </>
              )}
            </div>
          ) : (
            // Apply form
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Quick Apply</h2>
              <p className="text-gray-600 text-sm mb-6">
                {job.title} at {job.company_name || 'Unknown'}
              </p>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="label mb-0">Cover Letter</label>
                    <button
                      type="button"
                      onClick={handleGenerateCoverLetter}
                      disabled={generating}
                      className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 disabled:opacity-50"
                    >
                      <SparklesIcon className="w-4 h-4" />
                      {generating ? 'Generating...' : 'Generate with AI'}
                    </button>
                  </div>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Write a cover letter or use AI to generate one..."
                    className="input min-h-[200px] resize-y"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleClose}
                    className="btn-secondary flex-1"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="btn-primary flex-1"
                    disabled={submitting}
                  >
                    {submitting ? 'Applying...' : 'Apply Now'}
                  </button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Your application will be saved and you'll be redirected to Upwork to complete it.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
