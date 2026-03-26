import { api } from '@/services/admin/apiClient';
import { API_ROUTES } from '@/constants/routes';
import { UserProfile } from '@/admin/types';

export const userService = {
    getAll: (params?: Record<string, unknown>) => 
        api.get<{ data: UserProfile[], total: number }>(API_ROUTES.ADMIN('users'), params),
    
    getById: (id: string) => 
        api.get<UserProfile>(`${API_ROUTES.ADMIN('users')}?id=${id}`),
    
    update: (id: string, data: Partial<UserProfile>) => 
        api.put<UserProfile>(API_ROUTES.ADMIN('users'), { id, ...data }),
    
    delete: (id: string) => 
        api.delete<void>(`${API_ROUTES.ADMIN('users')}?id=${id}`),
};
