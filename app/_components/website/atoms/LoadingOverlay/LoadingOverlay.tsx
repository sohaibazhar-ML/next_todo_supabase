import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingOverlayProps {
  isVisible: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] bg-white/90 cursor-wait flex flex-col items-center justify-center"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <span className="text-secondary/60 text-[10px] font-medium tracking-[0.2em] uppercase">
              Loading
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
