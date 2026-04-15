import { useQuery } from '@tanstack/react-query';
import { adminStatsService } from '@/services/admin/admin-stats-service';
import { QUERY_KEYS } from '@/constants/queryKeys';

export const useAdminStats = (filters?: { startDate?: string, endDate?: string }) => {
    return useQuery({
        queryKey: [QUERY_KEYS.ADMIN.STATS, filters],
        queryFn: () => adminStatsService.getStats(filters),
        refetchInterval: 60000, // Refresh every minute for scalability and fresh data
    });
};
