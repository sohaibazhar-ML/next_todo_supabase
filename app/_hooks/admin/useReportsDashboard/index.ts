import { useState, useCallback } from 'react';
import { format, startOfMonth } from 'date-fns';
import { useReports } from '../useReports';
import { useCsvExport } from '../useCsvExport';

/**
 * useReportsDashboard Hook
 * 
 * Encapsulates the entire state and logic for the Reports Dashboard,
 * including filtering, date formatting, and CSV export.
 */
export function useReportsDashboard() {
    const { exportToCsv } = useCsvExport();
    
    // 1. Filter State
    const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(['fromDate', 'toDate']));
    const [fromDate, setFromDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    
    // 2. Data Fetching
    const { data, isLoading, error } = useReports(
        activeFilters.has('fromDate') ? fromDate : undefined,
        activeFilters.has('toDate') ? toDate : undefined
    );

    // 3. Logic Handlers
    const handleFilterChange = useCallback((name: string, value: string) => {
        if (name === 'fromDate') setFromDate(value);
        if (name === 'toDate') setToDate(value);
    }, []);

    const handleToggleFilter = useCallback((name: string, active: boolean) => {
        setActiveFilters(prev => {
            const next = new Set(prev);
            if (active) next.add(name);
            else next.delete(name);
            return next;
        });
    }, []);

    const handleExport = useCallback(() => {
        if (!data || !data.dailyData) return;
        exportToCsv(
            data.dailyData as unknown as Record<string, unknown>[], 
            `report_${fromDate}_to_${toDate}.csv`
        );
    }, [data, fromDate, toDate, exportToCsv]);

    return {
        // State
        data,
        isLoading,
        error,
        filterState: {
            fromDate,
            toDate,
            activeFilters,
        },
        // Handlers
        handleFilterChange,
        handleToggleFilter,
        handleExport,
    };
}
