import React from 'react';

interface LoadingOverlayProps {
  isVisible: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-white/10 cursor-wait flex items-center justify-center animate-in fade-in duration-300"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );
};
