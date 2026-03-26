import { api } from '@/services/apiClient';
import { API_ROUTES } from '@/constants/routes';
import { StatisticsData } from '@/types';

export const adminStatsService = {
    getStats: (): Promise<StatisticsData> => {
        return api.get<StatisticsData>(API_ROUTES.ADMIN('stats'));
    }
};
