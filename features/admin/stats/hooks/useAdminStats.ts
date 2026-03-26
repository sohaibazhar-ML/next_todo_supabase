import { useQuery } from '@tanstack/react-query';
import { adminStatsService } from '../services/adminStatsService';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';

export const useAdminStats = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.ADMIN.STATS],
        queryFn: () => adminStatsService.getStats(),
    });
};
