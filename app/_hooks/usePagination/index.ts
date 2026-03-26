import { useState, useCallback } from 'react';

export interface PaginationState {
    page: number;
    perPage: number;
}

export function usePagination(initialPage = 1, initialPerPage = 10) {
    const [pagination, setPagination] = useState<PaginationState>({
        page: initialPage,
        perPage: initialPerPage,
    });

    const setPage = useCallback((page: number) => {
        setPagination(prev => ({ ...prev, page }));
    }, []);

    const setPerPage = useCallback((perPage: number) => {
        setPagination(prev => ({ ...prev, perPage, page: 1 }));
    }, []);

    return {
        ...pagination,
        setPage,
        setPerPage,
        setPagination,
    };
}
