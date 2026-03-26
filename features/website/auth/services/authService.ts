import { api } from '@/shared/services/apiClient';
import { API_ROUTES } from '@/shared/constants/routes';
import { UserProfile, SignUpFormData } from '@/shared/types';

export const authService = {
    login: (credentials: any) => 
        api.post<{ user: UserProfile, token: string }>('/api/auth/login', credentials),
    
    signup: (data: SignUpFormData) => 
        api.post<{ user: UserProfile }>('/api/auth/signup', data),
    
    signout: () => 
        api.post('/api/auth/signout'),
    
    resetPassword: (email: string) => 
        api.post('/api/auth/reset-password', { email }),
};
