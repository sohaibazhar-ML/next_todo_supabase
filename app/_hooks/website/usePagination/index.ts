"use client";

import { useState, useMemo, useCallback } from 'react';

interface UsePaginationOptions<T> {
  data: T[];
  itemsPerPage?: number;
  initialPage?: number;
}

/**
 * Enhanced pagination hook to handle data slicing and page state.
 */
export const usePagination = <T,>(options: UsePaginationOptions<T>) => {
  const { data, itemsPerPage = 20, initialPage = 1 } = options;
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = useMemo(() => {
    return Math.ceil(data.length / itemsPerPage) || 1;
  }, [data.length, itemsPerPage]);

  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  }, [data, currentPage, itemsPerPage]);

  const onPageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const startIndex = useMemo(() => (currentPage - 1) * itemsPerPage, [currentPage, itemsPerPage]);

  return {
    currentPage,
    totalPages,
    currentData,
    onPageChange,
    startIndex,
  };
};
