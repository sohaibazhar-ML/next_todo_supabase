import { api } from '@/services/website/apiClient';
import { API_ROUTES } from '@/website/constants/routes';
import { UserProfile } from '@/website/types';

export const profileService = {
    getCurrent: () => 
        api.get<UserProfile>(API_ROUTES.PROFILES),
    
    update: (data: Partial<UserProfile>) => 
        api.put<UserProfile>(API_ROUTES.PROFILES, data),
};
