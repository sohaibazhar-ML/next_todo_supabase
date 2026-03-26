import { useQuery } from '@tanstack/react-query';
import { useNotify } from 'react-admin';
import { useEffect } from 'react';
import { reportService } from '@/services/admin/report-service';
import { QUERY_KEYS } from '@/constants/queryKeys';

/**
 * useReports Hook
 * 
 * Hardened hook for fetching report stats with strict typing
 * and integrated error notification.
 */
export const useReports = (from?: string, to?: string) => {
    const notify = useNotify();
    
    const query = useQuery({
        queryKey: [QUERY_KEYS.ADMIN.REPORTS, from, to],
        queryFn: () => reportService.getStats(from, to),
    });

    // Centralized error notification side-effect
    useEffect(() => {
        if (query.error) {
            notify('Error fetching report', { type: 'error' });
        }
    }, [query.error, notify]);

    return query;
};
