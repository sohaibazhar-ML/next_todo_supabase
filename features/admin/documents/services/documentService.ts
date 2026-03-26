import { api } from '@/shared/services/apiClient';
import { API_ROUTES } from '@/shared/constants/routes';
import { SerializedDocument } from '@/shared/types';

export const documentService = {
    getAll: (params?: Record<string, any>) => 
        api.get<{ data: SerializedDocument[], total: number }>(API_ROUTES.ADMIN('documents'), params),
    
    getById: (id: string) => 
        api.get<SerializedDocument>(`${API_ROUTES.ADMIN('documents')}?id=${id}`),
    
    create: (data: FormData) => 
        api.post<SerializedDocument>(API_ROUTES.ADMIN('documents'), data),
    
    update: (id: string, data: Partial<SerializedDocument>) => 
        api.put<SerializedDocument>(API_ROUTES.ADMIN('documents'), { id, ...data }),
    
    delete: (id: string) => 
        api.delete<void>(`${API_ROUTES.ADMIN('documents')}?id=${id}`),
};
