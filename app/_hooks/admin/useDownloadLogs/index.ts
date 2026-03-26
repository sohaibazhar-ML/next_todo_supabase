import { useQuery } from '@tanstack/react-query';
import { downloadService } from '@/services/admin/download-service';
import { QUERY_KEYS } from '@/constants/queryKeys';

export const useDownloadLogs = (params?: Record<string, unknown>) => {
    return useQuery({
        queryKey: [QUERY_KEYS.ADMIN.DOWNLOAD_LOGS, params],
        queryFn: () => downloadService.getAll(params),
    });
};
