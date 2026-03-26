import { useQuery } from '@tanstack/react-query';
import { reportService } from '../services/reportService';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';

export const useReports = (from?: string, to?: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.ADMIN.REPORTS, from, to],
        queryFn: () => reportService.getStats(from, to),
    });
};
