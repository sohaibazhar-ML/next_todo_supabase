"use client";

import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';

export const NetworkStatus = () => {
  const [isOffline, setIsOffline] = useState(false);
  const t = useTranslations('Common');

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsOffline(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          className="fixed top-0 left-0 w-full z-[10000] bg-[#E11D48] text-white py-2.5 px-4 flex items-center justify-center gap-3 shadow-xl"
        >
          <div className="bg-white/20 p-1.5 rounded-full">
            <WifiOff size={18} className="text-white" />
          </div>
          <span className="text-[15px] font-bold tracking-tight">
            {t('noInternet')}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
