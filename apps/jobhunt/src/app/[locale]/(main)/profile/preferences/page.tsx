'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function PreferencesPage() {
  const t = useTranslations('preferences');
  const tc = useTranslations('common');

  const [preferences, setPreferences] = useState({
    roles: '',
    salaryMin: '',
    salaryMax: '',
    workTypes: [] as string[],
    contractTypes: [] as string[],
    minFitScore: 70,
  });

  const handleWorkTypeToggle = (type: string) => {
    setPreferences((prev) => ({
      ...prev,
      workTypes: prev.workTypes.includes(type)
        ? prev.workTypes.filter((t) => t !== type)
        : [...prev.workTypes, type],
    }));
  };

  const handleContractTypeToggle = (type: string) => {
    setPreferences((prev) => ({
      ...prev,
      contractTypes: prev.contractTypes.includes(type)
        ? prev.contractTypes.filter((t) => t !== type)
        : [...prev.contractTypes, type],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save to Supabase
    console.log('Preferences:', preferences);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-600 mt-1">{t('subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        {/* Desired Roles */}
        <div>
          <label htmlFor="roles" className="label">{t('roles')}</label>
          <input
            id="roles"
            type="text"
            value={preferences.roles}
            onChange={(e) => setPreferences({ ...preferences, roles: e.target.value })}
            className="input"
            placeholder={t('rolesPlaceholder')}
          />
          <p className="text-xs text-gray-500 mt-1">Separate multiple roles with commas</p>
        </div>

        {/* Hourly Rate Range */}
        <div>
          <label className="label">{t('salary')} (USD/hr)</label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="number"
                value={preferences.salaryMin}
                onChange={(e) => setPreferences({ ...preferences, salaryMin: e.target.value })}
                className="input"
                placeholder={t('salaryMin')}
                min="0"
              />
            </div>
            <span className="text-gray-400">-</span>
            <div className="flex-1">
              <input
                type="number"
                value={preferences.salaryMax}
                onChange={(e) => setPreferences({ ...preferences, salaryMax: e.target.value })}
                className="input"
                placeholder={t('salaryMax')}
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Work Type */}
        <div>
          <label className="label">{t('workType')}</label>
          <div className="flex flex-wrap gap-2">
            {['remote', 'hybrid', 'onsite'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleWorkTypeToggle(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  preferences.workTypes.includes(type)
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {t(type)}
              </button>
            ))}
          </div>
        </div>

        {/* Contract Type */}
        <div>
          <label className="label">{t('contractType')}</label>
          <div className="flex flex-wrap gap-2">
            {['fulltime', 'contract', 'freelance'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleContractTypeToggle(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  preferences.contractTypes.includes(type)
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {t(type)}
              </button>
            ))}
          </div>
        </div>

        {/* Min Fit Score */}
        <div>
          <label className="label">
            {t('minFitScore')}: <span className="text-primary-600 font-bold">{preferences.minFitScore}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={preferences.minFitScore}
            onChange={(e) => setPreferences({ ...preferences, minFitScore: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button type="button" className="btn-secondary">
            {tc('cancel')}
          </button>
          <button type="submit" className="btn-primary">
            {t('save')}
          </button>
        </div>
      </form>
    </div>
  );
}
