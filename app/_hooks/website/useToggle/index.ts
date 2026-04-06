"use client";

import { useState, useCallback } from 'react';

/**
 * Simple hook for managing a boolean toggle state.
 * @param initialState - The initial state (default: false).
 */
export const useToggle = (initialState = false) => {
  const [value, setValue] = useState(initialState);

  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  const open = useCallback(() => {
    setValue(true);
  }, []);

  const close = useCallback(() => {
    setValue(false);
  }, []);

  return {
    value,
    toggle,
    open,
    close,
  };
};
