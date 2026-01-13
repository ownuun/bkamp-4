'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { BellIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const tc = useTranslations('common');

  const [settings, setSettings] = useState({
    emailAlerts: true,
    alertFrequency: 'realtime',
    minFitScore: 70,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save to Supabase
    console.log('Settings:', settings);
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{tc('settings')}</h1>
        <p className="text-gray-600 mt-1">Manage your notification preferences</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Alerts */}
        <div className="card p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <EnvelopeIcon className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Email Alerts</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Receive email notifications when matching jobs are found
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, emailAlerts: !settings.emailAlerts })}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 ${
                    settings.emailAlerts ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.emailAlerts ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Frequency */}
        <div className="card p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <BellIcon className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-3">Alert Frequency</h3>
              <div className="space-y-2">
                {[
                  { value: 'realtime', label: 'Real-time', description: 'Get notified immediately' },
                  { value: 'daily', label: 'Daily Digest', description: 'One email per day' },
                  { value: 'weekly', label: 'Weekly Summary', description: 'One email per week' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-colors ${
                      settings.alertFrequency === option.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="frequency"
                      value={option.value}
                      checked={settings.alertFrequency === option.value}
                      onChange={(e) => setSettings({ ...settings, alertFrequency: e.target.value })}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{option.label}</p>
                      <p className="text-sm text-gray-500">{option.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Min Fit Score for Alerts */}
        <div className="card p-6">
          <h3 className="font-medium text-gray-900 mb-3">
            Minimum Fit Score for Alerts: <span className="text-primary-600">{settings.minFitScore}%</span>
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Only receive alerts for jobs with a fit score above this threshold
          </p>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={settings.minFitScore}
            onChange={(e) => setSettings({ ...settings, minFitScore: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button type="submit" className="btn-primary">
            {tc('save')}
          </button>
        </div>
      </form>
    </div>
  );
}
