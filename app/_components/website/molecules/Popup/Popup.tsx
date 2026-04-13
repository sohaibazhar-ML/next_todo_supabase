"use client";
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Text } from '@/website/atoms';
import { PopupProps } from './Popup.types';

/**
 * A minimalist popup molecule used for confirmation messages and success feedback.
 * Features auto-close logic and a clean design matching the Swiss moved brand.
 */
export const Popup: React.FC<PopupProps> = ({
  title,
  description,
  isOpen,
  onClose,
  autoCloseDelay = 6000,
  className = '',
}) => {
  useEffect(() => {
    if (isOpen && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background-neutral/60 backdrop-blur-sm transition-all duration-300">
      <div 
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="popup-title"
        aria-describedby="popup-description"
        className={`bg-white w-full max-w-[650px] rounded-none shadow-xl relative p-10 md:p-16 flex flex-col items-center text-center animate-in fade-in zoom-in duration-300 ${className}`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-6 right-6 p-2 text-border-input hover:text-secondary transition-colors focus:outline-none"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center gap-6">
          <Text 
            id="popup-title"
            variant="heading-m" 
            className="text-secondary uppercase tracking-tight font-semibold"
          >
            {title}
          </Text>
          
          <Text 
            id="popup-description"
            variant="text-s" 
            className="text-secondary/80 max-w-[480px] leading-relaxed"
          >
            {description}
          </Text>
        </div>
      </div>
    </div>
  );
};
