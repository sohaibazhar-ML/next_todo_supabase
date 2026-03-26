import { useState, useCallback, useMemo } from 'react';
import { usePagination } from '@/hooks/usePagination';
import { useSort } from '@/hooks/useSort';

export function useTableState(initialField = 'id', initialOrder: 'ASC' | 'DESC' = 'DESC') {
    const pagination = usePagination();
    const sort = useSort(initialField, initialOrder);
    const [filters, setFilters] = useState<Record<string, unknown>>({});

    const handleFilterChange = useCallback((newFilters: Record<string, unknown>) => {
        setFilters(newFilters);
        pagination.setPage(1);
    }, [pagination]);

    const params = useMemo(() => ({
        page: pagination.page,
        perPage: pagination.perPage,
        sortField: sort.field,
        sortOrder: sort.order,
        ...filters,
    }), [pagination, sort, filters]);

    return {
        pagination,
        sort,
        filters,
        setFilters: handleFilterChange,
        params,
    };
}
