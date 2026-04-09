"use client";

import React from 'react';
import { Menu, X, Phone } from 'lucide-react';
import { Logo, Button, Text } from '@/website/atoms';
import { NavLink, LanguageSwitcher } from '@/website/molecules';
import { Link } from '@/i18n/routing';

import { useHeader } from '@/app/_hooks/website/useHeader';
import { useTranslations, useLocale } from 'next-intl';

import { HeaderProps } from '@/website/organisms/Header/Header.types';

export const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const t = useTranslations('Header');
  const locale = useLocale();
  const { isScrolled, isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useHeader();

  const navLinks = [
    { name: t('howItWorks'), href: '/#how-it-works' },
    { name: t('myDocuments'), href: '/#my-documents' },
    { name: t('contact'), href: '/#contact' },
  ];

  return (
    <header
      className={`fixed top-[15px] lg:top-[20px] left-[15px] lg:left-[40px] xl:left-[80px] right-[15px] lg:right-[40px] xl:right-[80px] z-50 transition-all duration-300 rounded-[12px] ${isScrolled
        ? 'bg-background-neutral/95 backdrop-blur-md shadow-lg h-[70px] lg:h-[80px]'
        : 'bg-background-neutral h-[80px] lg:h-[90px]'
        } ${className}`}
    >
      <div className="max-w-(--container-width-desktop) w-full h-full mx-auto px-2 sm:px-4 lg:px-6 xl:px-(--spacing-container-padding) flex items-center justify-between pb-[4px] lg:pb-[12px]">
        {/* Logo Section */}
        <div className="flex-shrink-0">
          <Link href="/">
            <Logo 
              variant="primary" 
              className="w-[140px] h-[35px] xs:w-[180px] xs:h-[45px] lg:w-[220px] lg:h-[55px] xl:w-[260px] xl:h-[65px] hover:opacity-90 transition-opacity" 
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className={`hidden lg:flex items-center ${locale === 'en' ? 'gap-[12px] xl:gap-[40px]' : 'gap-[8px] xl:gap-[16px]'}`}>
          {navLinks.map((link) => (
            <NavLink 
              key={link.name} 
              href={link.href} 
              className="lg:text-[14px] xl:text-[16px]"
              disableTruncate={locale === 'en'}
            >
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className={`hidden lg:flex items-center ${locale === 'en' ? 'gap-[4px] xl:gap-[24px]' : 'gap-[4px] xl:gap-[16px]'}`}>
          <Link href="/login">
            <Button
              size="sm"
              variant="outline"
              className="bg-white border-none text-secondary font-semibold hover:bg-white/90 lg:px-3 xl:px-6 overflow-hidden relative"
            >
              <span 
                className={`block ${locale === 'en' ? 'max-w-none' : 'overflow-hidden lg:max-w-[80px] xl:max-w-[100px]'}`}
                style={{ 
                  '--marquee-width': locale === 'en' ? 'none' : '80px',
                  '--marquee-width-lg': '80px',
                  '--marquee-width-xl': '100px'
                } as React.CSSProperties}
              >
                <span 
                  className={`block truncate ${locale === 'en' ? '' : 'hover-marquee'}`}
                  title={t('login')}
                >
                  {t('login')}
                </span>
              </span>
            </Button>
          </Link>
 
          <Link href="/register">
            <Button
              size="sm"
              variant="primary"
              className="lg:px-3 xl:px-6 overflow-hidden relative"
            >
              <span 
                className={`block ${locale === 'en' ? 'max-w-none' : 'overflow-hidden lg:max-w-[120px] xl:max-w-[160px]'}`}
                style={{ 
                  '--marquee-width': locale === 'en' ? 'none' : '120px',
                  '--marquee-width-lg': '120px',
                  '--marquee-width-xl': '160px'
                } as React.CSSProperties}
              >
                <span 
                  className={`block truncate ${locale === 'en' ? '' : 'hover-marquee'}`}
                  title={t('register')}
                >
                  {t('register')}
                </span>
              </span>
            </Button>
          </Link>

          <LanguageSwitcher />
        </div>

        {/* Mobile Actions and Toggle */}
        <div className="lg:hidden flex items-center gap-2 xs:gap-4 z-50">
          <div className="pointer-events-auto relative z-50 scale-90 xs:scale-100">
            <LanguageSwitcher />
          </div>
          
          <Button
            variant="ghost"
            className="p-1 xs:p-2 text-secondary z-50 relative pointer-events-auto border-none bg-transparent hover:bg-transparent"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6 xs:w-7 h-7" /> : <Menu className="w-6 h-6 xs:w-7 h-7" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-[15px] top-[100px] bottom-auto bg-white z-[40] p-8 flex flex-col gap-6 rounded-[12px] shadow-2xl animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col gap-6 mt-4">
            <NavLink
              href="/"
              className="text-xl"
              onClick={closeMobileMenu}
              disableTruncate
            >
              {t('home')}
            </NavLink>
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                href={link.href}
                className="text-xl"
                onClick={closeMobileMenu}
                disableTruncate
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Mobile Actions */}
          <div className="flex flex-col gap-4 mt-2 pt-6 border-t border-background-neutral">
            <Link href="/login" className="w-full" onClick={closeMobileMenu}>
              <Button
                variant="outline"
                className="w-full justify-center text-lg py-4 bg-white border-none text-secondary font-semibold hover:bg-background-neutral"
              >
                {t('login')}
              </Button>
            </Link>

            <Link href="/register" className="w-full" onClick={closeMobileMenu}>
              <Button
                variant="primary"
                className="w-full justify-center text-lg py-4"
              >
                {t('register')}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
