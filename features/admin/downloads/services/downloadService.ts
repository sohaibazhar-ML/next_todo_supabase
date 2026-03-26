import { api } from '@/shared/services/apiClient';
import { API_ROUTES } from '@/shared/constants/routes';
import { DownloadLog } from '@/shared/types';

export const downloadService = {
    getAll: (params?: Record<string, unknown>) => 
        api.get<{ data: DownloadLog[], total: number }>(API_ROUTES.ADMIN('download_logs'), params),
};
