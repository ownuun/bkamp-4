'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BoltIcon,
  HomeIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  PaperAirplaneIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'profile', href: '/profile', icon: UserCircleIcon },
  { name: 'jobs', href: '/jobs', icon: BriefcaseIcon },
  { name: 'applications', href: '/applications', icon: PaperAirplaneIcon },
  { name: 'settings', href: '/settings', icon: Cog6ToothIcon },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('common');
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 h-16 px-6 border-b border-gray-200">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <BoltIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">{t('appName')}</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname.includes(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                  {t(item.name)}
                </Link>
              );
            })}
          </nav>

          {/* User & Logout */}
          <div className="p-3 border-t border-gray-200">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <UserCircleIcon className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">User Name</p>
                <p className="text-xs text-gray-500 truncate">user@example.com</p>
              </div>
            </div>
            <button className="flex items-center gap-3 w-full px-3 py-2 mt-1 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
              <ArrowRightOnRectangleIcon className="w-5 h-5 text-gray-400" />
              {t('logout')}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
