import { useState, useCallback } from 'react';

export interface SortState {
    field: string;
    order: 'ASC' | 'DESC';
}

export function useSort(initialField = 'id', initialOrder: 'ASC' | 'DESC' = 'DESC') {
    const [sort, setSort] = useState<SortState>({
        field: initialField,
        order: initialOrder,
    });

    const setSortField = useCallback((field: string) => {
        setSort(prev => ({
            field,
            order: prev.field === field && prev.order === 'ASC' ? 'DESC' : 'ASC',
        }));
    }, []);

    return {
        ...sort,
        setSortField,
        setSort,
    };
}
