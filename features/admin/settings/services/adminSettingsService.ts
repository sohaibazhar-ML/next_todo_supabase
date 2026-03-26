import { api } from '@/shared/services/apiClient';
import { API_ROUTES } from '@/shared/constants/routes';
import { UserProfile } from '@/shared/types';

export const adminSettingsService = {
    getAdminProfile: async (userId: string): Promise<UserProfile> => {
        // The profiles API returns a single profile if userId is specified
        return api.get<UserProfile>(`${API_ROUTES.PROFILES}?userId=${userId}`);
    }
};
