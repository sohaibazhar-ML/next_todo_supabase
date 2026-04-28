"use client";

import React from 'react';
import { Menu, X, LogOut, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Logo, Image, Text, Input, Button } from '@/website/atoms';
import { Link } from '@/i18n/routing';
import { LanguageSwitcher } from '@/website/molecules';
import { DashboardHeaderProps } from '@/website/organisms/DashboardHeader/DashboardHeader.types';
import { logoutAction } from '@/actions/website/auth.actions';
import { DashboardSidebar } from '@/website/organisms';
import { motion, AnimatePresence } from 'framer-motion';

import { useToggle } from '@/app/_hooks/website/useToggle';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/app/_hooks/website/useDebounce';

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  className = '',
  activeTab = 'documents',
  isAccountPage = false,
  showSearch = false
}) => {
  const t = useTranslations('Dashboard.header');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = React.useTransition();
  const { value: isSearchOpen, toggle: toggleSearch } = useToggle(false);
  const { value: isMobileMenuOpen, toggle: toggleMobileMenu, close: closeMobileMenu } = useToggle(false);

  // Search State
  const [searchValue, setSearchValue] = React.useState(searchParams.get('q') || '');
  const debouncedSearch = useDebounce(searchValue, 500);

  // Sync Search with URL (only when search is enabled for this page)
  React.useEffect(() => {
    if (!showSearch) return;

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
  }, [debouncedSearch, router, pathname, searchParams, showSearch]);

  // Clear search when navigating to a non-search page
  React.useEffect(() => {
    if (!showSearch && searchValue) {
      setSearchValue('');
    }
  }, [showSearch]);

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
    <header className={`w-full flex flex-col shadow-md relative z-50 ${className}`}>
      {/* Main Nav Bar */}
      <div className="w-full bg-background-dark flex justify-center h-auto">
        <div className="max-w-[1440px] w-full px-6 lg:px-[50px] py-[9px] flex items-center justify-between gap-4">
          
          {/* Left Section: Logo & Mobile Menu */}
          <div className="flex items-center gap-4 lg:gap-8 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="lg:hidden text-white p-1 hover:bg-white/10"
              aria-label="Toggle mobile menu"
            >
              <Menu size={24} />
            </Button>
            
            <Link href="/">
              <Logo
                variant="logo2"
                className="w-[140px] h-[35px] lg:w-[220px] lg:h-[55px]"
              />
            </Link>
          </div>

          {/* Middle Section: Title & Search */}
          <div className="hidden md:flex items-center justify-center gap-6 lg:gap-12 flex-1 px-4 lg:px-10">
            <Text 
              variant="heading-m" 
              className="text-white font-semibold whitespace-nowrap !text-[23px] [font-stretch:85%]"
            >
              {t('portalTitle')}
            </Text>

            {showSearch && (
              <div className="flex-1 max-w-[411px]">
                <Input
                  id="search-desktop"
                  inputSize="sm"
                  type='search'
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="bg-white border-transparent focus:ring-0 transition-all shadow-sm !h-[36px] !rounded-[4px]"
                  inputClassName="text-secondary placeholder:text-secondary/50 py-[5px] px-[20px] !h-[36px]"
                />
              </div>
            )}
          </div>

          {/* Right Section: Actions */}
          <div className="flex items-center gap-4 lg:gap-8 flex-shrink-0">
            {/* Mobile Search Trigger */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSearch}
              className={`text-white p-2 h-auto hover:bg-white/10 ${showSearch ? 'md:hidden' : 'hidden'}`}
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
              className="text-white font-semibold p-0 h-auto hover:bg-transparent !text-[23px] [font-stretch:85%]"
            >
              {t('logout')}
            </Button>

            {/* Language Switcher */}
            <div className="scale-75 lg:scale-90 opacity-90 hover:opacity-100 transition-opacity flex-shrink-0">
              <LanguageSwitcher customIcon="/assets/website/dashboard/language-switcher-icon-2.png" />
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Overlay/Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeMobileMenu}
                className="fixed inset-0 bg-black/50 z-[100] lg:hidden"
              />
              
              {/* Drawer Content */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed left-0 top-0 h-full w-[280px] bg-white z-[101] lg:hidden shadow-2xl flex flex-col"
              >
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-background-dark text-white">
                  <Text variant="heading-m" className="font-bold uppercase tracking-tight">
                    {t('portalTitle')}
                  </Text>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={closeMobileMenu}
                    className="text-white p-1 hover:bg-white/10"
                  >
                    <X size={24} />
                  </Button>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  <DashboardSidebar onItemClick={closeMobileMenu} />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Mobile Search Dropdown — hidden via CSS when not on a searchable page */}
        {isSearchOpen && (
          <div className={`absolute top-full left-0 w-full bg-background-dark px-4 py-3 border-t border-white/10 z-30 shadow-lg animate-in slide-in-from-top-2 duration-200 ${showSearch ? 'md:hidden' : 'hidden'}`}>
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
