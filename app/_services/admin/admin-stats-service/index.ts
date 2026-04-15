import { api } from '@/services/admin/apiClient';
import { API_ROUTES } from '@/constants/routes';
import { StatisticsData } from '@/types';

export const adminStatsService = {
    getStats: (filters?: { startDate?: string, endDate?: string }): Promise<StatisticsData> => {
        let url = API_ROUTES.ADMIN('stats');
        if (filters?.startDate || filters?.endDate) {
            const params = new URLSearchParams();
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            url += `?${params.toString()}`;
        }
        return api.get<StatisticsData>(url);
    }
};
