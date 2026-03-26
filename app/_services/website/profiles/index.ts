import { api } from '@/services/website/apiClient';
import { API_ROUTES } from '@/website/constants/routes';
import { UserProfile } from '@/website/types/user';

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

/**
 * Coordinated profile setup/update
 * Handles username availability check and profile persistence
 */
export const completeProfileSetup = async (userId: string, data: Partial<UserProfile> & { username: string }, isCreating: boolean) => {
    if (isCreating) {
        // Check username availability first (Business Logic)
        const isAvailable = await checkUsernameAvailability(data.username);
        if (!isAvailable) {
            throw new Error('Username is already taken');
        }

        return createProfile({
            ...data,
            id: userId,
            email_confirmed: true,
            email_confirmed_at: new Date().toISOString()
        });
    }

    return updateProfile(userId, data);
};
