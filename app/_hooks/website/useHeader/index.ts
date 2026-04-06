"use client";

import { useState, useEffect, useCallback } from 'react';

interface UseHeaderOptions {
  scrollThreshold?: number;
}

export const useHeader = (options: UseHeaderOptions = {}) => {
  const { scrollThreshold = 20 } = options;
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Sync scrolled state
      setIsScrolled(window.scrollY > scrollThreshold);
      
      // Sync mobile menu (Rule: Close menu on scroll)
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollThreshold, isMobileMenuOpen]);

  return {
    isScrolled,
    isMobileMenuOpen,
    toggleMobileMenu,
    closeMobileMenu,
  };
};
