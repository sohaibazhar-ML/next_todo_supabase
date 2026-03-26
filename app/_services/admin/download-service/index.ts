import { api } from '@/services/admin/apiClient';
import { API_ROUTES } from '@/constants/routes';
import { DownloadLog } from '@/types';

export const downloadService = {
    getAll: (params?: Record<string, unknown>) => 
        api.get<{ data: DownloadLog[], total: number }>(API_ROUTES.ADMIN('download_logs'), params),
};
