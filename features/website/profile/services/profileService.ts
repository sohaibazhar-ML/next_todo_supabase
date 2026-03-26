import { api } from '@/shared/services/apiClient';
import { API_ROUTES } from '@/shared/constants/routes';
import { UserProfile } from '@/shared/types';

export const profileService = {
    getCurrent: () => 
        api.get<UserProfile>(API_ROUTES.PROFILES),
    
    update: (data: Partial<UserProfile>) => 
        api.put<UserProfile>(API_ROUTES.PROFILES, data),
};
