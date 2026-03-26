import { useQuery } from '@tanstack/react-query';
import { adminStatsService } from '@/services/admin-stats-service';
import { QUERY_KEYS } from '@/constants/queryKeys';

export const useAdminStats = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.ADMIN.STATS],
        queryFn: () => adminStatsService.getStats(),
    });
};
