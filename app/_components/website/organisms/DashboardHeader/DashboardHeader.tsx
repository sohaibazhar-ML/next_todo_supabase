"use client";

import React from 'react';
import { LogOut, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Logo, Image, Text, Input, Button } from '@/website/atoms';
import { Link } from '@/i18n/routing';
import { LanguageSwitcher } from '@/website/molecules';
import { DashboardHeaderProps } from '@/website/organisms/DashboardHeader/DashboardHeader.types';
import { logoutAction } from '@/actions/website/auth.actions';

import { useToggle } from '@/app/_hooks/website/useToggle';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/app/_hooks/website/useDebounce';

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  className = '',
  activeTab = 'documents',
  isAccountPage = false
}) => {
  const t = useTranslations('Dashboard.header');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = React.useTransition();
  const { value: isSearchOpen, toggle: toggleSearch } = useToggle(false);

  // Search State
  const [searchValue, setSearchValue] = React.useState(searchParams.get('q') || '');
  const debouncedSearch = useDebounce(searchValue, 500);

  // Sync Search with URL
  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const currentSearch = searchParams.get('q') || '';
    
    if (debouncedSearch !== currentSearch) {
      if (debouncedSearch) {
        params.set('q', debouncedSearch);
      } else {
        params.delete('q');
      }
      // Reset to page 1 on new search
      params.delete('page');
      
      router.push(`${pathname}?${params.toString()}`);
    }
  }, [debouncedSearch, router, pathname, searchParams]);

  // Sync search input with URL (e.g. on back button)
  React.useEffect(() => {
    const q = searchParams.get('q') || '';
    if (q !== searchValue) {
      setSearchValue(q);
    }
  }, [searchParams]);

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <header className={`w-full flex flex-col ${className}`}>
      {/* Top Tier: White background with Logo and Banner (Same as before) */}
      <div className="w-full bg-white flex justify-center py-4 lg:py-0 h-auto lg:h-[120px]">
        <div className="max-w-[1440px] w-full px-4 sm:px-6 lg:px-10 flex items-center justify-between lg:h-full">
          {/* Logo */}
          <Link href="/">
            <Logo
              variant="primary"
              className="w-[120px] h-[30px] sm:w-[150px] sm:h-[37px] lg:w-[260px] lg:h-[65px]"
            />
          </Link>

          {/* Banner Image (Right Aligned) - Desktop Only */}
          <div className="hidden lg:block relative h-[120px] w-[400px]">
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

      {/* Bottom Tier: Nav/Search Bar (Same styling as before) */}
      <div className="w-full bg-background-nav flex justify-center h-auto min-h-[50px] lg:min-h-[60px] shadow-md relative z-20">
        <div className="max-w-[1440px] w-full px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-4">
          
          {/* Left: Heading (Replacing Nav Tabs) */}
          <div className="flex items-center h-full">
            <Text 
              variant="heading-m" 
              className="text-white font-bold uppercase tracking-tight"
            >
              {t('portalTitle')}
            </Text>
          </div>

          {/* Middle: Search Bar (Desktop) */}
          <div className="hidden md:block flex-1 max-w-[500px]">
            <Input
              id="search-desktop"
              inputSize="sm"
              type='search'
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={t('searchPlaceholder')}
              rightIcon={Search}
              className="bg-white/95 border-transparent focus:bg-white transition-all shadow-sm"
            />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 lg:gap-10">
            {/* Mobile Search Trigger */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSearch}
              className="md:hidden text-white p-2 h-auto hover:bg-white/10"
              aria-label="Toggle search"
            >
              <Search size={22} />
            </Button>

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

            {/* Language Switcher (Same as before) */}
            <div className="scale-75 lg:scale-90 opacity-90 hover:opacity-100 transition-opacity flex-shrink-0">
              <LanguageSwitcher customIcon="/assets/website/dashboard/language-switcher-icon-2.png" />
            </div>
          </div>
        </div>

        {/* Mobile Search Dropdown */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 w-full bg-background-nav px-4 py-3 border-t border-white/10 md:hidden z-30 shadow-lg animate-in slide-in-from-top-2 duration-200">
            <Input
              autoFocus
              id="search-mobile"
              type='search'
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={t('searchPlaceholder')}
              rightIcon={Search}
              className="w-full h-[40px] shadow-inner bg-white"
            />
          </div>
        )}
      </div>
    </header>
  );
};
