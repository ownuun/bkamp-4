'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import {
  DocumentTextIcon,
  BoltIcon,
  BellAlertIcon,
  PaperAirplaneIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';

export default function LandingPage() {
  const t = useTranslations();

  const features = [
    {
      icon: DocumentTextIcon,
      title: t('landing.features.scan.title'),
      description: t('landing.features.scan.description'),
    },
    {
      icon: BoltIcon,
      title: t('landing.features.match.title'),
      description: t('landing.features.match.description'),
    },
    {
      icon: BellAlertIcon,
      title: t('landing.features.alert.title'),
      description: t('landing.features.alert.description'),
    },
    {
      icon: PaperAirplaneIcon,
      title: t('landing.features.apply.title'),
      description: t('landing.features.apply.description'),
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <BoltIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">{t('common.appName')}</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="btn-ghost">
                {t('common.login')}
              </Link>
              <Link href="/signup" className="btn-primary">
                {t('common.signup')}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
            {t('landing.hero.title')}
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            {t('landing.hero.subtitle')}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="btn-primary text-lg px-8 py-3">
              {t('landing.hero.cta')}
            </Link>
            <a href="#features" className="btn-secondary text-lg px-8 py-3">
              {t('landing.hero.ctaSecondary')}
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              {t('landing.features.title')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card p-6 text-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('landing.platforms.title')}
          </h2>
          <p className="text-gray-600 mb-12">{t('landing.platforms.description')}</p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-2 text-gray-400">
              <GlobeAltIcon className="w-8 h-8" />
              <span className="text-xl font-semibold">Upwork</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <GlobeAltIcon className="w-8 h-8" />
              <span className="text-xl font-semibold">Indeed</span>
              <span className="badge-primary text-xs">Coming Soon</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <GlobeAltIcon className="w-8 h-8" />
              <span className="text-xl font-semibold">LinkedIn</span>
              <span className="badge-primary text-xs">Coming Soon</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {t('landing.cta.title')}
          </h2>
          <p className="text-primary-100 text-lg mb-8">{t('landing.cta.subtitle')}</p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium rounded-lg bg-white text-primary-600 hover:bg-primary-50 transition-colors"
          >
            {t('landing.cta.button')}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <BoltIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">{t('common.appName')}</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2024 JobHunt. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
