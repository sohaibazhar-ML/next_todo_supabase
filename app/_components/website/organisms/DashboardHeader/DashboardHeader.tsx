"use client";

import React from 'react';
import { LogOut, Plus, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Logo, Image, Text, Input, Button } from '@/website/atoms';
import { Link } from '@/i18n/routing';
import { LanguageSwitcher } from '@/website/molecules';
import { DashboardHeaderProps } from '@/website/organisms/DashboardHeader/DashboardHeader.types';
import { logoutAction } from '@/actions/website/auth.actions';

import { useToggle } from '@/app/_hooks/website/useToggle';

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  className = '',
  activeTab = 'documents'
}) => {
  const t = useTranslations('Dashboard.header');
  const [isPending, startTransition] = React.useTransition();
  const { value: isSearchOpen, toggle: toggleSearch } = useToggle(false);

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <header className={`w-full flex flex-col ${className}`}>
      {/* Top Tier: White background with Logo and Banner */}
      <div className="w-full bg-white flex justify-center py-4 lg:py-0 h-auto lg:h-[120px]">
        <div className="max-w-(--container-width-desktop) w-full px-(--spacing-container-padding) flex items-center justify-between h-full">
          {/* Logo */}
          <Link href="/">
            <Logo
              variant="primary"
              className="w-[150px] h-[37px] sm:w-[180px] h-[45px] lg:w-[260px] lg:h-[65px]"
            />
          </Link>

          {/* Mobile Right Actions: Logout & Language (hidden on desktop) */}
          <div className="flex md:hidden items-center gap-4">
            {/* Logout */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              isLoading={isPending}
              className="text-secondary font-bold p-0 h-auto hover:bg-transparent"
            >
              {t('logout')}
            </Button>

            {/* Language Switcher */}
            <div className="scale-75 flex-shrink-0">
              <LanguageSwitcher customIcon="/assets/website/dashboard/language-switcher-icon-2.png" />
            </div>
          </div>

          {/* Banner Image (Right Aligned) - Desktop Only */}
          <div className="hidden lg:block relative h-full w-[400px]">
            <Image
              src="/assets/website/dashboard/dashboard-header-right.png"
              alt="Dashboard Banner"
              fill
              sizes="400px"
              className="object-contain object-right"
              priority
            />
          </div>
        </div>
      </div>

      {/* Bottom Tier: Nav Bar */}
      <div className="w-full bg-background-nav flex justify-center h-[50px] lg:h-[60px]">
        <div className="max-w-(--container-width-desktop) w-full px-(--spacing-container-padding) flex items-center justify-between gap-4">
          {/* Left: Nav Tabs - Scrollable on mobile */}
          <nav className="flex items-center h-full gap-4 lg:gap-8 overflow-x-auto no-scrollbar whitespace-nowrap">
            <Link
              href="/account"
              className={`text-white transition-opacity hover:opacity-100 h-full flex items-center border-b-2 transition-all ${activeTab === 'account' ? 'border-primary opacity-100' : 'border-transparent opacity-70'}`}
            >
              <Text variant="text-xxs" className="font-semibold uppercase tracking-wider">
                {t('account')}
              </Text>
            </Link>
            <Link
              href="/dashboard"
              className={`text-white transition-opacity hover:opacity-100 h-full flex items-center border-b-2 transition-all ${activeTab === 'documents' ? 'border-primary opacity-100' : 'border-transparent opacity-70'}`}
            >
              <Text variant="text-xxs" className="font-semibold uppercase tracking-wider">
                {t('documents')}
              </Text>
            </Link>
          </nav>

          {/* Right: Search and Logout/Lang (Desktop Only Logout/Lang) */}
          <div className="flex items-center gap-3 lg:gap-10 ml-auto">
            {/* Search Bar - Desktop */}
            <div className="hidden md:block">
              <Input
                id="search-desktop"
                inputSize="sm"
                type='search'
                placeholder={t('searchPlaceholder')}
                rightIcon={Search}
                className="w-[180px] lg:w-[320px]"
              />
            </div>

            {/* Search Trigger - Mobile */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSearch}
              className="md:hidden text-white p-2 h-auto hover:bg-white/10"
              aria-label="Toggle search"
            >
              <Search size={22} />
            </Button>

            {/* Actions Tier (Desktop Only) */}
            <div className="hidden md:flex items-center gap-4 lg:gap-10">
              {/* Logout */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                isLoading={isPending}
                className="text-white font-bold p-0 h-auto hover:bg-transparent"
              >
                {t('logout')}
              </Button>

              {/* Language Switcher */}
              <div className="scale-75 lg:scale-90 opacity-90 hover:opacity-100 transition-opacity flex-shrink-0">
                <LanguageSwitcher customIcon="/assets/website/dashboard/language-switcher-icon-2.png" />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search Dropdown */}
        {isSearchOpen && (
          <div className="absolute top-[170px] left-0 w-full bg-background-nav px-(--spacing-container-padding) py-3 border-t border-white/10 md:hidden z-30 shadow-lg animate-in slide-in-from-top-2 duration-200">
            <Input
              autoFocus
              id="search-mobile"
              type='search'
              placeholder={t('searchPlaceholder')}
              rightIcon={Search}
              className="w-full h-[40px] shadow-inner"
            />
          </div>
        )}
      </div>
    </header>
  );
};
