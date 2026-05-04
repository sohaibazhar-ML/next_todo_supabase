"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { Text } from '@/website/atoms';

interface DashboardSidebarProps {
  onItemClick?: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ onItemClick }) => {
  const t = useTranslations('Dashboard.header');
  const pathname = usePathname();

  const navItems = [
    {
      label: t('dashboardNav'),
      href: '/dashboard',
      active: pathname === '/dashboard'
    },
    {
      label: t('allDocuments'),
      href: '/dashboard/all',
      active: pathname === '/dashboard/all'
    },
    {
      label: t('myDocuments'),
      href: '/account/my-documents',
      active: pathname === '/account/my-documents'
    },
    {
      label: t('checklist'),
      href: '/dashboard/checklist',
      active: pathname === '/dashboard/checklist'
    },
    {
      label: t('profile'),
      href: '/account',
      active: pathname === '/account'
    },
    {
      label: t('settings'),
      href: '/account/settings',
      active: pathname === '/account/settings'
    }
  ];

  return (
    <aside className="w-64 xl:w-80 bg-white border-r border-gray-100 flex flex-col py-10">
      <nav className="flex flex-col gap-2">
        {navItems.map((item, idx) => (
          <Link
            key={idx}
            href={item.href as any}
            onClick={() => onItemClick?.()}
            className="flex items-center gap-3 py-2 px-8 transition-colors group relative"
          >
            {/* Active Indicator Arrow */}
            <div
              className={`absolute left-4 transition-opacity ${item.active ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}
            >
              <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[11px] border-l-primary border-b-[8px] border-b-transparent" />
            </div>

            <Text
              variant="dashboard-sidebar"
              className={`transition-colors ${item.active ? 'text-primary' : 'text-secondary group-hover:text-primary'}`}
            >
              {item.label}
            </Text>
          </Link>
        ))}
      </nav>
    </aside>
  );
};
