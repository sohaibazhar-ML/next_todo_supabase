import { api } from '@/shared/services/apiClient';
import { API_ROUTES } from '@/shared/constants/routes';
import { ReportStats } from '../types';

export const reportService = {
    getStats: (from?: string, to?: string) => {
        const params: Record<string, string> = {};
        if (from) params.from = from;
        if (to) params.to = to;
        
        return api.get<ReportStats>(API_ROUTES.ADMIN('reports'), params);
    },
};
