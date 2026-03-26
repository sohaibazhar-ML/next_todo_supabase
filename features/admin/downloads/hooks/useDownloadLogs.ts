import { useQuery } from '@tanstack/react-query';
import { downloadService } from '../services/downloadService';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';

export const useDownloadLogs = (params?: Record<string, any>) => {
    return useQuery({
        queryKey: [QUERY_KEYS.ADMIN.DOWNLOAD_LOGS, params],
        queryFn: () => downloadService.getAll(params),
    });
};
