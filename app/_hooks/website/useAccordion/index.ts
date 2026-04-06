"use client";

import { useState, useCallback } from 'react';

/**
 * Custom hook for managing accordion state.
 * Supports both single and multiple open items.
 * 
 * @param defaultOpenIndex - The index of the item that should be open by default.
 * @param allowMultiple - Whether multiple items can be open at the same time.
 */
export const useAccordion = (defaultOpenIndex: number | null = 0, allowMultiple = false) => {
  const [openIndexes, setOpenIndexes] = useState<(number | null)[]>(
    defaultOpenIndex !== null ? [defaultOpenIndex] : []
  );

  const toggle = useCallback((index: number) => {
    setOpenIndexes((prev) => {
      const isOpen = prev.includes(index);
      
      if (allowMultiple) {
        if (isOpen) {
          return prev.filter((i) => i !== index);
        }
        return [...prev, index];
      } else {
        return isOpen ? [] : [index];
      }
    });
  }, [allowMultiple]);

  const isOpen = useCallback((index: number) => {
    return openIndexes.includes(index);
  }, [openIndexes]);

  return {
    openIndexes,
    toggle,
    isOpen,
  };
};
