import { api } from '@/shared/services/apiClient';
import { API_ROUTES } from '@/shared/constants/routes';
import { UserProfile } from '@/shared/types/user';

/**
 * Update user profile
 * @param id - User ID
 * @param data - Profile data to update
 * @returns Updated user profile
 */
export const updateProfile = (id: string, data: Partial<UserProfile>) => 
    api.put<UserProfile>(API_ROUTES.PROFILES, { id, ...data });

/**
 * Check if a username is available
 * @param username - Username to check
 * @returns Boolean indicating availability
 */
export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    try {
        const response = await api.get<{ available: boolean }>(`${API_ROUTES.PROFILES}/check-username?username=${username}`);
        return response.available;
    } catch (error) {
        console.error('Error checking username availability:', error);
        return false;
    }
}

/**
 * Create a new user profile
 * @param data - Profile data
 * @returns Created user profile
 */
export const createProfile = (data: Partial<UserProfile> & { id: string, username: string }) => 
    api.post<UserProfile>(API_ROUTES.PROFILES, data);
