'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useDropzone } from 'react-dropzone';
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  XMarkIcon,
  CheckCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

type UploadState = 'idle' | 'uploading' | 'analyzing' | 'complete';

export default function ResumeUploadPage() {
  const t = useTranslations('resume');
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<UploadState>('idle');
  const [analysis, setAnalysis] = useState<{
    skills: string[];
    experience: number;
    strengths: string[];
    suggestions: string[];
  } | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      handleUpload(uploadedFile);
    }
  }, []);

  const handleUpload = async (uploadedFile: File) => {
    setState('uploading');

    // Simulate upload
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setState('analyzing');

    // Simulate AI analysis
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Mock analysis result
    setAnalysis({
      skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'Docker'],
      experience: 5,
      strengths: [
        'Strong frontend development skills',
        'Experience with modern web technologies',
        'Full-stack capabilities',
      ],
      suggestions: [
        'Consider adding more specific project metrics',
        'Highlight leadership experience if applicable',
      ],
    });

    setState('complete');
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
  });

  const removeFile = () => {
    setFile(null);
    setState('idle');
    setAnalysis(null);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('upload.title')}</h1>
      </div>

      {/* Upload Zone */}
      {state === 'idle' && (
        <div
          {...getRootProps()}
          className={`card p-12 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary-500 bg-primary-50' : 'border-2 border-dashed border-gray-200 hover:border-primary-300 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <CloudArrowUpIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('upload.description')}
          </h3>
          <p className="text-gray-500 text-sm">{t('upload.formats')}</p>
        </div>
      )}

      {/* Uploading / Analyzing State */}
      {(state === 'uploading' || state === 'analyzing') && (
        <div className="card p-12 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {state === 'uploading' ? 'Uploading...' : t('upload.analyzing')}
          </h3>
          {file && (
            <p className="text-gray-500 text-sm">{file.name}</p>
          )}
        </div>
      )}

      {/* Complete State with Analysis */}
      {state === 'complete' && analysis && (
        <div className="space-y-6">
          {/* File Info */}
          <div className="card p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{file?.name}</h4>
                <p className="text-sm text-green-600">Successfully analyzed</p>
              </div>
              <button onClick={removeFile} className="btn-ghost p-2">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Analysis Results */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-6">
              <SparklesIcon className="w-6 h-6 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">{t('analysis.title')}</h2>
            </div>

            {/* Skills */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">{t('analysis.skills')}</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.skills.map((skill) => (
                  <span key={skill} className="badge-primary px-3 py-1">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">{t('analysis.experience')}</h3>
              <p className="text-2xl font-bold text-gray-900">{analysis.experience} years</p>
            </div>

            {/* Strengths */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">{t('analysis.strengths')}</h3>
              <ul className="space-y-2">
                {analysis.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-600">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            {/* Suggestions */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">{t('analysis.suggestions')}</h3>
              <ul className="space-y-2">
                {analysis.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-600">
                    <SparklesIcon className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button onClick={removeFile} className="btn-secondary">
              Upload Different Resume
            </button>
            <button className="btn-primary">
              Continue to Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
