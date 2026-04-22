"use client";

import React from 'react';
import { useLoading } from '@/lib/providers/LoadingProvider';
import { LoadingOverlay } from '@/website/atoms';

export const ClientLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoading } = useLoading();

  return (
    <>
      <LoadingOverlay isVisible={isLoading} />
      {children}
    </>
  );
};
