import { api } from '@/services/apiClient';
import { API_ROUTES } from '@/constants/routes';
import { UserProfile } from '@/types';

export const profileService = {
    getCurrent: () => 
        api.get<UserProfile>(API_ROUTES.PROFILES),
    
    update: (data: Partial<UserProfile>) => 
        api.put<UserProfile>(API_ROUTES.PROFILES, data),
};
